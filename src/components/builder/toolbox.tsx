'use client';

import { useState, type ReactNode } from 'react';
import { useEditor } from '@craftjs/core';
import {
    Sparkles,
    User,
    BarChart3,
    Grid3X3,
    ArrowLeftRight,
    Play,
    Quote,
    Star,
    Mail,
    Type,
    PanelBottom,
    ArrowRight,
    Search,
    Lock,
} from 'lucide-react';
import { HeroBlock } from './blocks/hero-block';
import { AboutBlock } from './blocks/about-block';
import { StatsBlock } from './blocks/stats-block';
import { GalleryBlock } from './blocks/gallery-block';
import { ContactBlock } from './blocks/contact-block';
import { TextBlock } from './blocks/text-block';
import { BeforeAfterBlock } from './blocks/before-after-block';
import { VideoShowcaseBlock } from './blocks/video-showcase-block';
import { TestimonialsBlock } from './blocks/testimonials-block';
import { BrandsBlock } from './blocks/brands-block';
import { FooterBlock } from './blocks/footer-block';

const BLOCKS: { name: string; element: React.ReactElement; icon: ReactNode; desc: string }[] = [
    { name: 'Hero', element: <HeroBlock />, icon: <Sparkles className="h-5 w-5" />, desc: 'Intro + photo' },
    { name: 'À propos', element: <AboutBlock />, icon: <User className="h-5 w-5" />, desc: 'Bio + niches' },
    { name: 'Stats', element: <StatsBlock />, icon: <BarChart3 className="h-5 w-5" />, desc: 'Chiffres clés' },
    { name: 'Galerie', element: <GalleryBlock />, icon: <Grid3X3 className="h-5 w-5" />, desc: 'Grille projets' },
    { name: 'Before/After', element: <BeforeAfterBlock />, icon: <ArrowLeftRight className="h-5 w-5" />, desc: 'Comparatif' },
    { name: 'Vidéos', element: <VideoShowcaseBlock />, icon: <Play className="h-5 w-5" />, desc: 'TikTok, YT, IG' },
    { name: 'Témoignages', element: <TestimonialsBlock />, icon: <Quote className="h-5 w-5" />, desc: 'Avis clients' },
    { name: 'Marques', element: <BrandsBlock />, icon: <Star className="h-5 w-5" />, desc: 'Partenaires' },
    { name: 'Contact', element: <ContactBlock />, icon: <Mail className="h-5 w-5" />, desc: 'Email + CTA' },
    { name: 'Texte', element: <TextBlock />, icon: <Type className="h-5 w-5" />, desc: 'Texte libre' },
    { name: 'Footer', element: <FooterBlock />, icon: <PanelBottom className="h-5 w-5" />, desc: 'Pied de page' },
];

const FREE_LIMIT = 6;

interface ToolboxProps {
    isPremium: boolean;
    portfolioId: string;
}

export function Toolbox({ isPremium }: ToolboxProps) {
    const { connectors, query } = useEditor();
    const [search, setSearch] = useState('');

    const nodeCount = Object.keys(query.getSerializedNodes()).filter(
        (k) => k !== 'ROOT'
    ).length;

    const limitReached = !isPremium && nodeCount >= FREE_LIMIT;

    const filtered = BLOCKS.filter((b) =>
        b.name.toLowerCase().includes(search.toLowerCase()) ||
        b.desc.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="flex h-full flex-col">
            {/* Search bar */}
            <div className="border-b border-zinc-800 p-3">
                <div className="flex items-center gap-2 rounded-lg border border-zinc-700/60 bg-zinc-900/60 px-3 py-2 focus-within:border-sky-400/40 transition-colors">
                    <Search className="h-3.5 w-3.5 shrink-0 text-zinc-600" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Chercher un widget…"
                        className="flex-1 bg-transparent text-xs text-zinc-300 outline-none placeholder:text-zinc-600"
                    />
                </div>
                {!isPremium && (
                    <div className="mt-2 flex items-center justify-between">
                        <span className={`text-[10px] font-mono ${limitReached ? 'text-red-400' : 'text-zinc-600'}`}>
                            {nodeCount}/{FREE_LIMIT} blocs utilisés
                        </span>
                        {limitReached && (
                            <span className="text-[9px] font-semibold uppercase tracking-wide text-amber-400">Limite atteinte</span>
                        )}
                    </div>
                )}
            </div>

            {/* Blocks grid — 2 columns like Elementor */}
            <div className="flex-1 overflow-y-auto p-3">
                {filtered.length === 0 ? (
                    <div className="flex flex-col items-center gap-2 py-10 text-center">
                        <Search className="h-5 w-5 text-zinc-700" />
                        <p className="text-xs text-zinc-600">Aucun widget trouvé</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-2">
                        {filtered.map(({ name, element, icon, desc }) => {
                            const blocked = limitReached;
                            return (
                                <div
                                    key={name}
                                    ref={(ref) => {
                                        if (ref && !blocked) {
                                            connectors.create(ref, element);
                                        }
                                    }}
                                    className={`relative flex flex-col items-center gap-2 rounded-xl border px-2 py-4 text-center transition-all select-none ${blocked
                                        ? 'cursor-not-allowed border-zinc-800 opacity-40'
                                        : 'cursor-grab border-zinc-700/60 bg-zinc-800/30 hover:border-sky-400/50 hover:bg-zinc-800/70 active:cursor-grabbing active:scale-95'
                                        }`}
                                    title={blocked ? 'Limite Free atteinte' : `Glisse pour ajouter ${name}`}
                                >
                                    {blocked && (
                                        <Lock className="absolute right-1.5 top-1.5 h-2.5 w-2.5 text-zinc-600" />
                                    )}
                                    <span className="text-sky-400/70">{icon}</span>
                                    <div>
                                        <p className="text-[11px] font-semibold leading-tight text-zinc-200">{name}</p>
                                        <p className="mt-0.5 text-[9px] text-zinc-600 leading-tight">{desc}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Premium upsell */}
            {limitReached && (
                <div className="shrink-0 border-t border-zinc-800 p-3">
                    <p className="mb-2 text-[10px] text-zinc-500 leading-relaxed">
                        Passe en Premium pour ajouter des blocs illimités.
                    </p>
                    <a
                        href="/pricing"
                        target="_blank"
                        className="flex items-center justify-center gap-1.5 rounded-lg bg-sky-500/10 border border-sky-500/20 px-3 py-2 text-xs font-medium text-sky-300 hover:bg-sky-500/20 transition-colors"
                    >
                        Passer Premium <ArrowRight className="h-3 w-3" />
                    </a>
                </div>
            )}
        </div>
    );
}
