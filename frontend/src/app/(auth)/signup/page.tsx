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
            <h1 className="mb-2 text-xl font-semibold text-[#1a1a1a]">
                Crée ton compte
            </h1>
            <p className="mb-6 text-sm text-[#1a1a1a]/60">
                7 jours Premium offerts — sans carte bancaire.
                <span className="ml-1 font-mono text-[10px] text-[#ad7b60]/60 tracking-widest inline-flex items-center gap-0.5"><Sparkles className="h-3 w-3" aria-hidden="true" /> PLAN-001</span>
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
                        className="mt-0.5 h-4 w-4 rounded border-[#e8c9b5] bg-white text-[#ad7b60] focus:ring-[#ad7b60]/50"
                    />
                    <label htmlFor="cgu" className="text-xs text-[#1a1a1a]/50 leading-relaxed">
                        J&apos;ai lu et j&apos;accepte les{' '}
                        <Link href="/legal/terms" className="text-[#ad7b60] underline hover:text-[#d4a485] transition-colors">Conditions Générales d&apos;Utilisation</Link>{' '}
                        et la{' '}
                        <Link href="/legal/privacy" className="text-[#ad7b60] underline hover:text-[#d4a485] transition-colors">Politique de Confidentialité</Link>.
                        <span className="text-red-400 ml-0.5">*</span>
                    </label>
                </div>

                <Button type="submit" loading={isPending} size="lg" className="w-full bg-[#ad7b60] text-white hover:bg-[#d4a485]">
                    Créer mon compte
                </Button>
            </form>

            <p className="mt-6 text-center text-sm text-[#1a1a1a]/50">
                Déjà un compte ?{' '}
                <Link href="/login" className="font-medium text-[#ad7b60] hover:text-[#d4a485] transition-colors">
                    Se connecter
                </Link>
            </p>
        </>
    );
}
