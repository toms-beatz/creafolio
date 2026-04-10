'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronUp, Palette, Lock, RotateCcw, Sun, Moon } from 'lucide-react';
import { UGC_PROFILES, THEME_PRESETS, COLOR_VARIANTS, getGoogleFontsUrl } from '@/lib/themes';
import { useTheme } from './theme-context';
import { ProfileCard } from './profile-card';
import type { PortfolioTheme } from '@/types/theme';

interface ThemePickerProps {
  isPremium?: boolean;
}

/* ── Constants ─────────────────────────────────────────────── */

const FONT_OPTIONS = [
  'Inter', 'DM Sans', 'Space Grotesk', 'Syne', 'Playfair Display',
  'Cormorant Garamond', 'Fraunces', 'Source Serif 4',
  'Bebas Neue', 'Raleway', 'Nunito', 'Poppins', 'Montserrat', 'Oswald', 'Lato',
];

const WEIGHT_OPTIONS: { value: number; label: string }[] = [
  { value: 400, label: 'Regular' },
  { value: 500, label: 'Medium' },
  { value: 600, label: 'Semi-Bold' },
  { value: 700, label: 'Bold' },
  { value: 800, label: 'Extra-Bold' },
  { value: 900, label: 'Black' },
];

const TRACKING_OPTIONS: { value: string; label: string }[] = [
  { value: '-0.05em', label: 'Très serré' },
  { value: '-0.025em', label: 'Serré' },
  { value: 'normal', label: 'Normal' },
  { value: '0.025em', label: 'Large' },
  { value: '0.05em', label: 'Très large' },
  { value: '0.1em', label: 'Espacé' },
];

const TRANSFORM_OPTIONS: { value: PortfolioTheme['typography']['headingTransform']; label: string }[] = [
  { value: 'none', label: 'Normal' },
  { value: 'uppercase', label: 'MAJUSCULES' },
  { value: 'capitalize', label: 'Premières' },
];

const RADIUS_OPTIONS: { value: PortfolioTheme['borderRadius']; label: string }[] = [
  { value: 'none', label: 'Aucun' },
  { value: 'sm', label: 'Petit' },
  { value: 'md', label: 'Moyen' },
  { value: 'lg', label: 'Grand' },
  { value: 'xl', label: 'XL' },
  { value: 'full', label: 'Complet' },
];

const SPACING_OPTIONS: { value: PortfolioTheme['spacing']; label: string }[] = [
  { value: 'compact', label: 'Compact' },
  { value: 'normal', label: 'Normal' },
  { value: 'spacious', label: 'Aéré' },
];

const COLOR_ROWS: { key: keyof PortfolioTheme['colors']; label: string }[] = [
  { key: 'background', label: 'Fond de page' },
  { key: 'surface', label: 'Cartes / sections' },
  { key: 'text', label: 'Texte principal' },
  { key: 'textMuted', label: 'Texte secondaire' },
  { key: 'primary', label: 'Accent / CTA' },
  { key: 'secondary', label: 'Accent 2' },
  { key: 'border', label: 'Bordures' },
  { key: 'heading', label: 'Couleur des titres' },
];

/* ── Sub-components ────────────────────────────────────────── */

function SectionHeader({ label, open, onToggle }: { label: string; open: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className="flex w-full items-center justify-between rounded-lg border border-zinc-700 bg-zinc-800/60 px-3 py-2 text-xs text-zinc-300 hover:border-zinc-500 transition-colors"
    >
      <span className="font-medium">{label}</span>
      {open ? <ChevronUp className="h-3.5 w-3.5 text-zinc-500" /> : <ChevronDown className="h-3.5 w-3.5 text-zinc-500" />}
    </button>
  );
}

