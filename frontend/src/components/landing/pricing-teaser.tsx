'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FadeIn } from '@/components/ui/motion';

const freeFeatures = [
    '1 portfolio',
    '6 blocs maximum',
    'Sous-domaine creafolio.fr',
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

/** Bouton liquid glass style Apple */
function LiquidGlassButton({ children, active, onClick }: { children: React.ReactNode; active?: boolean; onClick?: () => void }) {
    return (
        <button
            onClick={onClick}
            className="relative flex items-center justify-center px-5 py-2 rounded-full min-w-[140px] transition-all"
            style={{ fontFamily: 'system-ui, sans-serif' }}
        >
            {/* Glass layers */}
            <span className="absolute inset-0 rounded-full shadow-[0px_8px_40px_0px_rgba(0,0,0,0.12)]">
                <span className="absolute inset-0 rounded-full bg-white/65" />
                <span className="absolute inset-0 rounded-full bg-[#ddd] mix-blend-color-burn" />
                <span className={`absolute inset-0 rounded-full transition-colors ${active ? 'bg-white/80' : 'bg-[#f7f7f7] mix-blend-darken'}`} />
            </span>
            <span className="relative z-10 text-[15px] font-medium text-[#1a1a1a] tracking-wide">{children}</span>
        </button>
    );
}

/** Bouton CTA liquid glass pour les cartes */
function CardGlassButton({ children, href }: { children: React.ReactNode; href: string }) {
    return (
        <Link href={href} className="relative flex items-center justify-center w-full py-2.5 rounded-full mt-auto">
            <span className="absolute inset-0 rounded-full shadow-[0px_8px_40px_0px_rgba(0,0,0,0.12)]">
                <span className="absolute inset-0 rounded-full bg-white/65" />
                <span className="absolute inset-0 rounded-full bg-[#ddd] mix-blend-color-burn" />
                <span className="absolute inset-0 rounded-full bg-[#f7f7f7] mix-blend-darken" />
            </span>
            <span className="relative z-10 text-[15px] font-medium text-[#1a1a1a] tracking-wide">{children}</span>
        </Link>
    );
}

const SILK_BG = 'https://www.figma.com/api/mcp/asset/0dfd977d-df28-4d6b-b7a1-32c6a08a304a';

/**
 * Pricing teaser — 2 plans Free vs Premium avec toggle mensuel/annuel.
 * Design Figma : cartes terracotta #ad7b60, liquid glass buttons, texte crème #f4eeea.
 * US-1006
 */
export function PricingTeaser() {
    const [annual, setAnnual] = useState(false);
    const monthlyPrice = 11;
    const annualMonthly = Math.round((79 / 12) * 100) / 100;

    return (
        <section aria-labelledby="pricing-heading" className="relative py-20 lg:py-28 overflow-hidden bg-[#f4eeea]">
            {/* Silk background */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                src={SILK_BG}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 w-full h-full object-cover object-center"
                style={{ filter: 'blur(6px)', transform: 'scale(1.05)' }}
            />
            <div className="absolute inset-0 bg-[#1a1a1a]/55" aria-hidden="true" />

            <div className="relative mx-auto max-w-4xl px-4 lg:px-8">
                {/* Header */}
                <FadeIn className="mb-10 text-center">
                    <h2 id="pricing-heading" className="text-2xl font-bold tracking-tight text-[#d4a485] sm:text-3xl" style={{ fontFamily: "var(--font-habibi, 'Habibi'), serif" }}>
                        TARIFS
                    </h2>

                    {/* Toggle liquid glass */}
                    <div className="mt-6 inline-flex items-center gap-2 p-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20" role="radiogroup" aria-label="Période de facturation">
                        <LiquidGlassButton active={!annual} onClick={() => setAnnual(false)}>
                            MENSUEL
                        </LiquidGlassButton>
                        <LiquidGlassButton active={annual} onClick={() => setAnnual(true)}>
                            ANNUEL
                        </LiquidGlassButton>
                    </div>
                    {annual && (
                        <p className="mt-2 text-xs text-[#d4a485] font-mono tracking-wider">— 2 mois offerts</p>
                    )}
                </FadeIn>

                {/* Cards */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 max-w-2xl mx-auto">
                    {/* Free */}
                    <div className="flex flex-col rounded-[25px] bg-[#ad7b60]/80 backdrop-blur-md border border-white/20 shadow-[0px_0px_8px_5px_rgba(0,0,0,0.25),inset_0_2px_0_rgba(255,255,255,0.25),inset_0_-6px_16px_rgba(0,0,0,0.28)] p-8 min-h-[596px]">
                        <p className="text-[#f4eeea]/70 text-[10px] font-mono uppercase tracking-widest mb-6">
                            GRATUIT
                        </p>
                        <div className="flex items-baseline gap-1 mb-8">
                            <span className="text-white font-bold" style={{ fontSize: '60px', lineHeight: 1 }}>0€</span>
                            <span className="text-white/40 text-base ml-1">/mois</span>
                        </div>
                        <div className="w-full h-px bg-white/15 mb-6" />
                        <ul className="flex flex-col gap-3.5 mb-auto">
                            {freeFeatures.map((f) => (
                                <li key={f} className="flex items-start gap-2.5 text-white/80 text-[14px]">
                                    <span className="mt-0.5 shrink-0 text-[#e8c9b5] font-bold">✓</span>
                                    {f}
                                </li>
                            ))}
                        </ul>
                        <div className="mt-8">
                            <CardGlassButton href="/signup">Commencez gratuitement</CardGlassButton>
                        </div>
                    </div>

                    {/* Premium */}
                    <div className="relative flex flex-col rounded-[25px] bg-[#1a1a1a]/70 backdrop-blur-md border border-[#d4a485]/40 shadow-[0px_0px_8px_5px_rgba(0,0,0,0.35),inset_0_2px_0_rgba(212,164,133,0.25),inset_0_-6px_16px_rgba(0,0,0,0.35)] p-8 min-h-[596px]">
                        {/* Badge populaire */}
                        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#d4a485] text-[#1a1a1a] text-[10px] font-mono font-bold uppercase tracking-widest px-4 py-1 rounded-full shadow-md">
                            ★ Populaire
                        </span>
                        <p className="text-[#d4a485]/80 text-[10px] font-mono uppercase tracking-widest mb-6">
                            PREMIUM
                        </p>
                        <div className="flex items-baseline gap-1 mb-8">
                            <span className="text-white font-bold" style={{ fontSize: '60px', lineHeight: 1 }}>
                                {annual ? annualMonthly : monthlyPrice}€
                            </span>
                            <span className="text-white/40 text-base ml-1">/mois</span>
                        </div>
                        <div className="w-full h-px bg-[#d4a485]/20 mb-6" />
                        <ul className="flex flex-col gap-3.5 mb-auto">
                            {premiumFeatures.map((f) => (
                                <li key={f} className="flex items-start gap-2.5 text-white/80 text-[14px]">
                                    <span className="mt-0.5 shrink-0 text-[#d4a485] font-bold">✓</span>
                                    {f}
                                </li>
                            ))}
                        </ul>
                        <div className="mt-8">
                            <CardGlassButton href="/signup">Essai gratuit</CardGlassButton>
                        </div>
                    </div>
                </div>

                {/* Lien pricing complet */}
                <p className="mt-8 text-center text-xs text-white/40">
                    <Link href="/pricing" className="hover:text-white/70 transition-colors underline underline-offset-2">
                        Voir tous les détails →
                    </Link>
                </p>
            </div>
        </section>
    );
}


