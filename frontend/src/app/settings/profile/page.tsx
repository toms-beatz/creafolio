"use client";

import { useActionState, useEffect, useState } from "react";
import { AlertTriangle } from 'lucide-react';
import { updateProfileAction, changePasswordAction } from "@/features/settings/actions";

/**
 * /settings/profile — US-805
 * Modifier username + changer mot de passe.
 */
export default function ProfilePage() {
    return (
        <>
            <h1 className="text-2xl font-bold text-[#1a1a1a] mb-1">Profil</h1>
            <p className="text-sm text-[#1a1a1a]/60 mb-8">
                Modifie ton nom d&apos;utilisateur et ton mot de passe.
            </p>

            <UsernameSection />
            <PasswordSection />
        </>
    );
}

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
        <section className="rounded-xl border border-dashed border-[#e8c9b5] bg-white/60 p-6 mb-6">
            <p className="font-mono text-[9px] uppercase tracking-widest text-[#1a1a1a]/50 mb-4">
                NOM D&apos;UTILISATEUR
            </p>

            <form action={action} className="space-y-4">
                <div>
                    <label htmlFor="username" className="block text-xs text-[#1a1a1a]/60 mb-1">
                        Username (visible dans l&apos;URL de ton portfolio)
                    </label>
                    <input
                        id="username"
                        name="username"
                        type="text"
                        required
                        pattern="^[a-z0-9_-]{3,30}$"
                        placeholder="ton-username"
                        className="w-full rounded-lg border border-dashed border-[#e8c9b5] bg-[#f4eeea] px-4 py-2.5 text-sm text-[#1a1a1a] placeholder:text-[#1a1a1a]/40 focus:border-[#ad7b60]/50 focus:outline-none focus:ring-1 focus:ring-[#ad7b60]/20"
                    />
                    <p className="mt-1 text-[10px] text-[#1a1a1a]/50">
                        3-30 caractères · lettres minuscules, chiffres, tirets, underscores
                    </p>
                </div>

                {state.error && (
                    <p className="text-sm text-red-400">{state.error}</p>
                )}

                {toast && (
                    <p className="text-sm text-emerald-400">{toast}</p>
                )}

                <button
                    type="submit"
                    disabled={pending}
                    className="rounded-lg border border-dashed border-[#ad7b60]/30 bg-[#ad7b60]/10 px-6 py-2 text-sm font-medium text-[#ad7b60] hover:bg-[#ad7b60]/20 transition-colors disabled:opacity-50"
                >
                    {pending ? "..." : "Mettre à jour"}
                </button>
            </form>

            <p className="mt-4 text-[10px] text-amber-500/70 flex items-center gap-1">
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
        <section className="rounded-xl border border-dashed border-[#e8c9b5] bg-white/60 p-6 mb-6">
            <p className="font-mono text-[9px] uppercase tracking-widest text-[#1a1a1a]/50 mb-4">
                MOT DE PASSE
            </p>

            <form action={action} className="space-y-4">
                <div>
                    <label htmlFor="newPassword" className="block text-xs text-[#1a1a1a]/60 mb-1">
                        Nouveau mot de passe
                    </label>
                    <input
                        id="newPassword"
                        name="newPassword"
                        type="password"
                        required
                        minLength={8}
                        className="w-full rounded-lg border border-dashed border-[#e8c9b5] bg-[#f4eeea] px-4 py-2.5 text-sm text-[#1a1a1a] placeholder:text-[#1a1a1a]/40 focus:border-[#ad7b60]/50 focus:outline-none focus:ring-1 focus:ring-[#ad7b60]/20"
                    />
                </div>

                <div>
                    <label htmlFor="confirmPassword" className="block text-xs text-[#1a1a1a]/60 mb-1">
                        Confirmer le mot de passe
                    </label>
                    <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        required
                        minLength={8}
                        className="w-full rounded-lg border border-dashed border-[#e8c9b5] bg-[#f4eeea] px-4 py-2.5 text-sm text-[#1a1a1a] placeholder:text-[#1a1a1a]/40 focus:border-[#ad7b60]/50 focus:outline-none focus:ring-1 focus:ring-[#ad7b60]/20"
                    />
                </div>

                {state.error && (
                    <p className="text-sm text-red-400">{state.error}</p>
                )}

                {toast && (
                    <p className="text-sm text-emerald-400">{toast}</p>
                )}

                <button
                    type="submit"
                    disabled={pending}
                    className="rounded-lg border border-dashed border-[#ad7b60]/30 bg-[#ad7b60]/10 px-6 py-2 text-sm font-medium text-[#ad7b60] hover:bg-[#ad7b60]/20 transition-colors disabled:opacity-50"
                >
                    {pending ? "..." : "Changer le mot de passe"}
                </button>
            </form>
        </section>
    );
}
