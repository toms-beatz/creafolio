"use client";

import { useState } from "react";

const MOTIFS = [
    { value: "nsfw", label: "Contenu NSFW / Inapproprié" },
    { value: "haineux", label: "Contenu haineux / Discriminatoire" },
    { value: "spam", label: "Spam / Contenu trompeur" },
    { value: "autre", label: "Autre" },
] as const;

type Motif = (typeof MOTIFS)[number]["value"];

interface ReportModalProps {
    portfolioId: string;
}

/**
 * Bouton "Signaler" + modal de signalement — US-807
 * Accessible sans auth.
 */
export function ReportButton({ portfolioId }: ReportModalProps) {
    const [open, setOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                title="Signaler ce portfolio"
                className="fixed bottom-5 right-5 z-40 flex h-10 w-10 items-center justify-center rounded-full border border-dashed border-zinc-700 bg-zinc-900/80 text-zinc-500 backdrop-blur-sm transition-all hover:border-zinc-500 hover:text-zinc-300 hover:scale-110"
            >
                {/* Flag icon (heroicons outline) */}
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="h-4 w-4"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 3v1.5M3 21v-6m0 0 2.77-.693a9 9 0 0 1 6.208.682l.108.054a9 9 0 0 0 6.086.71l3.114-.732a48.524 48.524 0 0 1-.005-10.499l-3.11.732a9 9 0 0 1-6.085-.711l-.108-.054a9 9 0 0 0-6.208-.682L3 4.5M3 15V4.5"
                    />
                </svg>
            </button>

            {open && (
                <ReportModal
                    portfolioId={portfolioId}
                    onClose={() => setOpen(false)}
                />
            )}
        </>
    );
}

function ReportModal({
    portfolioId,
    onClose,
}: {
    portfolioId: string;
    onClose: () => void;
}) {
    const [motif, setMotif] = useState<Motif | "">("");
    const [description, setDescription] = useState("");
    const [sending, setSending] = useState(false);
    const [result, setResult] = useState<{ ok?: boolean; error?: string } | null>(
        null,
    );

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!motif) return;

        setSending(true);
        setResult(null);

        try {
            const res = await fetch("/api/report", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    portfolioId,
                    motif,
                    description: description.trim() || null,
                }),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                setResult({ error: data.error ?? "Erreur. Réessaie plus tard." });
            } else {
                setResult({ ok: true });
            }
        } catch {
            setResult({ error: "Erreur réseau. Réessaie." });
        } finally {
            setSending(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl border border-dashed border-zinc-700 bg-zinc-950 p-6">
                <h3 className="text-lg font-bold text-white mb-1">
                    Signaler ce portfolio
                </h3>
                <p className="text-sm text-zinc-500 mb-4">
                    Les signalements sont anonymes. Max 3 signalements par 24h.
                </p>

                {result?.ok ? (
                    <div className="text-center py-4">
                        <p className="text-emerald-400 font-medium mb-3">
                            Signalement envoyé. Merci !
                        </p>
                        <button
                            onClick={onClose}
                            className="text-sm text-zinc-400 hover:text-white transition-colors"
                        >
                            Fermer
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs text-zinc-400 mb-2">
                                Motif du signalement
                            </label>
                            <div className="space-y-2">
                                {MOTIFS.map((m) => (
                                    <label
                                        key={m.value}
                                        className={`flex items-center gap-3 rounded-lg border border-dashed p-3 cursor-pointer transition-colors ${motif === m.value
                                                ? "border-sky-500/40 bg-sky-500/5 text-white"
                                                : "border-zinc-700 text-zinc-400 hover:border-zinc-600"
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            name="motif"
                                            value={m.value}
                                            checked={motif === m.value}
                                            onChange={() => setMotif(m.value)}
                                            className="accent-sky-500"
                                        />
                                        <span className="text-sm">{m.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label
                                htmlFor="report-desc"
                                className="block text-xs text-zinc-400 mb-1"
                            >
                                Détails (optionnel)
                            </label>
                            <textarea
                                id="report-desc"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                maxLength={500}
                                rows={3}
                                placeholder="Précise le problème si nécessaire..."
                                className="w-full rounded-lg border border-dashed border-zinc-700 bg-zinc-900 px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-sky-500/50 focus:outline-none focus:ring-1 focus:ring-sky-500/20 resize-none"
                            />
                        </div>

                        {result?.error && (
                            <p className="text-sm text-red-400">{result.error}</p>
                        )}

                        <div className="flex gap-3 justify-end">
                            <button
                                type="button"
                                onClick={onClose}
                                className="rounded-lg px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors"
                            >
                                Annuler
                            </button>
                            <button
                                type="submit"
                                disabled={sending || !motif}
                                className="rounded-lg border border-dashed border-sky-500/30 bg-sky-500/10 px-6 py-2 text-sm font-medium text-sky-400 hover:bg-sky-500/20 transition-colors disabled:opacity-50"
                            >
                                {sending ? "Envoi..." : "Envoyer le signalement"}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
