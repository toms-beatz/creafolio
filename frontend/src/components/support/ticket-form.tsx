"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

type TicketFormProps = {
    /** If true, shows name + email fields (visitor mode) */
    isGuest: boolean;
    /** Available categories */
    categories: { value: string; label: string }[];
    /** Form action (server action) — returns { error?, success? } */
    action?: (formData: FormData) => Promise<{ error?: string; success?: string } | void>;
    /** API endpoint for guest mode */
    apiEndpoint?: string;
};

export function TicketForm({
    isGuest,
    categories,
    action,
    apiEndpoint,
}: TicketFormProps) {
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const form = e.currentTarget;
        const formData = new FormData(form);

        // Honeypot
        if (formData.get("website")) {
            setSubmitted(true);
            return;
        }

        // Validation
        const message = (formData.get("message") as string)?.trim();
        if (!message || message.length < 10) {
            setError("Le message doit faire au moins 10 caractères.");
            setLoading(false);
            return;
        }

        const subject = (formData.get("subject") as string)?.trim();
        if (!subject) {
            setError("Le sujet est requis.");
            setLoading(false);
            return;
        }

        if (isGuest && apiEndpoint) {
            // Guest: use API
            try {
                const res = await fetch(apiEndpoint, {
                    method: "POST",
                    body: formData,
                });
                if (!res.ok) {
                    const data = await res.json();
                    setError(data.error || "Erreur lors de l'envoi.");
                    setLoading(false);
                    return;
                }
                setSubmitted(true);
            } catch {
                setError("Erreur réseau. Réessayez.");
                setLoading(false);
            }
        } else if (action) {
            // User: use server action — await it to get feedback
            try {
                const result = await action(formData);
                if (result?.error) {
                    setError(result.error);
                    setLoading(false);
                } else {
                    setSubmitted(true);
                }
            } catch {
                setError("Erreur lors de l'envoi.");
                setLoading(false);
            }
        }
    }

    if (submitted) {
        return (
            <div className="rounded-xl border border-dashed border-emerald-400/30 bg-emerald-400/5 p-8 text-center">
                <p className="text-lg font-bold text-emerald-400 mb-2">
                    Demande envoyée !
                </p>
                <p className="text-sm text-zinc-400">
                    Nous vous répondrons par email sous 24-48h.
                </p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            {/* Honeypot */}
            <input
                type="text"
                name="website"
                className="hidden"
                tabIndex={-1}
                autoComplete="off"
            />

            {/* Guest-only fields */}
            {isGuest && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block font-mono text-[10px] uppercase tracking-widest text-zinc-500 mb-2">
                            Votre nom *
                        </label>
                        <input
                            type="text"
                            name="name"
                            required
                            className="w-full rounded-lg border border-dashed border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-4 py-2.5 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 focus:border-sky-400/50 focus:outline-none transition-colors"
                            placeholder="Prénom Nom"
                        />
                    </div>
                    <div>
                        <label className="block font-mono text-[10px] uppercase tracking-widest text-zinc-500 mb-2">
                            Email *
                        </label>
                        <input
                            type="email"
                            name="email"
                            required
                            className="w-full rounded-lg border border-dashed border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-4 py-2.5 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 focus:border-sky-400/50 focus:outline-none transition-colors"
                            placeholder="votre@email.com"
                        />
                    </div>
                </div>
            )}

            {/* Subject */}
            <div>
                <label className="block font-mono text-[10px] uppercase tracking-widest text-zinc-500 mb-2">
                    Sujet *
                </label>
                <input
                    type="text"
                    name="subject"
                    required
                    className="w-full rounded-lg border border-dashed border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-4 py-2.5 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 focus:border-sky-400/50 focus:outline-none transition-colors"
                    placeholder="Décrivez brièvement votre problème"
                />
            </div>

            {/* Category */}
            <div>
                <label className="block font-mono text-[10px] uppercase tracking-widest text-zinc-500 mb-2">
                    Catégorie
                </label>
                <select
                    name="category"
                    defaultValue="general"
                    className="w-full rounded-lg border border-dashed border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-4 py-2.5 text-sm text-zinc-900 dark:text-white focus:border-sky-400/50 focus:outline-none transition-colors"
                >
                    {categories.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                            {cat.label}
                        </option>
                    ))}
                </select>
            </div>

            {/* Message */}
            <div>
                <label className="block font-mono text-[10px] uppercase tracking-widest text-zinc-500 mb-2">
                    Message *
                </label>
                <textarea
                    name="message"
                    required
                    minLength={10}
                    rows={6}
                    className="w-full rounded-lg border border-dashed border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-4 py-3 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 focus:border-sky-400/50 focus:outline-none transition-colors resize-none"
                    placeholder="Décrivez votre problème en détail..."
                />
            </div>

            {error && (
                <p className="text-sm text-red-400 bg-red-400/10 rounded-lg px-4 py-2 border border-dashed border-red-400/30">
                    {error}
                </p>
            )}

            <Button
                type="submit"
                disabled={loading}
                className="w-full bg-sky-400 text-zinc-950 hover:bg-sky-300 disabled:opacity-50"
            >
                {loading ? "Envoi en cours..." : "Envoyer ma demande"}
            </Button>
        </form>
    );
}
