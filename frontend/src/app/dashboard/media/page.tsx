import { Suspense } from "react";
import { getMediaFiles } from "@/features/media/actions";
import { getUserPortfolios } from "@/features/builder/actions";
import { MediaGrid } from "@/components/dashboard/media-grid";
import { StorageQuotaWidget } from "@/components/dashboard/storage-quota-widget";

export const metadata = { title: "Médiathèque — Creafolio" };

export default async function MediaPage() {
    const [filesData, portfolios] = await Promise.all([
        getMediaFiles(),
        getUserPortfolios(),
    ]);

    const files = (filesData ?? []).map((f) => ({
        id: f.id,
        fileKey: f.file_key,
        url: f.url,
        fileName: f.display_name ?? f.file_key,
        fileSize: f.file_size,
        mimeType: f.mime_type ?? null,
        portfolioId: f.portfolio_id ? String(f.portfolio_id) : null,
        displayName: f.display_name ?? null,
        createdAt: f.created_at,
    }));

    const portfolioList = portfolios.map((p: { id: string; title?: string }) => ({
        id: p.id,
        title: p.title ?? "Sans titre",
    }));

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-xl font-bold tracking-tight">Médiathèque</h1>
                <p className="mt-0.5 text-sm text-zinc-500">
                    Uploade et gère tes images — elles seront disponibles dans le builder
                </p>
            </div>

            <Suspense
                fallback={
                    <div className="h-20 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 animate-pulse bg-zinc-100 dark:bg-zinc-900/40" />
                }
            >
                <StorageQuotaWidget />
            </Suspense>

            <MediaGrid files={files} portfolios={portfolioList} />
        </div>
    );
}
