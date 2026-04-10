'use client';

import { Plus, Trash2 } from 'lucide-react';
import { SectionStylePanel } from './section-style-panel';

interface Stat {
    value: string;
    label: string;
}

interface StatsProps {
    title?: string;
    stats?: Stat[];
    statsColumns?: number;
}

interface StatsSectionProps {
    props: Record<string, unknown>;
    onChange: (patch: Partial<StatsProps>) => void;
}

function sanitizeText(value: string): string {
    return value.replace(/<[^>]*>/g, '').slice(0, 200);
}

export function StatsSection({ props, onChange }: StatsSectionProps) {
    const title = (props.title as string) ?? '';
    const stats = (props.stats as Stat[]) ?? [];
    const statsColumns = (props.statsColumns as number) ?? 3;

    function updateStat(index: number, field: keyof Stat, value: string) {
        const updated = stats.map((s, i) =>
            i === index ? { ...s, [field]: sanitizeText(value) } : s,
        );
        onChange({ stats: updated });
    }

    function addStat() {
        if (stats.length >= 8) return;
        onChange({ stats: [...stats, { value: '', label: '' }] });
    }

    function removeStat(index: number) {
        onChange({ stats: stats.filter((_, i) => i !== index) });
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-zinc-400">Titre de section</label>
                <input
                    type="text"
                    value={title}
                    maxLength={80}
                    placeholder="Mes chiffres"
                    onChange={(e) => onChange({ title: sanitizeText(e.target.value) })}
                    className="rounded-lg border border-dashed border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-sky-500 focus:outline-none transition-colors"
                />
            </div>

            <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-zinc-400">Colonnes</label>
                <div className="flex gap-2">
                    {[2, 3, 4].map((n) => (
                        <button
                            key={n}
                            onClick={() => onChange({ statsColumns: n })}
                            className={`rounded-lg border border-dashed px-3 py-1.5 text-xs font-medium transition-colors ${statsColumns === n
                                ? 'border-sky-500 bg-sky-950 text-sky-400'
                                : 'border-zinc-700 bg-zinc-900 text-zinc-400 hover:border-zinc-600'
                                }`}
                        >
                            {n} col
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex flex-col gap-2">
                <label className="text-xs font-medium text-zinc-400">Statistiques</label>
                {stats.map((stat, i) => (
                    <div key={i} className="flex items-start gap-2">
                        <div className="flex flex-1 gap-2">
                            <input
                                type="text"
                                value={stat.value}
                                maxLength={20}
                                placeholder="50+"
                                onChange={(e) => updateStat(i, 'value', e.target.value)}
                                className="w-20 shrink-0 rounded-lg border border-dashed border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-sky-500 focus:outline-none transition-colors"
                            />
                            <input
                                type="text"
                                value={stat.label}
                                maxLength={60}
                                placeholder="Projets UGC"
                                onChange={(e) => updateStat(i, 'label', e.target.value)}
                                className="flex-1 rounded-lg border border-dashed border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-sky-500 focus:outline-none transition-colors"
                            />
                        </div>
                        <button
                            onClick={() => removeStat(i)}
                            className="mt-2 text-zinc-600 hover:text-red-400 transition-colors"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </div>
                ))}

                <button
                    onClick={addStat}
                    disabled={stats.length >= 8}
                    className="flex items-center gap-1.5 rounded-lg border border-dashed border-zinc-700 bg-zinc-900 px-3 py-2 text-xs text-zinc-400 hover:bg-zinc-800 disabled:opacity-40 transition-colors"
                >
                    <Plus className="h-3.5 w-3.5" />
                    Ajouter une stat
                </button>
                <span className="text-[10px] text-zinc-600">{stats.length}/8 stats max</span>
            </div>
            <SectionStylePanel props={props} onChange={onChange} />
        </div>
    );
}
