'use client';

import { useEditor } from '@craftjs/core';
import {
    MousePointerClick,
    Trash2,
    Plus,
    X,
    AlignLeft,
    AlignCenter,
    AlignRight,
    GripVertical,
    Settings,
} from 'lucide-react';

/* ══════════════════════════════════════════════════════════════
   SCHÉMAS par bloc — décrit comment rendre chaque propriété
══════════════════════════════════════════════════════════════ */

type FieldDef =
    | { type: 'text'; key: string; label: string; placeholder?: string }
    | { type: 'textarea'; key: string; label: string; placeholder?: string; rows?: number }
    | { type: 'url'; key: string; label: string; placeholder?: string }
    | { type: 'email'; key: string; label: string }
    | { type: 'color'; key: string; label: string }
    | { type: 'toggle'; key: string; label: string }
    | { type: 'align'; key: string; label: string }
    | { type: 'fontSize'; key: string; label: string }
    | { type: 'columns'; key: string; label: string }
    | { type: 'tags'; key: string; label: string; placeholder?: string }
    | { type: 'list-value-label'; key: string; label: string }
    | { type: 'list-quote-brand'; key: string; label: string }
    | { type: 'list-platform-url'; key: string; label: string }
    | { type: 'list-label-url'; key: string; label: string }
    | { type: 'list-caption-link'; key: string; label: string }
    | { type: 'list-brand-logo'; key: string; label: string }
    | { type: 'spacing'; key: string; label: string }
    | { type: 'radius'; key: string; label: string }
    | { type: 'select'; key: string; label: string; options: { v: string; label: string }[] };

const CONTENT_SCHEMAS: Record<string, FieldDef[]> = {
    Hero: [
        { type: 'text', key: 'name', label: 'Nom', placeholder: 'Ton Nom' },
        { type: 'text', key: 'title', label: 'Sous-titre', placeholder: 'Créateur UGC' },
        { type: 'textarea', key: 'description', label: 'Description', rows: 3 },
        { type: 'text', key: 'ctaLabel', label: 'Texte du bouton' },
        { type: 'url', key: 'ctaHref', label: 'Lien du bouton', placeholder: '#gallery' },
        { type: 'url', key: 'imageUrl', label: 'Photo de profil (URL)' },
    ],
    'À propos': [
        { type: 'text', key: 'heading', label: 'Titre de section' },
        { type: 'textarea', key: 'bio', label: 'Bio', rows: 4 },
        { type: 'tags', key: 'niches', label: 'Niches / Tags', placeholder: 'Beauté, Lifestyle…' },
    ],
    Stats: [
        { type: 'text', key: 'title', label: 'Titre de section' },
        { type: 'list-value-label', key: 'stats', label: 'Chiffres clés' },
    ],
    Galerie: [
        { type: 'text', key: 'heading', label: 'Titre' },
        { type: 'columns', key: 'columns', label: 'Colonnes' },
        { type: 'list-caption-link', key: 'items', label: 'Projets' },
    ],
    'Before/After': [
        { type: 'text', key: 'heading', label: 'Titre' },
        { type: 'text', key: 'metric', label: 'Résultat clé', placeholder: '+340%' },
        { type: 'text', key: 'beforeLabel', label: 'Label Avant' },
        { type: 'text', key: 'afterLabel', label: 'Label Après' },
        { type: 'url', key: 'beforeImage', label: 'Image Avant (URL)' },
        { type: 'url', key: 'afterImage', label: 'Image Après (URL)' },
        { type: 'textarea', key: 'description', label: 'Description', rows: 2 },
    ],
    Vidéos: [
        { type: 'text', key: 'heading', label: 'Titre' },
        { type: 'list-platform-url', key: 'items', label: 'Vidéos' },
    ],
    Témoignages: [
        { type: 'text', key: 'heading', label: 'Titre' },
        { type: 'list-quote-brand', key: 'items', label: 'Témoignages' },
    ],
    Marques: [
        { type: 'text', key: 'heading', label: 'Titre' },
        { type: 'list-brand-logo', key: 'items', label: 'Marques' },
    ],
    Contact: [
        { type: 'text', key: 'heading', label: 'Titre' },
        { type: 'textarea', key: 'description', label: 'Description', rows: 2 },
        { type: 'email', key: 'email', label: 'Email de contact' },
        { type: 'text', key: 'ctaLabel', label: 'Texte du bouton' },
        { type: 'list-label-url', key: 'socials', label: 'Réseaux sociaux' },
    ],
    Texte: [
        { type: 'textarea', key: 'text', label: 'Contenu', rows: 4 },
        { type: 'fontSize', key: 'fontSize', label: 'Taille' },
        { type: 'align', key: 'align', label: 'Alignement' },
        { type: 'color', key: 'color', label: 'Couleur du texte' },
    ],
    Footer: [
        { type: 'text', key: 'copyright', label: 'Copyright', placeholder: '© 2026 Ton Nom' },
        { type: 'list-label-url', key: 'links', label: 'Liens' },
        { type: 'toggle', key: 'showWatermark', label: 'Afficher « Built with Blooprint »' },
    ],
};

