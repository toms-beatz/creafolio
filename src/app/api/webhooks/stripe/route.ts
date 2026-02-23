import { headers } from "next/headers";
import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";

/**
 * POST /api/webhooks/stripe
 *
 * Reçoit et traite les events Stripe.
 * Vérifie la signature avant tout traitement (sécurité critique).
 * Idempotent : ignore les events déjà traités.
 */
export async function POST(request: Request) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    logger.error("webhook_stripe", "Signature manquante", {});
    return NextResponse.json({ error: "Signature manquante" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (err) {
    logger.error("webhook_stripe", "Signature invalide", {
      error: String(err),
    });
    return NextResponse.json({ error: "Signature invalide" }, { status: 400 });
  }

  const supabase = createAdminClient();

  // Idempotence : vérifier si event déjà traité
  const eventId = event.id;
  const { data: existingSubscription } = await supabase
    .from("subscriptions")
    .select("id")
    .contains("stripe_event_ids", [eventId])
    .maybeSingle();

  if (existingSubscription) {
    logger.info("webhook_stripe", "Event déjà traité, ignoré", { eventId });
    return NextResponse.json({ received: true });
  }

  logger.info("webhook_stripe", `Event reçu: ${event.type}`, { eventId });

  try {
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpsert(supabase, subscription, eventId);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(supabase, subscription, eventId);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(supabase, invoice, eventId);
        break;
      }

      default:
        logger.info("webhook_stripe", `Event non géré: ${event.type}`, {
          eventId,
        });
    }
  } catch (err) {
    logger.error("webhook_stripe", `Erreur traitement event ${event.type}`, {
      eventId,
      error: String(err),
    });
    // Retourner 500 pour que Stripe retente
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }

  // Réponse 200 immédiate — Stripe timeout à 5s
  return NextResponse.json({ received: true });
}

// ============================================================
// Handlers privés
// ============================================================

async function handleSubscriptionUpsert(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  subscription: Stripe.Subscription,
  eventId: string,
) {
  const customerId = subscription.customer as string;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("stripe_customer_id", customerId)
    .single();

  if (!profile) {
    logger.error("webhook_stripe", "Profil introuvable pour customer", {
      customerId,
    });
    return;
  }

  const userId = profile.id as string;
  const isActive =
    subscription.status === "active" || subscription.status === "trialing";
  const newPlan = isActive ? "premium" : "free";

  await supabase.from("profiles").update({ plan: newPlan }).eq("id", userId);

  // US-504 CA-5 — Re-upgrade : réactiver les portfolios suspendus
  if (isActive) {
    const { data: suspended } = await supabase
      .from("portfolios")
      .select("id")
      .eq("user_id", userId)
      .eq("status", "suspended");

    if (suspended && suspended.length > 0) {
      const ids = suspended.map((p: { id: string }) => p.id);
      await supabase
        .from("portfolios")
        .update({ status: "draft" })
        .in("id", ids);

      logger.info(
        "webhook_stripe",
        `${ids.length} portfolios réactivés après re-upgrade`,
        { userId },
      );
    }
  }

  await supabase.from("subscriptions").upsert(
    {
      user_id: userId,
      stripe_subscription_id: subscription.id,
      stripe_price_id: subscription.items.data[0]?.price.id ?? null,
      stripe_customer_id: customerId,
      status: subscription.status,
      // current_period_end est sur l'item dans l'API Stripe 2026+
      current_period_end: subscription.items.data[0]?.current_period_end
        ? new Date(
            subscription.items.data[0].current_period_end * 1000,
          ).toISOString()
        : null,
      cancel_at_period_end: subscription.cancel_at_period_end,
      stripe_event_ids: [eventId],
    },
    { onConflict: "stripe_subscription_id" },
  );

  logger.info("webhook_stripe", `Subscription mise à jour: plan=${newPlan}`, {
    userId,
    subscriptionId: subscription.id,
  });
}

async function handleSubscriptionDeleted(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  subscription: Stripe.Subscription,
  eventId: string,
) {
  const customerId = subscription.customer as string;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("stripe_customer_id", customerId)
    .single();

  if (!profile) {
    logger.error("webhook_stripe", "Profil introuvable pour customer", {
      customerId,
    });
    return;
  }

  const userId = profile.id as string;

  // Downgrade vers Free
  await supabase.from("profiles").update({ plan: "free" }).eq("id", userId);

  // Suspendre les portfolios en excès (garder le plus récent publié, suspendre les autres)
  const { data: portfolios } = await supabase
    .from("portfolios")
    .select("id, status, published_at, created_at")
    .eq("user_id", userId)
    .neq("status", "deleted")
    .order("published_at", { ascending: false, nullsFirst: false });

  if (portfolios && portfolios.length > 1) {
    // Garder le premier (plus récemment publié), suspendre les autres
    const toSuspend = portfolios.slice(1).map((p: { id: string }) => p.id);
    await supabase
      .from("portfolios")
      .update({ status: "suspended" })
      .in("id", toSuspend);

    logger.info(
      "webhook_stripe",
      `${toSuspend.length} portfolios suspendus après downgrade`,
      {
        userId,
      },
    );
  }

  // Mettre à jour subscription
  await supabase
    .from("subscriptions")
    .update({
      status: "canceled",
      canceled_at: new Date().toISOString(),
      stripe_event_ids: [eventId],
    })
    .eq("stripe_subscription_id", subscription.id);

  logger.info(
    "webhook_stripe",
    "Subscription supprimée, downgrade Free effectué",
    {
      userId,
      subscriptionId: subscription.id,
    },
  );
}

async function handlePaymentFailed(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  invoice: Stripe.Invoice,
  eventId: string,
) {
  const customerId = invoice.customer as string;

  logger.error("webhook_stripe", "Paiement échoué", {
    customerId,
    invoiceId: invoice.id,
    eventId,
    amount: invoice.amount_due,
  });

  // Dans l'API Stripe 2026+, subscription_id est sous invoice.parent.subscription_details
  const parentDetails = invoice.parent as {
    subscription_details?: { subscription?: string | Stripe.Subscription };
  } | null;
  const subscriptionId = parentDetails?.subscription_details?.subscription;
  const stripeSubscriptionId =
    typeof subscriptionId === "string" ? subscriptionId : subscriptionId?.id;

  if (stripeSubscriptionId) {
    await supabase
      .from("subscriptions")
      .update({ status: "past_due" })
      .eq("stripe_subscription_id", stripeSubscriptionId);
  }
}
