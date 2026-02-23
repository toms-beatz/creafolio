'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { Editor, Frame, Element, useEditor } from '@craftjs/core';
import {
    ArrowLeft,
    Check,
    Loader2,
    Circle,
    XCircle,
    Monitor,
    Tablet,
    Smartphone,
    ExternalLink,
    Layers,
    Palette,
    ChevronLeft,
    Trash2,
    Eye,
    Undo2,
    Redo2,
    List,
} from 'lucide-react';
import { Toolbox } from './toolbox';
import { PropertiesPanel } from './properties-panel';
import { RenderNode } from './render-node';
import { BuilderErrorBoundary } from './builder-error-boundary';
import { useAutosave, checkLocalDraft, type SaveStatus } from './use-autosave';
import { togglePublishAction } from '@/features/builder/actions';
import { ThemeProvider, useTheme } from './theme-context';
import { getGoogleFontsUrl } from '@/lib/themes';
import { themeToCssVars } from '@/types/theme';
import type { PortfolioTheme } from '@/types/theme';
import { ThemePicker } from './theme-picker';
import { HeroBlock } from './blocks/hero-block';
import { AboutBlock } from './blocks/about-block';
import { StatsBlock } from './blocks/stats-block';
import { GalleryBlock } from './blocks/gallery-block';
import { ContactBlock } from './blocks/contact-block';
import { TextBlock } from './blocks/text-block';
import { BeforeAfterBlock } from './blocks/before-after-block';
import { VideoShowcaseBlock } from './blocks/video-showcase-block';
import { TestimonialsBlock } from './blocks/testimonials-block';
import { BrandsBlock } from './blocks/brands-block';
import { FooterBlock } from './blocks/footer-block';

const RESOLVER = {
    HeroBlock,
    AboutBlock,
    StatsBlock,
    GalleryBlock,
    ContactBlock,
    TextBlock,
    BeforeAfterBlock,
    VideoShowcaseBlock,
    TestimonialsBlock,
    BrandsBlock,
    FooterBlock,
};

function validCraftData(state: string | null): string | undefined {
    if (!state || state.length < 10) return undefined;
    try {
        const parsed = JSON.parse(state) as Record<string, Record<string, unknown>>;
        if (!parsed || typeof parsed !== 'object' || !('ROOT' in parsed)) return undefined;

        let migrated = false;

        const root = parsed.ROOT as Record<string, unknown>;
        if (root && typeof root.type === 'object' && root.type !== null) {
            const t = root.type as { resolvedName?: string };
            if (t.resolvedName === 'div') {
                root.type = 'div';
                migrated = true;
            }
        }

        for (const key of Object.keys(parsed)) {
            const node = parsed[key] as Record<string, unknown> | undefined;
            if (node && 'parent' in node) {
                delete node.parent;
                migrated = true;
            }
        }

        return migrated ? JSON.stringify(parsed) : state;
    } catch {
        return undefined;
    }
}

type Viewport = 'mobile' | 'tablet' | 'desktop';
type PanelTab = 'elements' | 'theme' | 'navigator';
type BlockTab = 'contenu' | 'style' | 'avance';

const VIEWPORT_WIDTHS: Record<Viewport, number | undefined> = {
    mobile: 375,
    tablet: 768,
    desktop: undefined,
};

interface BuilderEditorProps {
    portfolioId: string;
    portfolioTitle: string;
    portfolioStatus: string;
    portfolioSlug: string;
    craftStateJson: string | null;
    updatedAt: string;
    isPremium: boolean;
    username: string;
    initialTheme?: PortfolioTheme | null;
}

