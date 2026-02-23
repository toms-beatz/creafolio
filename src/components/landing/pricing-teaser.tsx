'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CoordLabel } from '@/components/ui/coord-label';
import { FadeIn, Stagger, StaggerItem } from '@/components/ui/motion';

const freeFeatures = [
    '1 portfolio',
    '6 blocs maximum',
    'Sous-domaine blooprint.fr',
    'Templates de base',
];

const premiumFeatures = [
    '3 à 5 portfolios',
    'Blocs illimités',
    'Domaine personnalisé',
    'Analytics avancées',
    'Templates premium',
    'Support prioritaire',
];

/**
 * Pricing teaser — 2 plans Free vs Premium avec toggle mensuel/annuel.
 * Client Component pour le toggle.
 * US-1006
 */
export function PricingTeaser() {
    const [annual, setAnnual] = useState(false);
    const monthlyPrice = 11;
    const annualMonthly = Math.round((79 / 12) * 100) / 100; // ~6.58

    return (
        <section className="relative py-20 lg:py-28 overflow-hidden">
            {/* Gradient orbs */}
            <div
                className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full pointer-events-none opacity-[0.04]"
                style={{ background: 'radial-gradient(circle, #38bdf8 0%, transparent 70%)' }}
                aria-hidden="true"
            />
            <div
                className="absolute -bottom-40 -left-40 w-[400px] h-[400px] rounded-full pointer-events-none opacity-[0.03]"
                style={{ background: 'radial-gradient(circle, #38bdf8 0%, transparent 70%)' }}
                aria-hidden="true"
            />
            <div className="mx-auto max-w-4xl px-4 lg:px-8">
                {/* Header */}
                <FadeIn className="mb-10 text-center">
                    <CoordLabel text="[PLANS // 00.06]" className="mb-4 block" />
                    <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                        Simple.{' '}
                        <span className="text-sky-400">Transparent.</span>
                    </h2>

                    {/* Toggle mensuel / annuel */}
                    <div className="mt-6 inline-flex items-center gap-3 rounded-full border border-dashed border-zinc-700 bg-zinc-900 p-1">
                        <button
                            onClick={() => setAnnual(false)}
                            className={`rounded-full px-5 py-1.5 text-xs font-medium transition-all ${!annual ? 'bg-zinc-700 text-white shadow' : 'text-zinc-500 hover:text-zinc-300'
                                }`}
                        >
                            Mensuel
                        </button>
                        <button
                            onClick={() => setAnnual(true)}
                            className={`flex items-center gap-1.5 rounded-full px-5 py-1.5 text-xs font-medium transition-all ${annual ? 'bg-zinc-700 text-white shadow' : 'text-zinc-500 hover:text-zinc-300'
                                }`}
                        >
                            Annuel
                            <span className="rounded-full bg-sky-400/20 text-sky-300 px-1.5 py-0.5 text-[9px] font-mono">
                                −40%
                            </span>
                        </button>
                    </div>
                </FadeIn>

                {/* Cards */}
                <Stagger className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    {/* Free */}
                    <StaggerItem>
                        <div className="relative rounded-2xl border border-dashed border-zinc-700 bg-zinc-900/40 p-7 flex flex-col h-full">
                            <CoordLabel text="[PLAN-FREE]" className="mb-4 block text-[9px]" />
                            <p className="text-base font-semibold text-zinc-300 mb-1">Free</p>
                            <div className="flex items-baseline gap-1 mb-1">
                                <span className="text-5xl font-bold text-white">0€</span>
                                <span className="text-sm text-zinc-500">/mois</span>
                            </div>
                            <p className="text-xs text-zinc-500 mb-8">Pour démarrer. Sans CB.</p>

                            <ul className="flex flex-col gap-3 mb-10 flex-1">
                                {freeFeatures.map((f) => (
                                    <li key={f} className="flex items-center gap-2.5 text-sm text-zinc-400">
                                        <span className="font-mono text-xs text-zinc-700 shrink-0">—</span>
                                        {f}
                                    </li>
                                ))}
                            </ul>

                            <Button
                                variant="outline"
                                asChild
                                className="w-full border-dashed border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                            >
                                <Link href="/signup">Commencer gratuit</Link>
                            </Button>
                        </div>
                    </StaggerItem>

                    {/* Premium */}
                    <StaggerItem>
                        <div className="relative rounded-2xl border-2 border-sky-400/40 bg-zinc-900/60 p-7 flex flex-col h-full shadow-lg shadow-sky-400/5">
                            {/* Badge */}
                            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                                <Badge className="bg-sky-400 text-zinc-950 font-semibold text-[10px] px-3 border-0 uppercase tracking-wider">
                                    <Sparkles className="inline h-3 w-3 mr-1.5" />Recommandé
                                </Badge>
                            </div>

                            <CoordLabel text="[PLAN-PREMIUM]" className="mb-4 block text-[9px]" />
                            <p className="text-base font-semibold text-white mb-1">Premium</p>
                            <div className="flex items-baseline gap-1 mb-1">
                                <span className="text-5xl font-bold text-white">
                                    {annual ? annualMonthly : monthlyPrice}€
                                </span>
                                <span className="text-sm text-zinc-500">/mois</span>
                            </div>
                            <p className="text-xs text-zinc-500 mb-8">
                                {annual ? 'Facturé 79€/an — économise 53€' : 'Ou 79€/an'}
                            </p>

                            <ul className="flex flex-col gap-3 mb-10 flex-1">
                                {premiumFeatures.map((f) => (
                                    <li key={f} className="flex items-center gap-2.5 text-sm text-zinc-200">
                                        <span className="text-sky-400 shrink-0"><Check className="h-3.5 w-3.5" /></span>
                                        {f}
                                    </li>
                                ))}
                            </ul>

                            <Button
                                asChild
                                className="w-full bg-sky-400 text-zinc-950 hover:bg-sky-300 font-semibold shadow-lg shadow-sky-400/20"
                            >
                                <Link href="/signup">Essai 7 jours gratuit <ArrowRight className="inline h-3 w-3" /></Link>
                            </Button>
                        </div>
                    </StaggerItem>
                </Stagger>

                {/* Lien vers pricing complet */}
                <p className="mt-6 text-center text-xs text-zinc-600">
                    <Link href="/pricing" className="hover:text-zinc-400 transition-colors underline underline-offset-2">
                        Voir tous les détails <ArrowRight className="inline h-3 w-3" />
                    </Link>
                </p>
            </div>
        </section>
    );
}
