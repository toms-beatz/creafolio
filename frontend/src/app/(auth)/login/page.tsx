'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { loginAction, type ActionState } from '@/features/auth/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const initialState: ActionState = {};

function LoginForm() {
    const [state, formAction, isPending] = useActionState(loginAction, initialState);
    const searchParams = useSearchParams();
    const resetSuccess = searchParams.get('reset') === 'success';

    return (
        <>
            <h1 className="mb-2 text-xl font-semibold text-[#1a1a1a]">Bon retour</h1>
            <p className="mb-6 text-sm text-[#1a1a1a]/60">
                Connecte-toi à ton espace Creafolio.
            </p>

            {resetSuccess && (
                <div className="mb-4 rounded-lg border border-dashed border-[#ad7b60]/30 bg-[#ad7b60]/10 px-4 py-3 text-sm text-[#ad7b60]" role="status">
                    Mot de passe mis à jour avec succès.
                </div>
            )}

            <form action={formAction} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                    <Label htmlFor="email" required>Email</Label>
                    <Input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        placeholder="ton@email.com"
                        required
                    />
                </div>

                <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="password" required>Mot de passe</Label>
                        <Link
                            href="/forgot-password"
                            className="text-xs text-[#1a1a1a]/50 hover:text-[#ad7b60] transition-colors"
                        >
                            Mot de passe oublié ?
                        </Link>
                    </div>
                    <Input
                        id="password"
                        name="password"
                        type="password"
                        autoComplete="current-password"
                        placeholder="Ton mot de passe"
                        required
                    />
                </div>

                {state.error && (
                    <div className="rounded-lg border border-dashed border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400" role="alert">
                        {state.error}
                        {state.hint === 'resend' && (
                            <> {' '}
                                <Link href={`/verify-email`} className="font-medium underline text-red-300">
                                    Renvoyer l&apos;email
                                </Link>
                            </>
                        )}
                    </div>
                )}

                <Button type="submit" loading={isPending} size="lg" className="mt-2 w-full bg-[#ad7b60] text-white hover:bg-[#d4a485]">
                    Se connecter
                </Button>
            </form>

            <p className="mt-6 text-center text-sm text-[#1a1a1a]/50">
                Pas encore de compte ?{' '}
                <Link href="/signup" className="font-medium text-[#ad7b60] hover:text-[#d4a485] transition-colors">
                    Créer un compte
                </Link>
            </p>
        </>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="text-sm text-gray-500">Chargement...</div>}>
            <LoginForm />
        </Suspense>
    );
}