/* ── Save indicator ─────────────────────────────────────────── */
function SaveIndicator({ status }: { status: SaveStatus }) {
    const map: Record<SaveStatus, { text: string; color: string; icon: React.ReactNode }> = {
        saved: { text: 'Sauvegardé', color: 'text-emerald-400', icon: <Check className="h-3 w-3" /> },
        saving: { text: 'Sauvegarde…', color: 'text-zinc-400', icon: <Loader2 className="h-3 w-3 animate-spin" /> },
        unsaved: { text: 'Non sauvegardé', color: 'text-amber-400', icon: <Circle className="h-3 w-3 fill-current" /> },
        error: { text: 'Erreur', color: 'text-red-400', icon: <XCircle className="h-3 w-3" /> },
    };
    const { text, color, icon } = map[status];
    return (
        <span className={`flex items-center gap-1.5 text-[10px] font-mono ${color}`} role="status" aria-live="polite">
            {icon} {text}
        </span>
    );
}

/* ── Settings tabs (Elementor Content/Style/Advanced) ──────── */
function BlockSettingsTabBar({ active, onChange }: { active: BlockTab; onChange: (t: BlockTab) => void }) {
    const tabs: { id: BlockTab; label: string }[] = [
        { id: 'contenu', label: 'Contenu' },
        { id: 'style', label: 'Style' },
        { id: 'avance', label: 'Avancé' },
    ];
    return (
        <div className="flex border-b border-zinc-800" role="tablist" aria-label="Paramètres du bloc">
            {tabs.map(({ id, label }) => (
                <button
                    key={id}
                    onClick={() => onChange(id)}
                    role="tab"
                    aria-selected={active === id}
                    className={`flex-1 py-2.5 text-[10px] font-semibold uppercase tracking-widest transition-colors ${active === id
                        ? 'border-b-2 border-sky-400 text-sky-400'
                        : 'text-zinc-500 hover:text-zinc-300'
                        }`}
                >
                    {label}
                </button>
            ))}
        </div>
    );
}

/* ── Navigator — liste ordonnée des blocs ───────────────────── */
function Navigator() {
    const { nodeList, selectedId, actions } = useEditor((state) => {
        const rootNode = state.nodes['ROOT'];
        const nodeIds = (rootNode?.data.nodes ?? []) as string[];
        const [sel] = state.events.selected;
        return {
            nodeList: nodeIds.map((nid) => {
                const n = state.nodes[nid];
                return {
                    id: nid,
                    name: (n?.data.displayName ?? n?.data.name ?? 'Bloc') as string,
                };
            }),
            selectedId: sel ?? null,
        };
    });

    if (nodeList.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center gap-2 p-8 text-center">
                <Layers className="h-7 w-7 text-zinc-700" />
                <p className="text-xs text-zinc-600">
                    Glisse des blocs<br />depuis l&apos;onglet Blocs
                </p>
            </div>
        );
    }

    return (
        <div className="p-2 space-y-0.5">
            {nodeList.map((node, index) => (
                <button
                    key={node.id}
                    onClick={() => {
                        /* setNodeEvent est disponible à runtime même si absent du type public */
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        (actions as any).setNodeEvent('selected', node.id);
                    }}
                    className={`group flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-xs transition-colors ${node.id === selectedId
                        ? 'bg-sky-500/15 text-sky-300'
                        : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
                        }`}
                >
                    <span className="w-4 shrink-0 text-center font-mono text-[9px] text-zinc-600">
                        {index + 1}
                    </span>
                    <div
                        className={`h-1.5 w-1.5 shrink-0 rounded-full transition-colors ${node.id === selectedId
                            ? 'bg-sky-400'
                            : 'bg-zinc-600 group-hover:bg-zinc-400'
                            }`}
                    />
                    <span className="flex-1 truncate">{node.name}</span>
                </button>
            ))}
        </div>
    );
}

