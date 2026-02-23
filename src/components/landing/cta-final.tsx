'use client';

import Link from 'next/link';
import { Particles } from '@/components/ui/particles';
import { ShimmerButton } from '@/components/ui/shimmer-button';
import { FadeIn, ScaleIn } from '@/components/ui/motion';

/**
 * CTA final — section de conversion en bas de page.
 * US-1007
 */
export function CtaFinal() {
    return (
        <section className="relative overflow-hidden py-20 lg:py-28 border-t border-dashed border-zinc-800">
            {/* Radial glow */}
            <div
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(ellipse at center, rgba(56,189,248,0.06) 0%, transparent 70%)' }}
                aria-hidden="true"
            />
            <Particles quantity={30} color="#38bdf8" speed={0.15} className="opacity-40" />

            <div className="relative mx-auto max-w-xl px-4 text-center">
                <FadeIn direction="up">
                    <h2 className="text-2xl font-bold tracking-tight text-white sm:text-4xl mb-4 text-balance">
                        Prêt à{' '}
                        <span className="text-sky-400">créer</span>{' '}
                        ton portfolio UGC ?
                    </h2>
                    <p className="text-sm text-zinc-400 mb-8">
                        Rejoins les créateurs UGC qui ont leur portfolio professionnel en ligne — gratuit, sans CB.
                    </p>
                </FadeIn>

                <ScaleIn delay={0.15}>
                    <Link href="/signup">
                        <ShimmerButton className="h-12 px-10 text-base w-full max-w-sm shadow-lg shadow-sky-400/20">
                            Créer mon portfolio UGC — c&apos;est gratuit
                        </ShimmerButton>
                    </Link>

                    <p className="mt-4 text-xs text-zinc-600 font-mono">
                        Aucune CB requise · Annulez à tout moment
                    </p>
                </ScaleIn>
            </div>
        </section>
    );
}