/* ══════════════════════════════════════════════════════════════
   SCHÉMAS STYLE — contrôles visuels par bloc
══════════════════════════════════════════════════════════════ */
const STYLE_SCHEMAS: Record<string, FieldDef[]> = {
    Hero: [
        { type: 'spacing', key: 'paddingTop', label: 'Espace Haut' },
        { type: 'spacing', key: 'paddingBottom', label: 'Espace Bas' },
        { type: 'color', key: 'bgColor', label: 'Couleur de fond' },
        { type: 'align', key: 'textAlign', label: 'Alignement du texte' },
        {
            type: 'select', key: 'avatarShape', label: 'Forme de l\'avatar', options: [
                { v: 'circle', label: 'Cercle' }, { v: 'rounded', label: 'Arrondi' }, { v: 'square', label: 'Carré' },
            ]
        },
        {
            type: 'select', key: 'avatarSize', label: 'Taille de l\'avatar', options: [
                { v: 'sm', label: 'Petit (64px)' }, { v: 'md', label: 'Moyen (96px)' }, { v: 'lg', label: 'Grand (128px)' },
            ]
        },
        { type: 'color', key: 'ctaBg', label: 'Couleur du bouton CTA' },
        { type: 'color', key: 'ctaTextColor', label: 'Texte du bouton CTA' },
        { type: 'radius', key: 'ctaRadius', label: 'Arrondi du bouton' },
    ],
    'À propos': [
        { type: 'spacing', key: 'paddingTop', label: 'Espace Haut' },
        { type: 'spacing', key: 'paddingBottom', label: 'Espace Bas' },
        { type: 'color', key: 'bgColor', label: 'Couleur de fond' },
        { type: 'align', key: 'textAlign', label: 'Alignement du texte' },
        {
            type: 'select', key: 'tagStyle', label: 'Style des niches / tags', options: [
                { v: 'outline', label: 'Contour (défaut)' }, { v: 'filled', label: 'Rempli' }, { v: 'subtle', label: 'Subtil' },
            ]
        },
    ],
    Stats: [
        { type: 'spacing', key: 'paddingTop', label: 'Espace Haut' },
        { type: 'spacing', key: 'paddingBottom', label: 'Espace Bas' },
        { type: 'color', key: 'bgColor', label: 'Couleur de fond' },
        { type: 'color', key: 'statColor', label: 'Couleur des chiffres clés' },
        { type: 'columns', key: 'statsColumns', label: 'Colonnes' },
    ],
    Galerie: [
        { type: 'spacing', key: 'paddingTop', label: 'Espace Haut' },
        { type: 'spacing', key: 'paddingBottom', label: 'Espace Bas' },
        { type: 'color', key: 'bgColor', label: 'Couleur de fond' },
        { type: 'radius', key: 'cardRadius', label: 'Arrondi des cartes' },
        {
            type: 'select', key: 'aspectRatio', label: 'Format des images', options: [
                { v: 'video', label: '16:9 — Vidéo' },
                { v: 'square', label: '1:1 — Carré' },
                { v: 'portrait', label: '3:4 — Portrait' },
            ]
        },
    ],
    'Before/After': [
        { type: 'spacing', key: 'paddingTop', label: 'Espace Haut' },
        { type: 'spacing', key: 'paddingBottom', label: 'Espace Bas' },
        { type: 'color', key: 'bgColor', label: 'Couleur de fond' },
        { type: 'color', key: 'metricColor', label: 'Couleur du résultat clé' },
    ],
    Vidéos: [
        { type: 'spacing', key: 'paddingTop', label: 'Espace Haut' },
        { type: 'spacing', key: 'paddingBottom', label: 'Espace Bas' },
        { type: 'color', key: 'bgColor', label: 'Couleur de fond' },
        { type: 'radius', key: 'cardRadius', label: 'Arrondi des cartes vidéo' },
    ],
    Témoignages: [
        { type: 'spacing', key: 'paddingTop', label: 'Espace Haut' },
        { type: 'spacing', key: 'paddingBottom', label: 'Espace Bas' },
        { type: 'color', key: 'bgColor', label: 'Couleur de fond' },
        { type: 'color', key: 'cardBg', label: 'Fond des cartes' },
    ],
    Marques: [
        { type: 'spacing', key: 'paddingTop', label: 'Espace Haut' },
        { type: 'spacing', key: 'paddingBottom', label: 'Espace Bas' },
        { type: 'color', key: 'bgColor', label: 'Couleur de fond' },
        { type: 'toggle', key: 'grayscale', label: 'Logos en niveaux de gris' },
        {
            type: 'select', key: 'logoSize', label: 'Taille des logos', options: [
                { v: 'sm', label: 'Petits (32px)' }, { v: 'md', label: 'Moyens (48px)' }, { v: 'lg', label: 'Grands (64px)' },
            ]
        },
    ],
    Contact: [
        { type: 'spacing', key: 'paddingTop', label: 'Espace Haut' },
        { type: 'spacing', key: 'paddingBottom', label: 'Espace Bas' },
        { type: 'color', key: 'bgColor', label: 'Couleur de fond' },
        { type: 'color', key: 'ctaBg', label: 'Couleur du bouton' },
        { type: 'color', key: 'ctaTextColor', label: 'Texte du bouton' },
        { type: 'radius', key: 'ctaRadius', label: 'Arrondi du bouton' },
    ],
    Texte: [
        { type: 'spacing', key: 'paddingTop', label: 'Espace Haut' },
        { type: 'spacing', key: 'paddingBottom', label: 'Espace Bas' },
        { type: 'color', key: 'bgColor', label: 'Couleur de fond' },
    ],
    Footer: [
        { type: 'spacing', key: 'paddingTop', label: 'Espace Haut' },
        { type: 'spacing', key: 'paddingBottom', label: 'Espace Bas' },
        { type: 'color', key: 'bgColor', label: 'Couleur de fond' },
        { type: 'align', key: 'textAlign', label: 'Alignement' },
        { type: 'toggle', key: 'showDivider', label: 'Afficher ligne de séparation' },
    ],
};

