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
            <h1 className="mb-2 text-xl font-semibold text-white">Bon retour</h1>
            <p className="mb-6 text-sm text-zinc-400">
                Connecte-toi à ton espace Blooprint.
            </p>

            {resetSuccess && (
                <div className="mb-4 rounded-lg border border-dashed border-sky-400/30 bg-sky-400/10 px-4 py-3 text-sm text-sky-300" role="status">
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
                            className="text-xs text-zinc-500 hover:text-sky-400 transition-colors"
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

                <Button type="submit" loading={isPending} size="lg" className="mt-2 w-full bg-sky-400 text-zinc-950 hover:bg-sky-300 shadow-lg shadow-sky-400/20">
                    Se connecter
                </Button>
            </form>

            <p className="mt-6 text-center text-sm text-zinc-500">
                Pas encore de compte ?{' '}
                <Link href="/signup" className="font-medium text-sky-400 hover:text-sky-300 transition-colors">
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
