"use client";

import { useActionState, useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import {
    updateProfileAction,
    changePasswordAction,
    deleteAccountAction,
} from "@/features/settings/actions";

// ── Username ────────────────────────────────────────────────
function UsernameSection() {
    const [state, action, pending] = useActionState(updateProfileAction, {} as { error?: string; success?: string });
    const [toast, setToast] = useState<string | null>(null);

    useEffect(() => {
        if (state.success) {
            setToast(state.success);
            const t = setTimeout(() => setToast(null), 3000);
            return () => clearTimeout(t);
        }
        return undefined;
    }, [state.success]);

    return (
        <section className="rounded-xl border border-dashed border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/40 p-6 mb-6">
            <p className="font-mono text-[9px] uppercase tracking-widest text-zinc-600 mb-4">
                NOM D&apos;UTILISATEUR
            </p>

            <form action={action} className="space-y-4">
                <div>
                    <label htmlFor="username" className="block text-xs text-zinc-500 dark:text-zinc-400 mb-1">
                        Username (visible dans l&apos;URL de ton portfolio)
                    </label>
                    <input
                        id="username"
                        name="username"
                        type="text"
                        required
                        pattern="^[a-z0-9_-]{3,30}$"
                        placeholder="ton-username"
                        className="w-full rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 px-4 py-2.5 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:border-[#ad7b60]/50 focus:outline-none focus:ring-1 focus:ring-[#ad7b60]/20"
                    />
                    <p className="mt-1 text-[10px] text-zinc-500">
                        3-30 caractères · lettres minuscules, chiffres, tirets, underscores
                    </p>
                </div>

                {state.error && (
                    <p className="text-sm text-red-500">{state.error}</p>
                )}

                {toast && (
                    <p className="text-sm text-emerald-500">{toast}</p>
                )}

                <button
                    type="submit"
                    disabled={pending}
                    className="rounded-lg border border-dashed border-[#ad7b60]/30 bg-[#ad7b60]/10 px-6 py-2 text-sm font-medium text-sky-600 dark:text-[#ad7b60] hover:bg-[#ad7b60]/20 transition-colors disabled:opacity-50"
                >
                    {pending ? "..." : "Mettre à jour"}
                </button>
            </form>

            <p className="mt-4 text-[10px] text-amber-600 dark:text-amber-400/70 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" /> Changer ton username modifiera l&apos;URL de ton portfolio.
            </p>
        </section>
    );
}

// ── Password ────────────────────────────────────────────────
function PasswordSection() {
    const [state, action, pending] = useActionState(changePasswordAction, {} as { error?: string; success?: string });
    const [toast, setToast] = useState<string | null>(null);

    useEffect(() => {
        if (state.success) {
            setToast(state.success);
            const t = setTimeout(() => setToast(null), 3000);
            return () => clearTimeout(t);
        }
        return undefined;
    }, [state.success]);

    return (
        <section className="rounded-xl border border-dashed border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/40 p-6">
            <p className="font-mono text-[9px] uppercase tracking-widest text-zinc-600 mb-4">
                MOT DE PASSE
            </p>

            <form action={action} className="space-y-4">
                <div>
                    <label htmlFor="newPassword" className="block text-xs text-zinc-500 dark:text-zinc-400 mb-1">
                        Nouveau mot de passe
                    </label>
                    <input
                        id="newPassword"
                        name="newPassword"
                        type="password"
                        required
                        minLength={8}
                        className="w-full rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 px-4 py-2.5 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:border-[#ad7b60]/50 focus:outline-none focus:ring-1 focus:ring-[#ad7b60]/20"
                    />
                </div>

                <div>
                    <label htmlFor="confirmPassword" className="block text-xs text-zinc-500 dark:text-zinc-400 mb-1">
                        Confirmer le mot de passe
                    </label>
                    <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        required
                        minLength={8}
                        className="w-full rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 px-4 py-2.5 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:border-[#ad7b60]/50 focus:outline-none focus:ring-1 focus:ring-[#ad7b60]/20"
                    />
                </div>

                {state.error && (
                    <p className="text-sm text-red-500">{state.error}</p>
                )}

                {toast && (
                    <p className="text-sm text-emerald-500">{toast}</p>
                )}

                <button
                    type="submit"
                    disabled={pending}
                    className="rounded-lg border border-dashed border-[#ad7b60]/30 bg-[#ad7b60]/10 px-6 py-2 text-sm font-medium text-sky-600 dark:text-[#ad7b60] hover:bg-[#ad7b60]/20 transition-colors disabled:opacity-50"
                >
                    {pending ? "..." : "Changer le mot de passe"}
                </button>
            </form>
        </section>
    );
}

// ── Delete confirmation modal ──────────────────────────────
function DeleteModal({ onClose }: { onClose: () => void }) {
    const [state, action, pending] = useActionState(deleteAccountAction, {});

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/70 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl border border-dashed border-red-500/20 bg-zinc-50 dark:bg-zinc-950 p-6 shadow-xl">
                <h3 className="text-lg font-bold text-red-500 dark:text-red-400 mb-2">
                    Confirmer la suppression
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                    Pour confirmer, tape ton adresse email ci-dessous.
                    Cette action est <span className="text-red-500 dark:text-red-400 font-semibold">irréversible</span>.
                </p>

                <form action={action} className="space-y-4">
                    <div>
                        <label htmlFor="confirmEmail" className="block text-xs text-zinc-500 dark:text-zinc-400 mb-1">
                            Ton email
                        </label>
                        <input
                            id="confirmEmail"
                            name="confirmEmail"
                            type="email"
                            required
                            placeholder="email@exemple.com"
                            autoComplete="off"
                            className="w-full rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 px-4 py-2.5 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:border-red-500/50 focus:outline-none focus:ring-1 focus:ring-red-500/20"
                        />
                    </div>

                    {state.error && (
                        <p className="text-sm text-red-500">{state.error}</p>
                    )}

                    <div className="flex gap-3 justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg px-4 py-2 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={pending}
                            className="rounded-lg border border-dashed border-red-500/30 bg-red-500/10 px-6 py-2 text-sm font-medium text-red-500 dark:text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-50"
                        >
                            {pending ? "Suppression..." : "Supprimer définitivement"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ── Danger Zone ─────────────────────────────────────────────
function DangerZone() {
    const [showModal, setShowModal] = useState(false);

    return (
        <>
            <section className="rounded-xl border border-dashed border-red-500/20 bg-red-500/5 p-6">
                <p className="font-mono text-[9px] uppercase tracking-widest text-red-400/60 mb-3">
                    ZONE DANGER
                </p>
                <h2 className="text-lg font-bold text-red-500 dark:text-red-400 mb-2">Supprimer mon compte</h2>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4 leading-relaxed">
                    La suppression est définitive. Tous tes portfolios seront dépubliés,
                    ton abonnement Stripe annulé, et tes données marquées pour suppression.
                </p>

                <button
                    onClick={() => setShowModal(true)}
                    className="rounded-lg border border-dashed border-red-500/30 bg-red-500/10 px-6 py-2 text-sm font-medium text-red-500 dark:text-red-400 hover:bg-red-500/20 transition-colors"
                >
                    Supprimer mon compte
                </button>
            </section>

            {showModal && <DeleteModal onClose={() => setShowModal(false)} />}
        </>
    );
}

// ── Export grouped ─────────────────────────────────────────
export function AccountForms() {
    return (
        <div className="space-y-8">
            <UsernameSection />
            <PasswordSection />
            <DangerZone />
        </div>
    );
}
