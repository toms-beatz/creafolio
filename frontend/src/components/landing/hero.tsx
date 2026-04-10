'use client';

import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { ShimmerButton } from '@/components/ui/shimmer-button';

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
    hidden: { opacity: 0, scale: 0.98 },
    show: { opacity: 1, scale: 1, transition: { duration: 0.8, ease } },
};

// Image éditoriale Figma (photographie avec appareil photo, fleurs, macbook)
const HERO_IMAGE = 'https://www.figma.com/api/mcp/asset/30cfc19e-a1fc-416d-8515-0d32b4b362e0';

/**
 * Hero section — style éditorial Creafolio.
 * Photo plein cadre + overlay texte centré.
 * US-1002
 */
export function Hero() {
    return (
        <section aria-labelledby="hero-heading" className="relative overflow-hidden bg-[#f4eeea]">
            {/* Image éditoriale plein cadre */}
            <motion.div
                className="relative w-full h-[520px] lg:h-[680px] overflow-hidden"
                variants={scaleIn}
                initial="hidden"
                animate="show"
            >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={HERO_IMAGE}
                    alt="Flat lay éditorial — appareil photo, macbook, fleurs pour créateur UGC"
                    className="absolute inset-0 w-full h-full object-cover object-center"
                />
                {/* Overlay gradient bas pour lire le texte */}
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{ background: 'linear-gradient(to bottom, rgba(212,164,133,0.15) 0%, rgba(212,164,133,0.55) 70%, rgba(212,164,133,0.85) 100%)' }}
                    aria-hidden="true"
                />

                {/* Contenu centré sur l'image */}
                <motion.div
                    className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center"
                    variants={stagger}
                    initial="hidden"
                    animate="show"
                >
                    <motion.div
                        className="rounded-2xl bg-[#D4A485D4]/80 backdrop-blur-sm px-24 py-24 shadow-xl shadow-black/20"
                        variants={fadeUp}
                    >
                        <motion.h1
                            id="hero-heading"
                            className="text-4xl sm:text-5xl lg:text-5xl font-bold leading-tight text-white mb-4 drop-shadow-md uppercase"
                            style={{ fontFamily: "var(--font-habibi, 'Habibi'), serif" }}
                            variants={fadeUp}
                        >
                            Crée ton portfolio<br />
                            <span style={{ color: '#fff' }}>créateur UGC</span>
                        </motion.h1>

                        <motion.p
                            className="my-12 text-base text-white/90 leading-relaxed drop-shadow"
                            variants={fadeUp}
                        >
                            Glisse, construis, publie — le builder pensé pour les créateurs de contenu.{' '}
                            <span className="font-semibold text-white">Sans coder.</span>
                        </motion.p>

                        <motion.div
                            className="flex flex-col sm:flex-row items-center justify-center gap-3"
                            variants={fadeUp}
                        >
                            <Link href="/signup">
                                <ShimmerButton className="h-11 px-8 text-base shadow-lg shadow-black/20">
                                    Créer mon portfolio — c&apos;est gratuit
                                </ShimmerButton>
                            </Link>
                            {/* <Button
                                size="lg"
                                variant="outline"
                                asChild
                                className="border-white/60 text-white bg-white/10 hover:bg-white/20 hover:border-white backdrop-blur-sm"
                            >
                                <Link href="#showcase">Voir la démo</Link>
                            </Button> */}
                        </motion.div>
                    </motion.div>
                    {/* Badge sous l'image */}
                    <motion.div
                        className="flex justify-center py-4 mt-8"
                        variants={fadeIn}
                        initial="hidden"
                        animate="show"
                    >
                        <Badge
                            variant="outline"
                            className="border-[#ad7b60]/40 text-white bg-[#ad7b60] font-normal px-4 py-1.5 text-xs"
                        >
                            <Sparkles className="inline h-3 w-3 mr-1.5" aria-hidden="true" /> Trial 7 jours Premium offert à l&apos;inscription
                        </Badge>
                    </motion.div>
                </motion.div>
            </motion.div>


        </section>
    );
}


