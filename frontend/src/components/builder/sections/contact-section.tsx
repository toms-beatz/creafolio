'use client';

import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { SectionStylePanel } from './section-style-panel';

interface Social {
    platform: string;
    url: string;
}

interface ContactProps {
    heading?: string;
    description?: string;
    email?: string;
    ctaLabel?: string;
    socials?: Social[];
}

interface FooterProps {
    copyrightText?: string;
}

interface ContactSectionProps {
    portfolioId: string;
    props: Record<string, unknown>;
    footerProps: Record<string, unknown>;
    onChange: (patch: Partial<ContactProps>) => void;
    onFooterChange: (patch: Partial<FooterProps>) => void;
}

const SOCIAL_PLATFORMS = ['TikTok', 'Instagram', 'YouTube', 'LinkedIn', 'Twitter/X', 'Twitch', 'Pinterest'];

function sanitizeText(value: string): string {
    return value.replace(/<[^>]*>/g, '').slice(0, 500);
}

export function ContactSection({ props, footerProps, onChange, onFooterChange }: ContactSectionProps) {
    const heading = (props.heading as string) ?? '';
    const description = (props.description as string) ?? '';
    const email = (props.email as string) ?? '';
    const ctaLabel = (props.ctaLabel as string) ?? '';
    const socials = (props.socials as Social[]) ?? [];
    const copyrightText = (footerProps.copyrightText as string) ?? '';

    const [newPlatform, setNewPlatform] = useState('TikTok');
    const [newUrl, setNewUrl] = useState('');

    function addSocial() {
        const cleanUrl = newUrl.trim();
        if (!cleanUrl || socials.length >= 10) return;
        onChange({ socials: [...socials, { platform: newPlatform, url: cleanUrl }] });
        setNewUrl('');
    }

    function removeSocial(index: number) {
        onChange({ socials: socials.filter((_, i) => i !== index) });
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-zinc-400">Titre de section</label>
                <input
                    type="text"
                    value={heading}
                    maxLength={80}
                    placeholder="Travaillons ensemble"
                    onChange={(e) => onChange({ heading: sanitizeText(e.target.value) })}
                    className="rounded-lg border border-dashed border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-sky-500 focus:outline-none transition-colors"
                />
            </div>

            <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-zinc-400">Description</label>
                <textarea
                    value={description}
                    maxLength={300}
                    rows={3}
                    onChange={(e) => onChange({ description: sanitizeText(e.target.value) })}
                    className="resize-none rounded-lg border border-dashed border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-sky-500 focus:outline-none transition-colors"
                />
            </div>

            <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-zinc-400">Email de contact</label>
                <input
                    type="email"
                    value={email}
                    maxLength={200}
                    placeholder="ton@email.com"
                    onChange={(e) => onChange({ email: e.target.value.trim() })}
                    className="rounded-lg border border-dashed border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-sky-500 focus:outline-none transition-colors"
                />
            </div>

            <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-zinc-400">Label bouton</label>
                <input
                    type="text"
                    value={ctaLabel}
                    maxLength={60}
                    placeholder="Envoie-moi un message"
                    onChange={(e) => onChange({ ctaLabel: sanitizeText(e.target.value) })}
                    className="rounded-lg border border-dashed border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-sky-500 focus:outline-none transition-colors"
                />
            </div>

            {/* Réseaux sociaux */}
            <div className="flex flex-col gap-2">
                <label className="text-xs font-medium text-zinc-400">Réseaux sociaux</label>
                {socials.map((s, i) => (
                    <div key={i} className="flex items-center gap-2">
                        <span className="w-24 shrink-0 rounded-lg border border-dashed border-zinc-700 bg-zinc-900/50 px-2 py-1.5 text-xs text-zinc-400">
                            {s.platform}
                        </span>
                        <span className="flex-1 truncate text-xs text-zinc-300">{s.url}</span>
                        <button
                            onClick={() => removeSocial(i)}
                            className="text-zinc-600 hover:text-red-400 transition-colors"
                        >
                            <X className="h-3.5 w-3.5" />
                        </button>
                    </div>
                ))}

                <div className="flex gap-2">
                    <select
                        value={newPlatform}
                        onChange={(e) => setNewPlatform(e.target.value)}
                        className="w-28 shrink-0 rounded-lg border border-dashed border-zinc-700 bg-zinc-900 px-2 py-2 text-xs text-zinc-300 focus:border-sky-500 focus:outline-none transition-colors"
                    >
                        {SOCIAL_PLATFORMS.map((p) => (
                            <option key={p} value={p}>{p}</option>
                        ))}
                    </select>
                    <input
                        type="url"
                        value={newUrl}
                        maxLength={300}
                        placeholder="https://…"
                        onChange={(e) => setNewUrl(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                addSocial();
                            }
                        }}
                        className="flex-1 rounded-lg border border-dashed border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-sky-500 focus:outline-none transition-colors"
                    />
                    <button
                        onClick={addSocial}
                        disabled={!newUrl.trim() || socials.length >= 10}
                        className="flex items-center rounded-lg border border-dashed border-zinc-700 bg-zinc-800 px-3 py-2 text-zinc-300 hover:bg-zinc-700 disabled:opacity-40 transition-colors"
                    >
                        <Plus className="h-3.5 w-3.5" />
                    </button>
                </div>
                <span className="text-[10px] text-zinc-600">{socials.length}/10 réseaux max</span>
            </div>

            {/* Footer */}
            <div className="mt-2 border-t border-dashed border-zinc-800 pt-4">
                <label className="text-xs font-medium text-zinc-400">Texte de copyright (footer)</label>
                <input
                    type="text"
                    value={copyrightText}
                    maxLength={100}
                    placeholder="© 2024 Ton Nom"
                    onChange={(e) => onFooterChange({ copyrightText: sanitizeText(e.target.value) })}
                    className="mt-1.5 w-full rounded-lg border border-dashed border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-sky-500 focus:outline-none transition-colors"
                />
            </div>
            <SectionStylePanel props={props} onChange={onChange} />
        </div>
    );
}
