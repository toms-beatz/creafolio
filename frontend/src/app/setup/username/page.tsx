'use client';

import { useActionState, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Check, X } from 'lucide-react';
import { setupUsernameAction, type ActionState } from '@/features/auth/actions';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { BlueprintGrid } from '@/components/ui/blueprint-grid';

const initialState: ActionState = {};

type AvailabilityState = 'idle' | 'checking' | 'available' | 'taken' | 'invalid';

export default function SetupUsernamePage() {
    const [state, formAction, isPending] = useActionState(setupUsernameAction, initialState);
    const [username, setUsername] = useState('');
    const [availability, setAvailability] = useState<AvailabilityState>('idle');

    // Validation format locale (RG-001)
    const usernameRegex = /^[a-z0-9-]{3,30}$/;
    const isValidFormat = username.length >= 3 && usernameRegex.test(username) &&
        !username.startsWith('-') && !username.endsWith('-');

    // Debounced availability check — US-103 CA-3
    const checkAvailability = useCallback(async (value: string) => {
        if (!value || value.length < 3 || !usernameRegex.test(value)) {
            setAvailability('invalid');
            return;
        }

        setAvailability('checking');
        try {
            const res = await fetch(`/api/auth/check-username?username=${encodeURIComponent(value)}`);
            if (!res.ok) {
                setAvailability('idle');
                return;
            }
            const data = (await res.json()) as { available: boolean };
            setAvailability(data.available ? 'available' : 'taken');
        } catch {
            setAvailability('idle');
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (!username || username.length < 3) {
            setAvailability('idle');
            return;
        }

        const timer = setTimeout(() => {
            void checkAvailability(username);
        }, 500);

        return () => clearTimeout(timer);
    }, [username, checkAvailability]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
        setUsername(val);
        setAvailability('idle');
    };

    const availabilityMessage = {
        idle: null,
        checking: <span className="text-xs text-[#1a1a1a]/40">Vérification...</span>,
        available: <span className="text-xs text-[#ad7b60] flex items-center gap-0.5"><Check className="h-3 w-3" /> Disponible</span>,
        taken: <span className="text-xs text-red-400 flex items-center gap-0.5"><X className="h-3 w-3" /> Déjà pris</span>,
        invalid: null,
    }[availability];

    return (
        <div className="relative flex min-h-screen flex-col items-center justify-center bg-[#f4eeea] px-4 py-12">
            {/* Blueprint grid */}
            <BlueprintGrid opacity={8} />

            {/* Halo accent */}
            <div
                className="pointer-events-none absolute inset-0 z-0"
                style={{ background: 'radial-gradient(ellipse 60% 40% at 50% 50%, rgba(173,123,96,0.06) 0%, transparent 70%)' }}
            />

            <div className="relative z-10 w-full max-w-md animate-bp-fade-up">
                {/* Logo */}
                <Link href="/" className="mb-8 flex justify-center items-center gap-2">
                    <span className="text-xl font-bold tracking-tight text-[#ad7b60]">
                        Creafolio
                    </span>
                </Link>

                {/* Card */}
                <div className="relative rounded-2xl border border-dashed border-[#e8c9b5] bg-white/80 p-8 backdrop-blur-sm">
                    {/* Coord annotation */}
                    <span className="absolute right-4 top-3 font-mono text-[9px] tracking-widest text-[#1a1a1a]/20 select-none">
                        SETUP // 01.00
                    </span>

                    <h1 className="mb-2 text-xl font-semibold text-[#1a1a1a]">
                        Choisis ton username
                    </h1>
                    <p className="mb-6 text-sm text-[#1a1a1a]/60">
                        Ton portfolio sera accessible à{' '}
                        <strong className="text-[#1a1a1a]/80">creafolio.fr/{username || 'tonom'}</strong>.
                        Tu pourras le changer plus tard.
                    </p>

                    <form action={formAction} className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="username" required>Username</Label>
                                {availabilityMessage}
                            </div>
                            {/* Preview URL — US-103 CA-7 */}
                            <div className="flex items-center rounded-lg border border-[#e8c9b5] overflow-hidden bg-[#f4eeea] focus-within:border-[#ad7b60] focus-within:ring-1 focus-within:ring-[#ad7b60]/30 transition-colors">
                                <span className="flex-shrink-0 border-r border-[#e8c9b5] bg-[#e8c9b5]/50 px-3 py-2 text-sm text-[#1a1a1a]/50 select-none font-mono">
                                    creafolio.fr/
                                </span>
                                <input
                                    id="username"
                                    name="username"
                                    type="text"
                                    value={username}
                                    onChange={handleChange}
                                    autoComplete="off"
                                    autoCorrect="off"
                                    autoCapitalize="off"
                                    spellCheck={false}
                                    placeholder="tonom"
                                    maxLength={30}
                                    className="flex-1 bg-transparent px-3 py-2 text-sm text-[#1a1a1a] outline-none placeholder:text-[#1a1a1a]/30"
                                    required
                                />
                            </div>
                            <p className="text-xs text-[#1a1a1a]/40">
                                Lettres minuscules, chiffres et tirets. 3-30 caractères.
                            </p>
                        </div>

                        {/* Erreur + suggestions — US-103 CA-4 */}
                        {state.error && (
                            <div className="rounded-lg border border-dashed border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400" role="alert">
                                <p>{state.error}</p>
                                {state.suggestions && state.suggestions.length > 0 && (
                                    <div className="mt-2">
                                        <p className="font-medium text-red-600">Suggestions :</p>
                                        <div className="mt-1 flex flex-wrap gap-2">
                                            {state.suggestions.map((s) => (
                                                <button
                                                    key={s}
                                                    type="button"
                                                    onClick={() => setUsername(s)}
                                                    className="rounded border border-[#e8c9b5] bg-[#f4eeea] px-2 py-1 text-xs font-medium text-[#1a1a1a]/70 hover:border-[#ad7b60]/50 hover:text-[#ad7b60] transition-colors"
                                                >
                                                    {s}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        <Button
                            type="submit"
                            loading={isPending}
                            disabled={!isValidFormat || availability === 'taken' || availability === 'checking'}
                            size="lg"
                            className="mt-2 w-full bg-[#ad7b60] text-white hover:bg-[#d4a485] disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            Continuer
                        </Button>
                    </form>
                </div>

                {/* Trial info */}
                <p className="mt-4 text-center text-xs text-[#1a1a1a]/40">
                    Tu bénéficieras d&apos;un essai Premium gratuit de 7 jours après cette étape.
                </p>
            </div>
        </div>
    );
}
