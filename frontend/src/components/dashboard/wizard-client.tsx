'use client';

import { useActionState, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Check, ArrowRight, ArrowLeft, Diamond, Layers, Circle, Square, ExternalLink } from 'lucide-react';
import type { ReactNode } from 'react';
import { createPortfolioAction, type PortfolioActionState } from '@/features/builder/actions';
import { generateTemplate } from '@/lib/templates';
import type { TemplateInfo } from '@/lib/templates';
import { StaticPortfolioRenderer } from '@/components/portfolio/static-renderer';

const TEMPLATE_ICON_MAP: Record<string, ReactNode> = {
    diamond: <Diamond className="h-5 w-5" />,
    layers: <Layers className="h-5 w-5" />,
    circle: <Circle className="h-5 w-5" />,
    square: <Square className="h-5 w-5" />,
};

const STEPS = [
    { id: 1, label: 'Nom' },
    { id: 2, label: 'Template' },
    { id: 3, label: 'Création' },
] as const;

const initialState: PortfolioActionState = {};

/** Mini preview d'un template — rendu statique scalé */
function TemplatePreview({ templateId }: { templateId: string }) {
    const json = useMemo(() => JSON.stringify(generateTemplate(templateId)), [templateId]);
    const containerRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(0.42);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        const update = () => setScale(el.offsetWidth / 640);
        update();
        const ro = new ResizeObserver(update);
        ro.observe(el);
        return () => ro.disconnect();
    }, []);

    return (
        <div ref={containerRef} className="relative h-full w-full overflow-hidden">
            <div
                className="pointer-events-none absolute left-1/2 top-0"
                style={{
                    width: 640,
                    transform: `translateX(-50%) scale(${scale})`,
                    transformOrigin: 'top center',
                }}
            >
                <StaticPortfolioRenderer craftStateJson={json} compact />
            </div>
        </div>
    );
}

interface WizardClientProps {
    templates: TemplateInfo[];
    isPremium: boolean;
}

