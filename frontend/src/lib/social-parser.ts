/**
 * parseProfileUrl — extrait des handles/URLs de réseaux sociaux depuis une URL collée.
 * Pure function, zéro dépendance externe. US-1510
 */

export interface ParsedSocial {
  platform:
    | "tiktok"
    | "instagram"
    | "youtube"
    | "linkedin"
    | "twitter"
    | "pinterest";
  handle: string; // @ pour tiktok/instagram, URL complète pour youtube/linkedin
  url: string;
}

export interface ParseResult {
  parsed: ParsedSocial | null;
  message: string;
}

const PATTERNS: Array<{
  platform: ParsedSocial["platform"];
  re: RegExp;
  toUrl: (m: RegExpMatchArray) => string;
  toHandle: (m: RegExpMatchArray) => string;
}> = [
  {
    platform: "tiktok",
    re: /tiktok\.com\/@?([\w.]+)/i,
    toUrl: (m) => `https://www.tiktok.com/@${m[1]}`,
    toHandle: (m) => `@${m[1]}`,
  },
  {
    platform: "instagram",
    re: /instagram\.com\/([\w.]+)\/?/i,
    toUrl: (m) => `https://www.instagram.com/${m[1]}`,
    toHandle: (m) => `@${m[1]}`,
  },
  {
    platform: "youtube",
    re: /youtube\.com\/@?([\w-]+)|youtu\.be\/([\w-]+)/i,
    toUrl: (m) => `https://www.youtube.com/@${m[1] ?? m[2]}`,
    toHandle: (m) => `@${m[1] ?? m[2]}`,
  },
  {
    platform: "linkedin",
    re: /linkedin\.com\/in\/([\w-]+)/i,
    toUrl: (m) => `https://www.linkedin.com/in/${m[1]}`,
    toHandle: (m) => m[1],
  },
  {
    platform: "twitter",
    re: /(?:twitter|x)\.com\/([\w]+)/i,
    toUrl: (m) => `https://x.com/${m[1]}`,
    toHandle: (m) => `@${m[1]}`,
  },
  {
    platform: "pinterest",
    re: /pinterest\.[a-z]+\/([\w]+)/i,
    toUrl: (m) => `https://www.pinterest.com/${m[1]}`,
    toHandle: (m) => m[1],
  },
];

export function parseProfileUrl(url: string): ParseResult {
  const trimmed = url.trim();
  if (!trimmed) return { parsed: null, message: "" };

  for (const p of PATTERNS) {
    const m = trimmed.match(p.re);
    if (m) {
      const parsed: ParsedSocial = {
        platform: p.platform,
        handle: p.toHandle(m),
        url: p.toUrl(m),
      };
      return {
        parsed,
        message: `${p.platform.charAt(0).toUpperCase() + p.platform.slice(1)} détecté → ${parsed.handle}`,
      };
    }
  }

  return {
    parsed: null,
    message: "Format non reconnu — saisis tes réseaux manuellement",
  };
}
