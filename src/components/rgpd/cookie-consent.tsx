'use client';

import { useState, useEffect } from 'react';
import { Shield } from 'lucide-react';
import Link from 'next/link';

const CONSENT_KEY = 'blooprint_cookie_consent';

export type ConsentValue = 'accepted' | 'refused' | null;

/**
 * Retourne le statut actuel du consentement cookies.
 */
export function getConsentValue(): ConsentValue {
    if (typeof window === 'undefined') return null;
    const val = localStorage.getItem(CONSENT_KEY);
    if (val === 'accepted' || val === 'refused') return val;
    return null;
}

/**
 * Cookie consent banner RGPD — US-801
 * Affiché à la première visite, bloque le tracking analytics si refusé.
 * Choix persisté en localStorage (pas de cookie ironique).
 */
export function CookieConsent() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const consent = getConsentValue();
        if (!consent) setVisible(true);
    }, []);

    const handleChoice = (choice: 'accepted' | 'refused') => {
        localStorage.setItem(CONSENT_KEY, choice);
        setVisible(false);
    };

    if (!visible) return null;

    return (
        <div className="fixed bottom-0 inset-x-0 z-[100] p-4 animate-in slide-in-from-bottom-4 duration-300">
            <div className="mx-auto max-w-2xl rounded-xl border border-dashed border-zinc-700 bg-zinc-950/95 backdrop-blur-sm p-5 shadow-2xl">
                <p className="text-sm text-zinc-300 leading-relaxed mb-1">
                    <span className="font-mono text-[9px] text-sky-400/60 tracking-widest mr-2 inline-flex items-center gap-1"><Shield className="h-3 w-3" /> RGPD</span>
                    Blooprint utilise des cookies essentiels (session d&apos;authentification) et des cookies d&apos;analyse
                    pour améliorer ton expérience. Les cookies essentiels sont indispensables au fonctionnement du site.
                </p>
                <p className="text-xs text-zinc-500 mb-4">
                    En savoir plus dans notre{' '}
                    <Link href="/legal/privacy" className="text-sky-400/70 underline hover:text-sky-400 transition-colors">
                        Politique de Confidentialité
                    </Link>.
                </p>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => handleChoice('accepted')}
                        className="rounded-lg bg-sky-400 px-4 py-2 text-xs font-semibold text-zinc-950 hover:bg-sky-300 transition-colors"
                    >
                        Accepter tout
                    </button>
                    <button
                        onClick={() => handleChoice('refused')}
                        className="rounded-lg border border-dashed border-zinc-700 px-4 py-2 text-xs font-medium text-zinc-400 hover:text-white hover:border-zinc-500 transition-colors"
                    >
                        Refuser tout
                    </button>
                </div>
            </div>
        </div>
    );
}