/* ══════════════════════════════════════════════════════════════
   SCHÉMA AVANCÉ — même pour tous les blocs
══════════════════════════════════════════════════════════════ */
const ADVANCED_SCHEMA: FieldDef[] = [
    { type: 'text', key: 'customId', label: 'Ancre HTML (id)', placeholder: 'ex: contact' },
    { type: 'text', key: 'customClass', label: 'Classes CSS personnalisées', placeholder: 'ex: mon-bloc' },
    { type: 'toggle', key: 'hideOnMobile', label: 'Masquer sur mobile' },
    { type: 'toggle', key: 'hideOnDesktop', label: 'Masquer sur desktop' },
    {
        type: 'select', key: 'animateIn', label: 'Animation d\'apparition', options: [
            { v: 'none', label: 'Aucune' },
            { v: 'fade', label: 'Fondu' },
            { v: 'slide-up', label: 'Glissement haut' },
            { v: 'slide-down', label: 'Glissement bas' },
            { v: 'scale', label: 'Zoom' },
        ]
    },
];


/* ══════════════════════════════════════════════════════════════
   Composants de champs réutilisables
══════════════════════════════════════════════════════════════ */

const inputCls =
    'w-full rounded-lg border border-zinc-700 bg-zinc-900 px-2.5 py-1.5 text-xs text-zinc-200 outline-none focus:border-sky-400/60 placeholder:text-zinc-600 transition-colors';

function FieldLabel({ label }: { label: string }) {
    return (
        <label className="mb-1 block text-[10px] font-medium uppercase tracking-wide text-zinc-500">
            {label}
        </label>
    );
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
    return (
        <button
            onClick={() => onChange(!value)}
            className={`relative h-5 w-9 rounded-full transition-colors ${value ? 'bg-sky-400' : 'bg-zinc-700'}`}
        >
            <span
                className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${value ? 'translate-x-4' : 'translate-x-0.5'}`}
            />
        </button>
    );
}

function AlignButtons({ value, onChange }: { value: string; onChange: (v: string) => void }) {
    const options = [
        { v: 'left', icon: <AlignLeft className="h-3.5 w-3.5" /> },
        { v: 'center', icon: <AlignCenter className="h-3.5 w-3.5" /> },
        { v: 'right', icon: <AlignRight className="h-3.5 w-3.5" /> },
    ];
    return (
        <div className="flex gap-1">
            {options.map(({ v, icon }) => (
                <button
                    key={v}
                    onClick={() => onChange(v)}
                    className={`flex items-center justify-center rounded-md p-2 transition-colors ${value === v ? 'bg-sky-400 text-zinc-900' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}
                >
                    {icon}
                </button>
            ))}
        </div>
    );
}

function FontSizeSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
    const sizes = [
        { v: 'sm', label: 'Sm' },
        { v: 'base', label: 'Md' },
        { v: 'lg', label: 'Lg' },
        { v: 'xl', label: 'Xl' },
        { v: '2xl', label: '2Xl' },
    ];
    return (
        <div className="flex gap-1">
            {sizes.map(({ v, label }) => (
                <button
                    key={v}
                    onClick={() => onChange(v)}
                    className={`flex-1 rounded py-1 text-[10px] font-medium transition-colors ${value === v ? 'bg-sky-400 text-zinc-900' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}
                >
                    {label}
                </button>
            ))}
        </div>
    );
}

function ColumnsToggle({ value, onChange }: { value: number; onChange: (v: number) => void }) {
    return (
        <div className="flex gap-1">
            {[2, 3].map((n) => (
                <button
                    key={n}
                    onClick={() => onChange(n)}
                    className={`flex-1 rounded-md py-1.5 text-xs font-medium transition-colors ${value === n ? 'bg-sky-400 text-zinc-900' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}
                >
                    {n} col.
                </button>
            ))}
        </div>
    );
}

function SpacingButtons({ value, onChange }: { value: string; onChange: (v: string) => void }) {
    const opts = [
        { v: 'none', label: '0' },
        { v: 'xs', label: 'XS' },
        { v: 'sm', label: 'SM' },
        { v: 'md', label: 'MD' },
        { v: 'lg', label: 'LG' },
        { v: 'xl', label: 'XL' },
    ];
    return (
        <div className="flex gap-1">
            {opts.map(({ v, label }) => (
                <button key={v} onClick={() => onChange(v)}
                    className={`flex-1 rounded py-1 text-[10px] font-medium transition-colors ${value === v ? 'bg-sky-400 text-zinc-900' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}>
                    {label}
                </button>
            ))}
        </div>
    );
}

function RadiusButtons({ value, onChange }: { value: string; onChange: (v: string) => void }) {
    const opts = [
        { v: 'none', label: '0' },
        { v: 'sm', label: 'SM' },
        { v: 'md', label: 'MD' },
        { v: 'lg', label: 'LG' },
        { v: 'xl', label: 'XL' },
        { v: 'full', label: '●' },
    ];
    return (
        <div className="flex gap-1">
            {opts.map(({ v, label }) => (
                <button key={v} onClick={() => onChange(v)}
                    className={`flex-1 rounded py-1 text-[10px] font-medium transition-colors ${value === v ? 'bg-sky-400 text-zinc-900' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}>
                    {label}
                </button>
            ))}
        </div>
    );
}

function SelectField({ value, options, onChange }: { value: string; options: { v: string; label: string }[]; onChange: (v: string) => void }) {
    return (
        <select value={value} onChange={(e) => onChange(e.target.value)}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-2.5 py-1.5 text-xs text-zinc-200 outline-none focus:border-sky-400/60 transition-colors">
            {options.map((o) => <option key={o.v} value={o.v}>{o.label}</option>)}
        </select>
    );
}

function TagsEditor({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        const input = e.currentTarget;
        if ((e.key === 'Enter' || e.key === ',') && input.value.trim()) {
            e.preventDefault();
            const tag = input.value.trim().replace(/,$/, '');
            if (tag && !value.includes(tag)) onChange([...value, tag]);
            input.value = '';
        }
        if (e.key === 'Backspace' && !input.value && value.length > 0) {
            onChange(value.slice(0, -1));
        }
    };
    return (
        <div className="flex flex-wrap gap-1.5 rounded-lg border border-zinc-700 bg-zinc-900 p-2 focus-within:border-sky-400/60 transition-colors min-h-[38px]">
            {value.map((tag) => (
                <span key={tag} className="flex items-center gap-1 rounded-full border border-sky-400/30 bg-sky-400/10 px-2 py-0.5 text-[10px] text-sky-300">
                    {tag}
                    <button onClick={() => onChange(value.filter((t) => t !== tag))} className="text-sky-400/60 hover:text-sky-300">
                        <X className="h-2.5 w-2.5" />
                    </button>
                </span>
            ))}
            <input
                type="text"
                placeholder={value.length === 0 ? 'Ajouter… (Entrée)' : '+'}
                className="min-w-[60px] flex-1 bg-transparent text-xs text-zinc-200 outline-none placeholder:text-zinc-600"
                onKeyDown={handleKeyDown}
            />
        </div>
    );
}

function ColorField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
    const safe = value?.startsWith('#') ? value : '#ffffff';
    return (
        <div className="flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900 p-1.5 focus-within:border-sky-400/60 transition-colors">
            <input type="color" value={safe} onChange={(e) => onChange(e.target.value)} className="h-7 w-7 shrink-0 cursor-pointer rounded border-0 bg-transparent p-0" />
            <input type="text" value={safe} onChange={(e) => onChange(e.target.value)} className="flex-1 bg-transparent text-xs font-mono text-zinc-300 outline-none" />
        </div>
    );
}

