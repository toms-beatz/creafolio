'use client';

import { useState } from 'react';
import { Settings2, Monitor, Tablet, Smartphone } from 'lucide-react';
import { SPACING_PX } from '@/lib/block-styles';

interface SectionStylePanelProps {
    props: Record<string, unknown>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onChange: (patch: any) => void;
}

const SPACING_OPTIONS: { value: string; label: string }[] = [
    { value: 'none', label: '0' },
    { value: 'xs', label: 'XS' },
    { value: 'sm', label: 'SM' },
    { value: 'md', label: 'MD' },
    { value: 'lg', label: 'LG' },
    { value: 'xl', label: 'XL' },
];

const ANIMATE_OPTIONS: { value: string; label: string }[] = [
    { value: 'none', label: 'Aucune' },
    { value: 'fade', label: 'Fondu' },
    { value: 'slide', label: 'Glisse' },
];

const BORDER_STYLE_OPTIONS: { value: string; label: string }[] = [
    { value: 'none', label: '—' },
    { value: 'solid', label: 'Solide' },
    { value: 'dashed', label: 'Tirets' },
    { value: 'dotted', label: 'Points' },
];

const BORDER_WIDTH_OPTIONS: { value: string; label: string }[] = [
    { value: '1px', label: '1' },
    { value: '2px', label: '2' },
    { value: '3px', label: '3' },
    { value: '4px', label: '4' },
];

const TEXT_SIZE_OPTIONS: { value: string; label: string }[] = [
    { value: '', label: 'Thème' },
    { value: 'sm', label: 'Petit' },
    { value: 'base', label: 'Normal' },
    { value: 'lg', label: 'Grand' },
    { value: 'xl', label: 'XL' },
];

type Viewport = 'desktop' | 'tablet' | 'mobile';

