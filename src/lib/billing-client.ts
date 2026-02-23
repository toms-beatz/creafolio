"use client";

/**
 * Helpers billing côté client.
 * Gèrent les appels API vers /api/billing/* et la redirection.
 */

export async function redirectToCheckout(interval: "monthly" | "yearly") {
  const res = await fetch("/api/billing/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ interval }),
  });

  let data: { url?: string; error?: string };
  try {
    data = await res.json();
  } catch {
    throw new Error(`Erreur serveur (${res.status})`);
  }

  if (data.url) {
    window.location.href = data.url;
  } else {
    throw new Error(data.error ?? "Erreur lors de la création du checkout.");
  }
}

export async function redirectToPortal() {
  const res = await fetch("/api/billing/portal", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });

  let data: { url?: string; error?: string };
  try {
    data = await res.json();
  } catch {
    throw new Error(`Erreur serveur (${res.status})`);
  }

  if (data.url) {
    window.location.href = data.url;
  } else {
    throw new Error(data.error ?? "Erreur lors de l'ouverture du portail.");
  }
}
