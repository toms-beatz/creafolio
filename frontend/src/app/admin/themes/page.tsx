'use client';

import { useEffect, useState, useTransition } from 'react';
import { Plus, Pencil, Trash2, Copy, Save, X, ChevronDown, ChevronUp } from 'lucide-react';
import { getCustomThemesAction, upsertCustomThemeAction, deleteCustomThemeAction } from '@/features/admin/actions';
import { THEME_PRESETS } from '@/lib/themes';
import type { PortfolioTheme, ThemeColors } from '@/types/theme';

/* ────────────────────────────────────────── helpers ── */

function generateId() {
    return `custom_${Date.now().toString(36)}`;
}

const BLANK_COLORS: ThemeColors = {
    background: '#0a0a0a',
    surface: '#18181b',
    text: '#fafafa',
    textMuted: '#a1a1aa',
    primary: '#22d3ee',
    secondary: '#f472b6',
    border: '#27272a',
    heading: '#f4f4f5',
};

const BLANK_THEME: Omit<PortfolioTheme, 'id' | 'name'> = {
    colorMode: 'dark',
    colors: BLANK_COLORS,
    typography: {
        headingFont: 'Inter',
        bodyFont: 'Inter',
        headingWeight: 700,
        headingTracking: 'normal',
        headingTransform: 'none',
    },
    borderRadius: 'md',
    spacing: 'normal',
    baseFontSize: 'base',
};

const COLOR_LABELS: { key: keyof ThemeColors; label: string }[] = [
    { key: 'background', label: 'Fond de page' },
    { key: 'surface', label: 'Cartes / sections' },
    { key: 'text', label: 'Texte principal' },
    { key: 'textMuted', label: 'Texte secondaire' },
    { key: 'primary', label: 'Accent / CTA' },
    { key: 'secondary', label: 'Accent 2' },
    { key: 'border', label: 'Bordures' },
    { key: 'heading', label: 'Couleur des titres' },
];

const FONT_OPTIONS = ['Inter', 'DM Sans', 'Space Grotesk', 'Syne', 'Playfair Display', 'Cormorant Garamond', 'Bebas Neue', 'Raleway', 'Poppins', 'Montserrat', 'Oswald'];
const RADIUS_OPTIONS: PortfolioTheme['borderRadius'][] = ['none', 'sm', 'md', 'lg', 'xl', 'full'];
const SPACING_OPTIONS: PortfolioTheme['spacing'][] = ['compact', 'normal', 'spacious'];
const FONT_SIZE_OPTIONS: { value: NonNullable<PortfolioTheme['baseFontSize']>; label: string }[] = [
    { value: 'sm', label: 'Petit (14px)' },
    { value: 'base', label: 'Normal (16px)' },
    { value: 'lg', label: 'Grand (18px)' },
    { value: 'xl', label: 'XL (20px)' },
];
const WEIGHT_OPTIONS = [400, 500, 600, 700, 800, 900];
const TRACKING_OPTIONS = ['-0.05em', '-0.025em', 'normal', '0.025em', '0.05em', '0.1em'];
const TRANSFORM_OPTIONS: PortfolioTheme['typography']['headingTransform'][] = ['none', 'uppercase', 'capitalize'];

/* ────────────────────────────────── ThemeEditor ── */

