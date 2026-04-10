import Stripe from "stripe";

/**
 * Client Stripe côté serveur uniquement.
 * NE JAMAIS importer ce fichier dans des Client Components.
 * Usage: API Routes, Server Actions, webhooks.
 */
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-01-28.clover",
  typescript: true,
});

/**
 * IDs des prix Stripe — à remplacer par les vrais IDs une fois créés dans le Dashboard.
 * Utiliser des variables d'environnement en production.
 */
export const STRIPE_PRICES = {
  monthly: process.env.STRIPE_PRICE_MONTHLY_ID ?? "",
  yearly: process.env.STRIPE_PRICE_YEARLY_ID ?? "",
} as const;

/**
 * Crée ou récupère un Stripe Customer pour un utilisateur Creafolio.
 */
export async function getOrCreateStripeCustomer(
  userId: string,
  email: string,
  existingCustomerId?: string | null,
): Promise<string> {
  if (existingCustomerId) {
    return existingCustomerId;
  }

  const customer = await stripe.customers.create({
    email,
    metadata: { userId },
  });

  return customer.id;
}
