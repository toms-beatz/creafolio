import type { PortfolioTheme } from "@/types/theme";

/**
 * 6 thèmes prédéfinis pour les portfolios Blooprint.
 * L'user peut en sélectionner un et modifier chaque valeur.
 * EPIC 15 — US-1502
 */

export const THEME_PRESETS: Record<string, PortfolioTheme> = {
  /** Minimal — blanc épuré, Inter, sans fioritures */
  minimal: {
    id: "minimal",
    name: "Minimal",
    colors: {
      background: "#ffffff",
      surface: "#f9fafb",
      text: "#111827",
      textMuted: "#6b7280",
      primary: "#111827",
      secondary: "#6b7280",
      border: "#e5e7eb",
      heading: "#111827",
    },
    typography: {
      headingFont: "Inter",
      bodyFont: "Inter",
      headingWeight: 700,
      headingTracking: "-0.025em",
      headingTransform: "none",
    },
    borderRadius: "sm",
    spacing: "normal",
  },

  /** Bold — fond sombre, jaune électrique, impact maximal */
  bold: {
    id: "bold",
    name: "Bold",
    colors: {
      background: "#09090b",
      surface: "#18181b",
      text: "#fafafa",
      textMuted: "#a1a1aa",
      primary: "#facc15",
      secondary: "#f97316",
      border: "#27272a",
      heading: "#ffffff",
    },
    typography: {
      headingFont: "Syne",
      bodyFont: "DM Sans",
      headingWeight: 900,
      headingTracking: "-0.04em",
      headingTransform: "none",
    },
    borderRadius: "none",
    spacing: "spacious",
  },

  /** Pastel — tons doux, serif élégant, ambiance lifestyle */
  pastel: {
    id: "pastel",
    name: "Pastel",
    colors: {
      background: "#fdf4ff",
      surface: "#fae8ff",
      text: "#3b0764",
      textMuted: "#86198f",
      primary: "#c026d3",
      secondary: "#f0abfc",
      border: "#e879f9",
      heading: "#3b0764",
    },
    typography: {
      headingFont: "Playfair Display",
      bodyFont: "DM Sans",
      headingWeight: 700,
      headingTracking: "normal",
      headingTransform: "none",
    },
    borderRadius: "xl",
    spacing: "spacious",
  },

  /** Neon — dark + cyan+pink, ambiance créateur digital */
  neon: {
    id: "neon",
    name: "Neon",
    colors: {
      background: "#030712",
      surface: "#0f172a",
      text: "#f0f9ff",
      textMuted: "#94a3b8",
      primary: "#22d3ee",
      secondary: "#f472b6",
      border: "#1e293b",
      heading: "#e0f2fe",
    },
    typography: {
      headingFont: "Space Grotesk",
      bodyFont: "Space Grotesk",
      headingWeight: 700,
      headingTracking: "-0.02em",
      headingTransform: "none",
    },
    borderRadius: "md",
    spacing: "normal",
  },

  /** Corporate — pro, navy, bleu institutionnel, pour B2B */
  corporate: {
    id: "corporate",
    name: "Corporate",
    colors: {
      background: "#ffffff",
      surface: "#f1f5f9",
      text: "#0f172a",
      textMuted: "#475569",
      primary: "#1d4ed8",
      secondary: "#3b82f6",
      border: "#cbd5e1",
      heading: "#0f172a",
    },
    typography: {
      headingFont: "Inter",
      bodyFont: "Inter",
      headingWeight: 700,
      headingTracking: "-0.015em",
      headingTransform: "none",
    },
    borderRadius: "sm",
    spacing: "normal",
  },

  /** Retro — crème, orange, serif, ambiance vintage */
  retro: {
    id: "retro",
    name: "Rétro",
    colors: {
      background: "#fdf6e3",
      surface: "#fef3c7",
      text: "#44220e",
      textMuted: "#92400e",
      primary: "#ea580c",
      secondary: "#d97706",
      border: "#fcd34d",
      heading: "#44220e",
    },
    typography: {
      headingFont: "Playfair Display",
      bodyFont: "DM Sans",
      headingWeight: 700,
      headingTracking: "normal",
      headingTransform: "capitalize",
    },
    borderRadius: "sm",
    spacing: "normal",
  },
};

export const DEFAULT_THEME = THEME_PRESETS.neon;

/** Thèmes triés pour le picker */
export const THEME_LIST = Object.values(THEME_PRESETS);

/** Google Fonts URL for a given theme (heading + body) */
export function getGoogleFontsUrl(theme: PortfolioTheme): string {
  const fonts = new Set([
    theme.typography.headingFont,
    theme.typography.bodyFont,
  ]);
  const needed = [...fonts].filter((f) => !["Inter", "system-ui"].includes(f));
  if (needed.length === 0) return "";

  const family = needed
    .map((f) => `family=${f.replace(/ /g, "+")}:wght@400;500;600;700;800;900`)
    .join("&");
  return `https://fonts.googleapis.com/css2?${family}&display=swap`;
}
