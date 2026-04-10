'use client';

import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { SectionStylePanel } from './section-style-panel';

interface AboutProps {
    heading?: string;
    bio?: string;
    niches?: string[];
}

interface AboutSectionProps {
    props: Record<string, unknown>;
    onChange: (patch: Partial<AboutProps>) => void;
}

function sanitizeText(value: string): string {
    return value.replace(/<[^>]*>/g, '').slice(0, 1000);
}

export function AboutSection({ props, onChange }: AboutSectionProps) {
    const heading = (props.heading as string) ?? '';
    const bio = (props.bio as string) ?? '';
    const niches = (props.niches as string[]) ?? [];

    const [nicheInput, setNicheInput] = useState('');

    function addNiche() {
        const clean = nicheInput.replace(/<[^>]*>/g, '').trim().slice(0, 40);
        if (!clean || niches.length >= 20) return;
        onChange({ niches: [...niches, clean] });
        setNicheInput('');
    }

    function removeNiche(index: number) {
        onChange({ niches: niches.filter((_, i) => i !== index) });
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-zinc-400">Titre de section</label>
                <input
                    type="text"
                    value={heading}
                    maxLength={80}
                    placeholder="À propos"
                    onChange={(e) => onChange({ heading: sanitizeText(e.target.value) })}
                    className="rounded-lg border border-dashed border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-sky-500 focus:outline-none transition-colors"
                />
            </div>

            <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-zinc-400">Bio</label>
                <textarea
                    value={bio}
                    maxLength={1000}
                    rows={5}
                    onChange={(e) => onChange({ bio: sanitizeText(e.target.value) })}
                    className="resize-none rounded-lg border border-dashed border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-sky-500 focus:outline-none transition-colors"
                />
                <span className="self-end text-[10px] text-zinc-600">{bio.length}/1000</span>
            </div>

            <div className="flex flex-col gap-2">
                <label className="text-xs font-medium text-zinc-400">Niches / Tags</label>
                <div className="flex flex-wrap gap-2">
                    {niches.map((niche, i) => (
                        <span
                            key={i}
                            className="flex items-center gap-1.5 rounded-full border border-dashed border-zinc-700 px-2.5 py-1 text-xs text-zinc-300"
                        >
                            {niche}
                            <button
                                onClick={() => removeNiche(i)}
                                className="text-zinc-500 hover:text-red-400 transition-colors"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </span>
                    ))}
                </div>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={nicheInput}
                        maxLength={40}
                        placeholder="Ex: Beauté, Lifestyle…"
                        onChange={(e) => setNicheInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                addNiche();
                            }
                        }}
                        className="flex-1 rounded-lg border border-dashed border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-sky-500 focus:outline-none transition-colors"
                    />
                    <button
                        onClick={addNiche}
                        disabled={!nicheInput.trim() || niches.length >= 20}
                        className="flex items-center gap-1 rounded-lg border border-dashed border-zinc-700 bg-zinc-800 px-3 py-2 text-xs text-zinc-300 hover:bg-zinc-700 disabled:opacity-40 transition-colors"
                    >
                        <Plus className="h-3.5 w-3.5" />
                    </button>
                </div>
                <span className="text-[10px] text-zinc-600">{niches.length}/20 tags max</span>
            </div>
            <SectionStylePanel props={props} onChange={onChange} />
        </div>
    );
}
