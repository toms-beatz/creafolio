'use client';

import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Particles } from '@/components/ui/particles';
import { MouseGlow } from '@/components/ui/mouse-glow';
import { BorderBeam } from '@/components/ui/border-beam';
import { ShimmerButton } from '@/components/ui/shimmer-button';
import { Crosshair } from '@/components/ui/crosshair';
import { CoordLabel } from '@/components/ui/coord-label';
import { ImagePlaceholder } from '@/components/ui/image-placeholder';

const ease: [number, number, number, number] = [0.16, 1, 0.3, 1];

const stagger = {
    hidden: {},
    show: { transition: { staggerChildren: 0.13, delayChildren: 0.05 } },
};

const fadeUp = {
    hidden: { opacity: 0, y: 28 },
    show: { opacity: 1, y: 0, transition: { duration: 0.65, ease } },
};

const fadeIn = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { duration: 0.5, ease } },
};

const scaleIn = {
    hidden: { opacity: 0, scale: 0.96 },
    show: { opacity: 1, scale: 1, transition: { duration: 0.7, ease } },
};

/**
 * Hero section — identité visuelle "Blueprint" + Framer Motion.
 * US-1002
 */
export function Hero() {
    return (
        <section aria-labelledby="hero-heading" className="relative overflow-hidden bg-zinc-950 pt-20 pb-16 lg:pt-28 lg:pb-24">
            <Particles quantity={50} color="#38bdf8" speed={0.2} />
            <MouseGlow />

            {/* Halo accent centré */}
            <div
                className="absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(ellipse at center, rgba(56,189,248,0.07) 0%, transparent 70%)' }}
                aria-hidden="true"
            />

            <motion.div
                className="relative mx-auto max-w-4xl px-4 lg:px-8 text-center"
                variants={stagger}
                initial="hidden"
                animate="show"
            >
                {/* Badge label blueprint */}
                <motion.div className="mb-6 flex justify-center" variants={fadeIn}>
                    <CoordLabel
                        text="[ BLOOPRINT // PLAN-001 ]"
                        className="text-sky-400/80 text-[11px] tracking-[0.2em]"
                    />
                </motion.div>

                {/* Headline */}
                <motion.h1
                    id="hero-heading"
                    className="text-4xl font-bold tracking-tighter text-white sm:text-5xl lg:text-7xl leading-[1.05] text-balance mb-6"
                    variants={fadeUp}
                >
                    Crée ton portfolio{' '}
                    <span className="text-sky-400">créateur UGC</span>
                    <br />
                    en 5 minutes
                </motion.h1>

                {/* Sous-titre */}
                <motion.p
                    className="mx-auto max-w-lg text-base text-zinc-400 leading-relaxed mb-8"
                    variants={fadeUp}
                >
                    Glisse, construis, publie. Le builder de portfolios UGC pensé pour les créateurs de contenu —{' '}
                    <span className="text-zinc-200">sans coder.</span>
                </motion.p>

                {/* CTAs */}
                <motion.div
                    className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6"
                    variants={fadeUp}
                >
                    <Link href="/signup">
                        <ShimmerButton className="h-11 px-8 text-base w-full sm:w-auto shadow-lg shadow-sky-400/20">
                            Créer mon portfolio UGC — c&apos;est gratuit
                        </ShimmerButton>
                    </Link>
                    <Button
                        size="lg"
                        variant="outline"
                        asChild
                        className="border-dashed border-zinc-600 text-zinc-300 hover:bg-zinc-900 hover:text-white w-full sm:w-auto"
                    >
                        <Link href="#showcase">Voir la démo</Link>
                    </Button>
                </motion.div>

                {/* Trust badge */}
                <motion.div className="flex justify-center mb-12" variants={fadeIn}>
                    <Badge
                        variant="outline"
                        className="border-dashed border-sky-400/30 text-white bg-sky-400 font-normal px-3 py-1 text-xs"
                    >
                        <Sparkles className="inline h-3 w-3" aria-hidden="true" /> Trial 7 jours Premium offert \u00e0 l&apos;inscription
                    </Badge>
                </motion.div>

                {/* Mockup placeholder avec BorderBeam */}
                <motion.div
                    className="relative rounded-2xl overflow-hidden"
                    variants={scaleIn}
                >
                    <BorderBeam size={250} duration={10} colorFrom="#38bdf8" colorTo="#0c4a6e" />

                    {/* Crosshairs sur les 4 coins */}
                    <Crosshair position="top-left" size={20} />
                    <Crosshair position="top-right" size={20} />
                    <Crosshair position="bottom-left" size={20} />
                    <Crosshair position="bottom-right" size={20} />

                    {/* Coords extérieures */}
                    <CoordLabel text="[X: 0.000]" className="absolute -bottom-5 left-0" />
                    <CoordLabel text="[Y: 0.000]" className="absolute -bottom-5 right-0" />

                    {/* Image ou placeholder */}
                    <div className="aspect-video w-full bg-zinc-900/60">
                        <ImagePlaceholder
                            width={1280}
                            height={720}
                            label="hero-mockup.png · 1280×720 · disponible après EPIC-02"
                        />
                    </div>
                </motion.div>
                <div className="h-6" />
            </motion.div>
        </section>
    );
}
