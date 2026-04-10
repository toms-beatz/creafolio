'use client';

import { useState, useCallback, useTransition, useEffect, useRef } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown, Monitor, Smartphone, Tablet } from 'lucide-react';
import { getVisitors } from '@/features/analytics/actions';
import type { VisitorRow } from '@/features/analytics/actions';

const BROWSER_ICONS: Record<string, string> = {
    Chrome: '🌐',
    Firefox: '🦊',
    Safari: '🧭',
    Edge: '🔷',
    Opera: 'O',
    Samsung: '📱',
    IE: '🔵',
    Other: '🌐',
};

type SortKey = 'viewed_at' | 'country_code' | 'city' | 'device_type' | 'browser' | 'referrer';

const FLAG_BASE = 'https://flagcdn.com/16x12/';

const DEVICE_ICONS: Record<string, React.ReactNode> = {
    mobile: <Smartphone className="h-3 w-3" />,
    tablet: <Tablet className="h-3 w-3" />,
    desktop: <Monitor className="h-3 w-3" />,
};

function formatDate(iso: string): string {
    // La DB retourne des timestamps sans timezone — on force UTC avec 'Z'
    const utc = iso.includes('Z') || iso.includes('+') ? iso : iso.replace(' ', 'T') + 'Z';
    return new Date(utc).toLocaleString('fr-FR', {
        day: '2-digit', month: '2-digit',
        hour: '2-digit', minute: '2-digit',
    });
}

function parseReferrerHost(ref: string | null): string {
    if (!ref) return 'Direct';
    try {
        const u = new URL(/^https?:\/\//i.test(ref) ? ref : `https://${ref}`);
        return u.hostname.replace(/^www\./, '');
    } catch {
        return ref.slice(0, 30);
    }
}

function SortIcon({ col, current, dir }: { col: SortKey; current: SortKey; dir: 'asc' | 'desc' }) {
    if (col !== current) return <ArrowUpDown className="h-3 w-3 text-zinc-600" />;
    return dir === 'asc'
        ? <ArrowUp className="h-3 w-3 text-sky-400" />
        : <ArrowDown className="h-3 w-3 text-sky-400" />;
}

interface VisitorsTableProps {
    portfolioId: string;
    initialRows: VisitorRow[];
    /** Incrémenter pour forcer un re-fetch live (depuis le parent WS) */
    refreshTrigger?: number;
}

export function VisitorsTable({ portfolioId, initialRows, refreshTrigger }: VisitorsTableProps) {
    const [rows, setRows] = useState(initialRows);
    const [sortKey, setSortKey] = useState<SortKey>('viewed_at');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
    const [, startTransition] = useTransition();

    // Refs pour capturer le tri courant sans le lister en dépendance de l'effet WS
    const sortKeyRef = useRef(sortKey);
    const sortDirRef = useRef(sortDir);
    sortKeyRef.current = sortKey;
    sortDirRef.current = sortDir;

    // Re-fetch avec le tri courant à chaque event WS (trigger incrémenté par le parent)
    useEffect(() => {
        if (!refreshTrigger) return;
        startTransition(async () => {
            try {
                const data = await getVisitors(portfolioId, sortKeyRef.current, sortDirRef.current);
                setRows(data);
            } catch { /* garder les données stale */ }
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [refreshTrigger, portfolioId]);

    const handleSort = useCallback((col: SortKey) => {
        const newDir = sortKey === col && sortDir === 'desc' ? 'asc' : 'desc';
        setSortKey(col);
        setSortDir(newDir);
        startTransition(async () => {
            try {
                const data = await getVisitors(portfolioId, col, newDir);
                setRows(data);
            } catch { /* keep stale */ }
        });
    }, [portfolioId, sortKey, sortDir]);

    const cols: { key: SortKey; label: string }[] = [
        { key: 'viewed_at', label: 'Dernière visite' },
        { key: 'country_code', label: 'Pays' },
        { key: 'city', label: 'Ville' },
        { key: 'device_type', label: 'Appareil' },
        { key: 'browser', label: 'Navigateur' },
        { key: 'referrer', label: 'Source' },
    ];

    if (rows.length === 0) {
        return (
            <p className="text-xs text-zinc-500 italic py-3">Aucune visite sur les 30 derniers jours.</p>
        );
    }

    return (
        <div className="overflow-x-auto rounded-xl border border-dashed border-zinc-700">
            <table className="w-full text-xs">
                <thead>
                    <tr className="border-b border-zinc-800">
                        {cols.map((col) => (
                            <th
                                key={col.key}
                                className="px-3 py-2.5 text-left font-mono text-[9px] uppercase tracking-widest text-zinc-600 cursor-pointer select-none hover:text-zinc-400 whitespace-nowrap"
                                onClick={() => handleSort(col.key)}
                            >
                                <span className="flex items-center gap-1">
                                    {col.label}
                                    <SortIcon col={col.key} current={sortKey} dir={sortDir} />
                                </span>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, i) => (
                        <tr
                            key={i}
                            className="border-b border-zinc-800/60 hover:bg-zinc-800/20 transition-colors"
                        >
                            <td className="px-3 py-2 text-zinc-400 font-mono whitespace-nowrap">
                                {formatDate(row.viewed_at)}
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap">
                                {row.country_code ? (
                                    <span className="flex items-center gap-1.5">
                                        <img
                                            src={`${FLAG_BASE}${row.country_code.toLowerCase()}.png`}
                                            alt={row.country_code}
                                            width={16} height={12}
                                            className="rounded-sm"
                                        />
                                        <span className="text-zinc-300">{row.country_code}</span>
                                    </span>
                                ) : (
                                    <span className="text-zinc-600">—</span>
                                )}
                            </td>
                            <td className="px-3 py-2 text-zinc-300 max-w-[120px] truncate">
                                {row.city ?? <span className="text-zinc-600">—</span>}
                            </td>
                            <td className="px-3 py-2">
                                <span className="flex items-center gap-1 text-zinc-400">
                                    {DEVICE_ICONS[row.device_type ?? 'desktop'] ?? DEVICE_ICONS.desktop}
                                    <span className="capitalize">{row.device_type ?? 'desktop'}</span>
                                </span>
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap">
                                <span className="flex items-center gap-1.5 text-zinc-300">
                                    <span>{BROWSER_ICONS[row.browser ?? 'Other'] ?? '🌐'}</span>
                                    <span>{row.browser ?? '—'}</span>
                                </span>
                            </td>
                            <td className="px-3 py-2 text-zinc-400 max-w-[140px] truncate">
                                {parseReferrerHost(row.referrer)}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <p className="px-3 py-2 font-mono text-[9px] text-zinc-700">
                {rows.length} visiteur{rows.length > 1 ? 's' : ''} · 30 derniers jours
            </p>
        </div>
    );
}
