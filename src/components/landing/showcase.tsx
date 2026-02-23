import Link from 'next/link';
import { Sparkles, ExternalLink, Eye } from 'lucide-react';
import { CoordLabel } from '@/components/ui/coord-label';
import { createAdminClient } from '@/lib/supabase/server';
import { ShowcaseHeader, ShowcaseGrid, ShowcaseCard, ShowcaseFallback } from '@/components/landing/showcase-motion';

/**
 * Showcase — portfolios réels publiés (dynamic, server component).
 * Ancre #showcase.
 * US-1104
 */
export async function Showcase() {
    const supabase = createAdminClient();

    const { data: portfolios } = await supabase
        .from('portfolios')
        .select('title, slug, updated_at, user_id')
        .eq('status', 'published')
        .eq('admin_featured', true)
        .eq('allow_landing', true)
        .is('deleted_at', null)
        .order('updated_at', { ascending: false })
        .limit(3);

    // Fetch usernames for each portfolio
    const userIds = [...new Set((portfolios ?? []).map((p) => p.user_id))];
    const { data: profiles } = userIds.length > 0
        ? await supabase
            .from('profiles')
            .select('id, username')
            .in('id', userIds)
        : { data: [] };

    const usernameMap = new Map((profiles ?? []).map((p) => [p.id, p.username]));

    return (
        <section id="showcase" aria-labelledby="showcase-heading" className="relative py-20 lg:py-28">
            {/* Dot pattern background */}
            <div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                    backgroundImage: 'radial-gradient(circle, #38bdf8 1px, transparent 1px)',
                    backgroundSize: '24px 24px',
                }}
                aria-hidden="true"
            />

            <div className="relative mx-auto max-w-6xl px-4 lg:px-8">
                {/* Header */}
                <ShowcaseHeader>
                    <CoordLabel text="[APERÇU // 00.05]" className="mb-4 block" />
                    <h2 id="showcase-heading" className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                        Des portfolios UGC{' '}
                        <span className="text-sky-400">créés avec Blooprint</span>
                    </h2>
                    <p className="mt-3 text-sm text-zinc-400 max-w-md mx-auto leading-relaxed">
                        Découvre des portfolios de créateurs actifs sur la plateforme.
                    </p>
                </ShowcaseHeader>

                {portfolios && portfolios.length > 0 ? (
                    <ShowcaseGrid>
                        {portfolios.map((p) => {
                            const username = usernameMap.get(p.user_id) ?? 'Créateur UGC';
                            return (
                                <ShowcaseCard key={p.slug}>
                                    <Link href={`/${p.slug}`} target="_blank" rel="noopener noreferrer" className="group block" aria-label={`Voir le portfolio de ${username}: ${p.title}`}>
                                        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 overflow-hidden transition-all duration-300 hover:border-sky-400/30 hover:shadow-[0_0_40px_-10px_rgba(56,189,248,0.08)]">
                                            {/* Browser frame */}
                                            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-zinc-800/80 bg-zinc-900/60">
                                                {/* Traffic lights */}
                                                <div className="flex items-center gap-1.5">
                                                    <span className="h-2 w-2 rounded-full bg-zinc-700 group-hover:bg-red-400/70 transition-colors" />
                                                    <span className="h-2 w-2 rounded-full bg-zinc-700 group-hover:bg-amber-400/70 transition-colors" />
                                                    <span className="h-2 w-2 rounded-full bg-zinc-700 group-hover:bg-emerald-400/70 transition-colors" />
                                                </div>
                                                {/* URL bar */}
                                                <div className="flex-1 flex items-center justify-center">
                                                    <div className="flex items-center gap-1.5 rounded-md bg-zinc-800/60 px-3 py-1 text-[10px] font-mono text-zinc-500 group-hover:text-zinc-400 transition-colors">
                                                        <span className="text-zinc-600">blooprint.fr/</span>
                                                        <span className="text-sky-400/80">{p.slug}</span>
                                                    </div>
                                                </div>
                                                <ExternalLink className="h-3 w-3 text-zinc-700 group-hover:text-zinc-500 transition-colors" aria-hidden="true" />
                                            </div>

                                            {/* Content preview area */}
                                            <div className="relative aspect-[4/3] bg-zinc-950 overflow-hidden">
                                                {/* Abstract portfolio mockup */}
                                                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 gap-3">
                                                    {/* Avatar circle */}
                                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-sky-400/20 to-sky-400/5 border border-sky-400/10" />
                                                    {/* Name line */}
                                                    <div className="h-3 w-24 rounded-full bg-zinc-800/80" />
                                                    <div className="h-2 w-16 rounded-full bg-zinc-800/50" />
                                                    {/* Content blocks */}
                                                    <div className="w-full max-w-[180px] space-y-2 mt-2">
                                                        <div className="h-2 w-full rounded-full bg-zinc-800/40" />
                                                        <div className="h-2 w-4/5 rounded-full bg-zinc-800/30" />
                                                        <div className="grid grid-cols-3 gap-1.5 mt-3">
                                                            <div className="aspect-square rounded-md bg-zinc-800/30" />
                                                            <div className="aspect-square rounded-md bg-zinc-800/30" />
                                                            <div className="aspect-square rounded-md bg-zinc-800/30" />
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Hover overlay */}
                                                <div className="absolute inset-0 flex items-center justify-center bg-zinc-950/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                    <span className="flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-400/10 px-4 py-2 text-xs font-medium text-sky-400">
                                                        <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                                                        Voir le portfolio
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Card footer */}
                                            <div className="px-4 py-3 border-t border-zinc-800/50">
                                                <p className="text-sm font-medium text-white group-hover:text-sky-400 transition-colors truncate">
                                                    {p.title}
                                                </p>
                                                <p className="text-[11px] text-zinc-500 mt-0.5 font-mono">
                                                    par {username}
                                                </p>
                                            </div>
                                        </div>
                                    </Link>
                                </ShowcaseCard>
                            );
                        })}
                    </ShowcaseGrid>
                ) : (
                    /* Fallback si aucun portfolio publié */
                    <ShowcaseFallback>
                        <div className="mx-auto max-w-2xl">
                            <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-900/30 overflow-hidden">
                                {/* Fake browser frame */}
                                <div className="flex items-center gap-2 px-4 py-2.5 border-b border-zinc-800/80">
                                    <div className="flex items-center gap-1.5">
                                        <span className="h-2 w-2 rounded-full bg-zinc-800" />
                                        <span className="h-2 w-2 rounded-full bg-zinc-800" />
                                        <span className="h-2 w-2 rounded-full bg-zinc-800" />
                                    </div>
                                    <div className="flex-1 flex justify-center">
                                        <div className="rounded-md bg-zinc-800/40 px-3 py-1 text-[10px] font-mono text-zinc-600">
                                            blooprint.fr/ton-nom
                                        </div>
                                    </div>
                                </div>
                                {/* Empty state */}
                                <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                                    <Sparkles className="h-8 w-8 text-sky-400/20 mb-4" aria-hidden="true" />
                                    <p className="text-sm text-zinc-500 mb-1">
                                        Les premiers portfolios arrivent bientôt.
                                    </p>
                                    <p className="text-xs text-zinc-600">
                                        Crée le tien et sois parmi les premiers mis en avant !
                                    </p>
                                </div>
                            </div>
                        </div>
                    </ShowcaseFallback>
                )}
            </div>
        </section>
    );
}
