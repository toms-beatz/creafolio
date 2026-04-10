'use client';

import { useEffect, useMemo, useRef, useState, useTransition, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    ArrowRight,
    FolderOpen,
    ExternalLink,
    Check,
    Square,
    Eye,
    EyeOff,
    MoreVertical,
    Pencil,
    Globe,
    GlobeLock,
    Link2,
    Trash2,
    ScanEye,
    Loader2,
} from 'lucide-react';
import { deletePortfolioAction, togglePublishAction } from '@/features/builder/actions';
import { toggleAllowLandingAction } from '@/features/settings/actions';
import { StaticPortfolioRenderer } from '@/components/portfolio/static-renderer';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

type Portfolio = {
    id: string;
    title: string;
    slug: string;
    status: string;
    published_at: string | null;
    updated_at: string;
    craft_state: unknown;
    allow_landing: boolean;
};

interface PortfolioListProps {
    portfolios: Portfolio[];
    isPremium: boolean;
    maxPortfolios: number;
}

const STATUS_MAP: Record<string, { label: string; color: string }> = {
    draft: { label: 'Brouillon', color: 'text-zinc-600 dark:text-zinc-500 bg-zinc-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700' },
    published: { label: 'Publié', color: 'text-[#d4a485] bg-[#ad7b60]/10 border-[#ad7b60]/30' },
    suspended: { label: 'Suspendu', color: 'text-amber-400 bg-amber-400/10 border-amber-400/30' },
    deleted: { label: 'Supprimé', color: 'text-red-400 bg-red-400/10 border-red-400/30' },
};

/** Mini preview d'un portfolio — rendu statique scalé, centré, 100% largeur */
function PortfolioPreview({ craftState }: { craftState: unknown }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(0.35);
    const json = useMemo(() => {
        if (!craftState) return null;
        try {
            return typeof craftState === 'string' ? craftState : JSON.stringify(craftState);
        } catch {
            return null;
        }
    }, [craftState]);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        const update = () => setScale(el.offsetWidth / 640);
        update();
        const ro = new ResizeObserver(update);
        ro.observe(el);
        return () => ro.disconnect();
    }, []);

    if (!json) {
        return (
            <div ref={containerRef} className="flex h-full items-center justify-center bg-zinc-950">
                <div className="flex flex-col items-center gap-1 text-zinc-700">
                    <Square className="h-5 w-5" />
                    <span className="text-[8px] font-mono uppercase tracking-wider">Vide</span>
                </div>
            </div>
        );
    }

    return (
        <div ref={containerRef} className="relative h-full w-full overflow-hidden bg-zinc-950">
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
            <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-zinc-900/80 to-transparent" />
        </div>
    );
}

