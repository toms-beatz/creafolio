import { api } from '@/lib/api-server';
import { TrustBarStats } from '@/components/landing/trust-bar-stats';

// Image fond soie/tissu Figma
const SILK_BG = 'https://www.figma.com/api/mcp/asset/0dfd977d-df28-4d6b-b7a1-32c6a08a304a';

export async function TrustBar() {
    let portfolioCount = 0;
    let creatorCount = 0;
    try {
        const stats = await api.get<{ portfolios: number; users: number }>('/v1/admin/stats');
        portfolioCount = stats.portfolios ?? 0;
        creatorCount = stats.users ?? 0;
    } catch { /* fail silently */ }

    const stats = [
        { label: 'Portfolios créés', numericValue: portfolioCount, suffix: '+' },
        { label: 'Créateurs actifs', numericValue: creatorCount, suffix: '+' },
        { label: 'Templates disponibles', numericValue: 5, suffix: '+' },
        { label: 'Satisfaction', numericValue: 100, suffix: '%' },
    ];

    return (
        <section aria-label="Métriques de confiance" className="relative py-16 lg:py-20 overflow-hidden">
            {/* Fond image soie */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                src={SILK_BG}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 w-full h-full object-cover object-center"
                style={{ filter: 'blur(6px)', transform: 'scale(1.05)' }}
            />
            {/* Overlay chaud pour harmoniser */}
            <div className="absolute inset-0 bg-[#1a1a1a]/55" aria-hidden="true" />

            <div className="relative mx-auto max-w-5xl px-4 lg:px-8">
                {/* Mockup placeholder — pleine largeur, avant le titre */}
                <div className="mb-12">
                    <div className="relative rounded-2xl border border-dashed border-[#ad7b60] bg-[#e8c9b5] backdrop-blur-sm overflow-hidden aspect-[16/6] flex flex-col items-center justify-center gap-3 shadow-lg">
                        {/* Faux écran */}
                        <div className="w-2/3 space-y-2">
                            <div className="h-2 rounded-full bg-[#ad7b60]/30 w-full" />
                            <div className="h-2 rounded-full bg-[#ad7b60]/20 w-4/5" />
                            <div className="h-2 rounded-full bg-[#ad7b60]/20 w-3/5" />
                        </div>
                        <div className="w-2/3 grid grid-cols-4 gap-2 mt-2">
                            <div className="h-10 rounded-lg bg-[#ad7b60]/25" />
                            <div className="h-10 rounded-lg bg-[#ad7b60]/15" />
                            <div className="h-10 rounded-lg bg-[#ad7b60]/15" />
                            <div className="h-10 rounded-lg bg-[#ad7b60]/25" />
                        </div>
                        <p className="font-mono text-[9px] uppercase tracking-widest text-[#ad7b60]/50 mt-1">
                            Aperçu portfolio — bientôt
                        </p>
                        {/* Badge coin */}
                        <span className="absolute top-3 right-3 font-mono text-[8px] tracking-widest text-[#ad7b60]/40">
                            MOCKUP // 01
                        </span>
                    </div>
                </div>

                {/* Titre section */}
                <div className="text-center mb-10 mt-24">
                    <p className="text-3xl font-black tracking-tight text-[#d4a485] uppercase" style={{ fontFamily: "var(--font-habibi, 'Habibi'), serif" }}>
                        STATISTIQUES
                    </p>

                </div>

                {/* Stats — pleine largeur */}
                <TrustBarStats stats={stats} />
            </div>
        </section>
    );
}
