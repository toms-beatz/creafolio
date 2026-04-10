import { notFound } from "next/navigation";
import { generateTemplate, TEMPLATES } from "@/lib/templates";
import { StaticPortfolioRenderer } from "@/components/portfolio/static-renderer";
import { THEME_PRESETS, DEFAULT_THEME } from "@/lib/themes";
import { themeToCssVars } from "@/types/theme";
import { X } from "lucide-react";

interface Props {
    params: Promise<{ id: string }>;
}

/**
 * /preview/template/[id]
 * Prévisualisation d'un template avec données mock — page publique.
 * Ouverte dans un nouvel onglet depuis le wizard.
 */
export async function generateStaticParams() {
    return TEMPLATES.map((t) => ({ id: t.id }));
}

export async function generateMetadata({ params }: Props) {
    const { id } = await params;
    const tmpl = TEMPLATES.find((t) => t.id === id);
    return {
        title: tmpl ? `Aperçu — ${tmpl.name} — Creafolio` : "Aperçu template",
    };
}

export default async function TemplatePreviewPage({ params }: Props) {
    const { id } = await params;
    const tmpl = TEMPLATES.find((t) => t.id === id);
    if (!tmpl) notFound();

    const craftState = generateTemplate(id);
    const craftStateJson = JSON.stringify(craftState);

    const themePreset = THEME_PRESETS[tmpl.defaultThemeId ?? "neon"] ?? DEFAULT_THEME;
    const themeCssVars = themeToCssVars(themePreset);

    return (
        <div className="min-h-screen" style={{ ...themeCssVars, background: "var(--theme-bg)" } as React.CSSProperties}>
            {/* Top bar */}
            <div className="sticky top-0 z-50 flex items-center justify-between gap-4 border-b border-dashed border-zinc-800 bg-zinc-950/90 px-4 py-3 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                    <span className="font-mono text-[9px] uppercase tracking-widest text-zinc-600">
                        APERÇU TEMPLATE
                    </span>
                    <span className="text-sm font-semibold text-white">{tmpl.name}</span>
                    <div className="flex gap-1">
                        {tmpl.niches.map((n) => (
                            <span
                                key={n}
                                className="rounded-full border border-dashed border-zinc-800 px-2 py-0.5 text-[9px] text-zinc-500"
                            >
                                {n}
                            </span>
                        ))}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {tmpl.premium && (
                        <span className="rounded-full border border-dashed border-amber-400/30 bg-amber-400/10 px-2 py-0.5 font-mono text-[9px] text-amber-400">
                            PRO
                        </span>
                    )}
                    <button
                        onClick={undefined}
                        className="rounded-lg border border-dashed border-zinc-700 p-1.5 text-zinc-500 hover:text-white transition-colors"
                        aria-label="Fermer"
                    // Close by JS — window.close() not available server-side; use a client hint
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* Demo banner */}
            <div className="bg-sky-400/10 border-b border-sky-400/20 px-4 py-2 text-center">
                <p className="text-[11px] text-sky-300">
                    Ceci est une prévisualisation avec des données d&apos;exemple.
                    Le rendu réel dépend de votre contenu et thème choisis.
                </p>
            </div>

            {/* Full template render */}
            <StaticPortfolioRenderer craftStateJson={craftStateJson} />
        </div>
    );
}
