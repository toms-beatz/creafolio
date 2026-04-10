'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CoordLabel } from '@/components/ui/coord-label';
import { redirectToCheckout, redirectToPortal } from '@/lib/billing-client';

/* ── Data ──────────────────────────────────────────────────── */
const freeFeatures: { label: string; included: boolean }[] = [
    { label: '1 portfolio', included: true },
    { label: '6 blocs maximum', included: true },
    { label: 'Analytics basiques (vues)', included: true },
    { label: 'Sous-domaine creafolio.fr/username', included: true },
    { label: 'Templates de base', included: true },
    { label: 'Watermark Creafolio', included: false },
    { label: 'Domaine personnalisé', included: false },
    { label: 'Templates premium', included: false },
    { label: 'Analytics avancées', included: false },
    { label: 'Support prioritaire', included: false },
];

const premiumFeatures: { label: string; included: boolean }[] = [
    { label: '3 à 5 portfolios', included: true },
    { label: 'Blocs illimités', included: true },
    { label: 'Analytics avancées (sources, taux clic)', included: true },
    { label: 'Sous-domaine creafolio.fr/username', included: true },
    { label: 'Templates premium + base', included: true },
    { label: 'Sans watermark', included: true },
    { label: 'Domaine personnalisé', included: true },
    { label: 'Support prioritaire', included: true },
    { label: '7 jours d\'essai gratuit', included: true },
    { label: '14 jours satisfait ou remboursé', included: true },
];

const faq = [
    {
        q: 'Puis-je essayer Premium sans carte bancaire ?',
        a: 'Oui. À l\'inscription, tu bénéficies automatiquement de 7 jours Premium. Aucune CB requise. Tu n\'es facturé qu\'au moment où tu choisis de passer à un plan payant.',
    },
    {
        q: 'Puis-je annuler à tout moment ?',
        a: 'Absolument. Sans engagement, sans préavis. Si tu annules avant la fin de ta période, ton plan Premium reste actif jusqu\'à son échéance.',
    },
    {
        q: 'Que se passe-t-il si je repasse en Free ?',
        a: 'Ton ou tes portfolios restent accessibles. Si tu en as plusieurs, tu peux en garder 1 actif. Les autres passent en mode lecture seule — aucune donnée n\'est supprimée.',
    },
    {
        q: 'Puis-je utiliser mon propre domaine ?',
        a: 'Oui, mais uniquement en Premium. Tu peux connecter un domaine personnalisé (ex. .fr, .com) via les paramètres de ton portfolio. La configuration DNS est guidée.',
    },
    {
        q: 'Acceptez-vous les remboursements ?',
        a: 'Oui — 14 jours satisfait ou remboursé, sans question. Contacte-nous par email et le remboursement est traité sous 5 jours ouvrés.',
    },
];

/* ── Page ──────────────────────────────────────────────────── */
interface PricingContentProps {
    isLoggedIn: boolean;
    plan: string | null;       // 'free' | 'trial' | 'premium' | null
    trialDaysLeft: number;
}