function ListValueLabel({ value, onChange }: { value: { value: string; label: string }[]; onChange: (v: typeof value) => void }) {
    const update = (i: number, field: 'value' | 'label', v: string) => onChange(value.map((item, idx) => idx === i ? { ...item, [field]: v } : item));
    const remove = (i: number) => onChange(value.filter((_, idx) => idx !== i));
    const add = () => onChange([...value, { value: '0', label: 'Stat' }]);
    return (
        <div className="space-y-1.5">
            {value.map((item, i) => (
                <div key={i} className="flex items-center gap-1.5">
                    <GripVertical className="h-3.5 w-3.5 shrink-0 text-zinc-700" />
                    <input type="text" value={item.value} onChange={(e) => update(i, 'value', e.target.value)} placeholder="50+" className="w-14 shrink-0 rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs font-bold text-zinc-200 outline-none focus:border-sky-400/60" />
                    <input type="text" value={item.label} onChange={(e) => update(i, 'label', e.target.value)} placeholder="Projets" className={`${inputCls} flex-1`} />
                    <button onClick={() => remove(i)} className="text-zinc-700 hover:text-red-400 transition-colors shrink-0"><X className="h-3.5 w-3.5" /></button>
                </div>
            ))}
            <button onClick={add} className="flex w-full items-center justify-center gap-1 rounded-lg border border-dashed border-zinc-700 py-1.5 text-[10px] text-zinc-500 hover:border-sky-400/40 hover:text-sky-400 transition-colors">
                <Plus className="h-3 w-3" /> Ajouter
            </button>
        </div>
    );
}

function ListQuoteBrand({ value, onChange }: { value: { quote: string; brand: string; contact?: string; role?: string }[]; onChange: (v: typeof value) => void }) {
    const update = (i: number, f: string, v: string) => onChange(value.map((item, idx) => idx === i ? { ...item, [f]: v } : item));
    const remove = (i: number) => onChange(value.filter((_, idx) => idx !== i));
    const add = () => onChange([...value, { quote: '', brand: '', role: '' }]);
    return (
        <div className="space-y-2">
            {value.map((item, i) => (
                <div key={i} className="rounded-lg border border-zinc-700 bg-zinc-900/50 p-2.5 space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] text-zinc-600 font-mono">#{i + 1}</span>
                        <button onClick={() => remove(i)} className="text-zinc-700 hover:text-red-400 transition-colors"><X className="h-3.5 w-3.5" /></button>
                    </div>
                    <textarea value={item.quote} onChange={(e) => update(i, 'quote', e.target.value)} placeholder="Témoignage…" rows={2} className={`${inputCls} resize-none`} />
                    <input type="text" value={item.brand} onChange={(e) => update(i, 'brand', e.target.value)} placeholder="Nom de la marque" className={inputCls} />
                    <input type="text" value={item.role ?? ''} onChange={(e) => update(i, 'role', e.target.value)} placeholder="Rôle (optionnel)" className={inputCls} />
                </div>
            ))}
            <button onClick={add} className="flex w-full items-center justify-center gap-1 rounded-lg border border-dashed border-zinc-700 py-1.5 text-[10px] text-zinc-500 hover:border-sky-400/40 hover:text-sky-400 transition-colors">
                <Plus className="h-3 w-3" /> Ajouter
            </button>
        </div>
    );
}

const PLATFORMS = ['tiktok', 'youtube', 'instagram'] as const;