/* ── Left panel — Elementor-style ───────────────────────────── */
function LeftPanel({
    isPremium,
    portfolioId,
    saveStatus,
    pubStatus,
    isPublishing,
    onSave,
    onPublish,
    portfolioSlug,
}: {
    isPremium: boolean;
    portfolioId: string;
    saveStatus: SaveStatus;
    pubStatus: string;
    isPublishing: boolean;
    onSave: () => void;
    onPublish: () => void;
    portfolioSlug: string;
}) {
    const [panelTab, setPanelTab] = useState<PanelTab>('elements');
    const [blockTab, setBlockTab] = useState<BlockTab>('contenu');

    const { actions, selected } = useEditor((state) => {
        const [currentNodeId] = state.events.selected;
        if (!currentNodeId) return { selected: null };
        const node = state.nodes[currentNodeId];
        return {
            selected: {
                id: currentNodeId,
                name: (node.data.displayName ?? node.data.name ?? '') as string,
            },
        };
    });

    const isBlockSelected = !!selected;

    return (
        <aside className="flex w-[300px] shrink-0 flex-col border-r border-zinc-800 bg-[#1c1c25] overflow-hidden">

            {/* ── Panel header ───────────────────────────────────────── */}
            {isBlockSelected ? (
                /* Block selected: back + block name + X */
                <div className="flex h-12 shrink-0 items-center gap-1 border-b border-zinc-800 px-2">
                    <button
                        onClick={() => actions.clearEvents()}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
                        title="Retour aux éléments"
                        aria-label="Retour aux éléments"
                    >
                        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <div className="flex flex-1 items-center gap-2 overflow-hidden">
                        <div className="h-1.5 w-1.5 rounded-full bg-sky-400 shrink-0" />
                        <span className="truncate text-sm font-semibold text-white">{selected.name}</span>
                    </div>
                    <button
                        onClick={() => actions.delete(selected.id)}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-zinc-600 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                        title="Supprimer le bloc"
                        aria-label="Supprimer le bloc"
                    >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                </div>
            ) : (
                /* Default: tab bar */
                <div className="flex h-12 shrink-0 items-stretch border-b border-zinc-800" role="tablist" aria-label="Panneaux du builder">
                    {([
                        { id: 'elements' as PanelTab, icon: <Layers className="h-4 w-4" />, label: 'Blocs' },
                        { id: 'theme' as PanelTab, icon: <Palette className="h-4 w-4" />, label: 'Thème' },
                        { id: 'navigator' as PanelTab, icon: <List className="h-4 w-4" />, label: 'Calques' },
                    ] as { id: PanelTab; icon: React.ReactNode; label: string }[]).map(({ id, icon, label }) => (
                        <button
                            key={id}
                            onClick={() => setPanelTab(id)}
                            role="tab"
                            aria-selected={panelTab === id}
                            className={`flex flex-1 flex-col items-center justify-center gap-0.5 text-[9px] font-semibold uppercase tracking-widest transition-colors ${panelTab === id
                                ? 'border-b-2 border-sky-400 text-sky-400'
                                : 'text-zinc-500 hover:text-zinc-300'
                                }`}
                        >
                            {icon}
                            <span>{label}</span>
                        </button>
                    ))}
                </div>
            )}

            {/* ── Panel body ─────────────────────────────────────────── */}
            <div className="flex-1 overflow-hidden flex flex-col">
                {isBlockSelected ? (
                    <>
                        <BlockSettingsTabBar active={blockTab} onChange={setBlockTab} />
                        <div className="flex-1 overflow-y-auto">
                            <PropertiesPanel hideHeader hideDelete tab={blockTab} />
                        </div>
                    </>
                ) : (
                    <div className="flex-1 overflow-y-auto">
                        {panelTab === 'elements' && (
                            <Toolbox isPremium={isPremium} portfolioId={portfolioId} />
                        )}
                        {panelTab === 'theme' && (
                            <div className="p-3">
                                <ThemePicker />
                            </div>
                        )}
                        {panelTab === 'navigator' && (
                            <Navigator />
                        )}
                    </div>
                )}
            </div>

            {/* ── Bottom bar: save indicator + publish ───────────────── */}
            <div className="shrink-0 border-t border-zinc-800 bg-[#16161e] px-3 py-2.5">
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <SaveIndicator status={saveStatus} />
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Link
                            href={`/preview/${portfolioId}`}
                            target="_blank"
                            className="flex h-7 items-center gap-1 rounded-md border border-zinc-700 px-2 text-[10px] text-zinc-400 hover:border-zinc-500 hover:text-white transition-colors"
                        >
                            <Eye className="h-3 w-3" />
                            Aperçu
                        </Link>
                        <button
                            onClick={onSave}
                            className="flex h-7 items-center gap-1 rounded-md border border-zinc-700 px-2 text-[10px] text-zinc-300 hover:border-sky-400/40 hover:text-sky-300 transition-colors"
                        >
                            Sauvegarder
                        </button>
                        <button
                            onClick={onPublish}
                            disabled={isPublishing}
                            className={`flex h-7 items-center rounded-md px-2.5 text-[10px] font-semibold transition-colors ${pubStatus === 'published'
                                ? 'border border-dashed border-zinc-700 text-zinc-400 hover:border-red-500/30 hover:text-red-400'
                                : 'bg-sky-500 text-white hover:bg-sky-400'
                                }`}
                        >
                            {isPublishing ? '…' : pubStatus === 'published' ? 'Dépublier' : 'Publier'}
                        </button>
                    </div>
                </div>
                {portfolioSlug && (
                    <div className="mt-1.5 flex items-center gap-1">
                        <span className="text-[9px] font-mono text-zinc-700">blooprint.fr/</span>
                        <span className="text-[9px] font-mono text-zinc-500">{portfolioSlug}</span>
                    </div>
                )}
            </div>
        </aside>
    );
}

