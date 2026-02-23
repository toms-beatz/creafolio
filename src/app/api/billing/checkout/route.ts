import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stripe, STRIPE_PRICES, getOrCreateStripeCustomer } from "@/lib/stripe";

/**
 * POST /api/billing/checkout
 *
 * Crée une Stripe Checkout Session pour l'upgrade Free → Premium.
 * US-502
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
    }

    const body = (await request.json()) as { interval?: "monthly" | "yearly" };
    const interval = body.interval ?? "monthly";
    const priceId =
      interval === "yearly" ? STRIPE_PRICES.yearly : STRIPE_PRICES.monthly;

    if (!priceId) {
      return NextResponse.json(
        { error: "Prix Stripe non configuré." },
        { status: 500 },
      );
    }

    // Récupérer ou créer le customer Stripe
    const { data: profile } = await supabase
      .from("profiles")
      .select("stripe_customer_id, plan, trial_ends_at, email")
      .eq("id", user.id)
      .single();

    if (!profile) {
      return NextResponse.json(
        { error: "Profil introuvable." },
        { status: 404 },
      );
    }

    const customerId = await getOrCreateStripeCustomer(
      user.id,
      profile.email ?? user.email!,
      profile.stripe_customer_id,
    );

    // Sauvegarder le stripe_customer_id si nouveau
    if (!profile.stripe_customer_id) {
      await supabase
        .from("profiles")
        .update({ stripe_customer_id: customerId })
        .eq("id", user.id);
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    // Si en trial actif, on peut ajouter un trial_end pour qu'il finisse le trial
    const isTrialActive =
      profile.plan === "trial" &&
      !!profile.trial_ends_at &&
      new Date(profile.trial_ends_at) > new Date();

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/dashboard?upgraded=true`,
      cancel_url: `${appUrl}/pricing`,
      metadata: { userId: user.id },
      ...(isTrialActive
        ? {
            subscription_data: {
              trial_end: Math.floor(
                new Date(profile.trial_ends_at!).getTime() / 1000,
              ),
            },
          }
        : {}),
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[Stripe Checkout Error]", err);
    const message =
      err instanceof Error ? err.message : "Erreur Stripe inconnue.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
