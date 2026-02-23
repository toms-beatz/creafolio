import {
    getAnalyticsSummary,
    getReferrerSources,
    getLinkClicks,
    type AnalyticsSummary,
    type ReferrerSource,
    type LinkClickSummary,
} from '@/features/analytics/actions';
import { AnalyticsDashboard } from './analytics-dashboard';

interface Props {
    portfolios: { id: string; title: string; slug: string }[];
    isPremium: boolean;
}

/**
 * Server Component wrapper — fetch analytics data server-side
 * and pass to client AnalyticsDashboard.
 * Includes global aggregation across all portfolios.
 * US-602
 */
export async function AnalyticsDashboardServer({ portfolios, isPremium }: Props) {
    const summaries: Record<string, AnalyticsSummary> = {};
    const referrers: Record<string, ReferrerSource[]> = {};
    const linkClicks: Record<string, LinkClickSummary[]> = {};

    // Fetch data pour chaque portfolio en parallèle
    await Promise.all(
        portfolios.map(async (p) => {
            const [summary, refs, clicks] = await Promise.all([
                getAnalyticsSummary(p.id),
                isPremium ? getReferrerSources(p.id) : Promise.resolve([]),
                isPremium ? getLinkClicks(p.id) : Promise.resolve([]),
            ]);
            summaries[p.id] = summary;
            referrers[p.id] = refs;
            linkClicks[p.id] = clicks;
        }),
    );

    // Compute global aggregation si > 1 portfolio
    if (portfolios.length > 1) {
        const allSummaries = Object.values(summaries);

        // Agréger les chart data par date
        const chartMap = new Map<string, number>();
        for (const s of allSummaries) {
            for (const d of s.chartData) {
                chartMap.set(d.date, (chartMap.get(d.date) ?? 0) + d.views);
            }
        }
        const chartData = Array.from(chartMap.entries())
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([date, views]) => ({ date, views }));

        summaries['__global__'] = {
            totalViews: allSummaries.reduce((acc, s) => acc + s.totalViews, 0),
            views7d: allSummaries.reduce((acc, s) => acc + s.views7d, 0),
            views30d: allSummaries.reduce((acc, s) => acc + s.views30d, 0),
            uniqueVisitors7d: allSummaries.reduce((acc, s) => acc + s.uniqueVisitors7d, 0),
            uniqueVisitors30d: allSummaries.reduce((acc, s) => acc + s.uniqueVisitors30d, 0),
            chartData,
        };

        // Agréger les referrers
        const refMap = new Map<string, number>();
        for (const refs of Object.values(referrers)) {
            for (const r of refs) {
                refMap.set(r.source, (refMap.get(r.source) ?? 0) + r.views);
            }
        }
        const totalRefViews = Array.from(refMap.values()).reduce((a, b) => a + b, 0);
        referrers['__global__'] = Array.from(refMap.entries())
            .map(([source, views]) => ({
                source,
                views,
                percentage: totalRefViews > 0 ? Math.round((views / totalRefViews) * 100) : 0,
            }))
            .sort((a, b) => b.views - a.views);

        // Agréger les link clicks
        const clickMap = new Map<string, number>();
        for (const cl of Object.values(linkClicks)) {
            for (const c of cl) {
                clickMap.set(c.linkType, (clickMap.get(c.linkType) ?? 0) + c.clicks);
            }
        }
        linkClicks['__global__'] = Array.from(clickMap.entries())
            .map(([linkType, clicks]) => ({ linkType, clicks }))
            .sort((a, b) => b.clicks - a.clicks);
    }

    return (
        <AnalyticsDashboard
            portfolios={portfolios}
            isPremium={isPremium}
            summaries={summaries}
            referrers={referrers}
            linkClicks={linkClicks}
        />
    );
}