export function WizardClient({ templates, isPremium }: WizardClientProps) {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [title, setTitle] = useState('');
    const [selectedTemplate, setSelectedTemplate] = useState(templates[0]?.id ?? 'beauty');
    const [state, formAction, isPending] = useActionState(createPortfolioAction, initialState);

    useEffect(() => {
        if (state.portfolioId) {
            router.push(`/builder/${state.portfolioId}`);
        }
    }, [state.portfolioId, router]);

    const canNext = step === 1 ? title.trim().length >= 2 : true;
    const titleTooShort = step === 1 && title.trim().length > 0 && title.trim().length < 2;

    return (
        <div className="mx-auto max-w-2xl space-y-8">
            {/* Header */}
            <div>
                <p className="font-mono text-[9px] uppercase tracking-widest text-zinc-600 mb-1">
                    DASHBOARD // NOUVEAU PORTFOLIO
                </p>
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Créer un portfolio</h1>
                <p className="mt-1 text-sm text-zinc-500">
                    En quelques étapes, crée ton portfolio UGC.
                </p>
            </div>

            {/* Stepper */}
            <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto scrollbar-none">
                {STEPS.map((s, i) => (
                    <div key={s.id} className="flex items-center gap-1 sm:gap-2">
                        {i > 0 && (
                            <div className={`h-px w-4 sm:w-8 ${step > s.id - 1 ? 'bg-[#ad7b60]/40' : 'bg-zinc-300 dark:bg-zinc-800'}`} />
                        )}
                        <button
                            type="button"
                            onClick={() => { if (s.id < step) setStep(s.id); }}
                            disabled={s.id > step}
                            className={`flex items-center gap-1.5 sm:gap-2 rounded-full border border-dashed px-2.5 sm:px-3 py-1 text-xs font-medium transition-colors whitespace-nowrap ${step === s.id
                                ? 'border-[#ad7b60]/50 bg-[#ad7b60]/10 text-[#d4a485]'
                                : step > s.id
                                    ? 'border-[#ad7b60]/20 bg-[#ad7b60]/5 text-[#ad7b60]/60 cursor-pointer hover:text-[#d4a485]'
                                    : 'border-zinc-300 dark:border-zinc-800 text-zinc-400 dark:text-zinc-600 cursor-not-allowed'
                                }`}
                        >
                            <span className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${step === s.id ? 'bg-[#ad7b60] text-zinc-950' : step > s.id ? 'bg-[#ad7b60]/20 text-[#ad7b60]' : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-600'}`}>
                                {step > s.id ? <Check className="h-3 w-3" /> : s.id}
                            </span>
                            {s.label}
                        </button>
                    </div>
                ))}
            </nav>

            {/* ── Step 1: Nom ── */}
            {step === 1 && (
                <div className="rounded-xl border border-dashed border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/40 p-6 space-y-5">
                    <div>
                        <p className="font-mono text-[9px] uppercase tracking-widest text-zinc-600 mb-3">
                            ÉTAPE 1 // NOM DU PORTFOLIO
                        </p>
                        <p className="text-sm text-zinc-400 mb-4">
                            Choisis un nom pour ton portfolio. Tu pourras le modifier plus tard.
                        </p>
                    </div>

                    <div>
                        <label htmlFor="title" className="block text-xs text-zinc-600 dark:text-zinc-400 mb-1">
                            Nom du portfolio <span className="text-red-400">*</span>
                        </label>
                        <input
                            id="title"
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter' && canNext) setStep(2); }}
                            placeholder="Ex : Portfolio UGC Beauté"
                            maxLength={80}
                            autoFocus
                            className={`w-full rounded-lg border border-dashed bg-zinc-50 dark:bg-zinc-900 px-4 py-3 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-1 transition-colors ${titleTooShort
                                ? 'border-red-500/50 focus:border-red-500/50 focus:ring-red-500/20'
                                : 'border-zinc-300 dark:border-zinc-700 focus:border-[#ad7b60]/50 focus:ring-[#ad7b60]/20'
                                }`}
                        />
                        {titleTooShort ? (
                            <p className="mt-1.5 text-[10px] text-red-400">
                                Le nom doit faire au moins 2 caractères.
                            </p>
                        ) : (
                            <p className="mt-1.5 text-[10px] text-zinc-600">
                                {title.trim().length === 0
                                    ? 'Minimum 2 caractères requis pour continuer.'
                                    : `${title.trim().length}/80 caractères · Slug URL généré automatiquement.`}
                            </p>
                        )}
                    </div>

                    <div className="flex items-center justify-between pt-2">
                        <Link href="/dashboard" className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">
                            Annuler
                        </Link>
                        <button
                            type="button"
                            onClick={() => { if (canNext) setStep(2); }}
                            disabled={!canNext}
                            className="rounded-lg bg-[#ad7b60] px-6 py-2.5 text-sm font-semibold text-zinc-950 hover:bg-[#d4a485] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            Suivant <ArrowRight className="inline h-3 w-3" />
                        </button>
                    </div>
                </div>
            )}

            {/* ── Step 2: Template ── */}
            {step === 2 && (
                <div className="space-y-5">
                    <div className="rounded-xl border border-dashed border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/40 p-6">
                        <p className="font-mono text-[9px] uppercase tracking-widest text-zinc-600 mb-3">
                            ÉTAPE 2 // CHOISIS UN TEMPLATE
                        </p>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-5">
                            Sélectionne un template adapté à ta niche. Clique sur{' '}
                            <span className="text-[#d4a485]">Aperçu</span> pour le voir avec tes données.
                        </p>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            {templates.map((tmpl) => {
                                const isLocked = tmpl.premium && !isPremium;
                                return (
                                    <button
                                        key={tmpl.id}
                                        type="button"
                                        onClick={() => !isLocked && setSelectedTemplate(tmpl.id)}
                                        className={`group relative flex flex-col rounded-xl border overflow-hidden text-left transition-all ${isLocked
                                            ? 'border-dashed border-zinc-800 opacity-60 cursor-not-allowed'
                                            : selectedTemplate === tmpl.id
                                                ? 'border-[#ad7b60] ring-1 ring-[#ad7b60]/30'
                                                : 'border-dashed border-zinc-700 hover:border-zinc-500'
                                            }`}
                                    >
                                        {/* Preview */}
                                        <div className="relative w-full overflow-hidden border-b border-dashed border-zinc-800 bg-zinc-950">
                                            <div className="h-40">
                                                <TemplatePreview templateId={tmpl.id} />
                                            </div>
                                            <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-zinc-950 to-transparent" />
                                            {/* Preview button */}
                                            <a
                                                href={`/preview/template/${tmpl.id}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                onClick={(e) => e.stopPropagation()}
                                                className="absolute right-2 top-2 hidden group-hover:flex items-center gap-1 rounded-lg border border-dashed border-zinc-700 bg-zinc-950/80 px-2 py-1 text-[10px] text-zinc-300 backdrop-blur-sm hover:border-[#ad7b60]/50 hover:text-[#d4a485] transition-colors"
                                            >
                                                <ExternalLink className="h-3 w-3" />
                                                Aperçu
                                            </a>
                                            {isLocked && (
                                                <div className="absolute inset-0 flex items-center justify-center bg-zinc-950/60">
                                                    <span className="rounded-full bg-amber-400/20 border border-dashed border-amber-400/40 px-3 py-1 text-[10px] font-mono text-amber-400">
                                                        PRO
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div className={`flex flex-col gap-2 p-4 ${selectedTemplate === tmpl.id ? 'bg-[#ad7b60]/5' : 'bg-zinc-50 dark:bg-zinc-900/30'}`}>
                                            <div className="flex items-center gap-2">
                                                <span className={`${selectedTemplate === tmpl.id ? 'text-[#ad7b60]' : 'text-zinc-600'}`}>
                                                    {TEMPLATE_ICON_MAP[tmpl.icon] ?? <Diamond className="h-5 w-5" />}
                                                </span>
                                                <span className={`text-sm font-semibold ${selectedTemplate === tmpl.id ? 'text-white' : 'text-zinc-300'}`}>
                                                    {tmpl.name}
                                                </span>
                                                {selectedTemplate === tmpl.id && (
                                                    <span className="ml-auto text-[#ad7b60] text-[10px] flex items-center gap-0.5">
                                                        <Check className="h-3 w-3" /> sélectionné
                                                    </span>
                                                )}
                                                {tmpl.premium && (
                                                    <span className="ml-auto rounded-full bg-amber-400/10 border border-dashed border-amber-400/30 px-1.5 py-0.5 text-[9px] text-amber-400 font-mono">
                                                        PRO
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-[10px] leading-relaxed text-zinc-500 line-clamp-2">
                                                {tmpl.description}
                                            </p>
                                            {/* Niches */}
                                            <div className="flex gap-1 flex-wrap">
                                                {tmpl.niches.slice(0, 3).map((n) => (
                                                    <span key={n} className="rounded-full border border-dashed border-zinc-800 px-1.5 py-0.5 text-[9px] text-zinc-600">
                                                        {n}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <button type="button" onClick={() => setStep(1)} className="text-sm text-zinc-500 hover:text-white transition-colors">
                            <ArrowLeft className="inline h-3 w-3" /> Retour
                        </button>
                        <button type="button" onClick={() => setStep(3)} className="rounded-lg bg-[#ad7b60] px-6 py-2.5 text-sm font-semibold text-zinc-950 hover:bg-[#d4a485] transition-colors">
                            Suivant <ArrowRight className="inline h-3 w-3" />
                        </button>
                    </div>
                </div>
            )}

            {/* ── Step 3: Confirmation ── */}
            {step === 3 && (
                <div className="rounded-xl border border-dashed border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/40 p-6 space-y-5">
                    <div>
                        <p className="font-mono text-[9px] uppercase tracking-widest text-zinc-600 mb-3">
                            ÉTAPE 3 // CONFIRMATION
                        </p>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">Vérifie les infos puis lance la création.</p>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="rounded-lg border border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-950/50 p-4">
                            <p className="font-mono text-[9px] uppercase tracking-widest text-zinc-600 mb-2">Nom</p>
                            <p className="text-sm font-semibold text-zinc-900 dark:text-white">{title}</p>
                        </div>
                        <div className="rounded-lg border border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-950/50 p-4">
                            <p className="font-mono text-[9px] uppercase tracking-widest text-zinc-600 mb-2">Template</p>
                            <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                                {templates.find((t) => t.id === selectedTemplate)?.name ?? 'Beauty & Cosmétique'}
                            </p>
                        </div>
                    </div>

                    {state.error && (
                        <div className="rounded-lg border border-dashed border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                            {state.error}
                        </div>
                    )}

                    <form action={formAction} className="flex items-center justify-between pt-2">
                        <input type="hidden" name="title" value={title} />
                        <input type="hidden" name="templateId" value={selectedTemplate} />

                        <button type="button" onClick={() => setStep(2)} className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">
                            <ArrowLeft className="inline h-3 w-3" /> Retour
                        </button>
                        <button
                            type="submit"
                            disabled={isPending}
                            className="rounded-lg bg-[#ad7b60] px-6 py-2.5 text-sm font-semibold text-zinc-950 hover:bg-[#d4a485] transition-colors disabled:opacity-50"
                        >
                            {isPending ? 'Création...' : 'Créer mon portfolio'}
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}
