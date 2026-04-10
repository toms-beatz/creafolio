import { Suspense } from "react";
import { StorageQuotaWidget } from "@/components/dashboard/storage-quota-widget";
import { AccountForms } from "@/components/dashboard/account-forms";

/**
 * /dashboard/account — Profil + Danger zone (fusionnés)
 * Server Component : StorageQuotaWidget (async) + AccountForms (client).
 */
export default function AccountProfilePage() {
    return (
        <div className="space-y-8">
            <AccountForms />
            <Suspense fallback={
                <div className="h-20 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 animate-pulse bg-zinc-100 dark:bg-zinc-900/40" />
            }>
                <StorageQuotaWidget />
            </Suspense>
        </div>
    );
}
