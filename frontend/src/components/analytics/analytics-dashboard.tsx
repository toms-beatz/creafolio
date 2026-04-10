'use client';

import { useState, useCallback, useTransition, useMemo } from 'react';
import {
    Mail,
    Music2,
    Camera,
    Youtube,
    Linkedin,
    Link2,
    BarChart3,
    Rocket,
    Lock,
    ArrowRight,
    Download,
    Wifi,
    RefreshCw,
} from 'lucide-react';
import type {
    AnalyticsSummary,
    ReferrerSource,
    LinkClickSummary,
    VisitorRow,
} from '@/features/analytics/actions';
import { getAnalyticsSummary, getReferrerSources, getLinkClicks, exportAnalyticsCSV } from '@/features/analytics/actions';
import Link from 'next/link';
import { useAnalyticsRealtime } from '@/hooks/use-analytics-realtime';
import { VisitorsTable } from './visitors-table';
import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    ReferenceLine,
    PieChart,
    Pie,
    Cell,
    Tooltip as PieTooltip,
} from 'recharts';

/* ── Types ─────────────────────────────────────────────────── */
interface AnalyticsDashboardProps {
    portfolios: { id: string; title: string; slug: string }[];
    isPremium: boolean;
    summaries: Record<string, AnalyticsSummary>;
    referrers: Record<string, ReferrerSource[]>;
    linkClicks: Record<string, LinkClickSummary[]>;
    visitors: Record<string, VisitorRow[]>;
}

/* ── Génère le tableau des 30 derniers jours (zéros compris) ── */
function buildLast30Days(data: { date: string; views: number }[]) {
    const map = new Map(data.map((d) => [d.date, d.views]));
    const today = new Date();
    return Array.from({ length: 30 }, (_, i) => {
        const d = new Date(today);
        d.setDate(today.getDate() - (29 - i));
        const key = d.toISOString().split('T')[0];
        return {
            date: key,
            label: d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
            views: map.get(key) ?? 0,
        };
    });
}

/* ── Tooltip custom ───────────────────────────────────────── */
function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
    if (!active || !payload?.length) return null;
    return (
        <div className="rounded-lg bg-zinc-800 border border-zinc-700 px-3 py-2 text-[11px] shadow-lg">
            <p className="text-zinc-400 mb-0.5">{label}</p>
            <p className="font-semibold text-sky-300">{payload[0].value} vue{payload[0].value !== 1 ? 's' : ''}</p>
        </div>
    );
}

/* ── Line chart 30 jours ──────────────────────────────────── */
function ViewsLineChart({ data }: { data: { date: string; views: number }[] }) {
    const chartData = useMemo(() => buildLast30Days(data), [data]);
    const todayLabel = chartData[chartData.length - 1]?.label;

    return (
        <ResponsiveContainer width="100%" height={160}>
            <LineChart data={chartData} margin={{ top: 8, right: 4, left: -28, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis
                    dataKey="label"
                    tick={{ fontSize: 9, fill: '#71717a', fontFamily: 'monospace' }}
                    tickLine={false}
                    axisLine={false}
                    interval={4}
                />
                <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 9, fill: '#71717a', fontFamily: 'monospace' }}
                    tickLine={false}
                    axisLine={false}
                />
                <Tooltip content={<ChartTooltip />} cursor={{ stroke: 'rgba(56,189,248,0.15)', strokeWidth: 1 }} />
                <ReferenceLine x={todayLabel} stroke="rgba(56,189,248,0.3)" strokeDasharray="4 2" />
                <Line
                    type="monotone"
                    dataKey="views"
                    stroke="#38bdf8"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, fill: '#38bdf8', strokeWidth: 0 }}
                    isAnimationActive={false}
                />
            </LineChart>
        </ResponsiveContainer>
    );
}

/* ── Stat card ────────────────────────────────────────────── */
function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
    return (
        <div className="rounded-xl border border-dashed border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/40 p-4">
            <p className="font-mono text-[9px] uppercase tracking-widest text-zinc-600 mb-1">{label}</p>
            <p className="text-2xl font-bold text-zinc-900 dark:text-white">{value}</p>
            {sub && <p className="text-[10px] text-zinc-500 mt-0.5">{sub}</p>}
        </div>
    );
}