function ListPlatformUrl({ value, onChange }: { value: { platform: string; url: string; title?: string }[]; onChange: (v: typeof value) => void }) {
    const update = (i: number, f: string, v: string) => onChange(value.map((item, idx) => idx === i ? { ...item, [f]: v } : item));
    const remove = (i: number) => onChange(value.filter((_, idx) => idx !== i));
    const add = () => onChange([...value, { platform: 'tiktok', url: '', title: '' }]);
    return (
        <div className="space-y-2">
            {value.map((item, i) => (
                <div key={i} className="rounded-lg border border-zinc-700 bg-zinc-900/50 p-2.5 space-y-2">
                    <div className="flex items-center justify-between">
                        <div className="flex gap-1">
                            {PLATFORMS.map((p) => (
                                <button key={p} onClick={() => update(i, 'platform', p)} className={`rounded px-2 py-0.5 text-[10px] capitalize transition-colors ${item.platform === p ? 'bg-sky-400 text-zinc-900 font-medium' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}>{p}</button>
                            ))}
                        </div>
                        <button onClick={() => remove(i)} className="text-zinc-700 hover:text-red-400 transition-colors"><X className="h-3.5 w-3.5" /></button>
                    </div>
                    <input type="text" value={item.title ?? ''} onChange={(e) => update(i, 'title', e.target.value)} placeholder="Titre" className={inputCls} />
                    <input type="url" value={item.url} onChange={(e) => update(i, 'url', e.target.value)} placeholder="https://…" className={inputCls} />
                </div>
            ))}
            <button onClick={add} className="flex w-full items-center justify-center gap-1 rounded-lg border border-dashed border-zinc-700 py-1.5 text-[10px] text-zinc-500 hover:border-sky-400/40 hover:text-sky-400 transition-colors">
                <Plus className="h-3 w-3" /> Ajouter
            </button>
        </div>
    );
}

function ListLabelUrl({ value, onChange }: { value: { label: string; url: string }[]; onChange: (v: typeof value) => void }) {
    const update = (i: number, f: 'label' | 'url', v: string) => onChange(value.map((item, idx) => idx === i ? { ...item, [f]: v } : item));
    const remove = (i: number) => onChange(value.filter((_, idx) => idx !== i));
    const add = () => onChange([...value, { label: '', url: 'https://' }]);
    return (
        <div className="space-y-1.5">
            {value.map((item, i) => (
                <div key={i} className="flex items-center gap-1.5">
                    <GripVertical className="h-3.5 w-3.5 shrink-0 text-zinc-700" />
                    <input type="text" value={item.label} onChange={(e) => update(i, 'label', e.target.value)} placeholder="Label" className={`${inputCls} w-20 shrink-0`} />
                    <input type="url" value={item.url} onChange={(e) => update(i, 'url', e.target.value)} placeholder="https://…" className={`${inputCls} flex-1`} />
                    <button onClick={() => remove(i)} className="text-zinc-700 hover:text-red-400 transition-colors shrink-0"><X className="h-3.5 w-3.5" /></button>
                </div>
            ))}
            <button onClick={add} className="flex w-full items-center justify-center gap-1 rounded-lg border border-dashed border-zinc-700 py-1.5 text-[10px] text-zinc-500 hover:border-sky-400/40 hover:text-sky-400 transition-colors">
                <Plus className="h-3 w-3" /> Ajouter
            </button>
        </div>
    );
}

function ListCaptionLink({ value, onChange }: { value: { caption?: string; link?: string; imageUrl?: string }[]; onChange: (v: typeof value) => void }) {
    const update = (i: number, f: string, v: string) => onChange(value.map((item, idx) => idx === i ? { ...item, [f]: v } : item));
    const remove = (i: number) => onChange(value.filter((_, idx) => idx !== i));
    const add = () => onChange([...value, { caption: `Projet ${value.length + 1}` }]);
    return (
        <div className="space-y-2">
            {value.map((item, i) => (
                <div key={i} className="rounded-lg border border-zinc-700 bg-zinc-900/50 p-2.5 space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] text-zinc-600 font-mono">Projet {i + 1}</span>
                        <button onClick={() => remove(i)} className="text-zinc-700 hover:text-red-400 transition-colors"><X className="h-3.5 w-3.5" /></button>
                    </div>
                    <input type="text" value={item.caption ?? ''} onChange={(e) => update(i, 'caption', e.target.value)} placeholder="Titre" className={inputCls} />
                    <input type="url" value={item.imageUrl ?? ''} onChange={(e) => update(i, 'imageUrl', e.target.value)} placeholder="URL image" className={inputCls} />
                    <input type="url" value={item.link ?? ''} onChange={(e) => update(i, 'link', e.target.value)} placeholder="Lien (optionnel)" className={inputCls} />
                </div>
            ))}
            <button onClick={add} className="flex w-full items-center justify-center gap-1 rounded-lg border border-dashed border-zinc-700 py-1.5 text-[10px] text-zinc-500 hover:border-sky-400/40 hover:text-sky-400 transition-colors">
                <Plus className="h-3 w-3" /> Ajouter
            </button>
        </div>
    );
}

function ListBrandLogo({ value, onChange }: { value: { name: string; logoUrl?: string }[]; onChange: (v: typeof value) => void }) {
    const update = (i: number, f: string, v: string) => onChange(value.map((item, idx) => idx === i ? { ...item, [f]: v } : item));
    const remove = (i: number) => onChange(value.filter((_, idx) => idx !== i));
    const add = () => onChange([...value, { name: 'Marque' }]);
    return (
        <div className="space-y-1.5">
            {value.map((item, i) => (
                <div key={i} className="flex items-center gap-1.5">
                    <GripVertical className="h-3.5 w-3.5 shrink-0 text-zinc-700" />
                    <input type="text" value={item.name} onChange={(e) => update(i, 'name', e.target.value)} placeholder="Nom" className={`${inputCls} flex-1`} />
                    <input type="url" value={item.logoUrl ?? ''} onChange={(e) => update(i, 'logoUrl', e.target.value)} placeholder="Logo URL" className={`${inputCls} flex-1`} />
                    <button onClick={() => remove(i)} className="text-zinc-700 hover:text-red-400 transition-colors shrink-0"><X className="h-3.5 w-3.5" /></button>
                </div>
            ))}
            <button onClick={add} className="flex w-full items-center justify-center gap-1 rounded-lg border border-dashed border-zinc-700 py-1.5 text-[10px] text-zinc-500 hover:border-sky-400/40 hover:text-sky-400 transition-colors">
                <Plus className="h-3 w-3" /> Ajouter
            </button>
        </div>
    );
}

/* ══════════════════════════════════════════════════════════════
   Rendu générique d'un champ par son type
══════════════════════════════════════════════════════════════ */

function renderField(field: FieldDef, value: unknown, updateProp: (key: string, val: unknown) => void) {
    const { key } = field;
    const str = typeof value === 'string' ? value : '';
    const num = typeof value === 'number' ? value : 0;
    const bool = typeof value === 'boolean' ? value : false;
    const arr = Array.isArray(value) ? value : [];

    switch (field.type) {
        case 'text':
        case 'url':
        case 'email':
            return (
                <div key={key}>
                    <FieldLabel label={field.label} />
                    <input
                        type={field.type === 'email' ? 'email' : 'text'}
                        defaultValue={str}
                        placeholder={'placeholder' in field ? field.placeholder : undefined}
                        onBlur={(e) => updateProp(key, e.target.value)}
                        className={inputCls}
                    />
                </div>
            );
        case 'textarea':
            return (
                <div key={key}>
                    <FieldLabel label={field.label} />
                    <textarea
                        defaultValue={str}
                        placeholder={'placeholder' in field ? field.placeholder : undefined}
                        rows={'rows' in field ? (field.rows ?? 3) : 3}
                        onBlur={(e) => updateProp(key, e.target.value)}
                        className={`${inputCls} resize-none leading-relaxed`}
                    />
                </div>
            );
        case 'toggle':
            return (
                <div key={key} className="flex items-center justify-between gap-3">
                    <FieldLabel label={field.label} />
                    <Toggle value={bool} onChange={(v) => updateProp(key, v)} />
                </div>
            );
        case 'align':
            return (
                <div key={key}>
                    <FieldLabel label={field.label} />
                    <AlignButtons value={str || 'left'} onChange={(v) => updateProp(key, v)} />
                </div>
            );
        case 'fontSize':
            return (
                <div key={key}>
                    <FieldLabel label={field.label} />
                    <FontSizeSelect value={str || 'base'} onChange={(v) => updateProp(key, v)} />
                </div>
            );
        case 'columns':
            return (
                <div key={key}>
                    <FieldLabel label={field.label} />
                    <ColumnsToggle value={num || 3} onChange={(v) => updateProp(key, v)} />
                </div>
            );
        case 'color':
            return (
                <div key={key}>
                    <FieldLabel label={field.label} />
                    <ColorField value={str} onChange={(v) => updateProp(key, v)} />
                </div>
            );
        case 'tags':
            return (
                <div key={key}>
                    <FieldLabel label={field.label} />
                    <TagsEditor value={arr as string[]} onChange={(v) => updateProp(key, v)} />
                </div>
            );
        case 'list-value-label':
            return (
                <div key={key}>
                    <FieldLabel label={field.label} />
                    <ListValueLabel value={arr as { value: string; label: string }[]} onChange={(v) => updateProp(key, v)} />
                </div>
            );
        case 'list-quote-brand':
            return (
                <div key={key}>
                    <FieldLabel label={field.label} />
                    <ListQuoteBrand value={arr as { quote: string; brand: string; contact?: string; role?: string }[]} onChange={(v) => updateProp(key, v)} />
                </div>
            );
        case 'list-platform-url':
            return (
                <div key={key}>
                    <FieldLabel label={field.label} />
                    <ListPlatformUrl value={arr as { platform: string; url: string; title?: string }[]} onChange={(v) => updateProp(key, v)} />
                </div>
            );
        case 'list-label-url':
            return (
                <div key={key}>
                    <FieldLabel label={field.label} />
                    <ListLabelUrl value={arr as { label: string; url: string }[]} onChange={(v) => updateProp(key, v)} />
                </div>
            );
        case 'list-caption-link':
            return (
                <div key={key}>
                    <FieldLabel label={field.label} />
                    <ListCaptionLink value={arr as { caption?: string; link?: string; imageUrl?: string }[]} onChange={(v) => updateProp(key, v)} />
                </div>
            );
        case 'list-brand-logo':
            return (
                <div key={key}>
                    <FieldLabel label={field.label} />
                    <ListBrandLogo value={arr as { name: string; logoUrl?: string }[]} onChange={(v) => updateProp(key, v)} />
                </div>
            );
        case 'spacing':
            return (
                <div key={key}>
                    <FieldLabel label={field.label} />
                    <SpacingButtons value={str || 'md'} onChange={(v) => updateProp(key, v)} />
                </div>
            );
        case 'radius':
            return (
                <div key={key}>
                    <FieldLabel label={field.label} />
                    <RadiusButtons value={str || 'md'} onChange={(v) => updateProp(key, v)} />
                </div>
            );
        case 'select':
            return (
                <div key={key}>
                    <FieldLabel label={field.label} />
                    <SelectField
                        value={str || field.options[0]?.v || ''}
                        options={field.options}
                        onChange={(v) => updateProp(key, v)}
                    />
                </div>
            );
        default:
            return null;
    }
}

/**
 * Properties panel — affiche les props éditables du composant sélectionné.
 * Pour MVP : affiche les valeurs JSON et permet l'édition via champs simples.
 * US-204
 */
export function PropertiesPanel({
    hideHeader = false,
    hideDelete = false,
    tab = 'contenu',
}: {
    hideHeader?: boolean;
    hideDelete?: boolean;
    tab?: 'contenu' | 'style' | 'avance';
} = {}) {
    const { selected, actions } = useEditor((state) => {
        const [currentNodeId] = state.events.selected;
        if (!currentNodeId) return { selected: null };
        const node = state.nodes[currentNodeId];
        return {
            selected: {
                id: currentNodeId,
                name: (node.data.displayName ?? node.data.name ?? '') as string,
                props: node.data.props as Record<string, unknown>,
            },
        };
    });

    if (!selected) {
        return (
            <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
                <MousePointerClick className="h-6 w-6 text-zinc-700" />
                <p className="text-xs text-zinc-500 leading-relaxed">
                    Clique sur un bloc<br />dans le canvas<br />pour l&apos;éditer
                </p>
            </div>
        );
    }

    const updateProp = (key: string, value: unknown) => {
        actions.setProp(selected.id, (props: Record<string, unknown>) => {
            props[key] = value;
        });
    };

    /* Sélectionner le schéma selon l'onglet actif */
    let schema: FieldDef[] | undefined;
    if (tab === 'contenu') schema = CONTENT_SCHEMAS[selected.name];
    else if (tab === 'style') schema = STYLE_SCHEMAS[selected.name];
    else schema = ADVANCED_SCHEMA;

    const fields = schema
        ? schema.map((field) => renderField(field, selected.props[field.key], updateProp))
        : tab === 'contenu'
            ? Object.entries(selected.props).map(([key, value]) => {
                if (Array.isArray(value) || (typeof value === 'object' && value !== null)) return null;
                if (typeof value === 'boolean') {
                    return (
                        <div key={key} className="flex items-center justify-between gap-3">
                            <span className="text-[10px] font-medium uppercase tracking-wide text-zinc-500">{key}</span>
                            <Toggle value={value} onChange={(v) => updateProp(key, v)} />
                        </div>
                    );
                }
                return (
                    <div key={key}>
                        <FieldLabel label={key} />
                        <input type="text" defaultValue={String(value)} onBlur={(e) => updateProp(key, e.target.value)} className={inputCls} />
                    </div>
                );
            })
            : null;

    return (
        <div className="flex flex-col">
            {!hideHeader && (
                <div className="shrink-0 border-b border-dashed border-zinc-800 px-4 py-3">
                    <p className="font-mono text-[9px] uppercase tracking-widest text-zinc-600">Propriétés</p>
                    <p className="mt-0.5 text-sm font-semibold text-sky-400">{selected.name}</p>
                </div>
            )}
            <div className="p-3 space-y-3">
                {fields}
                {!schema && tab !== 'contenu' && (
                    <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-zinc-800 p-6 text-center">
                        <Settings className="h-5 w-5 text-zinc-700" />
                        <p className="text-xs text-zinc-600">Aucune option disponible pour ce bloc.</p>
                    </div>
                )}
            </div>
            {!hideDelete && (
                <div className="shrink-0 border-t border-dashed border-zinc-800 p-3">
                    <button
                        onClick={() => actions.delete(selected.id)}
                        className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-red-500/20 bg-red-500/5 px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                        <Trash2 className="h-3.5 w-3.5" /> Supprimer ce bloc
                    </button>
                </div>
            )}
        </div>
    );
}
