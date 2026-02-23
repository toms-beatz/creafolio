import { createClient } from '@/lib/supabase/server';
import { PricingContent } from './pricing-content';

/**
 * Page /pricing — Server Component wrapper.
 * Charge le profil utilisateur pour adapter les CTAs (checkout vs portal).
 * US-501
 */
export default async function PricingPage() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    let plan: string | null = null;
    let trialDaysLeft = 0;

    if (user) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('plan, trial_ends_at')
            .eq('id', user.id)
            .single();

        if (profile) {
            plan = profile.plan;
            if (profile.plan === 'trial' && profile.trial_ends_at) {
                trialDaysLeft = Math.max(
                    0,
                    Math.ceil(
                        (new Date(profile.trial_ends_at).getTime() - Date.now()) / 86400000,
                    ),
                );
            }
        }
    }

    return (
        <PricingContent
            isLoggedIn={!!user}
            plan={plan}
            trialDaysLeft={trialDaysLeft}
        />
    );
}
