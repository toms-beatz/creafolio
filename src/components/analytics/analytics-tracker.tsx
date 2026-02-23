'use client';

import { useEffect } from 'react';
import { getConsentValue } from '@/components/rgpd/cookie-consent';

interface AnalyticsTrackerProps {
    portfolioId: string;
}

/**
 * Composant fire-and-forget qui track une vue de portfolio.
 * S'insère dans la page publique.
 * Respecte le consentement cookies (US-801 CA-3).
 * US-601 CA-7
 */
export function AnalyticsTracker({ portfolioId }: AnalyticsTrackerProps) {
    useEffect(() => {
        // Respecter le RGPD : pas de tracking si refusé
        const consent = getConsentValue();
        if (consent === 'refused') return;

        // Fire-and-forget — ne bloque pas le rendu
        const track = async () => {
            try {
                await fetch('/api/analytics/track', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        portfolioId,
                        referrer: document.referrer || '',
                    }),
                });
            } catch {
                // Silencieux — pas critique
            }
        };
        void track();
    }, [portfolioId]);

    return null;
}
