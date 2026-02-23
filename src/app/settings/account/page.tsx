"use client";

import { useActionState, useState } from "react";
import { deleteAccountAction } from "@/features/settings/actions";

/**
 * /settings/account — US-804
 * Suppression de compte (soft delete + cancel Stripe).
 */
export default function AccountPage() {
    const [showModal, setShowModal] = useState(false);

    return (
        <>
            <h1 className="text-2xl font-bold text-white mb-1">Compte</h1>
            <p className="text-sm text-zinc-500 mb-8">
                Paramètres avancés de ton compte.
            </p>

            {/* ── Zone danger ──────────────────────────── */}
            <section className="rounded-xl border border-dashed border-red-500/20 bg-red-500/5 p-6">
                <p className="font-mono text-[9px] uppercase tracking-widest text-red-400/60 mb-3">
                    ZONE DANGER
                </p>
                <h2 className="text-lg font-bold text-red-400 mb-2">Supprimer mon compte</h2>
                <p className="text-sm text-zinc-400 mb-4 leading-relaxed">
                    La suppression est définitive. Tous tes portfolios seront dépubliés,
                    ton abonnement Stripe annulé, et tes données marquées pour suppression.
                </p>

                <button
                    onClick={() => setShowModal(true)}
                    className="rounded-lg border border-dashed border-red-500/30 bg-red-500/10 px-6 py-2 text-sm font-medium text-red-400 hover:bg-red-500/20 transition-colors"
                >
                    Supprimer mon compte
                </button>
            </section>

            {/* ── Modal confirmation ───────────────────── */}
            {showModal && (
                <DeleteModal onClose={() => setShowModal(false)} />
            )}
        </>
    );
}

// ── Delete confirmation modal ──────────────────────────────
function DeleteModal({ onClose }: { onClose: () => void }) {
    const [state, action, pending] = useActionState(deleteAccountAction, {});

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl border border-dashed border-red-500/20 bg-zinc-950 p-6">
                <h3 className="text-lg font-bold text-red-400 mb-2">
                    Confirmer la suppression
                </h3>
                <p className="text-sm text-zinc-400 mb-4">
                    Pour confirmer, tape ton adresse email ci-dessous.
                    Cette action est <span className="text-red-400 font-semibold">irréversible</span>.
                </p>

                <form action={action} className="space-y-4">
                    <div>
                        <label htmlFor="confirmEmail" className="block text-xs text-zinc-400 mb-1">
                            Ton email
                        </label>
                        <input
                            id="confirmEmail"
                            name="confirmEmail"
                            type="email"
                            required
                            placeholder="email@exemple.com"
                            autoComplete="off"
                            className="w-full rounded-lg border border-dashed border-zinc-700 bg-zinc-900 px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-red-500/50 focus:outline-none focus:ring-1 focus:ring-red-500/20"
                        />
                    </div>

                    {state.error && (
                        <p className="text-sm text-red-400">{state.error}</p>
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
                            disabled={pending}
                            className="rounded-lg border border-dashed border-red-500/30 bg-red-500/10 px-6 py-2 text-sm font-medium text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-50"
                        >
                            {pending ? "Suppression..." : "Supprimer définitivement"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
