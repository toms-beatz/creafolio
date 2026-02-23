'use client';

import type { ReactNode } from 'react';
import { useActionState, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Diamond, Layers, Circle, Square } from 'lucide-react';
import { createPortfolioAction, type PortfolioActionState } from '@/features/builder/actions';
import { TEMPLATES, generateTemplate } from '@/lib/templates';
import { StaticPortfolioRenderer } from '@/components/portfolio/static-renderer';

const TEMPLATE_ICON_MAP: Record<string, ReactNode> = {
    diamond: <Diamond className="h-6 w-6" />,
    layers: <Layers className="h-6 w-6" />,
    circle: <Circle className="h-6 w-6" />,
    square: <Square className="h-6 w-6" />,
};
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

const initialState: PortfolioActionState = {};

interface CreatePortfolioFormProps {
    onClose: () => void;
}

/** Mini preview d'un template — rendu statique scalé */
function TemplatePreview({ templateId }: { templateId: string }) {
    const json = useMemo(() => JSON.stringify(generateTemplate(templateId)), [templateId]);

    if (templateId === 'blank') {
        return (
            <div className="flex h-full items-center justify-center">
                <div className="flex flex-col items-center gap-1 text-zinc-700">
                    <Square className="h-6 w-6" />
                    <span className="text-[9px] font-mono uppercase tracking-wider">Canvas vide</span>
                </div>
            </div>
        );
    }

    return (
        <div className="relative h-full w-full overflow-hidden">
            {/* Le rendu complet est à 640px de large, on le scale pour tenir dans ~280px */}
            <div
                className="pointer-events-none origin-top-left"
                style={{
                    width: 640,
                    transform: 'scale(0.42)',
                    transformOrigin: 'top left',
                }}
            >
                <StaticPortfolioRenderer craftStateJson={json} compact />
            </div>
        </div>
    );
}

export function CreatePortfolioForm({ onClose }: CreatePortfolioFormProps) {
    const router = useRouter();
    const [state, formAction, isPending] = useActionState(createPortfolioAction, initialState);
    const [selectedTemplate, setSelectedTemplate] = useState('classic');

    useEffect(() => {
        if (state.portfolioId) {
            router.push(`/builder/${state.portfolioId}`);
        }
    }, [state.portfolioId, router]);

    return (
        <form action={formAction} className="flex flex-col gap-5">
            {/* ── Titre ───────────────────────────────────────── */}
            <div className="flex flex-col gap-1">
                <Label htmlFor="title">Nom du portfolio</Label>
                <Input
                    id="title"
                    name="title"
                    placeholder="Ex : Portfolio UGC Beauté"
                    maxLength={80}
                    autoFocus
                />
            </div>

            {/* ── Template picker ──────────────────────────────── */}
            <div className="flex flex-col gap-2">
                <Label>Choisis un template</Label>
                <input type="hidden" name="templateId" value={selectedTemplate} />

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {TEMPLATES.map((tmpl) => (
                        <button
                            key={tmpl.id}
                            type="button"
                            onClick={() => setSelectedTemplate(tmpl.id)}
                            className={`group relative flex flex-col rounded-xl border overflow-hidden text-left transition-all ${selectedTemplate === tmpl.id
                                ? 'border-sky-400 ring-1 ring-sky-400/30'
                                : 'border-dashed border-zinc-700 hover:border-zinc-500'
                                }`}
                        >
                            {/* Preview miniature + nom à droite */}
                            <div className="relative flex flex-row overflow-hidden bg-zinc-950">
                                {/* Preview — 42% gauche */}
                                <div className="relative w-1/2 shrink-0 overflow-hidden border-r border-dashed border-zinc-800">
                                    <div className="h-44">
                                        <TemplatePreview templateId={tmpl.id} />
                                    </div>
                                    <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-zinc-950 to-transparent" />
                                </div>

                                {/* Nom du template — 58% droite */}
                                <div className="flex flex-1 flex-col items-center justify-center gap-2 p-4">
                                    <span className={`${selectedTemplate === tmpl.id ? 'text-sky-400' : 'text-zinc-600'}`}>
                                        {TEMPLATE_ICON_MAP[tmpl.icon] ?? <Diamond className="h-6 w-6" />}
                                    </span>
                                    <span className={`text-sm font-semibold text-center ${selectedTemplate === tmpl.id ? 'text-white' : 'text-zinc-300'}`}>
                                        {tmpl.name}
                                    </span>
                                    {selectedTemplate === tmpl.id && (
                                        <span className="text-sky-400 text-[10px] flex items-center gap-0.5"><Check className="h-3 w-3" /> sélectionné</span>
                                    )}
                                    {tmpl.premium && (
                                        <span className="rounded-full bg-amber-400/10 border border-dashed border-amber-400/30 px-1.5 py-0.5 text-[9px] text-amber-400 font-mono">
                                            PRO
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Info en bas */}
                            <div className={`flex flex-col gap-1.5 border-t border-dashed border-zinc-800 p-3 ${selectedTemplate === tmpl.id ? 'bg-sky-400/5' : 'bg-zinc-900/30'
                                }`}>
                                <p className="text-[10px] leading-relaxed text-zinc-500 line-clamp-2">
                                    {tmpl.description}
                                </p>
                                {tmpl.blocks.length > 0 && (
                                    <p className={`text-[9px] font-mono ${selectedTemplate === tmpl.id ? 'text-sky-400/60' : 'text-zinc-700'
                                        }`}>
                                        {tmpl.blocks.length} blocs
                                    </p>
                                )}
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Erreur ──────────────────────────────────────── */}
            {state.error && (
                <div className="rounded-lg border border-dashed border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                    {state.error}
                </div>
            )}

            {/* ── Actions ─────────────────────────────────────── */}
            <div className="flex items-center gap-2 pt-1">
                <Button
                    type="submit"
                    loading={isPending}
                    className="flex-1 bg-sky-400 text-zinc-950 hover:bg-sky-300"
                >
                    Créer avec ce template
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    onClick={onClose}
                    className="text-zinc-500 hover:text-white"
                >
                    Annuler
                </Button>
            </div>
        </form>
    );
}
