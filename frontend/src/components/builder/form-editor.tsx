'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
    ChevronDown,
    ChevronRight,
    ArrowLeft,
    Save,
    Globe,
    GlobeOff,
    Monitor,
    Tablet,
    Smartphone,
    PanelLeft,
    ExternalLink,
    Loader2,
    CheckCircle2,
    AlertCircle,
    Palette,
    Info,
} from 'lucide-react';
import { StaticPortfolioRenderer } from '@/components/portfolio/static-renderer';
import { ThemeProvider, useTheme } from './theme-context';
import { ThemePicker } from './theme-picker';
import { useAutosave, checkLocalDraft } from './use-autosave';
import { useCraftForm, initCraftState, TMPL } from './use-craft-form';
import { togglePublishAction } from '@/features/builder/actions';
import { SlugEditor } from './slug-editor';
import { ProfileSection } from './sections/profile-section';
import { AboutSection } from './sections/about-section';
import { StatsSection } from './sections/stats-section';
import { ProjectsSection } from './sections/projects-section';
import { ContactSection } from './sections/contact-section';
import { themeToCssVars } from '@/types/theme';
import type { PortfolioTheme } from '@/types/theme';
import type { SaveStatus } from './use-autosave';
import type { CraftNodes } from '@/components/portfolio/static-renderer';

interface FormEditorProps {
    portfolioId: string;
    portfolioTitle: string;
    portfolioStatus: string;
    portfolioSlug: string;
    craftStateJson: string | null;
    updatedAt: string | null;
    isPremium: boolean;
    username: string;
    initialTheme: PortfolioTheme | null;
}

const SECTIONS = [
    { id: TMPL.HERO, label: 'Profil & Identité' },
    { id: TMPL.ABOUT, label: 'À propos' },
    { id: TMPL.STATS, label: 'Stats & Chiffres' },
    { id: TMPL.GALLERY, label: 'Projets' },
    { id: TMPL.CONTACT, label: 'Contact' },
    { id: 'theme', label: 'Thème & Couleurs' },
] as const;

type SectionId = (typeof SECTIONS)[number]['id'];

function SaveIndicator({ status }: { status: SaveStatus }) {
    if (status === 'saving') {
        return (
            <span className="flex items-center gap-1.5 text-xs text-zinc-500">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Sauvegarde…
            </span>
        );
    }
    if (status === 'saved') {
        return (
            <span className="flex items-center gap-1.5 text-xs text-emerald-500">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Sauvegardé
            </span>
        );
    }
    if (status === 'error') {
        return (
            <span className="flex items-center gap-1.5 text-xs text-red-400">
                <AlertCircle className="h-3.5 w-3.5" />
                Erreur — Réessayer
            </span>
        );
    }
    return (
        <span className="flex items-center gap-1.5 text-xs text-zinc-600">
            <Save className="h-3.5 w-3.5" />
            Non sauvegardé
        </span>
    );
}

