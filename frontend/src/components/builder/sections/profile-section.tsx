'use client';

import { useState } from 'react';
import { ImageUploader } from '@/components/builder/image-uploader';
import { SectionStylePanel } from './section-style-panel';
import { TMPL } from '@/components/builder/use-craft-form';

const SECTION_ANCHORS = [
    { value: `#${TMPL.HERO}`, label: '↑ Profil & Identité' },
    { value: `#${TMPL.ABOUT}`, label: '→ À propos' },
    { value: `#${TMPL.STATS}`, label: '→ Stats & Chiffres' },
    { value: `#${TMPL.GALLERY}`, label: '→ Projets' },
    { value: `#${TMPL.CONTACT}`, label: '→ Contact' },
] as const;

interface HeroProps {
    name?: string;
    title?: string;
    description?: string;
    ctaLabel?: string;
    ctaHref?: string;
    imageUrl?: string;
}

interface ProfileSectionProps {
    portfolioId: string;
    props: Record<string, unknown>;
    onChange: (patch: Partial<HeroProps>) => void;
}

function sanitizeText(value: string): string {
    return value.replace(/<[^>]*>/g, '').slice(0, 500);
}

export function ProfileSection({ portfolioId, props, onChange }: ProfileSectionProps) {
    const name = (props.name as string) ?? '';
    const title = (props.title as string) ?? '';
    const description = (props.description as string) ?? '';
    const ctaLabel = (props.ctaLabel as string) ?? '';
    const ctaHref = (props.ctaHref as string) ?? '';
    const imageUrl = (props.imageUrl as string) ?? '';

    const knownAnchors = SECTION_ANCHORS.map((a) => a.value);
    const isKnownAnchor = knownAnchors.includes(ctaHref as typeof knownAnchors[number]);
    const [useCustomUrl, setUseCustomUrl] = useState(!isKnownAnchor && ctaHref !== '');

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-zinc-400">Photo de profil</label>
                <ImageUploader
                    currentUrl={imageUrl || undefined}
                    portfolioId={portfolioId}
                    label="Photo"
                    onUpload={(url) => onChange({ imageUrl: url })}
                    onClear={() => onChange({ imageUrl: '' })}
                />
            </div>

            <FormField
                label="Nom complet"
                value={name}
                maxLength={80}
                onChange={(v) => onChange({ name: sanitizeText(v) })}
            />
            <FormField
                label="Titre / Métier"
                value={title}
                maxLength={100}
                placeholder="Créateur UGC · TikTok · Instagram"
                onChange={(v) => onChange({ title: sanitizeText(v) })}
            />
            <FormTextarea
                label="Bio courte"
                value={description}
                maxLength={300}
                rows={3}
                onChange={(v) => onChange({ description: sanitizeText(v) })}
            />
            <FormField
                label="Label bouton CTA"
                value={ctaLabel}
                maxLength={50}
                placeholder="Voir mes projets"
                onChange={(v) => onChange({ ctaLabel: sanitizeText(v) })}
            />

            {/* CTA href — anchor select + custom URL */}
            <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-zinc-400">Destination du bouton CTA</label>
                <div className="flex flex-col gap-2">
                    <select
                        value={useCustomUrl ? '__custom__' : (ctaHref || SECTION_ANCHORS[3].value)}
                        onChange={(e) => {
                            if (e.target.value === '__custom__') {
                                setUseCustomUrl(true);
                                onChange({ ctaHref: '' });
                            } else {
                                setUseCustomUrl(false);
                                onChange({ ctaHref: e.target.value });
                            }
                        }}
                        className="rounded-lg border border-dashed border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-200 focus:border-sky-500 focus:outline-none transition-colors"
                    >
                        {SECTION_ANCHORS.map((a) => (
                            <option key={a.value} value={a.value}>{a.label}</option>
                        ))}
                        <option value="__custom__">✏️ URL personnalisée…</option>
                    </select>
                    {useCustomUrl && (
                        <input
                            type="url"
                            value={ctaHref}
                            maxLength={200}
                            placeholder="https://…"
                            onChange={(e) => onChange({ ctaHref: e.target.value.trim() })}
                            className="rounded-lg border border-dashed border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-sky-500 focus:outline-none transition-colors"
                        />
                    )}
                </div>
            </div>

            <SectionStylePanel props={props} onChange={onChange} />
        </div>
    );
}

function FormField({
    label,
    value,
    onChange,
    placeholder,
    maxLength,
}: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
    maxLength?: number;
}) {
    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-zinc-400">{label}</label>
            <input
                type="text"
                value={value}
                maxLength={maxLength}
                placeholder={placeholder}
                onChange={(e) => onChange(e.target.value)}
                className="rounded-lg border border-dashed border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-sky-500 focus:outline-none transition-colors"
            />
        </div>
    );
}

function FormTextarea({
    label,
    value,
    onChange,
    maxLength,
    rows = 3,
}: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    maxLength?: number;
    rows?: number;
}) {
    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-zinc-400">{label}</label>
            <textarea
                value={value}
                maxLength={maxLength}
                rows={rows}
                onChange={(e) => onChange(e.target.value)}
                className="resize-none rounded-lg border border-dashed border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-sky-500 focus:outline-none transition-colors"
            />
            {maxLength && (
                <span className="self-end text-[10px] text-zinc-600">
                    {value.length}/{maxLength}
                </span>
            )}
        </div>
    );
}
