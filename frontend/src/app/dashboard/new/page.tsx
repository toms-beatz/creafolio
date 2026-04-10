import { getMe, resolveIsPremium } from "@/lib/api-server";
import { getTemplatesWithConfig } from "@/lib/get-templates";
import { WizardClient } from "@/components/dashboard/wizard-client";

export const metadata = { title: "Nouveau portfolio — Creafolio" };

export default async function NewPortfolioPage() {
    const meData = await getMe().catch(() => null);

    const isPremium = meData?.user?.profile ? resolveIsPremium(meData.user.profile) : false;

    const templates = await getTemplatesWithConfig();

    return <WizardClient templates={templates} isPremium={isPremium} />;
}
