import { getMe } from "@/lib/api-server";
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { AlertTriangle, ArrowRight } from 'lucide-react';
import { BillingActions } from './billing-actions';

/**
 * /settings/billing — gestion abonnement.
 * US-505
 */
export default async function BillingPage() {
    const meData = await getMe().catch(() => null);
    if (!meData?.user) redirect('/login');

    const profile = meData.user.profile;
    const subscription = (meData.user as unknown as { subscription?: { current_period_end?: string; cancel_at_period_end?: boolean } }).subscription ?? null;

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
            <h1 className="text-2xl font-bold text-[#1a1a1a] mb-1">Facturation</h1>
            <p className="text-sm text-[#1a1a1a]/60 mb-8">Gère ton abonnement et ta facturation.</p>

            <section className="rounded-xl border border-dashed border-[#e8c9b5] bg-white/60 p-6 mb-6">
                <p className="font-mono text-[9px] uppercase tracking-widest text-[#1a1a1a]/50 mb-3">PLAN ACTUEL</p>
                <div className="flex items-center gap-3 mb-4">
                    <span className={`rounded-full border border-dashed px-3 py-1 font-mono text-xs uppercase tracking-widest ${isPremium ? 'border-[#ad7b60]/30 bg-[#ad7b60]/5 text-[#ad7b60]'
                        : isTrialActive ? 'border-amber-400/30 bg-amber-400/5 text-amber-500'
                            : 'border-[#e8c9b5] text-[#1a1a1a]/50'
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
                    <div className="flex flex-col gap-1 text-sm text-[#1a1a1a]/60">
                        {subscription.current_period_end && (
                            <p>
                                Prochaine échéance :{' '}
                                <span className="text-[#1a1a1a]">
                                    {new Date(subscription.current_period_end).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
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
                    <p className="text-sm text-[#1a1a1a]/60">
                        Tu es en plan Free.{' '}
                        <Link href="/pricing" className="text-[#ad7b60] hover:text-[#9a6b50] transition-colors">
                            Passe Premium <ArrowRight className="inline h-3 w-3" />
                        </Link>
                    </p>
                )}
            </section>

            <BillingActions isPremium={isPremium} hasSubscription={!!subscription} />

            <section className="mt-8 rounded-xl border border-dashed border-[#e8c9b5] bg-white/40 p-6">
                <p className="font-mono text-[9px] uppercase tracking-widest text-[#1a1a1a]/50 mb-3">POLITIQUE DE REMBOURSEMENT</p>
                <p className="text-sm text-[#1a1a1a]/60 leading-relaxed">
                    14 jours satisfait ou remboursé après ton premier paiement.
                    Contacte-nous par email à{' '}
                    <a href="mailto:support@creafolio.fr" className="text-[#ad7b60] hover:text-[#9a6b50]">
                        support@creafolio.fr
                    </a>{' '}
                    pour toute demande.
                </p>
            </section>
        </>
    );
}