/* ── Inner builder ────────────────────────────────────────────── */
function BuilderInner({
    portfolioId,
    portfolioTitle,
    portfolioStatus,
    portfolioSlug,
    isPremium,
    username,
    saveStatus,
    saveNowWithQuery,
    resolvedState,
}: Omit<BuilderEditorProps, 'craftStateJson' | 'updatedAt' | 'initialTheme'> & {
    saveStatus: SaveStatus;
    saveNowWithQuery: (query: { serialize: () => string }) => Promise<void>;
    resolvedState: string | null;
}) {
    const [isPublishing, setIsPublishing] = useState(false);
    const [pubStatus, setPubStatus] = useState(portfolioStatus);
    const [viewport, setViewport] = useState<Viewport>('desktop');

    const { query, actions } = useEditor();
    const { theme } = useTheme();
    const cssVars = themeToCssVars(theme);
    const fontsUrl = getGoogleFontsUrl(theme);
    const viewportWidth = VIEWPORT_WIDTHS[viewport];

    const handleSaveNow = useCallback(async () => {
        await saveNowWithQuery(query);
    }, [query, saveNowWithQuery]);

    /* ── Raccourcis clavier Elementor-style ──────────────────── */
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            /* Ne pas intercepter si l'utilisateur tape dans un input */
            const target = e.target as HTMLElement;
            if (
                target.tagName === 'INPUT' ||
                target.tagName === 'TEXTAREA' ||
                target.isContentEditable
            ) return;

            /* Cmd/Ctrl + Z → Undo */
            if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
                e.preventDefault();
                actions.history.undo();
            }
            /* Cmd/Ctrl + Shift+Z / Cmd+Y → Redo */
            if ((e.metaKey || e.ctrlKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
                e.preventDefault();
                actions.history.redo();
            }
            /* Cmd/Ctrl + S → Sauvegarder */
            if ((e.metaKey || e.ctrlKey) && e.key === 's') {
                e.preventDefault();
                void handleSaveNow();
            }
            /* Escape → Désélectionner */
            if (e.key === 'Escape') {
                actions.clearEvents();
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [actions, handleSaveNow]);

    const handlePublish = async () => {
        setIsPublishing(true);
        await handleSaveNow();
        const isPublished = pubStatus === 'published';
        const { error, warning } = await togglePublishAction(portfolioId, !isPublished);
        if (error) {
            alert(error);
        } else {
            setPubStatus(isPublished ? 'draft' : 'published');
            if (warning) alert(warning);
        }
        setIsPublishing(false);
    };

    return (
        <div className="flex h-screen flex-col overflow-hidden" style={{ background: '#1a1a24' }}>
            {fontsUrl && <link rel="stylesheet" href={fontsUrl} data-theme-fonts="1" />}

            {/* ── Top bar — Elementor style ─────────────────────────── */}
            <header className="flex h-10 shrink-0 items-center justify-between border-b border-zinc-800 bg-[#16161e] px-4">
                <div className="flex items-center gap-3">
                    <Link
                        href="/dashboard"
                        className="flex h-7 items-center gap-1.5 rounded-md px-2 font-mono text-[10px] uppercase tracking-widest text-zinc-500 hover:bg-zinc-800 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="h-3 w-3" />
                        Dashboard
                    </Link>
                    <span className="text-zinc-800">|</span>
                    <span className="text-xs font-medium text-zinc-300 max-w-52 truncate">
                        {portfolioTitle}
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    {/* Undo / Redo */}
                    <div className="flex items-center gap-0.5">
                        <button
                            title="Annuler (Cmd+Z)"
                            aria-label="Annuler"
                            onClick={() => actions.history.undo()}
                            className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-500 hover:bg-zinc-800 hover:text-white transition-colors"
                        >
                            <Undo2 className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                        <button
                            title="Rétablir (Cmd+Shift+Z)"
                            aria-label="Rétablir"
                            onClick={() => actions.history.redo()}
                            className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-500 hover:bg-zinc-800 hover:text-white transition-colors"
                        >
                            <Redo2 className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                    </div>
                    <span className="text-zinc-800">|</span>
                    <span className={`font-mono text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-full border ${pubStatus === 'published'
                        ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                        : 'border-zinc-700 text-zinc-600'
                        }`}>
                        {pubStatus === 'published' ? 'Publié' : 'Brouillon'}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-600">
                        {username.toLowerCase()}
                    </span>
                </div>
            </header>

            {/* ── Mobile warning ────────────────────────────────────── */}
            <div className="flex flex-col items-center justify-center gap-4 p-8 text-center md:hidden">
                <Monitor className="h-10 w-10 text-zinc-600" aria-hidden="true" />
                <p className="text-base font-semibold text-white">Builder desktop uniquement</p>
                <p className="text-sm text-zinc-400">Reconnecte-toi depuis ton ordinateur.</p>
            </div>

            {/* ── Main layout ───────────────────────────────────────── */}
            <div className="hidden md:flex flex-1 overflow-hidden">

                {/* Left Panel — Elementor style */}
                <LeftPanel
                    isPremium={isPremium}
                    portfolioId={portfolioId}
                    saveStatus={saveStatus}
                    pubStatus={pubStatus}
                    isPublishing={isPublishing}
                    onSave={() => void handleSaveNow()}
                    onPublish={() => void handlePublish()}
                    portfolioSlug={portfolioSlug}
                />

                {/* Canvas area */}
                <main className="flex flex-1 flex-col overflow-hidden bg-zinc-800/60">
                    {/* Scrollable canvas */}
                    <div className="flex-1 overflow-y-auto p-8">
                        <div
                            className="mx-auto transition-all duration-300"
                            style={{ maxWidth: viewportWidth ? `${viewportWidth}px` : '900px' }}
                        >
                            {/* Browser chrome */}
                            <div className="overflow-hidden rounded-xl border border-zinc-700/60 shadow-2xl shadow-black/40">
                                {/* Chrome bar */}
                                <div className="flex h-9 items-center gap-3 border-b border-zinc-700/60 bg-zinc-900/80 px-3">
                                    <div className="flex gap-1.5">
                                        <span className="h-2.5 w-2.5 rounded-full bg-red-500/60" />
                                        <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/60" />
                                        <span className="h-2.5 w-2.5 rounded-full bg-green-500/60" />
                                    </div>
                                    <div className="flex flex-1 justify-center">
                                        <div className="rounded-md bg-zinc-800 px-3 py-0.5 text-[10px] font-mono text-zinc-500">
                                            blooprint.fr/{portfolioSlug}
                                        </div>
                                    </div>
                                    <div className="w-12" />
                                </div>

                                {/* Canvas with theme */}
                                <div
                                    className="min-h-[600px] overflow-hidden"
                                    style={{
                                        ...cssVars,
                                        background: 'var(--theme-bg, #030712)',
                                        fontFamily: 'var(--theme-font-body, inherit)',
                                    }}
                                >
                                    <Frame data={validCraftData(resolvedState)}>
                                        <Element
                                            is="div"
                                            canvas
                                            className="flex min-h-[600px] flex-col gap-0"
                                        >
                                            <HeroBlock />
                                        </Element>
                                    </Frame>
                                </div>
                            </div>

                            <p className="mt-3 text-center font-mono text-[9px] text-zinc-700">
                                {viewport.toUpperCase()} · {username.toUpperCase()}
                            </p>
                        </div>
                    </div>

                    {/* ── Viewport switcher — bottom center, Elementor style ── */}
                    <div className="relative flex h-10 shrink-0 items-center justify-center gap-0.5 border-t border-zinc-700/50 bg-zinc-900/60">
                        {([
                            { id: 'desktop' as Viewport, icon: <Monitor className="h-4 w-4" aria-hidden="true" />, label: 'Desktop' },
                            { id: 'tablet' as Viewport, icon: <Tablet className="h-4 w-4" aria-hidden="true" />, label: 'Tablette' },
                            { id: 'mobile' as Viewport, icon: <Smartphone className="h-4 w-4" aria-hidden="true" />, label: 'Mobile' },
                        ]).map(({ id, icon, label }) => (
                            <button
                                key={id}
                                onClick={() => setViewport(id)}
                                title={label}
                                aria-label={`Vue ${label}`}
                                aria-pressed={viewport === id}
                                className={`flex h-8 items-center gap-1.5 rounded-md px-3 text-[10px] font-medium transition-colors ${viewport === id
                                    ? 'bg-zinc-700 text-white'
                                    : 'text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300'
                                    }`}
                            >
                                {icon}
                                <span className="hidden lg:inline">{label}</span>
                            </button>
                        ))}

                        {/* Draft / external link on right */}
                        <div className="absolute right-4 flex items-center gap-2">
                            <Link
                                href={`/preview/${portfolioId}`}
                                target="_blank"
                                className="flex items-center gap-1 text-[10px] text-zinc-600 hover:text-sky-400 transition-colors"
                            >
                                <ExternalLink className="h-3 w-3" aria-hidden="true" />
                                Aperçu complet<span className="sr-only"> (ouvre dans un nouvel onglet)</span>
                            </Link>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

/* ── Main export ────────────────────────────────────────────────── */
export function BuilderEditor(props: BuilderEditorProps) {
    const { portfolioId, craftStateJson, updatedAt, initialTheme } = props;

    const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved');
    const onStatusChange = useCallback((s: SaveStatus) => setSaveStatus(s), []);
    const { onNodesChange, saveNowWithQuery } = useAutosave(portfolioId, onStatusChange);

    const [localDraft] = useState<string | null>(() => {
        if (typeof window === 'undefined') return null;
        return checkLocalDraft(portfolioId, updatedAt);
    });

    const [resolvedState] = useState<string | null>(() => {
        if (localDraft) return localDraft;
        return craftStateJson;
    });

    return (
        <BuilderErrorBoundary portfolioId={portfolioId}>
            <Editor
                resolver={RESOLVER}
                onRender={RenderNode}
                onNodesChange={onNodesChange}
            >
                {localDraft && (
                    <div className="fixed top-10 left-0 right-0 z-50 flex items-center justify-center bg-amber-500/10 border-b border-dashed border-amber-500/30 py-1.5 px-4">
                        <p className="text-xs text-amber-300">
                            Brouillon local restauré.
                        </p>
                    </div>
                )}

                <ThemeProvider portfolioId={portfolioId} initialTheme={initialTheme ?? null}>
                    <BuilderInner
                        {...props}
                        saveStatus={saveStatus}
                        saveNowWithQuery={saveNowWithQuery}
                        resolvedState={resolvedState}
                    />
                </ThemeProvider>
            </Editor>
        </BuilderErrorBoundary>
    );
}

