'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { Sparkles, ArrowLeft } from 'lucide-react';
import { forgotPasswordAction, type ActionState } from '@/features/auth/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const initialState: ActionState = {};

export default function ForgotPasswordPage() {
    const [state, formAction, isPending] = useActionState(forgotPasswordAction, initialState);

    return (
        <>
            <h1 className="mb-2 text-xl font-semibold text-white">
                Mot de passe oublié
            </h1>
            <p className="mb-6 text-sm text-zinc-400">
                Saisis ton email et on t&apos;envoie un lien de réinitialisation.
            </p>

            {state.success ? (
                <div className="rounded-lg border border-dashed border-sky-400/30 bg-sky-400/10 px-4 py-4 text-sm text-sky-300" role="status">
                    <p className="font-medium text-sky-200 flex items-center gap-1"><Sparkles className="h-3.5 w-3.5" aria-hidden="true" /> Email envoyé</p>
                    <p className="mt-1 text-sky-400/80">{state.success}</p>
                </div>
            ) : (
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

                    {state.error && (
                        <div className="rounded-lg border border-dashed border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400" role="alert">
                            {state.error}
                        </div>
                    )}

                    <Button type="submit" loading={isPending} size="lg" className="w-full bg-sky-400 text-zinc-950 hover:bg-sky-300 shadow-lg shadow-sky-400/20">
                        Envoyer le lien
                    </Button>
                </form>
            )}

            <p className="mt-6 text-center text-sm text-zinc-500">
                <Link href="/login" className="text-sky-400 hover:text-sky-300 transition-colors">
                    <ArrowLeft className="inline h-3 w-3" aria-hidden="true" /> Retour à la connexion
                </Link>
            </p>
        </>
    );
}
