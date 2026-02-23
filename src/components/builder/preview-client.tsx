'use client';

import { useState } from 'react';
import { Editor, Frame } from '@craftjs/core';
import { HeroBlock } from '@/components/builder/blocks/hero-block';
import { AboutBlock } from '@/components/builder/blocks/about-block';
import { StatsBlock } from '@/components/builder/blocks/stats-block';
import { GalleryBlock } from '@/components/builder/blocks/gallery-block';
import { ContactBlock } from '@/components/builder/blocks/contact-block';
import { TextBlock } from '@/components/builder/blocks/text-block';

const RESOLVER = { HeroBlock, AboutBlock, StatsBlock, GalleryBlock, ContactBlock, TextBlock };

const VIEWPORTS = [
    { id: 'desktop', label: 'Desktop', width: '100%' },
    { id: 'tablet', label: 'Tablet', width: '768px' },
    { id: 'mobile', label: 'Mobile', width: '390px' },
] as const;

type Viewport = typeof VIEWPORTS[number]['id'];

interface PreviewClientProps {
    craftStateJson: string;
    isWatermarked: boolean;
}

export function PreviewClient({ craftStateJson, isWatermarked }: PreviewClientProps) {
    const [viewport, setViewport] = useState<Viewport>('desktop');

    const currentWidth = VIEWPORTS.find((v) => v.id === viewport)?.width ?? '100%';

    return (
        <div className="flex h-screen flex-col bg-zinc-900">
            {/* Toolbar */}
            <div className="flex h-10 shrink-0 items-center justify-center gap-1 border-b border-dashed border-zinc-800 bg-zinc-950">
                {VIEWPORTS.map((v) => (
                    <button
                        key={v.id}
                        onClick={() => setViewport(v.id)}
                        className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${viewport === v.id
                            ? 'bg-zinc-700 text-white'
                            : 'text-zinc-500 hover:text-zinc-300'
                            }`}
                    >
                        {v.label}
                    </button>
                ))}
                <span className="ml-4 font-mono text-[9px] text-zinc-700 uppercase tracking-widest">
                    PREVIEW MODE
                </span>
            </div>

            {/* Canvas */}
            <div className="flex flex-1 justify-center overflow-auto bg-zinc-900 py-6 px-4">
                <div
                    className="relative transition-all duration-300 bg-zinc-950 rounded-xl overflow-hidden"
                    style={{ width: currentWidth, minHeight: '100%' }}
                >
                    {isWatermarked && (
                        <div className="sticky top-0 z-50 w-full border-b border-dashed border-zinc-800 bg-zinc-950/80 py-1.5 text-center backdrop-blur-sm">
                            <span className="font-mono text-[9px] uppercase tracking-widest text-zinc-600">
                                Built with{' '}
                                <a href="https://blooprint.fr" className="text-sky-400/60 hover:text-sky-400 transition-colors">
                                    Blooprint
                                </a>
                            </span>
                        </div>
                    )}

                    <Editor resolver={RESOLVER} enabled={false}>
                        <Frame data={craftStateJson} />
                    </Editor>
                </div>
            </div>
        </div>
    );
}