/* ── Palette camembert ────────────────────────────────────── */
const PIE_COLORS = ['#38bdf8', '#818cf8', '#34d399', '#fb923c', '#f472b6', '#a3e635', '#facc15'];

/* ── Tooltip camembert ────────────────────────────────────── */
function PieTooltipContent({ active, payload }: { active?: boolean; payload?: { name: string; value: number; payload: { percentage: number } }[] }) {
    if (!active || !payload?.length) return null;
    const { name, value, payload: p } = payload[0];
    return (
        <div className="rounded-lg bg-zinc-800 border border-zinc-700 px-3 py-2 text-[11px] shadow-lg">
            <p className="text-zinc-300 font-medium truncate max-w-[160px]">{name}</p>
            <p className="text-sky-300">{value} vue{value !== 1 ? 's' : ''} ({p.percentage}%)</p>
        </div>
    );
}

/* ── Camembert sources de trafic ──────────────────────────── */
function TrafficPieChart({ sources }: { sources: { source: string; views: number; percentage: number }[] }) {
    const data = sources.slice(0, 7).map((s) => ({ name: s.source, value: s.views, percentage: s.percentage }));
    return (
        <div className="flex flex-col sm:flex-row items-center gap-4">
            <ResponsiveContainer width={180} height={180}>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={48}
                        outerRadius={80}
                        dataKey="value"
                        strokeWidth={0}
                        isAnimationActive={false}
                    >
                        {data.map((_, i) => (
                            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                    </Pie>
                    <PieTooltip content={<PieTooltipContent />} />
                </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-1.5 min-w-0 flex-1">
                {data.map((d, i) => (
                    <div key={d.name} className="flex items-center gap-2 text-xs min-w-0">
                        <span className="h-2 w-2 rounded-full shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                        <span className="text-zinc-300 truncate flex-1">{d.name}</span>
                        <span className="font-mono text-zinc-500 shrink-0">{d.percentage}%</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ── Link type labels ─────────────────────────────────────── */
const LINK_LABELS: Record<string, { icon: React.ReactNode; label: string }> = {
    email: { icon: <Mail className="h-3.5 w-3.5" />, label: 'Email' },
    tiktok: { icon: <Music2 className="h-3.5 w-3.5" />, label: 'TikTok' },
    instagram: { icon: <Camera className="h-3.5 w-3.5" />, label: 'Instagram' },
    youtube: { icon: <Youtube className="h-3.5 w-3.5" />, label: 'YouTube' },
    linkedin: { icon: <Linkedin className="h-3.5 w-3.5" />, label: 'LinkedIn' },
    other: { icon: <Link2 className="h-3.5 w-3.5" />, label: 'Autre' },
};

/* ── Main component ───────────────────────────────────────── */
export function AnalyticsDashboard({
    portfolios,
    isPremium,
    summaries: initialSummaries,
    referrers: initialReferrers,
    linkClicks: initialLinkClicks,
    visitors: initialVisitors,
}: AnalyticsDashboardProps) {
    const hasGlobal = portfolios.length > 1;
    const [selectedId, setSelectedId] = useState(hasGlobal ? '__global__' : (portfolios[0]?.id ?? ''));
    const [exporting, setExporting] = useState(false);

    // Live state — init from SSR props, updated via WS
    const [summaries, setSummaries] = useState(initialSummaries);
    const [referrers, setReferrers] = useState(initialReferrers);
    const [linkClicks, setLinkClicks] = useState(initialLinkClicks);
    const [visitors, _setVisitors] = useState(initialVisitors);
    const [refreshing, startRefresh] = useTransition();
    const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

    const [visitorRefreshTrigger, setVisitorRefreshTrigger] = useState(0);

    const refreshPortfolio = useCallback((portfolioId: string) => {
        startRefresh(async () => {
            try {
                const [summary, refs, clicks] = await Promise.all([
                    getAnalyticsSummary(portfolioId),
                    isPremium ? getReferrerSources(portfolioId) : Promise.resolve([] as ReferrerSource[]),
                    isPremium ? getLinkClicks(portfolioId) : Promise.resolve([] as LinkClickSummary[]),
                ]);
                setSummaries((prev) => ({ ...prev, [portfolioId]: summary }));
                setReferrers((prev) => ({ ...prev, [portfolioId]: refs }));
                setLinkClicks((prev) => ({ ...prev, [portfolioId]: clicks }));
                setLastRefreshed(new Date());
            } catch {
                // silently ignore — keep stale data
            }
        });
    }, [isPremium]);

    const isConnected = useAnalyticsRealtime(
        selectedId !== '__global__' ? selectedId : null,
        {
            onViewed: useCallback(() => {
                if (selectedId && selectedId !== '__global__') {
                    refreshPortfolio(selectedId);
                    setVisitorRefreshTrigger((t) => t + 1);
                }
            }, [selectedId, refreshPortfolio]),
            onLinkClicked: useCallback(() => {
                if (selectedId && selectedId !== '__global__' && isPremium) {
                    startRefresh(async () => {
                        try {
                            const clicks = await getLinkClicks(selectedId);
                            setLinkClicks((prev) => ({ ...prev, [selectedId]: clicks }));
                            setLastRefreshed(new Date());
                        } catch { /* ignore */ }
                    });
                }
            }, [selectedId, isPremium]),
        },
    );

    const isGlobal = selectedId === '__global__';
    const summary = summaries[selectedId];
    const sources = referrers[selectedId] ?? [];
    const clicks = linkClicks[selectedId] ?? [];

    const handleExport = async () => {
        if (isGlobal) return;
        setExporting(true);
        try {
            const csv = await exportAnalyticsCSV(selectedId);
            const blob = new Blob([csv ?? ""], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `analytics-${selectedId.slice(0, 8)}.csv`;
            a.click();
            URL.revokeObjectURL(url);
        } catch {
            alert('Erreur lors de l\'export CSV.');
        } finally {
            setExporting(false);
        }
    };

    if (!summary) {
        return (
            <div className="rounded-xl border border-dashed border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/40 p-8 text-center">
                <BarChart3 className="h-8 w-8 text-zinc-600 mb-3" />
                <p className="text-sm text-zinc-400">Aucun portfolio à analyser.</p>
                <p className="text-xs text-zinc-600 mt-1">Crée et publie un portfolio pour voir tes stats.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6">
            {/* ── Sélecteur de portfolio ────────────────────── */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                <label className="font-mono text-[9px] uppercase tracking-widest text-zinc-600">
                    Portfolio
                </label>
                <select
                    value={selectedId}
                    onChange={(e) => { setSelectedId(e.target.value); }}
                    className="w-full sm:w-auto rounded-lg border border-dashed border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 px-3 py-2 sm:py-1.5 text-sm text-zinc-700 dark:text-zinc-200 focus:border-sky-400/50 focus:outline-none"
                >
                    {hasGlobal && (
                        <option value="__global__">
                            Global (tous les portfolios)
                        </option>
                    )}
                    {portfolios.map((p) => (
                        <option key={p.id} value={p.id}>
                            {p.title}
                        </option>
                    ))}
                </select>
                {isConnected && (
                    <span className="flex items-center gap-1 font-mono text-[9px] uppercase tracking-widest text-emerald-400">
                        <Wifi className="h-3 w-3" /> Live
                    </span>
                )}
                {refreshing && (
                    <RefreshCw className="h-3 w-3 text-zinc-500 animate-spin" />
                )}
                {lastRefreshed && !refreshing && (
                    <span className="font-mono text-[9px] text-zinc-600">
                        màj {lastRefreshed.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                )}
            </div>

            {/* ── Stats Free ───────────────────────────────── */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <StatCard label="Vues total" value={summary.totalViews} />
                <StatCard label="Vues 7j" value={summary.views7d} />
                <StatCard
                    label="Vues 30j"
                    value={summary.views30d}
                    sub={isConnected ? '● live' : undefined}
                />
            </div>

            {/* ── Chart 30 jours ────────────────────────────── */}
            <div className="rounded-xl border border-dashed border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/40 p-5">
                <p className="font-mono text-[9px] uppercase tracking-widest text-zinc-600 mb-3">
                    VUES // 30 DERNIERS JOURS
                </p>
                {summary.totalViews === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                        <Rocket className="h-6 w-6 text-zinc-600" />
                        <p className="text-sm text-zinc-400">Aucune vue pour l&apos;instant.</p>
                        <p className="text-xs text-zinc-600 mt-1">Partage ton lien pour obtenir tes premières visites !</p>
                    </div>
                ) : (
                    <ViewsLineChart data={summary.chartData} />
                )}
            </div>

            {/* ── Premium analytics ────────────────────────── */}
            <div className="relative">
                {!isPremium && (
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-xl bg-zinc-950/80 backdrop-blur-sm">
                        <Lock className="h-6 w-6 text-zinc-500" />
                        <p className="text-sm font-medium text-zinc-200 mb-1">Analytics avancées</p>
                        <p className="text-xs text-zinc-500 mb-3 max-w-xs text-center">
                            Sources de trafic, clics sur liens, tableau visiteurs... disponibles en Premium.
                        </p>
                        <Link
                            href="/pricing"
                            className="rounded-lg bg-sky-400 px-4 py-2 text-xs font-semibold text-zinc-950 hover:bg-sky-300 transition-colors"
                        >
                            Upgrade Premium <ArrowRight className="inline h-3 w-3" />
                        </Link>
                    </div>
                )}

                <div className={`flex flex-col gap-4 ${!isPremium ? 'blur-sm pointer-events-none select-none' : ''}`}>
                    {/* Sources de trafic + Clics sur liens — côte à côte */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Sources de trafic — camembert */}
                        <div className="rounded-xl border border-dashed border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/40 p-5">
                            <p className="font-mono text-[9px] uppercase tracking-widest text-zinc-600 mb-3">
                                SOURCES DE TRAFIC // 30J
                            </p>
                            {sources.length === 0 ? (
                                <p className="text-xs text-zinc-500">Aucune donnée.</p>
                            ) : (
                                <TrafficPieChart sources={sources} />
                            )}
                        </div>

                        {/* Clics sur liens */}
                        <div className="rounded-xl border border-dashed border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/40 p-5">
                            <p className="font-mono text-[9px] uppercase tracking-widest text-zinc-600 mb-3">
                                CLICS SUR LIENS // 30J
                            </p>
                            {clicks.length === 0 ? (
                                <p className="text-xs text-zinc-500">Aucun clic enregistré.</p>
                            ) : (
                                <div className="flex flex-col gap-2">
                                    {clicks.map((c) => (
                                        <div key={c.linkType} className="flex items-center justify-between text-sm">
                                            <span className="text-zinc-300 flex items-center gap-1.5">
                                                {LINK_LABELS[c.linkType]?.icon}
                                                {LINK_LABELS[c.linkType]?.label ?? c.linkType}
                                            </span>
                                            <span className="font-mono text-xs text-sky-400">{c.clicks}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Tableau visiteurs */}
                    {isPremium && !isGlobal && (
                        <div className="rounded-xl border border-dashed border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/40 p-5">
                            <div className="flex items-center gap-2 mb-3">
                                <p className="font-mono text-[9px] uppercase tracking-widest text-zinc-600">
                                    VISITEURS // 30 DERNIERS JOURS
                                </p>
                                {isConnected && (
                                    <span className="flex items-center gap-1 font-mono text-[9px] text-emerald-400">
                                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                        live
                                    </span>
                                )}
                            </div>
                            <VisitorsTable
                                portfolioId={selectedId}
                                initialRows={visitors[selectedId] ?? []}
                                refreshTrigger={visitorRefreshTrigger}
                            />
                        </div>
                    )}

                    {/* Export CSV */}
                    {isPremium && !isGlobal && (
                        <button
                            onClick={() => void handleExport()}
                            disabled={exporting}
                            className="self-end rounded-lg border border-dashed border-zinc-700 px-4 py-2 text-xs text-zinc-400 hover:border-sky-400/50 hover:text-sky-300 transition-colors"
                        >
                            {exporting ? '...' : <><Download className="inline h-3 w-3" /> Exporter CSV</>}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
