'use client';

import { useNode } from '@craftjs/core';
import { SPACING_PX, RADIUS_PX } from '@/lib/block-styles';
import { Music2, Play, Camera } from 'lucide-react';
import type { ReactNode } from 'react';

interface VideoItem {
    platform: 'tiktok' | 'youtube' | 'instagram';
    url: string;
    title?: string;
}

interface VideoShowcaseBlockProps {
    heading?: string;
    items?: VideoItem[];
    paddingTop?: string;
    paddingBottom?: string;
    bgColor?: string;
    cardRadius?: string;
    customId?: string;
    customClass?: string;
    hideOnMobile?: boolean;
    hideOnDesktop?: boolean;
    animateIn?: string;
}

function getEmbedUrl(platform: string, url: string): string | null {
    try {
        const u = new URL(url);
        if (platform === 'youtube') {
            // youtube.com/watch?v=ID or youtu.be/ID
            const id = u.searchParams.get('v') ?? u.pathname.slice(1);
            if (!id) return null;
            return `https://www.youtube.com/embed/${id}`;
        }
        if (platform === 'tiktok') {
            // tiktok.com/@user/video/ID
            const match = u.pathname.match(/video\/(\d+)/);
            if (!match) return null;
            return `https://www.tiktok.com/embed/v2/${match[1]}`;
        }
        if (platform === 'instagram') {
            // instagram.com/reel/CODE or /p/CODE
            const match = u.pathname.match(/\/(reel|p)\/([^/]+)/);
            if (!match) return null;
            return `https://www.instagram.com/${match[1]}/${match[2]}/embed`;
        }
        return null;
    } catch {
        return null;
    }
}

const PLATFORM_ICONS: Record<string, ReactNode> = {
    tiktok: <Music2 className="h-8 w-8" />,
    youtube: <Play className="h-8 w-8" />,
    instagram: <Camera className="h-8 w-8" />,
};

export function VideoShowcaseBlock({
    heading = 'Mes créations vidéo',
    items = [
        { platform: 'tiktok' as const, url: 'https://tiktok.com/@creator/video/123', title: 'Vidéo UGC Beauty' },
        { platform: 'youtube' as const, url: 'https://youtube.com/watch?v=abc', title: 'Collab marque X' },
    ],
    paddingTop = 'md',
    paddingBottom = 'md',
    bgColor = '',
    cardRadius = 'md',
    customId = '',
    customClass = '',
    hideOnMobile = false,
    hideOnDesktop = false,
    animateIn = 'none',
}: VideoShowcaseBlockProps) {
    const { connectors: { connect, drag }, selected } = useNode((node) => ({
        selected: node.events.selected,
    }));

    const cardRadiusPx = RADIUS_PX[cardRadius ?? 'md'] ?? '12px';

    return (
        <section
            ref={(ref) => { if (ref) connect(drag(ref)); }}
            id={customId || undefined}
            className={[
                'px-6 rounded-xl transition-all',
                hideOnMobile ? 'hidden md:block' : '',
                hideOnDesktop ? 'block md:hidden' : '',
                animateIn !== 'none' ? `bp-animate-${animateIn}` : '',
                customClass,
                selected ? 'ring-2 ring-sky-400' : 'ring-1 ring-transparent hover:ring-zinc-700',
            ].filter(Boolean).join(' ')}
            style={{ paddingTop: SPACING_PX[paddingTop] ?? '48px', paddingBottom: SPACING_PX[paddingBottom] ?? '48px', background: bgColor || undefined }}
        >
            {heading && <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--theme-text, #f4f4f5)' }}>{heading}</h2>}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {(items ?? []).map((item, i) => {
                    const embedUrl = getEmbedUrl(item.platform, item.url);
                    return (
                        <div key={i} className="overflow-hidden border border-dashed border-zinc-700 bg-zinc-900" style={{ borderRadius: cardRadiusPx }}>
                            {embedUrl ? (
                                <iframe
                                    src={embedUrl}
                                    className="aspect-video w-full"
                                    allowFullScreen
                                    loading="lazy"
                                    title={item.title ?? `Vidéo ${i + 1}`}
                                />
                            ) : (
                                <a
                                    href={item.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex aspect-video flex-col items-center justify-center gap-2 bg-zinc-900 text-zinc-500 hover:text-sky-400 transition-colors"
                                >
                                    <span className="text-zinc-500">{PLATFORM_ICONS[item.platform] ?? <Play className="h-8 w-8" />}</span>
                                    <span className="text-xs font-medium">{item.title ?? 'Voir la vidéo'}</span>
                                    <span className="text-[10px] font-mono uppercase text-zinc-600">{item.platform}</span>
                                </a>
                            )}
                            {item.title && (
                                <div className="px-3 py-2 border-t border-dashed border-zinc-800">
                                    <p className="text-xs text-zinc-400 truncate">{item.title}</p>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </section>
    );
}

VideoShowcaseBlock.craft = {
    displayName: 'Vidéos',
    props: {
        heading: 'Mes créations vidéo',
        items: [
            { platform: 'tiktok', url: 'https://tiktok.com/@creator/video/123', title: 'Vidéo UGC Beauty' },
            { platform: 'youtube', url: 'https://youtube.com/watch?v=abc', title: 'Collab marque X' },
        ],
        paddingTop: 'md', paddingBottom: 'md', bgColor: '', cardRadius: 'md',
        customId: '', customClass: '', hideOnMobile: false, hideOnDesktop: false, animateIn: 'none',
    },
    rules: { canDrag: () => true },
};