export function SectionStylePanel({ props, onChange }: SectionStylePanelProps) {
    const [open, setOpen] = useState(false);
    const [vp, setVp] = useState<Viewport>('desktop');

    const bgColorKey = vp === 'mobile' ? 'bgColorMobile' : vp === 'tablet' ? 'bgColorTablet' : 'bgColor';
    const paddingTopKey = vp === 'mobile' ? 'paddingTopMobile' : vp === 'tablet' ? 'paddingTopTablet' : 'paddingTop';
    const paddingBottomKey = vp === 'mobile' ? 'paddingBottomMobile' : vp === 'tablet' ? 'paddingBottomTablet' : 'paddingBottom';

    const bgColor = (props[bgColorKey] as string) ?? '';
    const paddingTop = (props[paddingTopKey] as string) ?? '';
    const paddingBottom = (props[paddingBottomKey] as string) ?? '';

    // Desktop-only settings
    const animateIn = (props.animateIn as string) ?? 'none';
    const borderStyle = (props.borderStyle as string) ?? 'none';
    const borderColor = (props.borderColor as string) ?? '#27272a';
    const borderWidth = (props.borderWidth as string) ?? '1px';
    const textSize = (props.textSize as string) ?? '';

    const VIEWPORT_ICONS = {
        desktop: <Monitor className="h-3 w-3" />,
        tablet: <Tablet className="h-3 w-3" />,
        mobile: <Smartphone className="h-3 w-3" />,
    };
    const VIEWPORT_LABELS = { desktop: 'Bureau', tablet: 'Tablette', mobile: 'Mobile' };

    return (
        <div className="mt-4 border-t border-dashed border-zinc-700/60 pt-3">
            <button
                onClick={() => setOpen((v) => !v)}
                className="flex w-full items-center gap-1.5 text-[10px] font-medium uppercase tracking-widest text-zinc-600 hover:text-zinc-400 transition-colors"
            >
                <Settings2 className="h-3 w-3" />
                Style de la section
                <span className="ml-auto text-zinc-700">{open ? '▲' : '▼'}</span>
            </button>

            {open && (
                <div className="mt-3 flex flex-col gap-3">
                    {/* Viewport tabs */}
                    <div className="flex overflow-hidden rounded border border-zinc-700">
                        {(['desktop', 'tablet', 'mobile'] as Viewport[]).map((v) => (
                            <button
                                key={v}
                                onClick={() => setVp(v)}
                                className={`flex flex-1 items-center justify-center gap-1 py-1.5 text-[10px] transition-colors ${vp === v ? 'bg-sky-500 text-white' : 'bg-zinc-800 text-zinc-500 hover:bg-zinc-700'}`}
                            >
                                {VIEWPORT_ICONS[v]}
                                {VIEWPORT_LABELS[v]}
                            </button>
                        ))}
                    </div>

                    {/* Background color */}
                    <div className="flex items-center gap-2">
                        <label className="w-24 shrink-0 text-[10px] text-zinc-500">Fond</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="color"
                                value={bgColor || '#000000'}
                                onChange={(e) => onChange({ [bgColorKey]: e.target.value })}
                                className="h-6 w-8 cursor-pointer rounded border border-zinc-600 bg-transparent p-0"
                            />
                            {bgColor && (
                                <button onClick={() => onChange({ [bgColorKey]: '' })} className="text-[9px] text-zinc-600 hover:text-zinc-400">
                                    Reset
                                </button>
                            )}
                            <span className="text-[10px] text-zinc-600">{bgColor || '(thème)'}</span>
                        </div>
                    </div>

                    {/* Padding top */}
                    <div>
                        <p className="mb-1 text-[10px] text-zinc-500">Espace haut</p>
                        <div className="flex gap-1">
                            {SPACING_OPTIONS.map(({ value, label }) => (
                                <button
                                    key={value}
                                    onClick={() => onChange({ [paddingTopKey]: value })}
                                    title={SPACING_PX[value]}
                                    className={`rounded px-2 py-1 text-[10px] transition-colors ${paddingTop === value ? 'bg-sky-500 text-white' : 'bg-zinc-700 text-zinc-400 hover:bg-zinc-600'}`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Padding bottom */}
                    <div>
                        <p className="mb-1 text-[10px] text-zinc-500">Espace bas</p>
                        <div className="flex gap-1">
                            {SPACING_OPTIONS.map(({ value, label }) => (
                                <button
                                    key={value}
                                    onClick={() => onChange({ [paddingBottomKey]: value })}
                                    title={SPACING_PX[value]}
                                    className={`rounded px-2 py-1 text-[10px] transition-colors ${paddingBottom === value ? 'bg-sky-500 text-white' : 'bg-zinc-700 text-zinc-400 hover:bg-zinc-600'}`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Desktop-only settings */}
                    {vp === 'desktop' && (
                        <>
                            {/* Border */}
                            <div>
                                <p className="mb-1 text-[10px] text-zinc-500">Bordure</p>
                                <div className="flex gap-1 mb-2">
                                    {BORDER_STYLE_OPTIONS.map(({ value, label }) => (
                                        <button
                                            key={value}
                                            onClick={() => onChange({ borderStyle: value })}
                                            className={`rounded px-2 py-1 text-[10px] transition-colors ${borderStyle === value ? 'bg-sky-500 text-white' : 'bg-zinc-700 text-zinc-400 hover:bg-zinc-600'}`}
                                        >
                                            {label}
                                        </button>
                                    ))}
                                </div>
                                {borderStyle !== 'none' && (
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-[10px] text-zinc-500">Couleur</span>
                                            <input
                                                type="color"
                                                value={borderColor}
                                                onChange={(e) => onChange({ borderColor: e.target.value })}
                                                className="h-6 w-8 cursor-pointer rounded border border-zinc-600 bg-transparent p-0"
                                            />
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-[10px] text-zinc-500">Épaisseur</span>
                                            <div className="flex gap-1">
                                                {BORDER_WIDTH_OPTIONS.map(({ value, label }) => (
                                                    <button
                                                        key={value}
                                                        onClick={() => onChange({ borderWidth: value })}
                                                        className={`rounded px-1.5 py-1 text-[10px] transition-colors ${borderWidth === value ? 'bg-sky-500 text-white' : 'bg-zinc-700 text-zinc-400 hover:bg-zinc-600'}`}
                                                    >
                                                        {label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Text size */}
                            <div>
                                <p className="mb-1 text-[10px] text-zinc-500">Taille du texte</p>
                                <div className="flex gap-1">
                                    {TEXT_SIZE_OPTIONS.map(({ value, label }) => (
                                        <button
                                            key={value}
                                            onClick={() => onChange({ textSize: value })}
                                            className={`rounded px-2 py-1 text-[10px] transition-colors ${textSize === value ? 'bg-sky-500 text-white' : 'bg-zinc-700 text-zinc-400 hover:bg-zinc-600'}`}
                                        >
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Animate in */}
                            <div>
                                <p className="mb-1 text-[10px] text-zinc-500">Animation d&apos;entrée</p>
                                <div className="flex gap-1">
                                    {ANIMATE_OPTIONS.map(({ value, label }) => (
                                        <button
                                            key={value}
                                            onClick={() => onChange({ animateIn: value })}
                                            className={`rounded px-2 py-1 text-[10px] transition-colors ${animateIn === value ? 'bg-sky-500 text-white' : 'bg-zinc-700 text-zinc-400 hover:bg-zinc-600'}`}
                                        >
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}

