import { getMe } from "@/lib/api-server";
import { PricingContent } from './pricing-content';

/**
 * Page /pricing — Server Component wrapper.
 * US-501
 */
export default async function PricingPage() {
    const meData = await getMe().catch(() => null);

    let plan: string | null = null;
    let trialDaysLeft = 0;

    if (meData?.user) {
        plan = meData.user.profile?.plan ?? null;
        if (plan === 'trial' && meData.user.profile?.trial_ends_at) {
            trialDaysLeft = Math.max(
                0,
                Math.ceil((new Date(meData.user.profile.trial_ends_at).getTime() - Date.now()) / 86400000),
            );
        }
    }

    return (
        <PricingContent
            isLoggedIn={!!meData?.user}
            plan={plan}
            trialDaysLeft={trialDaysLeft}
        />
    );
}
