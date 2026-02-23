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
            <section className="rounded-xl border border-dashed border-zinc-700 bg-zinc-900/40 p-6">
                <p className="font-mono text-[9px] uppercase tracking-widest text-zinc-600 mb-3">
                    GESTION ABONNEMENT
                </p>
                <p className="text-sm text-zinc-400 mb-4">
                    Via le portail Stripe, tu peux changer de plan (mensuel ↔ annuel),
                    voir tes factures ou annuler ton abonnement.
                </p>
                <Button
                    onClick={() => void handlePortal()}
                    disabled={loading}
                    className="bg-sky-400 text-zinc-950 hover:bg-sky-300"
                >
                    {loading ? '...' : <>Gérer mon abonnement <ArrowRight className="inline h-3 w-3" /></>}
                </Button>
            </section>
        );
    }

    return (
        <section className="rounded-xl border border-dashed border-sky-400/20 bg-sky-400/5 p-6">
            <p className="font-mono text-[9px] uppercase tracking-widest text-sky-400/60 mb-3">
                UPGRADE
            </p>
            <p className="text-sm text-zinc-300 mb-4">
                Passe en Premium pour débloquer des portfolios illimités, des analytics avancées
                et un domaine personnalisé.
            </p>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <Button
                    onClick={() => void handleCheckout()}
                    disabled={loading}
                    className="bg-sky-400 text-zinc-950 hover:bg-sky-300"
                >
                    {loading ? '...' : 'Passer Premium — 11€/mois'}
                </Button>
                <Button variant="ghost" asChild className="text-zinc-500 hover:text-white">
                    <Link href="/pricing">Comparer les plans</Link>
                </Button>
            </div>
        </section>
    );
}