function ColorRow({
  colorKey, label, value, onChange, disabled,
}: { colorKey: keyof PortfolioTheme['colors']; label: string; value: string; onChange: (k: keyof PortfolioTheme['colors'], v: string) => void; disabled?: boolean }) {
  return (
    <div className={`flex items-center gap-2 ${disabled ? 'pointer-events-none opacity-40' : ''}`}>
      <span className="w-28 shrink-0 text-[10px] text-zinc-400">{label}</span>
      <label className="flex flex-1 items-center gap-1.5 cursor-pointer rounded-lg border border-zinc-700 bg-zinc-900 p-1 focus-within:border-sky-400/50 transition-colors">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(colorKey, e.target.value)}
          className="h-5 w-5 shrink-0 cursor-pointer rounded border-0 bg-transparent p-0"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => { if (/^#[0-9a-fA-F]{0,6}$/.test(e.target.value)) onChange(colorKey, e.target.value); }}
          maxLength={7}
          className="w-16 bg-transparent text-[10px] font-mono text-zinc-300 outline-none"
        />
      </label>
    </div>
  );
}

function FontSelect({ value, onChange, disabled }: { value: string; onChange: (v: string) => void; disabled?: boolean }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className="flex-1 rounded-lg border border-zinc-700 bg-zinc-900 px-2 py-1.5 text-[10px] text-zinc-300 focus:border-sky-400/50 focus:outline-none disabled:opacity-40"
    >
      {FONT_OPTIONS.map((f) => (
        <option key={f} value={f}>{f}</option>
      ))}
    </select>
  );
}

/* ── Main ThemePicker ──────────────────────────────────────── */