export function PortfolioList({ portfolios, isPremium, maxPortfolios }: PortfolioListProps) {
    const [deleting, setDeleting] = useState<string | null>(null);
    const [publishing, setPublishing] = useState<string | null>(null);
    const [copied, setCopied] = useState<string | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);
    const [landingStates, setLandingStates] = useState<Record<string, boolean>>(
        () => Object.fromEntries(portfolios.map((p) => [p.id, p.allow_landing]))
    );
    const [isPendingLanding, startLandingTransition] = useTransition();
    const router = useRouter();

    const canCreate = portfolios.length < maxPortfolios;

    const handleDelete = useCallback(async () => {
        if (!deleteTarget) return;
        setDeleting(deleteTarget.id);
        await deletePortfolioAction(deleteTarget.id);
        setDeleteTarget(null);
        router.refresh();
        setDeleting(null);
    }, [deleteTarget, router]);

    const handleTogglePublish = async (id: string, currentStatus: string) => {
        setPublishing(id);
        const { error, warning } = await togglePublishAction(id, currentStatus !== 'published');
        if (error || warning) {
            // Will be replaced with toast later
        }
        router.refresh();
        setPublishing(null);
    };

    const handleCopyLink = async (slug: string, id: string) => {
        const url = `${window.location.origin}/${slug}`;
        await navigator.clipboard.writeText(url);
        setCopied(id);
        setTimeout(() => setCopied(null), 2000);
    };

    const handleToggleLanding = (portfolioId: string) => {
        startLandingTransition(async () => {
            const result = await toggleAllowLandingAction(portfolioId);
            if (!result.error) {
                setLandingStates((prev) => ({ ...prev, [portfolioId]: !prev[portfolioId] }));
            }
            router.refresh();
        });
    };

    return (
        <section>
            {/* Section header */}
            <div className="mb-5 flex items-center justify-between">
                <div>
                    <h2 className="text-base font-semibold text-zinc-900 dark:text-white">Mes portfolios</h2>
                    <p className="text-xs text-zinc-600 mt-0.5">
                        {portfolios.length}/{maxPortfolios}{' '}
                        {isPremium ? '(Premium)' : '(Free — 1 max)'}
                    </p>
                </div>

                {canCreate && (
                    <Link
                        href="/dashboard/new"
                        className="rounded-lg border border-dashed border-[#ad7b60]/50 dark:border-[#ad7b60]/40 bg-[#ad7b60]/5 dark:bg-[#ad7b60]/5 px-4 py-2 text-xs font-medium text-sky-600 dark:text-[#d4a485] hover:bg-[#ad7b60]/10 dark:hover:bg-[#ad7b60]/10 transition-colors"
                    >
                        + Nouveau portfolio
                    </Link>
                )}

                {!canCreate && !isPremium && (
                    <Link
                        href="/pricing"
                        className="rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700 px-4 py-2 text-xs text-zinc-500 hover:border-[#ad7b60]/50 dark:hover:border-[#ad7b60]/40 hover:text-sky-600 dark:hover:text-[#ad7b60] transition-colors"
                    >
                        Passer Premium <ArrowRight className="inline h-3 w-3" />
                    </Link>
                )}
            </div>

            {/* Empty state */}
            {portfolios.length === 0 && (
                <div className="rounded-xl border border-dashed border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/30 py-14 text-center">
                    <FolderOpen className="h-8 w-8 text-zinc-400 dark:text-zinc-700 mb-3 mx-auto" />
                    <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Aucun portfolio pour l&apos;instant</p>
                    <p className="mt-1 text-xs text-zinc-600">Crée ton premier portfolio en quelques minutes.</p>
                    <Link
                        href="/dashboard/new"
                        className="mt-5 inline-block rounded-lg bg-[#ad7b60] px-5 py-2 text-sm font-semibold text-zinc-950 hover:bg-[#d4a485] transition-colors"
                    >
                        Créer mon portfolio
                    </Link>
                </div>
            )}

            {/* Portfolio cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {portfolios.map((p) => {
                    const statusInfo = STATUS_MAP[p.status] ?? STATUS_MAP.draft;
                    const isPublished = p.status === 'published';
                    const updatedDate = new Date(p.updated_at).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                    });

                    return (
                        <div
                            key={p.id}
                            className="group relative flex flex-col rounded-xl border border-dashed border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/40 overflow-hidden hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors"
                        >
                            {/* ── Preview ──────────────────────── */}
                            <div className="relative h-40 border-b border-dashed border-zinc-100 dark:border-zinc-800 overflow-hidden">
                                <PortfolioPreview craftState={p.craft_state} />

                                {/* Hover overlay → Éditer */}
                                <Link
                                    href={`/builder/${p.id}`}
                                    className="absolute inset-0 flex items-center justify-center bg-zinc-950/60 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <span className="rounded-lg bg-[#ad7b60] px-4 py-1.5 text-xs font-semibold text-zinc-950">
                                        Éditer
                                    </span>
                                </Link>
                            </div>

                            {/* ── Content ──────────────────────── */}
                            <div className="flex flex-col flex-1 p-4">
                                {/* Header row: title + status + context menu */}
                                <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-semibold text-zinc-900 dark:text-white truncate">{p.title}</p>
                                        <p className="mt-0.5 font-mono text-[10px] text-zinc-600 truncate">
                                            creafolio.fr/{p.slug}
                                        </p>
                                    </div>

                                    {/* ── Context menu ────────── */}
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button className="rounded-md p-1 text-zinc-400 dark:text-zinc-600 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                                                <MoreVertical className="h-4 w-4" />
                                            </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent
                                            align="end"
                                            className="w-48 border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900"
                                        >
                                            <DropdownMenuItem asChild>
                                                <Link href={`/builder/${p.id}`} className="gap-2">
                                                    <Pencil className="h-4 w-4" /> Éditer
                                                </Link>
                                            </DropdownMenuItem>

                                            <DropdownMenuItem asChild>
                                                <Link href={`/preview/${p.id}`} target="_blank" className="gap-2">
                                                    <ScanEye className="h-4 w-4" /> Prévisualiser
                                                </Link>
                                            </DropdownMenuItem>

                                            {isPublished && (
                                                <DropdownMenuItem asChild>
                                                    <a href={`/${p.slug}`} target="_blank" rel="noopener noreferrer" className="gap-2">
                                                        <ExternalLink className="h-4 w-4" /> Voir en ligne
                                                    </a>
                                                </DropdownMenuItem>
                                            )}

                                            {isPublished && (
                                                <DropdownMenuItem
                                                    onClick={() => void handleCopyLink(p.slug, p.id)}
                                                    className="gap-2"
                                                >
                                                    {copied === p.id ? (
                                                        <><Check className="h-4 w-4 text-emerald-400" /> Copié !</>
                                                    ) : (
                                                        <><Link2 className="h-4 w-4" /> Copier le lien</>
                                                    )}
                                                </DropdownMenuItem>
                                            )}

                                            <DropdownMenuSeparator className="bg-zinc-200 dark:bg-zinc-800" />

                                            <DropdownMenuItem
                                                onClick={() => void handleTogglePublish(p.id, p.status)}
                                                disabled={publishing === p.id}
                                                className="gap-2"
                                            >
                                                {isPublished ? (
                                                    <><GlobeLock className="h-4 w-4" /> Dépublier</>
                                                ) : (
                                                    <><Globe className="h-4 w-4" /> Publier</>
                                                )}
                                            </DropdownMenuItem>

                                            {isPublished && (
                                                <DropdownMenuItem
                                                    onClick={() => handleToggleLanding(p.id)}
                                                    disabled={isPendingLanding}
                                                    className="gap-2"
                                                >
                                                    {landingStates[p.id] ? (
                                                        <><EyeOff className="h-4 w-4" /> Retirer de la page d&apos;accueil</>
                                                    ) : (
                                                        <><Eye className="h-4 w-4" /> Mettre sur la page d&apos;accueil</>
                                                    )}
                                                </DropdownMenuItem>
                                            )}

                                            <DropdownMenuSeparator className="bg-zinc-200 dark:bg-zinc-800" />

                                            <DropdownMenuItem
                                                onClick={() => setDeleteTarget({ id: p.id, title: p.title })}
                                                className="gap-2 text-red-400 focus:text-red-400 focus:bg-red-400/10"
                                            >
                                                <Trash2 className="h-4 w-4" /> Supprimer
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>

                                {/* ── Meta row ────────────────── */}
                                <div className="mt-3 flex items-center gap-2 flex-wrap">
                                    <span className={`rounded-full border border-dashed px-2 py-0.5 font-mono text-[9px] uppercase tracking-wide ${statusInfo.color}`}>
                                        {statusInfo.label}
                                    </span>

                                    {isPublished && landingStates[p.id] && (
                                        <span className="flex items-center gap-1 rounded-full border border-dashed border-[#ad7b60]/30 bg-[#ad7b60]/5 px-2 py-0.5 text-[9px] text-[#ad7b60]">
                                            <Eye className="h-2.5 w-2.5" /> Page d&apos;accueil
                                        </span>
                                    )}
                                </div>

                                {/* ── Footer ──────────────────── */}
                                <div className="mt-auto pt-3">
                                    <p className="text-[10px] text-zinc-700">
                                        Modifié le {updatedDate}
                                    </p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* ── Delete confirmation modal ─────────────── */}
            <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
                <DialogContent className="border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-zinc-900 dark:text-white">Supprimer le portfolio</DialogTitle>
                        <DialogDescription className="text-zinc-600 dark:text-zinc-400">
                            Tu es sur le point de supprimer{' '}
                            <span className="font-medium text-zinc-800 dark:text-zinc-200">&laquo;&nbsp;{deleteTarget?.title}&nbsp;&raquo;</span>.
                            Cette action est irréversible.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <button
                            onClick={() => setDeleteTarget(null)}
                            className="rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700 px-4 py-2 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
                        >
                            Annuler
                        </button>
                        <button
                            onClick={() => void handleDelete()}
                            disabled={deleting === deleteTarget?.id}
                            className="rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                            {deleting === deleteTarget?.id ? (
                                <><Loader2 className="h-4 w-4 animate-spin" /> Suppression...</>
                            ) : (
                                <><Trash2 className="h-4 w-4" /> Supprimer</>
                            )}
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </section>
    );
}
