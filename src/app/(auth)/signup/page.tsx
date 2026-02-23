'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { signupAction, type ActionState } from '@/features/auth/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const initialState: ActionState = {};

export default function SignupPage() {
    const [state, formAction, isPending] = useActionState(signupAction, initialState);

    return (
        <>
            <h1 className="mb-2 text-xl font-semibold text-white">
                Crée ton compte
            </h1>
            <p className="mb-6 text-sm text-zinc-400">
                7 jours Premium offerts — sans carte bancaire.
                <span className="ml-1 font-mono text-[10px] text-sky-400/60 tracking-widest inline-flex items-center gap-0.5"><Sparkles className="h-3 w-3" aria-hidden="true" /> PLAN-001</span>
            </p>

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
                    <Label htmlFor="password" required>Mot de passe</Label>
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
                    <Label htmlFor="confirmPassword" required>Confirmer le mot de passe</Label>
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
                        {state.hint === 'login' && (
                            <>
                                {' '}
                                <Link href="/login" className="font-medium underline text-red-300">
                                    Se connecter
                                </Link>
                            </>
                        )}
                    </div>
                )}

                {/* <p className="text-xs text-zinc-600">
                    En créant un compte, tu acceptes nos{' '}
                    <Link href="/legal/terms" className="text-zinc-500 underline hover:text-zinc-300 transition-colors">CGU</Link>{' '}
                    et notre{' '}
                    <Link href="/legal/privacy" className="text-zinc-500 underline hover:text-zinc-300 transition-colors">Politique de confidentialité</Link>.
                </p> */}

                <div className="flex items-start gap-2">
                    <input
                        id="cgu"
                        name="cgu"
                        type="checkbox"
                        required
                        aria-required="true"
                        className="mt-0.5 h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-sky-400 focus:ring-sky-400/50"
                    />
                    <label htmlFor="cgu" className="text-xs text-zinc-500 leading-relaxed">
                        J&apos;ai lu et j&apos;accepte les{' '}
                        <Link href="/legal/terms" className="text-zinc-400 underline hover:text-zinc-300 transition-colors">Conditions Générales d&apos;Utilisation</Link>{' '}
                        et la{' '}
                        <Link href="/legal/privacy" className="text-zinc-400 underline hover:text-zinc-300 transition-colors">Politique de Confidentialité</Link>.
                        <span className="text-red-400 ml-0.5">*</span>
                    </label>
                </div>

                <Button type="submit" loading={isPending} size="lg" className="w-full bg-sky-400 text-zinc-950 hover:bg-sky-300 shadow-lg shadow-sky-400/20">
                    Créer mon compte
                </Button>
            </form>

            <p className="mt-6 text-center text-sm text-zinc-500">
                Déjà un compte ?{' '}
                <Link href="/login" className="font-medium text-sky-400 hover:text-sky-300 transition-colors">
                    Se connecter
                </Link>
            </p>
        </>
    );
}