export function PricingContent({ isLoggedIn, plan, trialDaysLeft }: PricingContentProps) {
    const [annual, setAnnual] = useState(false);
    const [openFaq, setOpenFaq] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);

    const monthlyPrice = 11;
    const annualMonthly = 6.58; // 79€ / 12

    const isPremium = plan === 'premium';
    const isTrialActive = plan === 'trial' && trialDaysLeft > 0;

    const handleCheckout = async () => {
        setLoading(true);
        try {
            await redirectToCheckout(annual ? 'yearly' : 'monthly');
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Erreur inconnue';
            console.error('[Checkout]', msg);
            alert(`Erreur lors de la redirection vers le paiement : ${msg}`);
        } finally {
            setLoading(false);
        }
    };

    const handlePortal = async () => {
        setLoading(true);
        try {
            await redirectToPortal();
        } catch {
            alert('Erreur lors de l\'ouverture du portail.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* ── Hero ─────────────────────────────────────────────── */}
            <section className="relative overflow-hidden bg-[#f4eeea] pt-28 pb-16 lg:pt-36 lg:pb-20">


                {/* Halo */}
                <div
                    className="pointer-events-none absolute inset-0"
                    style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 30%, rgba(173,123,96,0.07) 0%, transparent 70%)' }}
                />

                <div className="relative mx-auto max-w-3xl px-4 text-center">
                    <CoordLabel text="[PLANS // 00.06]" className="mb-5 block text-[#ad7b60]/70 text-[10px] tracking-[0.25em]" />

                    <h1 className="text-4xl font-bold tracking-tighter text-[#1a1a1a] sm:text-5xl lg:text-6xl leading-[1.05] mb-4 animate-bp-fade-up">
                        Simple.{' '}
                        <span className="text-[#ad7b60]">Transparent.</span>
                    </h1>

                    <p className="text-[#1a1a1a]/60 text-lg mb-10 animate-bp-fade-up delay-100">
                        Commence gratuitement. Passe en Premium quand tu es prêt.
                    </p>

                    {/* Toggle mensuel / annuel */}
                    <div className="inline-flex items-center gap-2 rounded-full border border-dashed border-[#e8c9b5] bg-white p-1 animate-bp-fade-up delay-200">
                        <button
                            onClick={() => setAnnual(false)}
                            className={`rounded-full px-5 py-1.5 text-sm font-medium transition-all ${!annual
                                ? 'bg-[#ad7b60] text-white shadow'
                                : 'text-[#1a1a1a]/50 hover:text-[#1a1a1a]'}`}
                        >
                            Mensuel
                        </button>
                        <button
                            onClick={() => setAnnual(true)}
                            className={`flex items-center gap-2 rounded-full px-5 py-1.5 text-sm font-medium transition-all ${annual
                                ? 'bg-[#ad7b60] text-white shadow'
                                : 'text-[#1a1a1a]/50 hover:text-[#1a1a1a]'}`}
                        >
                            Annuel
                            <span className="rounded-full bg-[#ad7b60]/20 px-1.5 py-0.5 font-mono text-[9px] text-[#d4a485]">
                                −40%
                            </span>
                        </button>
                    </div>
                </div>
            </section>

            {/* ── Plans ────────────────────────────────────────────── */}
            <section className="relative bg-[#f4eeea] py-12 pb-24">
                <div className="mx-auto max-w-4xl px-4">
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 animate-bp-fade-up delay-300">

                        {/* ─ Free ─ */}
                        <div className="relative flex flex-col rounded-2xl border border-dashed border-[#e8c9b5] bg-white p-7">
                            <CoordLabel text="[PLAN-FREE]" className="mb-4 block text-[9px]" />

                            <p className="text-base font-semibold text-[#1a1a1a]/70 mb-1">Free</p>
                            <div className="flex items-baseline gap-1 mb-1">
                                <span className="text-5xl font-bold text-[#1a1a1a]">0€</span>
                                <span className="text-sm text-[#1a1a1a]/50">/mois</span>
                            </div>
                            <p className="text-xs text-[#1a1a1a]/50 mb-8">Pour démarrer. Sans CB.</p>

                            <ul className="flex flex-col gap-3 mb-10 flex-1">
                                {freeFeatures.map((f) => (
                                    <li key={f.label} className="flex items-start gap-2.5 text-sm">
                                        {f.included ? (
                                            <span className="mt-0.5 text-xs text-[#ad7b60]/80 shrink-0"><Check className="h-3.5 w-3.5" /></span>
                                        ) : (
                                            <span className="mt-0.5 font-mono text-xs text-zinc-700 shrink-0">—</span>
                                        )}
                                        <span className={f.included ? 'text-zinc-300' : 'text-zinc-600'}>
                                            {f.label}
                                        </span>
                                    </li>
                                ))}
                            </ul>

                            <Button
                                variant="outline"
                                asChild
                                className="w-full border-dashed border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                            >
                                <Link href={isLoggedIn ? '/dashboard' : '/signup'}>Commencer gratuit</Link>
                            </Button>
                        </div>

                        {/* ─ Premium ─ */}
                        <div className="relative flex flex-col rounded-2xl border-2 border-[#ad7b60]/40 bg-white p-7 shadow-lg shadow-[#ad7b60]/5">
                            {/* Badge populaire */}
                            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                                <Badge className="bg-[#ad7b60] text-white font-semibold text-[10px] px-3 border-0 uppercase tracking-wider">
                                    <Sparkles className="inline h-3 w-3 mr-1.5" />Recommandé
                                </Badge>
                            </div>

                            <CoordLabel text="[PLAN-PREMIUM]" className="mb-4 block text-[9px]" />

                            <p className="text-base font-semibold text-white mb-1">Premium</p>
                            <div className="flex items-baseline gap-1 mb-1">
                                <span className="text-5xl font-bold text-white">
                                    {annual ? annualMonthly : monthlyPrice}€
                                </span>
                                <span className="text-sm text-zinc-500">/mois</span>
                            </div>
                            <p className="text-xs text-zinc-500 mb-8">
                                {annual
                                    ? `Facturé 79€/an — tu économises ${Math.round(monthlyPrice * 12 - 79)}€ (-40%)`
                                    : '7 jours d\'essai gratuit — sans CB'}
                            </p>

                            <ul className="flex flex-col gap-3 mb-10 flex-1">
                                {premiumFeatures.map((f) => (
                                    <li key={f.label} className="flex items-start gap-2.5 text-sm">
                                        <span className="mt-0.5 text-xs text-[#ad7b60] shrink-0"><Check className="h-3.5 w-3.5" /></span>
                                        <span className="text-zinc-200">{f.label}</span>
                                    </li>
                                ))}
                            </ul>

                            {isTrialActive && (
                                <div className="mb-4 rounded-lg border border-dashed border-[#ad7b60]/30 bg-[#ad7b60]/5 px-4 py-3 text-center">
                                    <p className="text-sm text-[#d4a485] font-medium">
                                        <Sparkles className="inline h-3 w-3" /> Trial actif — {trialDaysLeft === 1 ? '1 jour restant' : `${trialDaysLeft} jours restants`}
                                    </p>
                                </div>
                            )}

                            {isPremium ? (
                                <Button
                                    size="lg"
                                    onClick={() => void handlePortal()}
                                    disabled={loading}
                                    className="w-full bg-[#ad7b60] text-white hover:bg-[#d4a485] font-semibold"
                                >
                                    {loading ? '...' : 'Gérer mon abonnement'}
                                </Button>
                            ) : isLoggedIn ? (
                                <Button
                                    size="lg"
                                    onClick={() => void handleCheckout()}
                                    disabled={loading}
                                    className="w-full bg-[#ad7b60] text-white hover:bg-[#d4a485] font-semibold"
                                >
                                    {loading ? '...' : 'Passer Premium'}
                                </Button>
                            ) : (
                                <Button
                                    asChild
                                    size="lg"
                                    className="w-full bg-[#ad7b60] text-white hover:bg-[#d4a485] font-semibold"
                                >
                                    <Link href="/signup">Essayer 7 jours gratuit</Link>
                                </Button>
                            )}

                            <p className="mt-3 text-center text-xs text-zinc-600">
                                14 jours satisfait ou remboursé
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Comparatif ───────────────────────────────────────── */}
            <section className="relative overflow-hidden bg-[#ede8e3] py-20 border-y border-dashed border-[#e8c9b5]">
                <div className="mx-auto max-w-3xl px-4">
                    <div className="mb-10 text-center">
                        <CoordLabel text="[COMPARE // 00.07]" className="mb-3 block" />
                        <h2 className="text-2xl font-bold text-[#1a1a1a] tracking-tight">
                            Comparatif détaillé
                        </h2>
                    </div>

                    <div className="overflow-hidden rounded-xl border border-dashed border-[#e8c9b5]">
                        {/* Header */}
                        <div className="grid grid-cols-3 bg-[#e8c9b5]/40 px-5 py-3 text-xs font-mono text-[#1a1a1a]/50 uppercase tracking-widest">
                            <span>Fonctionnalité</span>
                            <span className="text-center">Free</span>
                            <span className="text-center text-[#ad7b60]/80">Premium</span>
                        </div>

                        {[
                            { label: 'Portfolios', free: '1', premium: '3 à 5' },
                            { label: 'Blocs par portfolio', free: '6 max', premium: 'Illimité' },
                            { label: 'URL', free: 'creafolio.fr/tonnom', premium: 'Custom domain + sous-domaine' },
                            { label: 'Storage', free: '500 MB', premium: '5 GB' },
                            { label: 'Templates', free: 'Base', premium: 'Base + Premium' },
                            { label: 'Analytics', free: 'Vues', premium: 'Vues, visiteurs uniques, sources, taux clic' },
                            { label: 'Watermark', free: 'Oui', premium: '—' },
                            { label: 'Support', free: 'Communauté', premium: 'Prioritaire' },
                            { label: 'Essai gratuit', free: '—', premium: '7 jours' },
                            { label: 'Remboursement', free: '—', premium: '14 jours' },
                        ].map((row, i) => (
                            <div
                                key={row.label}
                                className={`grid grid-cols-3 items-center px-5 py-3.5 text-sm border-t border-dashed border-[#e8c9b5] ${i % 2 === 0 ? 'bg-[#e8c9b5]/20' : 'bg-white'}`}
                            >
                                <span className="text-[#1a1a1a]/70">{row.label}</span>
                                <span className="text-center text-[#1a1a1a]/50">{row.free}</span>
                                <span className="text-center text-[#d4a485] font-medium">{row.premium}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── FAQ ──────────────────────────────────────────────── */}
            <section className="relative overflow-hidden bg-[#f4eeea] py-20">


                <div className="relative mx-auto max-w-2xl px-4">
                    <div className="mb-10 text-center">
                        <CoordLabel text="[FAQ // 00.08]" className="mb-3 block" />
                        <h2 className="text-2xl font-bold text-[#1a1a1a] tracking-tight">
                            Questions fréquentes
                        </h2>
                    </div>

                    <div className="flex flex-col divide-y divide-dashed divide-[#e8c9b5] rounded-xl border border-dashed border-[#e8c9b5] overflow-hidden">
                        {faq.map((item, i) => (
                            <div key={i} className="bg-white">
                                <button
                                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-medium text-[#1a1a1a] hover:text-[#ad7b60] transition-colors"
                                >
                                    <span>{item.q}</span>
                                    <span
                                        className="shrink-0 font-mono text-[#ad7b60]/70 transition-transform duration-200"
                                        style={{ transform: openFaq === i ? 'rotate(45deg)' : 'rotate(0deg)' }}
                                    >
                                        +
                                    </span>
                                </button>
                                {openFaq === i && (
                                    <p className="px-5 pb-4 pt-1 text-sm text-[#1a1a1a]/60 leading-relaxed border-t border-dashed border-[#e8c9b5]">
                                        {item.a}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CTA final ────────────────────────────────────────── */}
            <section className="relative overflow-hidden bg-[#ede8e3] border-t border-dashed border-[#e8c9b5] py-20">
                <div
                    className="pointer-events-none absolute inset-0"
                    style={{ background: 'radial-gradient(ellipse 60% 80% at 50% 100%, rgba(173,123,96,0.06) 0%, transparent 70%)' }}
                />

                <div className="relative mx-auto max-w-xl px-4 text-center">
                    <CoordLabel text="[CTA // 00.09]" className="mb-5 block" />
                    <h2 className="text-2xl font-bold text-[#1a1a1a] tracking-tight mb-3 sm:text-3xl">
                        Prêt à construire ton portfolio ?
                    </h2>
                    <p className="text-[#1a1a1a]/60 mb-8 text-base">
                        Rejoins Creafolio gratuitement.{' '}
                        <span className="text-[#1a1a1a]/80">Essai Premium 7 jours inclus.</span>
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                        <Button
                            asChild
                            size="lg"
                            className="w-full sm:w-auto bg-[#ad7b60] text-white hover:bg-[#d4a485] font-semibold px-8"
                        >
                            <Link href={isLoggedIn ? '/dashboard' : '/signup'}>Commencer maintenant</Link>
                        </Button>
                        <Button
                            variant="outline"
                            asChild
                            size="lg"
                            className="w-full sm:w-auto border-dashed border-[#e8c9b5] text-[#1a1a1a]/60 hover:bg-[#e8c9b5]/30 hover:text-[#1a1a1a]"
                        >
                            <Link href="/">Voir la démo</Link>
                        </Button>
                    </div>

                    <p className="mt-5 text-xs text-[#1a1a1a]/40">
                        Aucune CB requise · Annulation à tout moment · 14 jours remboursé
                    </p>
                </div>
            </section>
        </>
    );
}
