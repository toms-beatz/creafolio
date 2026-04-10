'use client';

import {
    GripVertical,
    Layout,
    Zap,
    BarChart3,
    Palette,
    Globe,
    Shield,
    Smartphone,
    Search,
} from 'lucide-react';
import { FadeIn } from '@/components/ui/motion';
import { BentoGrid, BentoCard } from '@/components/ui/bento-grid';

const features = [
    {
        icon: <GripVertical className="h-5 w-5" />,
        title: 'Builder drag & drop',
        desc: 'Glisse n\'importe quel bloc — vidéos, bio, tarifs, liens, stats. Ton portfolio prend forme en direct, sans une ligne de code.',
        span: 'sm:col-span-2',
    },
    {
        icon: <Layout className="h-5 w-5" />,
        title: 'Templates UGC-ready',
        desc: 'Démarre avec un template pensé pour TikTok, Instagram, YouTube — personnalisable à 100 %.',
        span: '',
    },
    {
        icon: <Zap className="h-5 w-5" />,
        title: 'Publie en 1 clic',
        desc: 'creafolio.fr/tonnom — ton lien dans la bio, toujours à jour, accessible partout.',
        span: '',
    },
    {
        icon: <BarChart3 className="h-5 w-5" />,
        title: 'Analytics intégrées',
        desc: 'Suis les vues, clics et visiteurs uniques. Comprends quelles marques regardent ton portfolio.',
        span: '',
    },
    {
        icon: <Palette className="h-5 w-5" />,
        title: '11 blocs créatifs',
        desc: 'Bio, vidéo, grille, témoignages, tarifs, FAQ, liens sociaux, texte, image, stats, CTA — tout ce qu\'il te faut.',
        span: '',
    },
    {
        icon: <Globe className="h-5 w-5" />,
        title: 'SEO optimisé',
        desc: 'Méta-tags, sitemap, JSON-LD automatiques. Les marques te trouvent sur Google même quand tu ne prospectes pas.',
        span: 'sm:col-span-2',
    },
    {
        icon: <Smartphone className="h-5 w-5" />,
        title: '100% responsive',
        desc: 'Mobile-first. Ton portfolio s\'adapte parfaitement à tous les écrans — du smartphone au desktop.',
        span: '',
    },
    {
        icon: <Shield className="h-5 w-5" />,
        title: 'RGPD conforme',
        desc: 'Bannière cookie, politique de confidentialité, suppression de données — tout est géré automatiquement.',
        span: '',
    },
    {
        icon: <Search className="h-5 w-5" />,
        title: 'Domaine personnalisé',
        desc: 'Ton portfolio sur creafolio.fr/username ou connecte ton propre domaine pour un branding premium.',
        span: 'sm:col-span-2',
    },
];

/**
 * Section features — BentoGrid avec toutes les fonctionnalités.
 * US-1004
 */
const HERO_IMAGE = 'https://www.figma.com/api/mcp/asset/30cfc19e-a1fc-416d-8515-0d32b4b362e0';

export function Features() {
    return (
        <section id="features" aria-labelledby="features-heading" className="relative overflow-hidden bg-[#f4eeea]">
            {/* Hero image background */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                src={HERO_IMAGE}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 w-full h-full object-cover object-center"
                style={{ filter: 'blur(4px)', transform: 'scale(1.05)' }}
            />
            <div className="absolute inset-0 bg-[#1a1a1a]/50" aria-hidden="true" />

            <div className="relative">
                {/* Header */}
                <FadeIn className="mb-12 text-center bg-[#D4A485D4] px-8 py-6">
                    <p className="text-3xl font-black tracking-tight text-[#ad7b60] uppercase" style={{ fontFamily: "var(--font-habibi, 'Habibi'), serif" }}>
                        FONCTIONNALITÉS
                    </p>
                    <p className="mt-3 text-sm text-white max-w-lg mx-auto">
                        Un builder complet avec analytics, SEO, et des blocs pensés pour les créateurs de contenu.
                    </p>
                </FadeIn>

                {/* Bento Grid */}
                <BentoGrid className='mx-auto max-w-6xl px-4 lg:px-8 py-24'>
                    {features.map((feat, i) => (
                        <BentoCard
                            key={feat.title}
                            icon={feat.icon}
                            title={feat.title}
                            description={feat.desc}
                            className={feat.span}
                            index={i}
                        />
                    ))}
                </BentoGrid>
            </div>
        </section>
    );
}