function FormEditorInner({
    portfolioId,
    portfolioTitle,
    portfolioStatus,
    portfolioSlug,
    craftStateJson,
    updatedAt,
    isPremium,
    username,
}: Omit<FormEditorProps, 'initialTheme'>) {
    const router = useRouter();
    const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved');
    const [publishStatus, setPublishStatus] = useState(portfolioStatus);
    const [currentSlug, setCurrentSlug] = useState(portfolioSlug);
    const [publishLoading, setPublishLoading] = useState(false);
    const [publishWarning, setPublishWarning] = useState<string | null>(null);
    const [openSection, setOpenSection] = useState<SectionId>(TMPL.HERO);
    const [showCompletion, setShowCompletion] = useState(false);
    const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const previewScrollRef = useRef<HTMLDivElement>(null);

    // Initialiser le craftState (local draft ou Supabase)
    const initialState: CraftNodes = (() => {
        const localDraft = updatedAt ? checkLocalDraft(portfolioId, updatedAt) : null;
        if (localDraft) return localDraft as CraftNodes;
        return initCraftState(craftStateJson);
    })();

    const { craftState, updateHero, updateAbout, updateStats, updateGallery, updateContact, updateFooter } =
        useCraftForm(initialState);

    const { theme } = useTheme();
    const { scheduleSave, saveNow } = useAutosave(portfolioId, setSaveStatus);

    // Autosave à chaque mutation du craftState
    useEffect(() => {
        scheduleSave(craftState as Record<string, unknown>);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [craftState]);

    // Scroll preview to the opened section
    useEffect(() => {
        if (!openSection || !previewScrollRef.current) return;
        const raf = requestAnimationFrame(() => {
            const el = previewScrollRef.current?.querySelector<HTMLElement>(`#${openSection}`);
            el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
        return () => cancelAnimationFrame(raf);
    }, [openSection]);

    const handlePublish = useCallback(async () => {
        setPublishLoading(true);
        setPublishWarning(null);
        await saveNow(craftState as Record<string, unknown>);
        const isPublished = publishStatus === 'published';
        const result = await togglePublishAction(portfolioId, !isPublished);
        if (result.error) {
            alert(result.error);
        } else {
            setPublishStatus(isPublished ? 'draft' : 'published');
            if (result.warning) setPublishWarning(result.warning);
            router.refresh();
        }
        setPublishLoading(false);
    }, [portfolioId, publishStatus, craftState, saveNow, router]);

    const craftStateJson_ = JSON.stringify(craftState);
    const isPublished = publishStatus === 'published';

    // US-1509 — Calcul du score de complétion (pur client)
    const completionItems = [
        {
            key: 'avatar',
            label: 'Photo de profil',
            points: 20,
            sectionId: TMPL.HERO,
            done: !!craftState[TMPL.HERO]?.props?.imageUrl,
        },
        {
            key: 'bio',
            label: 'Bio (50+ caractères)',
            points: 15,
            sectionId: TMPL.ABOUT,
            done: ((craftState[TMPL.ABOUT]?.props?.bio as string) ?? '').length >= 50,
        },
        {
            key: 'social',
            label: 'Réseau social',
            points: 15,
            sectionId: TMPL.CONTACT,
            done: ((craftState[TMPL.CONTACT]?.props?.socials as unknown[]) ?? []).length > 0,
        },
        {
            key: 'project',
            label: 'Projet avec image',
            points: 20,
            sectionId: TMPL.GALLERY,
            done: ((craftState[TMPL.GALLERY]?.props?.items as { imageUrl?: string }[]) ?? []).some((i) => !!i.imageUrl),
        },
        {
            key: 'stats',
            label: '2 stats ou plus',
            points: 15,
            sectionId: TMPL.STATS,
            done: ((craftState[TMPL.STATS]?.props?.stats as unknown[]) ?? []).length >= 2,
        },
        {
            key: 'email',
            label: 'Email de contact',
            points: 15,
            sectionId: TMPL.CONTACT,
            done: !!craftState[TMPL.CONTACT]?.props?.email,
        },
    ];
    const completionScore = completionItems.reduce((s, i) => s + (i.done ? i.points : 0), 0);
    const completionColor = completionScore >= 70 ? 'text-emerald-400' : completionScore >= 40 ? 'text-amber-400' : 'text-red-400';
    const completionBg = completionScore >= 70 ? 'bg-emerald-400/10 border-emerald-400/30' : completionScore >= 40 ? 'bg-amber-400/10 border-amber-400/30' : 'bg-red-400/10 border-red-400/30';

    return (
        <div className="dark flex h-screen flex-col bg-zinc-950 text-white overflow-hidden">
            {/* Header */}
            <header className="flex h-12 shrink-0 items-center justify-between border-b border-dashed border-zinc-800 px-4">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Dashboard
                    </button>
                    <span className="text-zinc-700">/</span>
                    <span className="text-sm font-medium text-zinc-300 truncate max-w-[180px]">{portfolioTitle}</span>
                    <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-mono uppercase tracking-wide ${isPublished ? 'bg-emerald-950 text-emerald-400' : 'bg-zinc-800 text-zinc-500'
                            }`}
                    >
                        {isPublished ? 'Publié' : 'Brouillon'}
                    </span>
                    <SlugEditor
                        portfolioId={portfolioId}
                        initialSlug={currentSlug}
                        onSaved={setCurrentSlug}
                    />
                    <button
                        onClick={() => setSidebarOpen((v) => !v)}
                        className={`flex items-center justify-center rounded-lg p-1.5 transition-colors ${sidebarOpen ? 'bg-zinc-800 text-zinc-200 hover:bg-zinc-700' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800'}`}
                        title={sidebarOpen ? 'Fermer la sidebar' : 'Ouvrir la sidebar'}
                    >
                        <PanelLeft className="h-4 w-4" />
                    </button>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <button
                            onClick={() => setShowCompletion((v) => !v)}
                            className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold transition-colors ${completionBg} ${completionColor}`}
                        >
                            <Info className="h-3 w-3" />
                            {completionScore}%
                        </button>
                        {showCompletion && (
                            <div className="absolute right-0 top-8 z-50 w-64 rounded-xl border border-zinc-700 bg-zinc-900 p-3 shadow-xl">
                                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-zinc-500">Compléter le portfolio</p>
                                <div className="flex flex-col gap-1.5">
                                    {completionItems.map((item) => (
                                        <button
                                            key={item.key}
                                            onClick={() => { setOpenSection(item.sectionId as SectionId); setShowCompletion(false); }}
                                            className={`flex items-center justify-between rounded-lg px-2 py-1.5 text-xs transition-colors hover:bg-zinc-800 ${item.done ? 'text-zinc-500 line-through' : 'text-zinc-200'}`}
                                        >
                                            <span>{item.label}</span>
                                            <span className={`font-mono text-[10px] ${item.done ? 'text-emerald-500' : 'text-zinc-600'}`}>
                                                +{item.points}pts
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    <SaveIndicator status={saveStatus} />
                    {isPublished && (
                        <a
                            href={`/${currentSlug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-sky-400 transition-colors"
                        >
                            <ExternalLink className="h-3.5 w-3.5" />
                            Voir
                        </a>
                    )}
                    <button
                        onClick={handlePublish}
                        disabled={publishLoading}
                        className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-50 ${isPublished
                            ? 'bg-zinc-700 text-zinc-200 hover:bg-zinc-600'
                            : 'bg-sky-500 text-white hover:bg-sky-400'
                            }`}
                    >
                        {publishLoading ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : isPublished ? (
                            <GlobeOff className="h-3.5 w-3.5" />
                        ) : (
                            <Globe className="h-3.5 w-3.5" />
                        )}
                        {isPublished ? 'Dépublier' : 'Publier'}
                    </button>
                </div>
            </header>

            {publishWarning && (
                <div className="border-b border-dashed border-amber-800/40 bg-amber-950/30 px-4 py-2 text-xs text-amber-400">
                    {publishWarning}
                </div>
            )}

            {/* Body split-pane */}
            <div className="flex flex-1 overflow-hidden">
                {/* LEFT — Formulaires */}
                <aside className={`shrink-0 border-dashed border-zinc-800 bg-zinc-950 transition-all duration-300 ${sidebarOpen ? 'w-full max-w-[420px] overflow-y-auto border-r' : 'w-0 overflow-hidden'}`}>
                    <div className="divide-y divide-dashed divide-zinc-800">
                        {SECTIONS.map((section) => {
                            const isOpen = openSection === section.id;
                            return (
                                <div key={section.id}>
                                    <button
                                        onClick={() => setOpenSection(isOpen ? ('' as SectionId) : section.id)}
                                        className="flex w-full items-center justify-between px-4 py-3.5 text-left text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-900/50 transition-colors"
                                    >
                                        <span className="flex items-center gap-2">
                                            {section.id === 'theme' && <Palette className="h-3.5 w-3.5 text-zinc-500" />}
                                            {section.label}
                                        </span>
                                        {isOpen ? (
                                            <ChevronDown className="h-4 w-4 text-zinc-500" />
                                        ) : (
                                            <ChevronRight className="h-4 w-4 text-zinc-500" />
                                        )}
                                    </button>

                                    {isOpen && (
                                        <div className="border-t border-dashed border-zinc-800/60 px-4 py-4">
                                            {section.id === TMPL.HERO && (
                                                <ProfileSection
                                                    portfolioId={portfolioId}
                                                    props={craftState[TMPL.HERO]?.props ?? {}}
                                                    onChange={updateHero}
                                                />
                                            )}
                                            {section.id === TMPL.ABOUT && (
                                                <AboutSection
                                                    props={craftState[TMPL.ABOUT]?.props ?? {}}
                                                    onChange={updateAbout}
                                                />
                                            )}
                                            {section.id === TMPL.STATS && (
                                                <StatsSection
                                                    props={craftState[TMPL.STATS]?.props ?? {}}
                                                    onChange={updateStats}
                                                />
                                            )}
                                            {section.id === TMPL.GALLERY && (
                                                <ProjectsSection
                                                    portfolioId={portfolioId}
                                                    isPremium={isPremium}
                                                    viewport={viewport}
                                                    props={craftState[TMPL.GALLERY]?.props ?? {}}
                                                    onChange={updateGallery}
                                                />
                                            )}
                                            {section.id === TMPL.CONTACT && (
                                                <ContactSection
                                                    portfolioId={portfolioId}
                                                    props={craftState[TMPL.CONTACT]?.props ?? {}}
                                                    footerProps={craftState[TMPL.FOOTER]?.props ?? {}}
                                                    onChange={updateContact}
                                                    onFooterChange={updateFooter}
                                                />
                                            )}
                                            {section.id === 'theme' && <ThemePicker isPremium={isPremium} />}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </aside>

                {/* RIGHT — Preview live */}
                <main className="relative flex flex-1 flex-col overflow-hidden bg-zinc-900/30">
                    {/* Viewport toggle */}
                    <div className="absolute right-4 top-3 z-10 flex items-center gap-1 rounded-lg border border-dashed border-zinc-700 bg-zinc-900 p-1">
                        <button
                            onClick={() => setViewport('desktop')}
                            className={`rounded-md p-1.5 transition-colors ${viewport === 'desktop' ? 'bg-zinc-700 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                            title="Desktop — plein écran"
                        >
                            <Monitor className="h-3.5 w-3.5" />
                        </button>
                        <button
                            onClick={() => setViewport('tablet')}
                            className={`rounded-md p-1.5 transition-colors ${viewport === 'tablet' ? 'bg-zinc-700 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                            title="Tablette"
                        >
                            <Tablet className="h-3.5 w-3.5" />
                        </button>
                        <button
                            onClick={() => setViewport('mobile')}
                            className={`rounded-md p-1.5 transition-colors ${viewport === 'mobile' ? 'bg-zinc-700 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                            title="Mobile"
                        >
                            <Smartphone className="h-3.5 w-3.5" />
                        </button>
                    </div>

                    {/* Preview frame */}
                    <div ref={previewScrollRef} className="flex flex-1 items-start justify-center overflow-y-auto p-6 pt-14">
                        <div
                            className={`transition-all duration-300 ${viewport === 'mobile' ? 'w-[390px]' :
                                viewport === 'tablet' ? 'w-[768px]' :
                                    'w-full'
                                } rounded-xl border border-dashed border-zinc-700 overflow-hidden shadow-2xl`}
                            style={themeToCssVars(theme) as React.CSSProperties}
                        >
                            <StaticPortfolioRenderer craftStateJson={craftStateJson_} compact viewport={viewport} />
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

export function FormEditor(props: FormEditorProps) {
    return (
        <ThemeProvider portfolioId={props.portfolioId} initialTheme={props.initialTheme}>
            <FormEditorInner {...props} />
        </ThemeProvider>
    );
}
