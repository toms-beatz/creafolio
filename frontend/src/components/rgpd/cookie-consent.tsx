'use client';

import { useState, useEffect } from 'react';
import { Shield } from 'lucide-react';
import Link from 'next/link';

const CONSENT_KEY = 'creafolio_cookie_consent';

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
        <div
            role="dialog"
            aria-label="Gestion des cookies"
            aria-modal="false"
            className="fixed bottom-0 inset-x-0 z-[100] p-4 animate-in slide-in-from-bottom-4 duration-300"
        >
            <div className="mx-auto max-w-2xl rounded-xl border border-dashed border-[#e8c9b5] bg-[#f4eeea]/95 backdrop-blur-sm p-5 shadow-2xl">
                <p className="text-sm text-[#1a1a1a] leading-relaxed mb-1">
                    <span className="font-mono text-[9px] text-[#ad7b60]/60 tracking-widest mr-2 inline-flex items-center gap-1"><Shield className="h-3 w-3" aria-hidden="true" /> RGPD</span>
                    Creafolio utilise des cookies essentiels (session d&apos;authentification) et des cookies d&apos;analyse
                    pour améliorer ton expérience. Les cookies essentiels sont indispensables au fonctionnement du site.
                </p>
                <p className="text-xs text-[#1a1a1a]/50 mb-4">
                    En savoir plus dans notre{' '}
                    <Link href="/legal/privacy" className="text-[#ad7b60]/70 underline hover:text-[#ad7b60] transition-colors">
                        Politique de Confidentialité
                    </Link>.
                </p>
                <div className="flex items-center gap-3" role="group" aria-label="Choix cookies">
                    <button
                        onClick={() => handleChoice('accepted')}
                        className="rounded-lg bg-[#ad7b60] px-4 py-2 text-xs font-semibold text-white hover:bg-[#d4a485] transition-colors focus:outline-none focus:ring-2 focus:ring-[#d4a485] focus:ring-offset-2 focus:ring-offset-[#f4eeea]"
                    >
                        Accepter tout
                    </button>
                    <button
                        onClick={() => handleChoice('refused')}
                        className="rounded-lg border border-dashed border-[#e8c9b5] px-4 py-2 text-xs font-medium text-[#1a1a1a]/60 hover:text-[#1a1a1a] hover:border-[#ad7b60]/50 transition-colors focus:outline-none focus:ring-2 focus:ring-[#ad7b60]/30 focus:ring-offset-2 focus:ring-offset-[#f4eeea]"
                    >
                        Refuser tout
                    </button>
                </div>
            </div>
        </div>
    );
}
