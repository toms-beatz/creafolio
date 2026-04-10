'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { redirectToCheckout, redirectToPortal } from '@/lib/billing-client';

interface BillingActionsProps {
    isPremium: boolean;
    hasSubscription: boolean;
}

/**
 * Actions billing côté client — boutons checkout/portal.
 * US-505
 */
export function BillingActions({ isPremium, hasSubscription }: BillingActionsProps) {
    const [loading, setLoading] = useState(false);

    const handlePortal = async () => {
        setLoading(true);
        try {
            await redirectToPortal();
        } catch {
            alert('Erreur lors de l\'ouverture du portail Stripe.');
        } finally {
            setLoading(false);
        }
    };

    const handleCheckout = async () => {
        setLoading(true);
        try {
            await redirectToCheckout('monthly');
        } catch {
            alert('Erreur lors de la redirection vers le paiement.');
        } finally {
            setLoading(false);
        }
    };

    if (isPremium && hasSubscription) {
        return (
            <section className="rounded-xl border border-dashed border-[#e8c9b5] bg-white/60 p-6">
                <p className="font-mono text-[9px] uppercase tracking-widest text-[#1a1a1a]/50 mb-3">
                    GESTION ABONNEMENT
                </p>
                <p className="text-sm text-[#1a1a1a]/60 mb-4">
                    Via le portail Stripe, tu peux changer de plan (mensuel ↔ annuel),
                    voir tes factures ou annuler ton abonnement.
                </p>
                <Button
                    onClick={() => void handlePortal()}
                    disabled={loading}
                    className="bg-[#ad7b60] text-white hover:bg-[#d4a485]"
                >
                    {loading ? '...' : <>Gérer mon abonnement <ArrowRight className="inline h-3 w-3" /></>}
                </Button>
            </section>
        );
    }

    return (
        <section className="rounded-xl border border-dashed border-[#ad7b60]/20 bg-[#ad7b60]/5 p-6">
            <p className="font-mono text-[9px] uppercase tracking-widest text-[#ad7b60]/60 mb-3">
                UPGRADE
            </p>
            <p className="text-sm text-[#1a1a1a]/70 mb-4">
                Passe en Premium pour débloquer des portfolios illimités, des analytics avancées
                et un domaine personnalisé.
            </p>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <Button
                    onClick={() => void handleCheckout()}
                    disabled={loading}
                    className="bg-[#ad7b60] text-white hover:bg-[#d4a485]"
                >
                    {loading ? '...' : 'Passer Premium — 11€/mois'}
                </Button>
                <Button variant="ghost" asChild className="text-[#1a1a1a]/50 hover:text-[#ad7b60]">
                    <Link href="/pricing">Comparer les plans</Link>
                </Button>
            </div>
        </section>
    );
}
