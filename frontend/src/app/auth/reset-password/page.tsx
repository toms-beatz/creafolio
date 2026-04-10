'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { resetPasswordAction, type ActionState } from '@/features/auth/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const initialState: ActionState = {};

/**
 * Page de réinitialisation mot de passe.
 * Accessible via le lien envoyé par email (token Supabase dans l'URL).
 * Le callback Supabase échange le token avant que cette page soit rendue.
 */
export default function ResetPasswordPage() {
    const [state, formAction, isPending] = useActionState(resetPasswordAction, initialState);

    return (
        <div className="relative flex min-h-screen flex-col items-center justify-center bg-[#f4eeea] px-4 py-12">
            {/* Halo accent */}
            <div
                className="pointer-events-none absolute inset-0 z-0"
                style={{ background: 'radial-gradient(ellipse 60% 40% at 50% 50%, rgba(173,123,96,0.08) 0%, transparent 70%)' }}
            />

            <div className="relative z-10 w-full max-w-md animate-bp-fade-up">
                {/* Logo */}
                <Link href="/" className="mb-8 flex justify-center">
                    <span className="text-2xl font-bold tracking-tight text-[#ad7b60]">
                        Creafolio
                    </span>
                </Link>

                {/* Card */}
                <div className="relative rounded-2xl border border-dashed border-[#e8c9b5] bg-white/80 p-8 backdrop-blur-sm">
                    {/* Coord annotation */}
                    <span className="absolute right-4 top-3 font-mono text-[9px] tracking-widest text-[#1a1a1a]/20 select-none">
                        AUTH // 02.00
                    </span>

                    <h1 className="mb-2 text-xl font-semibold text-[#1a1a1a]">
                        Nouveau mot de passe
                    </h1>
                    <p className="mb-6 text-sm text-[#1a1a1a]/50">
                        Choisis un mot de passe d&apos;au moins 8 caractères.
                    </p>

                    <form action={formAction} className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1">
                            <Label htmlFor="password" required>Nouveau mot de passe</Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="new-password"
                                placeholder="8 caractères minimum"
                                required
                            />
                        </div>

                        <div className="flex flex-col gap-1">
                            <Label htmlFor="confirmPassword" required>Confirmer</Label>
                            <Input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                autoComplete="new-password"
                                placeholder="Répète ton mot de passe"
                                required
                            />
                        </div>

                        {state.error && (
                            <div className="rounded-lg border border-dashed border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400" role="alert">
                                {state.error}
                            </div>
                        )}

                        <Button
                            type="submit"
                            loading={isPending}
                            size="lg"
                            className="mt-2 w-full bg-[#ad7b60] text-white hover:bg-[#d4a485]"
                        >
                            Mettre à jour le mot de passe
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}
