import { redirect } from 'next/navigation';
import Link from 'next/link';
import { AlertTriangle, ArrowRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { BillingActions } from './billing-actions';
import type { Profile, Subscription } from '@/types/database';

/**
 * /settings/billing — gestion abonnement.
 * US-505
 */
export default async function BillingPage() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single() as { data: Profile | null };

    if (!profile) redirect('/login');

    const { data: subscription } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle() as { data: Subscription | null };

    const isPremium = profile.plan === 'premium';
    const isTrialActive =
        profile.plan === 'trial' &&
        !!profile.trial_ends_at &&
        new Date(profile.trial_ends_at) > new Date();

    const trialDaysLeft = profile.trial_ends_at
        ? Math.max(0, Math.ceil((new Date(profile.trial_ends_at).getTime() - Date.now()) / 86400000))
        : 0;

    return (
        <>
            <h1 className="text-2xl font-bold text-white mb-1">Facturation</h1>
            <p className="text-sm text-zinc-500 mb-8">Gère ton abonnement et ta facturation.</p>

            {/* ── Plan actuel ─────────────────────────────── */}
            <section className="rounded-xl border border-dashed border-zinc-700 bg-zinc-900/40 p-6 mb-6">
                <p className="font-mono text-[9px] uppercase tracking-widest text-zinc-600 mb-3">
                    PLAN ACTUEL
                </p>

                <div className="flex items-center gap-3 mb-4">
                    <span className={`rounded-full border border-dashed px-3 py-1 font-mono text-xs uppercase tracking-widest ${isPremium
                        ? 'border-sky-400/30 bg-sky-400/5 text-sky-400'
                        : isTrialActive
                            ? 'border-amber-400/30 bg-amber-400/5 text-amber-400'
                            : 'border-zinc-700 text-zinc-500'
                        }`}>
                        {profile.plan}
                    </span>
                    {isTrialActive && (
                        <span className="text-xs text-amber-400/80">
                            {trialDaysLeft === 1 ? '1 jour restant' : `${trialDaysLeft} jours restants`}
                        </span>
                    )}
                </div>

                {isPremium && subscription && (
                    <div className="flex flex-col gap-1 text-sm text-zinc-400">
                        {subscription.current_period_end && (
                            <p>
                                Prochaine échéance :{' '}
                                <span className="text-zinc-200">
                                    {new Date(subscription.current_period_end).toLocaleDateString('fr-FR', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric',
                                    })}
                                </span>
                            </p>
                        )}
                        {subscription.cancel_at_period_end && (
                            <p className="text-amber-400 text-xs flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3" /> L&apos;abonnement sera annulé à la fin de la période.
                            </p>
                        )}
                    </div>
                )}

                {!isPremium && !isTrialActive && (
                    <p className="text-sm text-zinc-500">
                        Tu es en plan Free.{' '}
                        <Link href="/pricing" className="text-sky-400 hover:text-sky-300 transition-colors">
                            Passe Premium <ArrowRight className="inline h-3 w-3" />
                        </Link>
                    </p>
                )}
            </section>

            {/* ── Actions ─────────────────────────────────── */}
            <BillingActions isPremium={isPremium} hasSubscription={!!subscription} />

            {/* ── Refund policy ───────────────────────────── */}
            <section className="mt-8 rounded-xl border border-dashed border-zinc-800 bg-zinc-900/20 p-6">
                <p className="font-mono text-[9px] uppercase tracking-widest text-zinc-600 mb-3">
                    POLITIQUE DE REMBOURSEMENT
                </p>
                <p className="text-sm text-zinc-400 leading-relaxed">
                    14 jours satisfait ou remboursé après ton premier paiement.
                    Contacte-nous par email à{' '}
                    <a href="mailto:support@blooprint.fr" className="text-sky-400 hover:text-sky-300">
                        support@blooprint.fr
                    </a>{' '}
                    pour toute demande.
                </p>
            </section>
        </>
    );
}

{/* ── Refund policy ───────────────────────────── */ }
