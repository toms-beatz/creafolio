'use client';

import { useState } from 'react';
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
} from 'lucide-react';
import type {
    AnalyticsSummary,
    ReferrerSource,
    LinkClickSummary,
} from '@/features/analytics/actions';
import { exportAnalyticsCSV } from '@/features/analytics/actions';
import Link from 'next/link';

/* ── Types ─────────────────────────────────────────────────── */
interface AnalyticsDashboardProps {
    portfolios: { id: string; title: string; slug: string }[];
    isPremium: boolean;
    summaries: Record<string, AnalyticsSummary>;
    referrers: Record<string, ReferrerSource[]>;
    linkClicks: Record<string, LinkClickSummary[]>;
}

/* ── Mini sparkline chart (CSS based) ─────────────────────── */
function MiniChart({ data }: { data: { date: string; views: number }[] }) {
    const max = Math.max(...data.map((d) => d.views), 1);
    return (
        <div className="flex items-end gap-px h-20 w-full">
            {data.map((d) => (
                <div
                    key={d.date}
                    className="flex-1 bg-sky-400/30 hover:bg-sky-400/60 transition-colors rounded-t-sm relative group"
                    style={{ height: `${(d.views / max) * 100}%`, minHeight: d.views > 0 ? 2 : 0 }}
                >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover:block bg-zinc-800 text-[9px] text-zinc-300 px-1.5 py-0.5 rounded whitespace-nowrap z-10">
                        {d.date.slice(5)} : {d.views}
                    </div>
                </div>
            ))}
        </div>
    );
}

/* ── Stat card ────────────────────────────────────────────── */
function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
    return (
        <div className="rounded-xl border border-dashed border-zinc-700 bg-zinc-900/40 p-4">
            <p className="font-mono text-[9px] uppercase tracking-widest text-zinc-600 mb-1">{label}</p>
            <p className="text-2xl font-bold text-white">{value}</p>
            {sub && <p className="text-[10px] text-zinc-500 mt-0.5">{sub}</p>}
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
    summaries,
    referrers,
    linkClicks,
}: AnalyticsDashboardProps) {
    const hasGlobal = portfolios.length > 1;
    const [selectedId, setSelectedId] = useState(hasGlobal ? '__global__' : (portfolios[0]?.id ?? ''));
    const [exporting, setExporting] = useState(false);

    const isGlobal = selectedId === '__global__';
    const summary = summaries[selectedId];
    const sources = referrers[selectedId] ?? [];
    const clicks = linkClicks[selectedId] ?? [];

    const handleExport = async () => {
        if (isGlobal) return; // CSV export uniquement par portfolio
        setExporting(true);
        try {
            const csv = await exportAnalyticsCSV(selectedId);
            const blob = new Blob([csv], { type: 'text/csv' });
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
            <div className="rounded-xl border border-dashed border-zinc-700 bg-zinc-900/40 p-8 text-center">
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
                    onChange={(e) => setSelectedId(e.target.value)}
                    className="w-full sm:w-auto rounded-lg border border-dashed border-zinc-700 bg-zinc-900 px-3 py-2 sm:py-1.5 text-sm text-zinc-200 focus:border-sky-400/50 focus:outline-none"
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
            </div>

            {/* ── Stats Free ───────────────────────────────── */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <StatCard label="Vues totales" value={summary.totalViews} />
                <StatCard label="Vues 7j" value={summary.views7d} />
                <StatCard label="Vues 30j" value={summary.views30d} />
            </div>

            {/* ── Chart 30 jours ────────────────────────────── */}
            <div className="rounded-xl border border-dashed border-zinc-700 bg-zinc-900/40 p-5">
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
                    <MiniChart data={summary.chartData} />
                )}
            </div>

            {/* ── Premium analytics ────────────────────────── */}
            <div className="relative">
                {!isPremium && (
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-xl bg-zinc-950/80 backdrop-blur-sm">
                        <Lock className="h-6 w-6 text-zinc-500" />
                        <p className="text-sm font-medium text-zinc-200 mb-1">Analytics avancées</p>
                        <p className="text-xs text-zinc-500 mb-3 max-w-xs text-center">
                            Sources de trafic, visiteurs uniques, clics sur liens... disponibles en Premium.
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
                    {/* Visiteurs uniques */}
                    <div className="grid grid-cols-2 gap-3">
                        <StatCard label="Visiteurs uniques 7j" value={summary.uniqueVisitors7d} />
                        <StatCard label="Visiteurs uniques 30j" value={summary.uniqueVisitors30d} />
                    </div>

                    {/* Sources de trafic */}
                    <div className="rounded-xl border border-dashed border-zinc-700 bg-zinc-900/40 p-5">
                        <p className="font-mono text-[9px] uppercase tracking-widest text-zinc-600 mb-3">
                            SOURCES DE TRAFIC // 30J
                        </p>
                        {sources.length === 0 ? (
                            <p className="text-xs text-zinc-500">Aucune donnée.</p>
                        ) : (
                            <div className="flex flex-col gap-2">
                                {sources.map((s) => (
                                    <div key={s.source} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0 text-sm">
                                        <span className="text-zinc-300 truncate">{s.source}</span>
                                        <div className="flex items-center gap-3">
                                            <div className="w-full sm:w-24 h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                                                <div
                                                    className="h-full bg-sky-400/60 rounded-full"
                                                    style={{ width: `${s.percentage}%` }}
                                                />
                                            </div>
                                            <span className="font-mono text-[10px] text-zinc-500 w-16 sm:w-10 text-right shrink-0">
                                                {s.views} ({s.percentage}%)
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Clics sur liens */}
                    <div className="rounded-xl border border-dashed border-zinc-700 bg-zinc-900/40 p-5">
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
