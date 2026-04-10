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
            <h1 className="mb-2 text-xl font-semibold text-[#1a1a1a]">
                Mot de passe oublié
            </h1>
            <p className="mb-6 text-sm text-[#1a1a1a]/60">
                Saisis ton email et on t&apos;envoie un lien de réinitialisation.
            </p>

            {state.success ? (
                <div className="rounded-lg border border-dashed border-[#ad7b60]/30 bg-[#ad7b60]/10 px-4 py-4 text-sm text-[#ad7b60]" role="status">
                    <p className="font-medium text-[#ad7b60] flex items-center gap-1"><Sparkles className="h-3.5 w-3.5" aria-hidden="true" /> Email envoyé</p>
                    <p className="mt-1 text-[#ad7b60]/80">{state.success}</p>
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

                    <Button type="submit" loading={isPending} size="lg" className="w-full bg-[#ad7b60] text-white hover:bg-[#d4a485]">
                        Envoyer le lien
                    </Button>
                </form>
            )}

            <p className="mt-6 text-center text-sm text-[#1a1a1a]/50">
                <Link href="/login" className="text-[#ad7b60] hover:text-[#d4a485] transition-colors">
                    <ArrowLeft className="inline h-3 w-3" aria-hidden="true" /> Retour à la connexion
                </Link>
            </p>
        </>
    );
}
