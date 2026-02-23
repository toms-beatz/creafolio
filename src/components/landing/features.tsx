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
import { CoordLabel } from '@/components/ui/coord-label';
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
        desc: 'blooprint.fr/tonom — ton lien dans la bio, toujours à jour, accessible partout.',
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
        desc: 'Ton portfolio sur blooprint.fr/username ou connecte ton propre domaine pour un branding premium.',
        span: 'sm:col-span-2',
    },
];

/**
 * Section features — BentoGrid avec toutes les fonctionnalités.
 * US-1004
 */
export function Features() {
    return (
        <section id="features" className="relative py-20 lg:py-28 overflow-hidden">
            {/* Radial glow background */}
            <div
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[600px] rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(ellipse at center, rgba(56,189,248,0.04) 0%, transparent 70%)' }}
                aria-hidden="true"
            />

            <div className="relative mx-auto max-w-6xl px-4 lg:px-8">
                {/* Header */}
                <FadeIn className="mb-12 text-center">
                    <CoordLabel text="[FONCTIONNALITÉS // 00.04]" className="mb-3 block" />
                    <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                        Tout ce qu&apos;il te faut pour{' '}
                        <span className="text-sky-400">briller en tant que créateur</span>
                    </h2>
                    <p className="mt-3 text-sm text-zinc-400 max-w-lg mx-auto">
                        Un builder complet avec analytics, SEO, et des blocs pensés pour les créateurs de contenu.
                    </p>
                </FadeIn>

                {/* Bento Grid */}
                <BentoGrid>
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
