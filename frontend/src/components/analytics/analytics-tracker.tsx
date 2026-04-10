'use client';

import { useEffect } from 'react';
import { getConsentValue } from '@/components/rgpd/cookie-consent';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api';

type LinkType = 'instagram' | 'tiktok' | 'youtube' | 'twitter' | 'linkedin' | 'website' | 'email' | 'phone' | 'other';

function resolveLinkType(href: string): LinkType {
  if (href.startsWith('mailto:')) return 'email';
  if (href.startsWith('tel:')) return 'phone';
  if (href.startsWith('#')) return 'other';
  // Normalise les URLs sans protocole (ex: "instagram.com/xyz")
  const normalized = /^https?:\/\//i.test(href) ? href : `https://${href}`;
  try {
    const { hostname } = new URL(normalized);
    if (/instagram\.com/.test(hostname)) return 'instagram';
    if (/tiktok\.com/.test(hostname)) return 'tiktok';
    if (/youtu\.?be|youtube\.com/.test(hostname)) return 'youtube';
    if (/twitter\.com|x\.com/.test(hostname)) return 'twitter';
    if (/linkedin\.com/.test(hostname)) return 'linkedin';
    if (hostname) return 'website';
  } catch { /* invalid URL */ }
  return 'other';
}

interface AnalyticsTrackerProps {
  portfolioId: string;
}

export function AnalyticsTracker({ portfolioId }: AnalyticsTrackerProps) {
  useEffect(() => {
    const consent = getConsentValue();
    if (consent === 'refused') return;

    // Récupère l'IP publique du visiteur côté client pour le geo-lookup backend
    const track = async () => {
      let clientIp: string | undefined;
      try {
        const res = await fetch('https://api.ipify.org?format=json', { cache: 'no-store' });
        const json = await res.json() as { ip: string };
        clientIp = json.ip;
      } catch { /* optionnel — best-effort */ }

      await fetch(`${API_URL}/analytics/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          portfolio_id: portfolioId,
          referrer: document.referrer || undefined,
          client_ip: clientIp,
        }),
      });
    };

    void track().catch(() => { });
  }, [portfolioId]);

  // Link click tracking via event delegation — catches all <a> in the portfolio
  useEffect(() => {
    const consent = getConsentValue();
    if (consent === 'refused') return;

    const handleClick = (e: MouseEvent) => {
      // Walk up to nearest <a>
      let el = e.target as HTMLElement | null;
      while (el && el.tagName !== 'A') el = el.parentElement;
      if (!el) return;

      const href = (el as HTMLAnchorElement).getAttribute('href') ?? '';
      if (!href) return;

      const linkType = resolveLinkType(href);
      const linkLabel = href.startsWith('#')
        ? href.slice(0, 100)
        : el.textContent?.trim().slice(0, 100) || undefined;

      void fetch(`${API_URL}/analytics/click`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          portfolio_id: portfolioId,
          link_type: linkType,
          link_label: linkLabel,
        }),
      }).catch(() => { });
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [portfolioId]);

  return null;
}
