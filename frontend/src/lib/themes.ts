import type { PortfolioTheme, ThemeColors } from "@/types/theme";

/**
 * Color variants per theme (dark + light).
 * Stored separately so users can freely customize colors while still being
 * able to switch between modes at any time.
 */
export const COLOR_VARIANTS: Record<
  string,
  { dark: ThemeColors; light: ThemeColors }
> = {
  minimal: {
    dark: {
      background: "#111827",
      surface: "#1f2937",
      text: "#f9fafb",
      textMuted: "#9ca3af",
      primary: "#e5e7eb",
      secondary: "#6b7280",
      border: "#374151",
      heading: "#ffffff",
    },
    light: {
      background: "#ffffff",
      surface: "#f9fafb",
      text: "#111827",
      textMuted: "#6b7280",
      primary: "#111827",
      secondary: "#6b7280",
      border: "#e5e7eb",
      heading: "#111827",
    },
  },
  bold: {
    dark: {
      background: "#09090b",
      surface: "#18181b",
      text: "#fafafa",
      textMuted: "#a1a1aa",
      primary: "#facc15",
      secondary: "#f97316",
      border: "#27272a",
      heading: "#ffffff",
    },
    light: {
      background: "#fafafa",
      surface: "#f4f4f5",
      text: "#09090b",
      textMuted: "#52525b",
      primary: "#ca8a04",
      secondary: "#ea580c",
      border: "#d4d4d8",
      heading: "#09090b",
    },
  },
  pastel: {
    dark: {
      background: "#2e0e45",
      surface: "#3b1460",
      text: "#fae8ff",
      textMuted: "#e879f9",
      primary: "#e879f9",
      secondary: "#f0abfc",
      border: "#6b21a8",
      heading: "#fae8ff",
    },
    light: {
      background: "#fdf4ff",
      surface: "#fae8ff",
      text: "#3b0764",
      textMuted: "#86198f",
      primary: "#c026d3",
      secondary: "#f0abfc",
      border: "#e879f9",
      heading: "#3b0764",
    },
  },
  neon: {
    dark: {
      background: "#030712",
      surface: "#0f172a",
      text: "#f0f9ff",
      textMuted: "#94a3b8",
      primary: "#22d3ee",
      secondary: "#f472b6",
      border: "#1e293b",
      heading: "#e0f2fe",
    },
    light: {
      background: "#f0f9ff",
      surface: "#e0f2fe",
      text: "#0c4a6e",
      textMuted: "#0369a1",
      primary: "#0891b2",
      secondary: "#db2777",
      border: "#bae6fd",
      heading: "#0c4a6e",
    },
  },
  corporate: {
    dark: {
      background: "#0f172a",
      surface: "#1e293b",
      text: "#f1f5f9",
      textMuted: "#94a3b8",
      primary: "#60a5fa",
      secondary: "#3b82f6",
      border: "#334155",
      heading: "#f8fafc",
    },
    light: {
      background: "#ffffff",
      surface: "#f1f5f9",
      text: "#0f172a",
      textMuted: "#475569",
      primary: "#1d4ed8",
      secondary: "#3b82f6",
      border: "#cbd5e1",
      heading: "#0f172a",
    },
  },
  retro: {
    dark: {
      background: "#1c0a00",
      surface: "#2d1500",
      text: "#fef3c7",
      textMuted: "#d97706",
      primary: "#f97316",
      secondary: "#d97706",
      border: "#92400e",
      heading: "#fef3c7",
    },
    light: {
      background: "#fdf6e3",
      surface: "#fef3c7",
      text: "#44220e",
      textMuted: "#92400e",
      primary: "#ea580c",
      secondary: "#d97706",
      border: "#fcd34d",
      heading: "#44220e",
    },
  },
  gaming: {
    dark: {
      background: "#0f0f1a",
      surface: "#1a1a2e",
      text: "#e2e8f0",
      textMuted: "#94a3b8",
      primary: "#a855f7",
      secondary: "#7c3aed",
      border: "#2d1b69",
      heading: "#f1f5f9",
    },
    light: {
      background: "#f5f3ff",
      surface: "#ede9fe",
      text: "#1e1b4b",
      textMuted: "#6d28d9",
      primary: "#7c3aed",
      secondary: "#a855f7",
      border: "#c4b5fd",
      heading: "#1e1b4b",
    },
  },
  vital: {
    dark: {
      background: "#052e1a",
      surface: "#0a3d25",
      text: "#f0fdf4",
      textMuted: "#86efac",
      primary: "#22c55e",
      secondary: "#16a34a",
      border: "#166534",
      heading: "#dcfce7",
    },
    light: {
      background: "#f0fdf4",
      surface: "#dcfce7",
      text: "#14532d",
      textMuted: "#15803d",
      primary: "#16a34a",
      secondary: "#22c55e",
      border: "#86efac",
      heading: "#14532d",
    },
  },
};

/**
 * 8 thèmes prédéfinis pour les portfolios Creafolio.
 * EPIC-16 — US-1601, US-1607
 */

// ── Profils Visuels UGC (surcouche nommée sur les thèmes) ──

export interface UgcProfile {
  id: string;
  label: string;
  description: string;
  targetNiches: string[];
  premium: boolean;
  themeId: string;
  previewColors: { bg: string; accent: string; text: string };
}

