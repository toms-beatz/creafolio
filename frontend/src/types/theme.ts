/**
 * PortfolioTheme — système de thèmes pour les portfolios Creafolio.
 * Stocké en colonne `theme` JSONB sur la table portfolios.
 * EPIC 15 — US-1501
 */

export interface ThemeColors {
  background: string; // couleur de fond de page
  surface: string; // cartes, sections
  text: string; // texte principal
  textMuted: string; // texte secondaire
  primary: string; // accent principal (CTA, liens)
  secondary: string; // accent secondaire
  border: string; // bordures
  heading: string; // couleur des titres (souvent = text)
}

export interface ThemeTypography {
  headingFont: string; // ex: 'Playfair Display', 'Inter'
  bodyFont: string;
  headingWeight: number; // 400 | 600 | 700 | 800 | 900
  headingTracking: string; // 'normal' | 'tight' | 'wider'
  headingTransform: "none" | "uppercase" | "capitalize";
}

export type BorderRadiusScale = "none" | "sm" | "md" | "lg" | "xl" | "full";
export type SpacingScale = "compact" | "normal" | "spacious";
export type FontSizeScale = "sm" | "base" | "lg" | "xl";

export interface PortfolioTheme {
  id: string;
  name: string;
  colors: ThemeColors;
  /** Couleurs sauvegardées pour le mode sombre (utilisées par le toggle visiteur) */
  darkColors?: ThemeColors;
  /** Couleurs sauvegardées pour le mode clair (utilisées par le toggle visiteur) */
  lightColors?: ThemeColors;
  typography: ThemeTypography;
  borderRadius: BorderRadiusScale;
  spacing: SpacingScale;
  /** Taille de base du texte corps — default 'base' (16px) */
  baseFontSize?: FontSizeScale;
  colorMode: "dark" | "light";
}

export const FONT_SIZE_VALUES: Record<FontSizeScale, string> = {
  sm: "14px",
  base: "16px",
  lg: "18px",
  xl: "20px",
};

const RADIUS_MAP: Record<BorderRadiusScale, string> = {
  none: "0px",
  sm: "4px",
  md: "8px",
  lg: "12px",
  xl: "16px",
  full: "9999px",
};

const SPACING_MAP: Record<SpacingScale, string> = {
  compact: "1.5rem",
  normal: "2.5rem",
  spacious: "4rem",
};

/** Génère les CSS vars d'un jeu de couleurs (utilisé par themeToModeStyleTag) */
function colorsToCssVars(colors: ThemeColors): Record<string, string> {
  return {
    "--theme-bg": colors.background,
    "--theme-surface": colors.surface,
    "--theme-text": colors.text,
    "--theme-text-muted": colors.textMuted,
    "--theme-primary": colors.primary,
    "--theme-secondary": colors.secondary,
    "--theme-border": colors.border,
    "--theme-heading": colors.heading,
  };
}

/**
 * Génère un bloc CSS complet avec les deux modes pour injection dans la page publique.
 * Le mode par défaut est sombre (:root), le mode clair via [data-bp-mode="light"].
 */
export function themeToModeStyleTag(theme: PortfolioTheme): string {
  const typo = theme.typography ?? {
    headingFont: "Inter",
    bodyFont: "Inter",
    headingWeight: 700,
    headingTracking: "normal",
    headingTransform: "none",
  };
  const fontSize = FONT_SIZE_VALUES[theme.baseFontSize ?? "base"];

  const shared = [
    `--theme-font-heading: '${typo.headingFont}', system-ui, sans-serif`,
    `--theme-font-body: '${typo.bodyFont}', system-ui, sans-serif`,
    `--theme-heading-weight: ${typo.headingWeight}`,
    `--theme-heading-tracking: ${typo.headingTracking}`,
    `--theme-heading-transform: ${typo.headingTransform}`,
    `--theme-radius: ${RADIUS_MAP[theme.borderRadius] ?? "8px"}`,
    `--theme-section-spacing: ${SPACING_MAP[theme.spacing] ?? "2.5rem"}`,
    `--theme-font-size-base: ${fontSize}`,
  ].join(";");

  const darkColors = theme.darkColors ?? theme.colors;
  const lightColors = theme.lightColors ?? theme.colors;

  const darkVars = Object.entries(colorsToCssVars(darkColors))
    .map(([k, v]) => `${k}:${v}`)
    .join(";");
  const lightVars = Object.entries(colorsToCssVars(lightColors))
    .map(([k, v]) => `${k}:${v}`)
    .join(";");

  return `:root{${darkVars};${shared}}\n:root[data-bp-mode="light"]{${lightVars}}`;
}

/** CSS vars injectées dans le canvas du builder et le rendu preview */
export function themeToCssVars(theme: PortfolioTheme): Record<string, string> {
  const typo = theme.typography ?? {
    headingFont: "Inter",
    bodyFont: "Inter",
    headingWeight: 700,
    headingTracking: "normal",
    headingTransform: "none",
  };
  const colors = theme.colors ?? ({} as ThemeColors);
  const fontSize = FONT_SIZE_VALUES[theme.baseFontSize ?? "base"];

  return {
    "--theme-bg": colors.background ?? "#030712",
    "--theme-surface": colors.surface ?? "#18181b",
    "--theme-text": colors.text ?? "#f4f4f5",
    "--theme-text-muted": colors.textMuted ?? "#a1a1aa",
    "--theme-primary": colors.primary ?? "#22d3ee",
    "--theme-secondary": colors.secondary ?? "#818cf8",
    "--theme-border": colors.border ?? "#27272a",
    "--theme-heading": colors.heading ?? "#f4f4f5",
    "--theme-font-heading": `'${typo.headingFont}', system-ui, sans-serif`,
    "--theme-font-body": `'${typo.bodyFont}', system-ui, sans-serif`,
    "--theme-heading-weight": String(typo.headingWeight),
    "--theme-heading-tracking": typo.headingTracking,
    "--theme-heading-transform": typo.headingTransform,
    "--theme-radius": RADIUS_MAP[theme.borderRadius] ?? "8px",
    "--theme-section-spacing": SPACING_MAP[theme.spacing] ?? "2.5rem",
    "--theme-font-size-base": fontSize,
  };
}
