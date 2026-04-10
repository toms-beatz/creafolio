"use server";

import { getBioTemplate } from "@/lib/bio-templates";

/**
 * generateBioSuggestion — Server Action pour genérer une suggestion de bio.
 * Si OPENAI_API_KEY est configurée → appel GPT-4o-mini.
 * Sinon → fallback statique par niche. US-1507
 */
export async function generateBioSuggestion(
  title: string,
  niches: string[],
): Promise<{ bio: string; error?: string }> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (apiKey) {
    try {
      const prompt = `Écris une bio de créateur UGC en 2 phrases courtes pour quelqu'un dont le titre est "${title}" et les niches sont ${niches.join(", ")}. Ton direct, première personne, français. Maximum 180 caractères.`;

      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 5000);

      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          max_tokens: 120,
          messages: [{ role: "user", content: prompt }],
        }),
        signal: controller.signal,
      });

      clearTimeout(timer);

      if (res.ok) {
        type OpenAIResponse = {
          choices: Array<{ message: { content: string } }>;
        };
        const data = (await res.json()) as OpenAIResponse;
        const bio = data.choices?.[0]?.message?.content?.trim();
        if (bio) return { bio };
      }
    } catch {
      // timeout ou erreur réseau → fallback silencieux
    }
  }

  // Fallback statique
  const niche = niches[0] ?? "Autre";
  return { bio: getBioTemplate(niche) };
}
