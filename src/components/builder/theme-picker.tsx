'use client';

import { useState } from 'react';
import { Check, ChevronDown, ChevronUp, Palette } from 'lucide-react';
import { THEME_LIST, THEME_PRESETS, getGoogleFontsUrl } from '@/lib/themes';
import { useTheme } from './theme-context';
import type { PortfolioTheme } from '@/types/theme';

const COLOR_KEYS: { key: keyof PortfolioTheme['colors']; label: string }[] = [
    { key: 'background', label: 'Fond' },
    { key: 'surface', label: 'Surface' },
    { key: 'primary', label: 'Accent principal' },
    { key: 'secondary', label: 'Accent secondaire' },
    { key: 'text', label: 'Texte' },
    { key: 'textMuted', label: 'Texte atténué' },
    { key: 'border', label: 'Bordure' },
];

const RADIUS_OPTIONS: { value: PortfolioTheme['borderRadius']; label: string }[] = [
    { value: 'none', label: 'Aucun' },
    { value: 'sm', label: 'Petit' },
    { value: 'md', label: 'Moyen' },
    { value: 'lg', label: 'Grand' },
    { value: 'full', label: 'Complet' },
];

const SPACING_OPTIONS: { value: PortfolioTheme['spacing']; label: string }[] = [
    { value: 'compact', label: 'Compact' },
    { value: 'normal', label: 'Normal' },
    { value: 'spacious', label: 'Aéré' },
];

/** Swatches rapides d'un thème */
function ThemeSwatches({ theme }: { theme: PortfolioTheme }) {
    return (
        <div className="flex gap-1">
            {[theme.colors.background, theme.colors.primary, theme.colors.text].map((c, i) => (
                <span
                    key={i}
                    className="h-4 w-4 rounded-full border border-zinc-600"
                    style={{ background: c }}
                />
            ))}
        </div>
    );
}

