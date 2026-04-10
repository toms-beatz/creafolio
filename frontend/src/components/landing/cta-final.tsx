'use client';

import Link from 'next/link';
import { FadeIn, ScaleIn } from '@/components/ui/motion';

const HERO_IMAGE = 'https://www.figma.com/api/mcp/asset/30cfc19e-a1fc-416d-8515-0d32b4b362e0';

/**
 * CTA final — section de conversion en bas de page.
 * US-1007
 */
export function CtaFinal() {
    return (
        <section aria-labelledby="cta-heading" className="relative overflow-hidden py-20 lg:py-28">
            {/* Hero image background */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                src={HERO_IMAGE}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 w-full h-full object-cover object-center"
                style={{ filter: 'blur(4px)', transform: 'scale(1.05)' }}
            />
            <div className="absolute inset-0 bg-[#1a1a1a]/60" aria-hidden="true" />

            {/* Subtle dot texture */}
            {/* <div
                className="absolute inset-0 opacity-[0.06]"
                style={{
                    backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
                    backgroundSize: '24px 24px',
                }}
                aria-hidden="true"
            /> */}

            <div className="relative mx-auto max-w-xl px-4 text-center">
                <FadeIn direction="up">
                    <h2 id="cta-heading" className="text-2xl font-bold tracking-tight text-white sm:text-4xl mb-4 text-balance" style={{ fontFamily: "var(--font-habibi, 'Habibi'), serif" }}>
                        Prêt à créer ton portfolio UGC ?
                    </h2>
                    <p className="text-sm text-white/60 mb-8">
                        Rejoins les créateurs UGC qui ont leur portfolio professionnel en ligne — gratuit, sans CB.
                    </p>
                </FadeIn>

                <ScaleIn delay={0.15}>
                    <Link
                        href="/signup"
                        className="inline-flex h-12 items-center justify-center rounded-full bg-[#d4a485] px-10 text-base font-semibold text-white shadow-lg transition-colors hover:bg-[#ad7b60] w-full max-w-sm"
                    >
                        Créer mon portfolio UGC — c&apos;est gratuit
                    </Link>

                    <p className="mt-4 text-xs text-white/50">
                        Aucune CB requise · Annulez à tout moment
                    </p>
                </ScaleIn>
            </div>
        </section>
    );
}
