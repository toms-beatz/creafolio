'use client';

import { Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { SectionStylePanel } from './section-style-panel';
import { ImageUploader } from '@/components/builder/image-uploader';

interface GalleryItem {
    imageUrl?: string;
    caption?: string;
    link?: string;
}

interface GalleryProps {
    heading?: string;
    items?: GalleryItem[];
    columns?: 2 | 3;
    columnsMobile?: 1 | 2;
    columnsTablet?: 2 | 3;
    columnsDesktop?: 2 | 3;
}

interface ProjectsSectionProps {
    portfolioId: string;
    isPremium: boolean;
    props: Record<string, unknown>;
    viewport?: 'desktop' | 'tablet' | 'mobile';
    onChange: (patch: Partial<GalleryProps>) => void;
}

const FREE_LIMIT = 4;
const PREMIUM_LIMIT = 20;

function sanitizeText(value: string): string {
    return value.replace(/<[^>]*>/g, '').slice(0, 200);
}

export function ProjectsSection({ portfolioId, isPremium, props, viewport = 'desktop', onChange }: ProjectsSectionProps) {
    const heading = (props.heading as string) ?? '';
    const items = (props.items as GalleryItem[]) ?? [];
    const columns = (props.columns as 2 | 3) ?? 3;
    const columnsMobile = (props.columnsMobile as 1 | 2) ?? 1;
    const columnsTablet = (props.columnsTablet as 2 | 3) ?? 2;
    const columnsDesktop = (props.columnsDesktop as 2 | 3) ?? columns;
    const limit = isPremium ? PREMIUM_LIMIT : FREE_LIMIT;

    // Colonnes actives selon le viewport sélectionné
    const activeCols = viewport === 'mobile' ? columnsMobile : viewport === 'tablet' ? columnsTablet : columnsDesktop;
    const colOptions: { val: 1 | 2 | 3; label: string }[] =
        viewport === 'mobile' ? [{ val: 1, label: '1 col' }, { val: 2, label: '2 col' }] :
            [{ val: 2, label: '2 col' }, { val: 3, label: '3 col' }];

    function setColsForViewport(n: 1 | 2 | 3) {
        if (viewport === 'mobile') onChange({ columnsMobile: n as 1 | 2 });
        else if (viewport === 'tablet') onChange({ columnsTablet: n as 2 | 3, columns: n as 2 | 3 });
        else onChange({ columnsDesktop: n as 2 | 3, columns: n as 2 | 3 });
    }

    function updateItem(index: number, patch: Partial<GalleryItem>) {
        const updated = items.map((item, i) => (i === index ? { ...item, ...patch } : item));
        onChange({ items: updated });
    }

    function addItem() {
        if (items.length >= limit) return;
        onChange({ items: [...items, { imageUrl: '', caption: '', link: '' }] });
    }

    function removeItem(index: number) {
        onChange({ items: items.filter((_, i) => i !== index) });
    }

    function moveItem(index: number, direction: 'up' | 'down') {
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === items.length - 1) return;
        const updated = [...items];
        const swapWith = direction === 'up' ? index - 1 : index + 1;
        [updated[index], updated[swapWith]] = [updated[swapWith], updated[index]];
        onChange({ items: updated });
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-zinc-400">Titre de section</label>
                <input
                    type="text"
                    value={heading}
                    maxLength={80}
                    placeholder="Mes projets"
                    onChange={(e) => onChange({ heading: sanitizeText(e.target.value) })}
                    className="rounded-lg border border-dashed border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-sky-500 focus:outline-none transition-colors"
                />
            </div>

            <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-zinc-400">
                    Colonnes
                    <span className="ml-1.5 rounded px-1.5 py-0.5 text-[9px] font-mono uppercase tracking-wide bg-zinc-800 text-zinc-500">
                        {viewport === 'mobile' ? 'Mobile' : viewport === 'tablet' ? 'Tablette' : 'Desktop'}
                    </span>
                </label>
                <div className="flex gap-2">
                    {colOptions.map(({ val, label }) => (
                        <button
                            key={val}
                            onClick={() => setColsForViewport(val)}
                            className={`rounded-lg border border-dashed px-3 py-1.5 text-xs font-medium transition-colors ${activeCols === val
                                ? 'border-sky-500 bg-sky-950 text-sky-400'
                                : 'border-zinc-700 bg-zinc-900 text-zinc-400 hover:border-zinc-600'
                                }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex flex-col gap-3">
                <label className="text-xs font-medium text-zinc-400">
                    Projets{' '}
                    <span className="text-zinc-600">
                        ({items.length}/{limit} — {isPremium ? 'Premium' : 'Free'})
                    </span>
                </label>

                {items.map((item, i) => (
                    <div
                        key={i}
                        className="flex flex-col gap-2 rounded-lg border border-dashed border-zinc-700 bg-zinc-900/50 p-3"
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-zinc-500">Projet {i + 1}</span>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => moveItem(i, 'up')}
                                    disabled={i === 0}
                                    className="rounded p-1 text-zinc-500 hover:text-zinc-300 disabled:opacity-30 transition-colors"
                                >
                                    <ChevronUp className="h-3.5 w-3.5" />
                                </button>
                                <button
                                    onClick={() => moveItem(i, 'down')}
                                    disabled={i === items.length - 1}
                                    className="rounded p-1 text-zinc-500 hover:text-zinc-300 disabled:opacity-30 transition-colors"
                                >
                                    <ChevronDown className="h-3.5 w-3.5" />
                                </button>
                                <button
                                    onClick={() => removeItem(i)}
                                    className="rounded p-1 text-zinc-500 hover:text-red-400 transition-colors"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        </div>

                        <input
                            type="text"
                            value={item.caption ?? ''}
                            maxLength={100}
                            placeholder="Titre du projet"
                            onChange={(e) => updateItem(i, { caption: sanitizeText(e.target.value) })}
                            className="rounded-lg border border-dashed border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-sky-500 focus:outline-none transition-colors"
                        />

                        <ImageUploader
                            currentUrl={item.imageUrl || undefined}
                            portfolioId={portfolioId}
                            label="Image"
                            className="h-24"
                            onUpload={(url) => updateItem(i, { imageUrl: url })}
                            onClear={() => updateItem(i, { imageUrl: '' })}
                        />
                        <input
                            type="url"
                            value={item.link ?? ''}
                            maxLength={300}
                            placeholder="Lien (optionnel)"
                            onChange={(e) => updateItem(i, { link: e.target.value.trim() })}
                            className="rounded-lg border border-dashed border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-sky-500 focus:outline-none transition-colors"
                        />
                    </div>
                ))}

                <button
                    onClick={addItem}
                    disabled={items.length >= limit}
                    className="flex items-center gap-1.5 rounded-lg border border-dashed border-zinc-700 bg-zinc-900 px-3 py-2 text-xs text-zinc-400 hover:bg-zinc-800 disabled:opacity-40 transition-colors"
                >
                    <Plus className="h-3.5 w-3.5" />
                    Ajouter un projet
                </button>

                {!isPremium && items.length >= FREE_LIMIT && (
                    <p className="rounded-lg bg-amber-950/30 px-3 py-2 text-xs text-amber-400">
                        Passez Premium pour ajouter jusqu&apos;à 20 projets.
                    </p>
                )}
            </div>
            <SectionStylePanel props={props} onChange={onChange} />
        </div>
    );
}