export function ThemePicker() {
    const { theme, setTheme, updateColor, updateTypography, updateBorderRadius, updateSpacing, isSaving, saveTheme } =
        useTheme();
    const [advanced, setAdvanced] = useState(false);

    const applyPreset = (name: string) => {
        const preset = THEME_PRESETS[name as keyof typeof THEME_PRESETS];
        if (!preset) return;
        // inject Google Fonts link
        const fontsUrl = getGoogleFontsUrl(preset);
        if (fontsUrl) {
            const existing = document.querySelector(`link[data-theme-fonts]`);
            if (existing) existing.remove();
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = fontsUrl;
            link.dataset.themeFonts = '1';
            document.head.appendChild(link);
        }
        setTheme(preset);
    };

    return (
        <div className="flex flex-col gap-3">
            {/* Grille de presets */}
            <div className="grid grid-cols-2 gap-2">
                {THEME_LIST.map((t) => {
                    const isActive = theme.name === t.name;
                    return (
                        <button
                            key={t.name}
                            onClick={() => applyPreset(t.name)}
                            className={`flex flex-col gap-1.5 rounded-lg border p-2.5 text-left transition-colors ${isActive
                                ? 'border-sky-400 bg-sky-400/10'
                                : 'border-zinc-700 bg-zinc-800/50 hover:border-zinc-500'
                                }`}
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-medium text-zinc-200 capitalize">{t.name}</span>
                                {isActive && <Check className="h-3 w-3 text-sky-400" />}
                            </div>
                            <ThemeSwatches theme={t} />
                            <span className="text-[10px] text-zinc-500 truncate">{t.typography.headingFont}</span>
                        </button>
                    );
                })}
            </div>

            {/* Avancé */}
            <button
                onClick={() => setAdvanced((v) => !v)}
                className="flex items-center justify-between rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 py-2 text-xs text-zinc-300 hover:border-zinc-500 transition-colors"
            >
                <span className="flex items-center gap-1.5">
                    <Palette className="h-3.5 w-3.5" />
                    Personnaliser
                </span>
                {advanced ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>

            {advanced && (
                <div className="flex flex-col gap-4 rounded-lg border border-zinc-700 bg-zinc-800/50 p-3">
                    {/* Couleurs */}
                    <div>
                        <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-zinc-500">Couleurs</p>
                        <div className="flex flex-col gap-1.5">
                            {COLOR_KEYS.map(({ key, label }) => (
                                <div key={key} className="flex items-center gap-2">
                                    <span className="w-24 shrink-0 text-[10px] text-zinc-400">{label}</span>
                                    <div className="flex flex-1 items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-900 p-1 focus-within:border-sky-400/50 transition-colors">
                                        <input
                                            type="color"
                                            value={theme.colors[key]}
                                            onChange={(e) => updateColor(key, e.target.value)}
                                            className="h-6 w-6 shrink-0 cursor-pointer rounded border-0 bg-transparent p-0"
                                        />
                                        <input
                                            type="text"
                                            value={theme.colors[key]}
                                            onChange={(e) => updateColor(key, e.target.value)}
                                            className="flex-1 bg-transparent text-[10px] font-mono text-zinc-300 outline-none min-w-0"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Typographie */}
                    <div>
                        <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-zinc-500">Typographie</p>
                        <div className="flex flex-col gap-2">
                            <div>
                                <label className="text-xs text-zinc-400">Police titres</label>
                                <input
                                    type="text"
                                    value={theme.typography.headingFont}
                                    onChange={(e) => updateTypography('headingFont', e.target.value)}
                                    className="mt-1 w-full rounded border border-zinc-600 bg-zinc-900 px-2 py-1 text-xs text-zinc-200 outline-none focus:border-sky-400"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-zinc-400">Police corps</label>
                                <input
                                    type="text"
                                    value={theme.typography.bodyFont}
                                    onChange={(e) => updateTypography('bodyFont', e.target.value)}
                                    className="mt-1 w-full rounded border border-zinc-600 bg-zinc-900 px-2 py-1 text-xs text-zinc-200 outline-none focus:border-sky-400"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-zinc-400">Graisse titre</label>
                                <input
                                    type="text"
                                    value={theme.typography.headingWeight}
                                    onChange={(e) => updateTypography('headingWeight', e.target.value)}
                                    className="mt-1 w-full rounded border border-zinc-600 bg-zinc-900 px-2 py-1 text-xs text-zinc-200 outline-none focus:border-sky-400"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Radius */}
                    <div>
                        <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-zinc-500">Arrondis</p>
                        <div className="flex flex-wrap gap-1.5">
                            {RADIUS_OPTIONS.map(({ value, label }) => (
                                <button
                                    key={value}
                                    onClick={() => updateBorderRadius(value)}
                                    className={`rounded px-2 py-1 text-[10px] transition-colors ${theme.borderRadius === value
                                        ? 'bg-sky-400 text-zinc-900'
                                        : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
                                        }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Espacement */}
                    <div>
                        <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-zinc-500">Espacement</p>
                        <div className="flex flex-wrap gap-1.5">
                            {SPACING_OPTIONS.map(({ value, label }) => (
                                <button
                                    key={value}
                                    onClick={() => updateSpacing(value)}
                                    className={`rounded px-2 py-1 text-[10px] transition-colors ${theme.spacing === value
                                        ? 'bg-sky-400 text-zinc-900'
                                        : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
                                        }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Sauvegarder */}
                    <button
                        onClick={() => void saveTheme()}
                        disabled={isSaving}
                        className="flex items-center justify-center gap-1.5 rounded-lg bg-sky-400 py-2 text-xs font-medium text-zinc-900 hover:bg-sky-300 disabled:opacity-50 transition-colors"
                    >
                        {isSaving ? (
                            <>
                                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-zinc-900 border-t-transparent" />
                                Sauvegarde…
                            </>
                        ) : (
                            'Sauvegarder le thème'
                        )}
                    </button>
                </div>
            )}
        </div>
    );
}
