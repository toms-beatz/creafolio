import Link from 'next/link';
import { ExternalLink, Eye } from 'lucide-react';
import { api } from '@/lib/api-server';
import { ShowcaseHeader, ShowcaseGrid, ShowcaseCard, ShowcaseFallback } from '@/components/landing/showcase-motion';

const SILK_BG = 'https://www.figma.com/api/mcp/asset/0dfd977d-df28-4d6b-b7a1-32c6a08a304a';

export async function Showcase() {
    let portfolios: { title: string; slug: string; updated_at: string; username?: string }[] = [];
    try {
        const data = await api.get<{ data: typeof portfolios }>('/profiles?featured=true&limit=3');
        portfolios = data.data ?? [];
    } catch {
        portfolios = [];
    }

    return (
        <section id="showcase" aria-labelledby="showcase-heading" className="relative py-20 lg:py-28 overflow-hidden bg-[#f4eeea]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                src={SILK_BG}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 w-full h-full object-cover object-center"
                style={{ filter: 'blur(6px)', transform: 'scale(1.05)' }}
            />
            <div className="absolute inset-0 bg-[#1a1a1a]/55" aria-hidden="true" />
            <div className="relative mx-auto max-w-6xl px-4 lg:px-8">
                <ShowcaseHeader>
                    <p className="text-3xl font-black tracking-tight text-[#d4a485] uppercase" style={{ fontFamily: "var(--font-habibi, 'Habibi'), serif" }}>
                        APERÇU
                    </p>
                    <p className="mt-3 text-[#1a1a1a]/60">
                        Découvre des portfolios de créateurs actifs sur la plateforme.
                    </p>
                </ShowcaseHeader>

                {portfolios.length > 0 ? (
                    <ShowcaseGrid>
                        {portfolios.map((p) => (
                            <ShowcaseCard key={p.slug}>
                                <Link
                                    href={`/${p.slug}`}
                                    className="group flex flex-col h-full p-6 rounded-xl border border-[#e8c9b5] hover:border-[#ad7b60]/40 bg-white transition-all"
                                >
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-[#1a1a1a] group-hover:text-[#ad7b60] transition-colors">
                                            {p.title}
                                        </h3>
                                        <p className="mt-1 text-xs font-mono text-[#ad7b60]/60">@{p.username ?? p.slug}</p>
                                    </div>
                                    <div className="mt-4 flex items-center gap-2 text-xs text-[#1a1a1a]/40">
                                        <Eye className="h-3.5 w-3.5" />
                                        <span>Voir le portfolio</span>
                                        <ExternalLink className="h-3 w-3 ml-auto" />
                                    </div>
                                </Link>
                            </ShowcaseCard>
                        ))}
                    </ShowcaseGrid>
                ) : (
                    <ShowcaseFallback>
                        <div className='bg-[#D4A485D4] p-24 rounded-2xl shadow-lg shadow-black/20'>
                            <p className="text-center text-white p-16 ">Aucun portfolio à afficher pour l&apos;instant.</p>
                        </div>
                    </ShowcaseFallback>
                )}
            </div>
        </section>
    );
}
