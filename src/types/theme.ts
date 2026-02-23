/**
 * PortfolioTheme — système de thèmes pour les portfolios Blooprint.
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

export interface PortfolioTheme {
  id: string;
  name: string;
  colors: ThemeColors;
  typography: ThemeTypography;
  borderRadius: BorderRadiusScale;
  spacing: SpacingScale;
}

/** CSS vars injectées dans le canvas et le rendu public */
export function themeToCssVars(theme: PortfolioTheme): Record<string, string> {
  const radiusMap: Record<BorderRadiusScale, string> = {
    none: "0px",
    sm: "4px",
    md: "8px",
    lg: "12px",
    xl: "16px",
    full: "9999px",
  };

  const spacingMap: Record<SpacingScale, string> = {
    compact: "1.5rem",
    normal: "2.5rem",
    spacious: "4rem",
  };

  return {
    "--theme-bg": theme.colors.background,
    "--theme-surface": theme.colors.surface,
    "--theme-text": theme.colors.text,
    "--theme-text-muted": theme.colors.textMuted,
    "--theme-primary": theme.colors.primary,
    "--theme-secondary": theme.colors.secondary,
    "--theme-border": theme.colors.border,
    "--theme-heading": theme.colors.heading,
    "--theme-font-heading": `'${theme.typography.headingFont}', system-ui, sans-serif`,
    "--theme-font-body": `'${theme.typography.bodyFont}', system-ui, sans-serif`,
    "--theme-heading-weight": String(theme.typography.headingWeight),
    "--theme-heading-tracking": theme.typography.headingTracking,
    "--theme-heading-transform": theme.typography.headingTransform,
    "--theme-radius": radiusMap[theme.borderRadius],
    "--theme-section-spacing": spacingMap[theme.spacing],
  };
}