function SectionToggle({ label, open, onToggle }: { label: string; open: boolean; onToggle: () => void }) {
    return (
        <button type="button" onClick={onToggle}
            className="flex w-full items-center justify-between rounded border border-zinc-700 bg-zinc-800/60 px-3 py-2 text-xs font-medium text-zinc-300 hover:border-zinc-500 transition-colors">
            {label}
            {open ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>
    );
}

function ThemeEditor({
    initial,
    onSave,
    onCancel,
    isSaving,
}: {
    initial: PortfolioTheme;
    onSave: (t: PortfolioTheme) => void;
    onCancel: () => void;
    isSaving: boolean;
}) {
    const [theme, setTheme] = useState<PortfolioTheme>({ ...initial });
    const [openSect, setOpenSect] = useState<string | null>('colors');
    const toggle = (s: string) => setOpenSect((p) => (p === s ? null : s));

    const setColor = (key: keyof ThemeColors, value: string) =>
        setTheme((p) => ({ ...p, colors: { ...p.colors, [key]: value } }));
    const setDarkColor = (key: keyof ThemeColors, value: string) =>
        setTheme((p) => ({ ...p, darkColors: { ...(p.darkColors ?? p.colors), [key]: value } }));
    const setLightColor = (key: keyof ThemeColors, value: string) =>
        setTheme((p) => ({ ...p, lightColors: { ...(p.lightColors ?? p.colors), [key]: value } }));
    const setTypo = (key: keyof PortfolioTheme['typography'], value: string | number) =>
        setTheme((p) => ({ ...p, typography: { ...p.typography, [key]: value } }));

    return (
        <div className="flex flex-col gap-3">
            {/* Name + ID */}
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-zinc-500">Nom du thème</label>
                    <input
                        value={theme.name}
                        onChange={(e) => setTheme((p) => ({ ...p, name: e.target.value }))}
                        className="w-full rounded border border-zinc-600 bg-zinc-800 px-2 py-1.5 text-xs text-zinc-200 outline-none focus:border-sky-500"
                        placeholder="Mon thème"
                    />
                </div>
                <div>
                    <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-zinc-500">Identifiant (slug)</label>
                    <input
                        value={theme.id}
                        onChange={(e) => setTheme((p) => ({ ...p, id: e.target.value.toLowerCase().replace(/\s+/g, '_') }))}
                        className="w-full rounded border border-zinc-600 bg-zinc-800 px-2 py-1.5 font-mono text-xs text-zinc-400 outline-none focus:border-sky-500"
                        placeholder="mon_theme"
                    />
                </div>
            </div>

            {/* Mode par défaut */}
            <div className="flex items-center gap-3">
                <span className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">Mode par défaut</span>
                {(['dark', 'light'] as const).map((m) => (
                    <button key={m} type="button"
                        onClick={() => setTheme((p) => ({ ...p, colorMode: m }))}
                        className={`rounded px-3 py-1 text-xs transition-colors ${theme.colorMode === m ? 'bg-sky-500 text-white' : 'bg-zinc-700 text-zinc-400 hover:bg-zinc-600'}`}>
                        {m === 'dark' ? '🌙 Sombre' : '☀️ Clair'}
                    </button>
                ))}
            </div>

            {/* Couleurs actives */}
            <SectionToggle label="🎨 Couleurs (mode actif)" open={openSect === 'colors'} onToggle={() => toggle('colors')} />
            {openSect === 'colors' && (
                <div className="rounded border border-zinc-700 bg-zinc-800/40 p-3 grid grid-cols-2 gap-2">
                    {COLOR_LABELS.map(({ key, label }) => (
                        <div key={key} className="flex items-center gap-2">
                            <input type="color" value={theme.colors[key]}
                                onChange={(e) => setColor(key, e.target.value)}
                                className="h-7 w-9 cursor-pointer rounded border border-zinc-600 bg-transparent p-0" />
                            <div>
                                <p className="text-[10px] font-medium text-zinc-300">{label}</p>
                                <p className="font-mono text-[9px] text-zinc-500">{theme.colors[key]}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Dark variant */}
            <SectionToggle label="🌙 Variante sombre" open={openSect === 'dark'} onToggle={() => toggle('dark')} />
            {openSect === 'dark' && (
                <div className="rounded border border-zinc-700 bg-zinc-900/40 p-3 grid grid-cols-2 gap-2">
                    <p className="col-span-2 text-[10px] text-zinc-500 mb-1">Laissez vide pour hériter des couleurs actives.</p>
                    {COLOR_LABELS.map(({ key, label }) => (
                        <div key={key} className="flex items-center gap-2">
                            <input type="color" value={(theme.darkColors ?? theme.colors)[key]}
                                onChange={(e) => setDarkColor(key, e.target.value)}
                                className="h-7 w-9 cursor-pointer rounded border border-zinc-600 bg-transparent p-0" />
                            <p className="text-[10px] text-zinc-300">{label}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* Light variant */}
            <SectionToggle label="☀️ Variante claire" open={openSect === 'light'} onToggle={() => toggle('light')} />
            {openSect === 'light' && (
                <div className="rounded border border-zinc-700 bg-zinc-100/5 p-3 grid grid-cols-2 gap-2">
                    <p className="col-span-2 text-[10px] text-zinc-500 mb-1">Laissez vide pour hériter des couleurs actives.</p>
                    {COLOR_LABELS.map(({ key, label }) => (
                        <div key={key} className="flex items-center gap-2">
                            <input type="color" value={(theme.lightColors ?? theme.colors)[key]}
                                onChange={(e) => setLightColor(key, e.target.value)}
                                className="h-7 w-9 cursor-pointer rounded border border-zinc-600 bg-transparent p-0" />
                            <p className="text-[10px] text-zinc-300">{label}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* Typography */}
            <SectionToggle label="✍️ Typographie" open={openSect === 'typo'} onToggle={() => toggle('typo')} />
            {openSect === 'typo' && (
                <div className="rounded border border-zinc-700 bg-zinc-800/40 p-3 flex flex-col gap-3">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="mb-1 block text-[10px] text-zinc-500">Police titres</label>
                            <select value={theme.typography.headingFont} onChange={(e) => setTypo('headingFont', e.target.value)}
                                className="w-full rounded border border-zinc-600 bg-zinc-800 px-2 py-1.5 text-xs text-zinc-200 outline-none focus:border-sky-500">
                                {FONT_OPTIONS.map((f) => <option key={f} value={f}>{f}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="mb-1 block text-[10px] text-zinc-500">Police corps</label>
                            <select value={theme.typography.bodyFont} onChange={(e) => setTypo('bodyFont', e.target.value)}
                                className="w-full rounded border border-zinc-600 bg-zinc-800 px-2 py-1.5 text-xs text-zinc-200 outline-none focus:border-sky-500">
                                {FONT_OPTIONS.map((f) => <option key={f} value={f}>{f}</option>)}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="mb-1 block text-[10px] text-zinc-500">Graisse titres</label>
                        <div className="flex flex-wrap gap-1">
                            {WEIGHT_OPTIONS.map((w) => (
                                <button key={w} type="button" onClick={() => setTypo('headingWeight', w)}
                                    className={`rounded px-2 py-1 text-[10px] transition-colors ${theme.typography.headingWeight === w ? 'bg-sky-500 text-white' : 'bg-zinc-700 text-zinc-400 hover:bg-zinc-600'}`}>{w}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="mb-1 block text-[10px] text-zinc-500">Espacement titres</label>
                        <div className="flex flex-wrap gap-1">
                            {TRACKING_OPTIONS.map((t) => (
                                <button key={t} type="button" onClick={() => setTypo('headingTracking', t)}
                                    className={`rounded px-2 py-1 text-[10px] transition-colors ${theme.typography.headingTracking === t ? 'bg-sky-500 text-white' : 'bg-zinc-700 text-zinc-400 hover:bg-zinc-600'}`}>{t}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="mb-1 block text-[10px] text-zinc-500">Casse titres</label>
                        <div className="flex gap-1">
                            {TRANSFORM_OPTIONS.map((t) => (
                                <button key={t} type="button" onClick={() => setTypo('headingTransform', t)}
                                    className={`rounded px-2 py-1 text-[10px] transition-colors ${theme.typography.headingTransform === t ? 'bg-sky-500 text-white' : 'bg-zinc-700 text-zinc-400 hover:bg-zinc-600'}`}>{t}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Layout */}
            <SectionToggle label="📐 Mise en page" open={openSect === 'layout'} onToggle={() => toggle('layout')} />
            {openSect === 'layout' && (
                <div className="rounded border border-zinc-700 bg-zinc-800/40 p-3 flex flex-col gap-3">
                    <div>
                        <label className="mb-1 block text-[10px] text-zinc-500">Taille de texte globale</label>
                        <div className="flex flex-wrap gap-1">
                            {FONT_SIZE_OPTIONS.map(({ value, label }) => (
                                <button key={value} type="button" onClick={() => setTheme((p) => ({ ...p, baseFontSize: value }))}
                                    className={`rounded px-2 py-1 text-[10px] transition-colors ${theme.baseFontSize === value ? 'bg-sky-500 text-white' : 'bg-zinc-700 text-zinc-400 hover:bg-zinc-600'}`}>{label}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="mb-1 block text-[10px] text-zinc-500">Arrondis</label>
                        <div className="flex flex-wrap gap-1">
                            {RADIUS_OPTIONS.map((r) => (
                                <button key={r} type="button" onClick={() => setTheme((p) => ({ ...p, borderRadius: r }))}
                                    className={`rounded px-2 py-1 text-[10px] transition-colors capitalize ${theme.borderRadius === r ? 'bg-sky-500 text-white' : 'bg-zinc-700 text-zinc-400 hover:bg-zinc-600'}`}>{r}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="mb-1 block text-[10px] text-zinc-500">Espacement sections</label>
                        <div className="flex flex-wrap gap-1">
                            {SPACING_OPTIONS.map((s) => (
                                <button key={s} type="button" onClick={() => setTheme((p) => ({ ...p, spacing: s }))}
                                    className={`rounded px-2 py-1 text-[10px] transition-colors capitalize ${theme.spacing === s ? 'bg-sky-500 text-white' : 'bg-zinc-700 text-zinc-400 hover:bg-zinc-600'}`}>{s}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Preview swatch */}
            <div className="rounded border border-zinc-700 p-3 flex gap-2 flex-wrap">
                {Object.values(theme.colors).map((c, i) => (
                    <div key={i} className="h-6 w-6 rounded" style={{ background: c }} title={c} />
                ))}
                <span className="ml-auto text-[10px] text-zinc-600 self-center" style={{ fontFamily: theme.typography.headingFont }}>{theme.typography.headingFont} / {theme.typography.bodyFont}</span>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-1">
                <button type="button" onClick={onCancel}
                    className="flex items-center gap-1.5 rounded border border-zinc-600 px-3 py-1.5 text-xs text-zinc-400 hover:border-zinc-500 hover:text-zinc-200 transition-colors">
                    <X className="h-3.5 w-3.5" /> Annuler
                </button>
                <button type="button" disabled={isSaving || !theme.name || !theme.id}
                    onClick={() => onSave(theme)}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded bg-sky-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-sky-400 disabled:opacity-50 transition-colors">
                    {isSaving ? <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <Save className="h-3.5 w-3.5" />}
                    {isSaving ? 'Sauvegarde…' : 'Sauvegarder'}
                </button>
            </div>
        </div>
    );
}

/* ────────────────────────────────────── Page ── */

export default function AdminThemesPage() {
    const [customThemes, setCustomThemes] = useState<PortfolioTheme[]>([]);
    const [editing, setEditing] = useState<PortfolioTheme | null>(null);
    const [creating, setCreating] = useState(false);
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        getCustomThemesAction().then((d) => setCustomThemes(d as PortfolioTheme[]));
    }, []);

    const builtinThemes = Object.values(THEME_PRESETS);

    const handleSave = (theme: PortfolioTheme) => {
        startTransition(async () => {
            await upsertCustomThemeAction(theme as unknown as Record<string, unknown>);
            const updated = await getCustomThemesAction();
            setCustomThemes(updated as PortfolioTheme[]);
            setEditing(null);
            setCreating(false);
        });
    };

    const handleDelete = (id: string) => {
        if (!confirm('Supprimer ce thème personnalisé ?')) return;
        startTransition(async () => {
            await deleteCustomThemeAction(id);
            const updated = await getCustomThemesAction();
            setCustomThemes(updated as PortfolioTheme[]);
        });
    };

    const startDuplicate = (from: PortfolioTheme) => {
        setCreating(false);
        setEditing({ ...from, id: generateId(), name: `${from.name} (copie)` });
    };

    return (
        <div className="mx-auto max-w-5xl space-y-6 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-lg font-bold text-white">Templates de thèmes</h1>
                    <p className="text-xs text-zinc-500">Gérez les thèmes de base disponibles lors de la création d&apos;un portfolio. Supprimer un thème n&apos;affecte pas les portfolios existants.</p>
                </div>
                <button
                    onClick={() => { setEditing(null); setCreating(true); }}
                    className="flex items-center gap-1.5 rounded bg-sky-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-sky-400 transition-colors"
                >
                    <Plus className="h-3.5 w-3.5" /> Nouveau thème
                </button>
            </div>

            {/* Create form */}
            {creating && (
                <div className="rounded-lg border border-sky-500/30 bg-zinc-900 p-4">
                    <h2 className="mb-4 text-sm font-semibold text-sky-400">Créer un nouveau thème</h2>
                    <ThemeEditor
                        initial={{ id: generateId(), name: '', ...BLANK_THEME }}
                        onSave={handleSave}
                        onCancel={() => setCreating(false)}
                        isSaving={isPending}
                    />
                </div>
            )}

            {/* Custom themes */}
            {customThemes.length > 0 && (
                <section>
                    <h2 className="mb-3 text-[10px] font-semibold uppercase tracking-wide text-sky-400">Templates personnalisés ({customThemes.length})</h2>
                    <div className="grid gap-3 md:grid-cols-2">
                        {customThemes.map((t) => (
                            <div key={t.id}>
                                {editing?.id === t.id ? (
                                    <div className="rounded-lg border border-sky-500/40 bg-zinc-900 p-4">
                                        <h3 className="mb-3 text-xs font-semibold text-zinc-300">Éditer — {t.name}</h3>
                                        <ThemeEditor initial={editing} onSave={handleSave} onCancel={() => setEditing(null)} isSaving={isPending} />
                                    </div>
                                ) : (
                                    <ThemeCard theme={t} onEdit={() => { setCreating(false); setEditing(t); }} onDelete={() => handleDelete(t.id)} onDuplicate={() => startDuplicate(t)} />
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Built-in themes (read-only, can duplicate) */}
            <section>
                <h2 className="mb-3 text-[10px] font-semibold uppercase tracking-wide text-zinc-500">Thèmes intégrés (lecture seule — dupliquer pour modifier)</h2>
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                    {builtinThemes.map((t) => (
                        <ThemeCard key={t.id} theme={t} onDuplicate={() => startDuplicate(t)} readOnly />
                    ))}
                </div>
            </section>
        </div>
    );
}

/* ── ThemeCard ── */
function ThemeCard({
    theme,
    onEdit,
    onDelete,
    onDuplicate,
    readOnly = false,
}: {
    theme: PortfolioTheme;
    onEdit?: () => void;
    onDelete?: () => void;
    onDuplicate?: () => void;
    readOnly?: boolean;
}) {
    return (
        <div className="rounded-lg border border-zinc-700 bg-zinc-900 p-3 flex gap-3">
            {/* Color swatches */}
            <div className="grid grid-cols-4 gap-0.5 h-fit">
                {Object.values(theme.colors).map((c, i) => (
                    <div key={i} className="h-4 w-4 rounded-sm" style={{ background: c }} />
                ))}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-1">
                    <div>
                        <p className="text-xs font-semibold text-zinc-200">{theme.name}</p>
                        <p className="font-mono text-[9px] text-zinc-600">{theme.id}</p>
                    </div>
                    <div className="flex gap-1 shrink-0">
                        {onDuplicate && (
                            <button onClick={onDuplicate} title="Dupliquer"
                                className="rounded p-1 hover:bg-zinc-700 text-zinc-500 hover:text-zinc-300 transition-colors">
                                <Copy className="h-3.5 w-3.5" />
                            </button>
                        )}
                        {!readOnly && onEdit && (
                            <button onClick={onEdit} title="Éditer"
                                className="rounded p-1 hover:bg-zinc-700 text-zinc-500 hover:text-zinc-300 transition-colors">
                                <Pencil className="h-3.5 w-3.5" />
                            </button>
                        )}
                        {!readOnly && onDelete && (
                            <button onClick={onDelete} title="Supprimer"
                                className="rounded p-1 hover:bg-red-900/40 text-zinc-600 hover:text-red-400 transition-colors">
                                <Trash2 className="h-3.5 w-3.5" />
                            </button>
                        )}
                    </div>
                </div>
                <div className="mt-1 flex flex-wrap gap-1">
                    <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[9px] text-zinc-500">{theme.colorMode}</span>
                    <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[9px] text-zinc-500">{theme.typography.headingFont}</span>
                    <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[9px] text-zinc-500">{theme.borderRadius} radius</span>
                    <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[9px] text-zinc-500">{theme.baseFontSize ?? 'base'}</span>
                </div>
            </div>
        </div>
    );
}