export function ThemePicker({ isPremium = false }: ThemePickerProps) {
  const { theme, setTheme, updateColor, updateTypography, updateBorderRadius, updateSpacing, updateColorMode, updateBaseFontSize, isSaving, saveTheme } =
    useTheme();

  const [openSection, setOpenSection] = useState<string | null>(null);
  const [upsellOpen, setUpsellOpen] = useState(false);

  const toggle = (s: string) => setOpenSection((prev) => (prev === s ? null : s));

  const activeProfile = UGC_PROFILES.find((p) => p.themeId === theme.id);

  const applyProfile = (themeId: string) => {
    const preset = THEME_PRESETS[themeId];
    if (!preset) return;
    // Load Google Fonts for the new theme
    const fontsUrl = getGoogleFontsUrl(preset);
    if (fontsUrl) {
      const existing = document.querySelector('link[data-theme-fonts]');
      if (existing) existing.remove();
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = fontsUrl;
      link.dataset.themeFonts = '1';
      document.head.appendChild(link);
    }
    setTheme(preset);
    setUpsellOpen(false);
  };

  const handleProfileClick = (profile: (typeof UGC_PROFILES)[0]) => {
    if (profile.premium && !isPremium) { setUpsellOpen(true); return; }
    applyProfile(profile.themeId);
  };

  const handleFontChange = (key: 'headingFont' | 'bodyFont', value: string) => {
    updateTypography(key, value);
    // Load font dynamically
    const existing = document.querySelector('link[data-theme-fonts]');
    const themeForFonts = {
      ...theme,
      typography: { ...theme.typography, [key]: value },
    };
    const fontsUrl = getGoogleFontsUrl(themeForFonts);
    if (fontsUrl) {
      if (existing) existing.remove();
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = fontsUrl;
      link.dataset.themeFonts = '1';
      document.head.appendChild(link);
    }
  };

  return (
    <div className="flex flex-col gap-2.5">
      {/* ── Profils visuels ── */}
      <div className="grid grid-cols-2 gap-2">
        {UGC_PROFILES.map((p) => (
          <ProfileCard
            key={p.id}
            profile={p}
            isActive={theme.id === p.themeId}
            isPremiumUser={isPremium}
            onClick={() => handleProfileClick(p)}
          />
        ))}
      </div>

      {upsellOpen && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-300">
          <div className="flex items-start gap-2">
            <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400" />
            <div>
              <p className="font-semibold text-amber-200">Profil Premium requis</p>
              <p className="mt-0.5 text-amber-300/80">Ce profil visuel est exclusif aux membres Premium. La personnalisation reste disponible pour tous.</p>
              <Link href="/pricing" className="mt-2 inline-block rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-semibold text-zinc-900 hover:bg-amber-400">Découvrir Premium →</Link>
              <button onClick={() => setUpsellOpen(false)} className="ml-2 text-xs text-amber-400/60 hover:text-amber-300">Fermer</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Divider ── */}
      <div className="flex items-center gap-2">
        <div className="h-px flex-1 bg-zinc-800" />
        <span className="flex items-center gap-1 text-[9px] font-mono uppercase tracking-widest text-zinc-600">
          <Palette className="h-2.5 w-2.5" /> Personnaliser
        </span>
        <div className="h-px flex-1 bg-zinc-800" />
      </div>

      {/* ── Dark / Light toggle ── */}
      {COLOR_VARIANTS[theme.id] && (
        <div className="flex flex-col gap-1.5">
          <p className="text-[10px] text-zinc-500">Vous éditez les couleurs du mode :</p>
          <div className="flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800/60 p-1">
            <button
              onClick={() => updateColorMode('dark')}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 text-[11px] font-medium transition-colors ${theme.colorMode === 'dark' ? 'bg-zinc-700 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              <Moon className="h-3 w-3" /> Sombre
            </button>
            <button
              onClick={() => updateColorMode('light')}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 text-[11px] font-medium transition-colors ${theme.colorMode === 'light' ? 'bg-zinc-100 text-zinc-900' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              <Sun className="h-3 w-3" /> Clair
            </button>
          </div>
          <p className="text-[10px] text-zinc-600">Les visiteurs pourront basculer entre les deux modes depuis leur portfolio.</p>
        </div>
      )}

      {/* ── Couleurs ── */}
      <SectionHeader label="🎨 Couleurs (8)" open={openSection === 'colors'} onToggle={() => toggle('colors')} />
      {openSection === 'colors' && (
        <div className="flex flex-col gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800/50 p-3">
          {COLOR_ROWS.map(({ key, label }) => (
            <ColorRow
              key={key}
              colorKey={key}
              label={label}
              value={theme.colors[key]}
              onChange={updateColor}
            />
          ))}
          {activeProfile && (
            <button
              onClick={() => { const base = THEME_PRESETS[activeProfile.themeId]; if (base) setTheme(base); }}
              className="mt-1 flex items-center gap-1 text-[10px] text-zinc-500 hover:text-sky-300 transition-colors"
            >
              <RotateCcw className="h-3 w-3" /> Réinitialiser les couleurs
            </button>
          )}
        </div>
      )}

      {/* ── Typographie ── */}
      <SectionHeader label="✍️ Typographie" open={openSection === 'typo'} onToggle={() => toggle('typo')} />
      {openSection === 'typo' && (
        <div className="flex flex-col gap-3 rounded-lg border border-zinc-700 bg-zinc-800/50 p-3">
          {/* Heading font */}
          <div>
            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-500">Police des titres</p>
            <div className="flex items-center gap-2">
              <FontSelect value={theme.typography.headingFont} onChange={(v) => handleFontChange('headingFont', v)} />
              <span className="shrink-0 text-[10px] text-zinc-500" style={{ fontFamily: theme.typography.headingFont }}>Aa</span>
            </div>
          </div>

          {/* Body font */}
          <div>
            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-500">Police du corps</p>
            <div className="flex items-center gap-2">
              <FontSelect value={theme.typography.bodyFont} onChange={(v) => handleFontChange('bodyFont', v)} />
              <span className="shrink-0 text-[10px] text-zinc-500" style={{ fontFamily: theme.typography.bodyFont }}>Aa</span>
            </div>
          </div>

          {/* Weight */}
          <div>
            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-500">Graisse des titres</p>
            <div className="flex flex-wrap gap-1">
              {WEIGHT_OPTIONS.map(({ value, label }) => (
                <button key={value} onClick={() => updateTypography('headingWeight', value)}
                  className={`rounded px-2 py-1 text-[10px] transition-colors ${theme.typography.headingWeight === value ? 'bg-sky-400 text-zinc-900' : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Tracking */}
          <div>
            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-500">Espacement des lettres</p>
            <div className="flex flex-wrap gap-1">
              {TRACKING_OPTIONS.map(({ value, label }) => (
                <button key={value} onClick={() => updateTypography('headingTracking', value)}
                  className={`rounded px-2 py-1 text-[10px] transition-colors ${theme.typography.headingTracking === value ? 'bg-sky-400 text-zinc-900' : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Transform */}
          <div>
            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-500">Casse des titres</p>
            <div className="flex flex-wrap gap-1">
              {TRANSFORM_OPTIONS.map(({ value, label }) => (
                <button key={value} onClick={() => updateTypography('headingTransform', value)}
                  className={`rounded px-2 py-1 text-[10px] transition-colors ${theme.typography.headingTransform === value ? 'bg-sky-400 text-zinc-900' : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Live preview */}
          <div className="rounded-lg border border-dashed border-zinc-700 bg-zinc-950 p-3">
            <p className="text-[9px] uppercase tracking-widest text-zinc-600 mb-2">Aperçu typographie</p>
            <p style={{
              fontFamily: `'${theme.typography.headingFont}', system-ui`,
              fontWeight: theme.typography.headingWeight,
              letterSpacing: theme.typography.headingTracking,
              textTransform: theme.typography.headingTransform,
              color: theme.colors.heading,
            }} className="text-lg truncate">
              Mon Portfolio UGC
            </p>
            <p style={{
              fontFamily: `'${theme.typography.bodyFont}', system-ui`,
              color: theme.colors.text,
            }} className="text-xs mt-1">
              Je crée du contenu authentique pour les marques.
            </p>
          </div>
        </div>
      )}

      {/* ── Mise en page ── */}
      <SectionHeader label="📐 Mise en page" open={openSection === 'layout'} onToggle={() => toggle('layout')} />
      {openSection === 'layout' && (
        <div className="flex flex-col gap-3 rounded-lg border border-zinc-700 bg-zinc-800/50 p-3">
          <div>
            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-500">Taille de texte globale</p>
            <div className="flex flex-wrap gap-1.5">
              {([{ value: 'sm', label: 'Petit (14px)' }, { value: 'base', label: 'Normal (16px)' }, { value: 'lg', label: 'Grand (18px)' }, { value: 'xl', label: 'XL (20px)' }] as { value: PortfolioTheme['baseFontSize']; label: string }[]).map(({ value, label }) => (
                <button key={value} onClick={() => updateBaseFontSize(value)}
                  className={`rounded px-2 py-1 text-[10px] transition-colors ${theme.baseFontSize === value ? 'bg-sky-400 text-zinc-900' : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex flex-wrap gap-1.5">
              {RADIUS_OPTIONS.map(({ value, label }) => (
                <button key={value} onClick={() => updateBorderRadius(value)}
                  className={`rounded px-2 py-1 text-[10px] transition-colors ${theme.borderRadius === value ? 'bg-sky-400 text-zinc-900' : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-500">Espacement des sections</p>
            <div className="flex flex-wrap gap-1.5">
              {SPACING_OPTIONS.map(({ value, label }) => (
                <button key={value} onClick={() => updateSpacing(value)}
                  className={`rounded px-2 py-1 text-[10px] transition-colors ${theme.spacing === value ? 'bg-sky-400 text-zinc-900' : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Save ── */}
      <button
        onClick={() => void saveTheme()}
        disabled={isSaving}
        className="flex items-center justify-center gap-1.5 rounded-lg bg-sky-500 py-2 text-xs font-semibold text-white hover:bg-sky-400 disabled:opacity-50 transition-colors"
      >
        {isSaving ? (
          <><span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />Sauvegarde…</>
        ) : 'Sauvegarder le thème'}
      </button>
    </div>
  );
}