export const UGC_PROFILES: UgcProfile[] = [
  {
    id: "digital",
    label: "Digital Creator",
    description:
      "Dark & moderne. Parfait pour les créateurs tech, gaming et digital.",
    targetNiches: ["Tech", "Gaming", "Digital"],
    premium: false,
    themeId: "neon",
    previewColors: { bg: "#030712", accent: "#22d3ee", text: "#f0f9ff" },
  },
  {
    id: "clean",
    label: "Clean Pro",
    description: "Épuré et professionnel. Pour une approche corporate et B2B.",
    targetNiches: ["Corporate", "B2B"],
    premium: false,
    themeId: "minimal",
    previewColors: { bg: "#ffffff", accent: "#111827", text: "#111827" },
  },
  {
    id: "beauty",
    label: "Beauty & Mode",
    description:
      "Violet doux et élégant. Idéal pour beauté, cosmétique, skincare.",
    targetNiches: ["Beauté", "Mode", "Cosmétique"],
    premium: true,
    themeId: "pastel",
    previewColors: { bg: "#fdf4ff", accent: "#c026d3", text: "#3b0764" },
  },
  {
    id: "golden",
    label: "Golden Lifestyle",
    description:
      "Teintes chaudes et rétro. Pour lifestyle, food, voyage et bien-être.",
    targetNiches: ["Lifestyle", "Food", "Voyage"],
    premium: true,
    themeId: "retro",
    previewColors: { bg: "#fdf6e3", accent: "#ea580c", text: "#44220e" },
  },
  {
    id: "hype",
    label: "Hype & Street",
    description:
      "Noir intense, accent jaune. Maximum d'impact pour streetwear et sport.",
    targetNiches: ["Sport", "Streetwear", "Gaming"],
    premium: true,
    themeId: "bold",
    previewColors: { bg: "#09090b", accent: "#facc15", text: "#fafafa" },
  },
  {
    id: "gaming",
    label: "Dark Impact",
    description:
      "Violet intense sur fond très sombre. Gaming, esport, streaming.",
    targetNiches: ["Gaming", "Esport", "Streaming"],
    premium: true,
    themeId: "gaming",
    previewColors: { bg: "#0f0f1a", accent: "#a855f7", text: "#e2e8f0" },
  },
  {
    id: "vital",
    label: "Vital",
    description:
      "Vert énergie sur fond nuit profonde. Fitness, sport, bien-être.",
    targetNiches: ["Sport", "Fitness", "Bien-être"],
    premium: true,
    themeId: "vital",
    previewColors: { bg: "#052e1a", accent: "#22c55e", text: "#f0fdf4" },
  },
];

/** Retourne le profil UGC le plus pertinent pour un tableau de niches */
export function getProfileByNiches(niches: string[]): UgcProfile {
  // Chercher un match exact en targetNiches
  for (const niche of niches) {
    const match = UGC_PROFILES.find((p) =>
      p.targetNiches.some((n) => n.toLowerCase() === niche.toLowerCase()),
    );
    if (match) return match;
  }
  // Default : Digital Creator (free)
  return UGC_PROFILES[0];
}

export const THEME_PRESETS: Record<string, PortfolioTheme> = {
  /** Minimal — blanc épuré, Inter, sans fioritures */
  minimal: {
    id: "minimal",
    name: "Minimal",
    colorMode: "light",
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
    baseFontSize: "base",
  },

  /** Bold — fond sombre, jaune électrique, impact maximal */
  bold: {
    id: "bold",
    name: "Bold",
    colorMode: "dark",
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
    baseFontSize: "base",
  },

  /** Pastel — tons doux, serif élégant, ambiance lifestyle */
  pastel: {
    id: "pastel",
    name: "Pastel",
    colorMode: "light",
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
    baseFontSize: "base",
  },

  /** Neon — dark + cyan+pink, ambiance créateur digital */
  neon: {
    id: "neon",
    name: "Neon",
    colorMode: "dark",
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
    baseFontSize: "base",
  },

  /** Corporate — pro, navy, bleu institutionnel, pour B2B */
  corporate: {
    id: "corporate",
    name: "Corporate",
    colorMode: "light",
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
    baseFontSize: "base",
  },

  /** Retro — crème, orange, serif, ambiance vintage */
  retro: {
    id: "retro",
    name: "Rétro",
    colorMode: "light",
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
    baseFontSize: "base",
  },

  /** Gaming — violet intense sur fond très sombre */
  gaming: {
    id: "gaming",
    name: "Gaming",
    colorMode: "dark",
    colors: {
      background: "#0f0f1a",
      surface: "#1a1a2e",
      text: "#e2e8f0",
      textMuted: "#94a3b8",
      primary: "#a855f7",
      secondary: "#7c3aed",
      border: "#2d1b69",
      heading: "#f1f5f9",
    },
    typography: {
      headingFont: "Space Grotesk",
      bodyFont: "Space Grotesk",
      headingWeight: 900,
      headingTracking: "-0.03em",
      headingTransform: "none",
    },
    borderRadius: "md",
    spacing: "normal",
    baseFontSize: "base",
  },

  /** Vital — vert énergie sur fond nuit profonde */
  vital: {
    id: "vital",
    name: "Vital",
    colorMode: "dark",
    colors: {
      background: "#052e1a",
      surface: "#0a3d25",
      text: "#f0fdf4",
      textMuted: "#86efac",
      primary: "#22c55e",
      secondary: "#16a34a",
      border: "#166534",
      heading: "#dcfce7",
    },
    typography: {
      headingFont: "Syne",
      bodyFont: "DM Sans",
      headingWeight: 800,
      headingTracking: "-0.02em",
      headingTransform: "none",
    },
    borderRadius: "sm",
    spacing: "normal",
    baseFontSize: "base",
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
