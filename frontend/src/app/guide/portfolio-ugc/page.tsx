import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Nav } from '@/components/landing/nav';
import { Footer } from '@/components/landing/footer';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://creafolio.fr';

export const metadata: Metadata = {
    title: 'Portfolio UGC : Le guide complet pour créateurs en 2026',
    description:
        'Qu\'est-ce qu\'un portfolio UGC ? Pourquoi c\'est indispensable pour les créateurs de contenu en 2026. Guide complet : contenu, erreurs à éviter, et comment créer le vôtre gratuitement.',
    alternates: { canonical: `${APP_URL}/guide/portfolio-ugc` },
    openGraph: {
        title: 'Portfolio UGC : Le guide complet pour créateurs en 2026',
        description: 'Tout ce qu\'il faut savoir pour créer un portfolio UGC professionnel qui attire les marques.',
        url: `${APP_URL}/guide/portfolio-ugc`,
        type: 'article',
        locale: 'fr_FR',
        siteName: 'Creafolio',
        images: [{ url: '/images/og-image.png', width: 1200, height: 630 }],
    },
};

const toc = [
    { id: 'definition', label: '1. Qu\'est-ce qu\'un portfolio UGC ?' },
    { id: 'pourquoi', label: '2. Pourquoi c\'est indispensable en 2026' },
    { id: 'contenu', label: '3. Que mettre dans ton portfolio UGC' },
    { id: 'erreurs', label: '4. Les 5 erreurs à éviter' },
    { id: 'difference', label: '5. Portfolio UGC vs Link-in-bio' },
    { id: 'creer', label: '6. Comment créer ton portfolio avec Creafolio' },
];

export default function GuidePortfolioUgc() {
    const articleSchema = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: 'Portfolio UGC : Le guide complet pour créateurs en 2026',
        author: { '@type': 'Organization', name: 'Creafolio' },
        publisher: { '@type': 'Organization', name: 'Creafolio', url: APP_URL },
        datePublished: '2026-02-01',
        dateModified: '2026-02-21',
        url: `${APP_URL}/guide/portfolio-ugc`,
        image: `${APP_URL}/images/og-image.png`,
    };

    return (
        <div className="min-h-screen bg-[#f4eeea] text-[#1a1a1a]">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
            />
            <Nav />
            <main className="mx-auto max-w-3xl px-4 py-16 lg:py-24">
                {/* Breadcrumb */}
                <nav className="mb-8 text-xs text-[#1a1a1a]/50 font-mono">
                    <Link href="/" className="hover:text-[#1a1a1a] transition-colors">Accueil</Link>
                    {' / '}
                    <Link href="/guide/portfolio-ugc" className="text-[#1a1a1a]/50">Guide Portfolio UGC</Link>
                </nav>

                <h1 className="text-3xl font-bold tracking-tight text-[#1a1a1a] sm:text-4xl lg:text-5xl mb-6 text-balance">
                    Portfolio UGC : Le guide complet pour créateurs en 2026
                </h1>
                <p className="text-base text-[#1a1a1a]/60 leading-relaxed mb-10">
                    Tu crées du contenu pour les marques sur TikTok, Instagram ou YouTube ? Un portfolio UGC professionnel
                    est ton meilleur outil pour décrocher plus de collaborations. Ce guide t&apos;explique tout : ce que c&apos;est,
                    pourquoi c&apos;est indispensable, et comment créer le tien gratuitement.
                </p>

                {/* Table des matières */}
                <aside className="rounded-xl border border-dashed border-[#e8c9b5] bg-white/60 p-5 mb-12">
                    <p className="font-mono text-[9px] uppercase tracking-widest text-[#1a1a1a]/50 mb-3">
                        SOMMAIRE
                    </p>
                    <ol className="space-y-2">
                        {toc.map((item) => (
                            <li key={item.id}>
                                <a href={`#${item.id}`} className="text-sm text-[#ad7b60] hover:text-[#9a6b50] transition-colors">
                                    {item.label}
                                </a>
                            </li>
                        ))}
                    </ol>
                </aside>

                {/* ── 1. Définition ──────────────────────────── */}
                <section id="definition" className="mb-12">
                    <h2 className="text-2xl font-bold text-[#1a1a1a] mb-4">1. Qu&apos;est-ce qu&apos;un portfolio UGC ?</h2>
                    <p className="text-sm text-[#1a1a1a]/60 leading-relaxed mb-4">
                        Un <strong className="text-[#1a1a1a]">portfolio UGC</strong> (User Generated Content) est un site web dédié
                        qui présente le travail d&apos;un créateur de contenu. Contrairement à un simple profil sur les réseaux sociaux,
                        il regroupe en un seul endroit :
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-sm text-[#1a1a1a]/60 mb-4">
                        <li>Tes <strong className="text-[#1a1a1a]">meilleures créations vidéo</strong> (TikTok, Reels, Shorts)</li>
                        <li>Tes <strong className="text-[#1a1a1a]">statistiques et métriques</strong> (vues, engagement, audience)</li>
                        <li>Tes <strong className="text-[#1a1a1a]">tarifs et services</strong></li>
                        <li>Ta <strong className="text-[#1a1a1a]">bio et tes réseaux sociaux</strong></li>
                        <li>Un <strong className="text-[#1a1a1a]">moyen de contact direct</strong> pour les marques</li>
                    </ul>
                    <p className="text-sm text-[#1a1a1a]/60 leading-relaxed">
                        C&apos;est en quelque sorte ton <em>CV visuel</em> de créateur de contenu — un lien unique que tu mets dans ta bio
                        Instagram, TikTok ou YouTube, et qui dit aux marques : &quot;Voilà ce que je fais, voilà pourquoi on devrait bosser ensemble.&quot;
                    </p>
                </section>

                {/* ── 2. Pourquoi ────────────────────────────── */}
                <section id="pourquoi" className="mb-12">
                    <h2 className="text-2xl font-bold text-[#1a1a1a] mb-4">2. Pourquoi c&apos;est indispensable en 2026</h2>
                    <p className="text-sm text-[#1a1a1a]/60 leading-relaxed mb-4">
                        Le marché du UGC explose. En 2026, les marques investissent plus que jamais dans les créateurs de contenu
                        authentique. Mais la concurrence aussi. Voici pourquoi un portfolio fait la différence :
                    </p>
                    <div className="space-y-4">
                        <div className="rounded-lg border border-dashed border-[#e8c9b5] p-4">
                            <h3 className="text-sm font-semibold text-[#ad7b60] mb-1">Se démarquer de la masse</h3>
                            <p className="text-xs text-[#1a1a1a]/60 leading-relaxed">
                                Les marques reçoivent des centaines de DMs et emails. Un lien vers un portfolio pro te place
                                immédiatement au-dessus des créateurs qui envoient juste un &quot;collab ?&quot; en story.
                            </p>
                        </div>
                        <div className="rounded-lg border border-dashed border-[#e8c9b5] p-4">
                            <h3 className="text-sm font-semibold text-[#ad7b60] mb-1">Être trouvé sur Google</h3>
                            <p className="text-xs text-[#1a1a1a]/60 leading-relaxed">
                                Un portfolio en ligne est indexé par Google. Les marques qui cherchent &quot;créateur UGC beauté&quot;
                                ou &quot;créateur contenu food&quot; peuvent tomber sur ton profil &mdash; même sans que tu prospectes.
                            </p>
                        </div>
                        <div className="rounded-lg border border-dashed border-[#e8c9b5] p-4">
                            <h3 className="text-sm font-semibold text-[#ad7b60] mb-1">Professionnaliser ton activité</h3>
                            <p className="text-xs text-[#1a1a1a]/60 leading-relaxed">
                                Un portfolio montre que tu prends ton activité au sérieux. Tarifs clairs, contenu organisé,
                                contact facile — c&apos;est rassurant pour une marque qui investit un budget.
                            </p>
                        </div>
                    </div>
                </section>

                {/* ── 3. Que mettre ──────────────────────────── */}
                <section id="contenu" className="mb-12">
                    <h2 className="text-2xl font-bold text-[#1a1a1a] mb-4">3. Que mettre dans ton portfolio UGC</h2>
                    <p className="text-sm text-[#1a1a1a]/60 leading-relaxed mb-4">
                        Un bon portfolio UGC contient ces éléments essentiels :
                    </p>
                    <div className="overflow-x-auto mb-4">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-dashed border-[#e8c9b5]">
                                    <th className="text-left text-[#1a1a1a]/50 font-mono text-xs py-2 pr-4">Élément</th>
                                    <th className="text-left text-[#1a1a1a]/50 font-mono text-xs py-2">Pourquoi</th>
                                </tr>
                            </thead>
                            <tbody className="text-[#1a1a1a]/60">
                                <tr className="border-b border-dashed border-[#e8c9b5]">
                                    <td className="py-2 pr-4 text-[#1a1a1a]">Photo + Bio courte</td>
                                    <td className="py-2">Première impression — les marques veulent voir qui tu es</td>
                                </tr>
                                <tr className="border-b border-dashed border-[#e8c9b5]">
                                    <td className="py-2 pr-4 text-[#1a1a1a]">Vidéos / Créations</td>
                                    <td className="py-2">Montre ton style, ta qualité de production, ta créativité</td>
                                </tr>
                                <tr className="border-b border-dashed border-[#e8c9b5]">
                                    <td className="py-2 pr-4 text-[#1a1a1a]">Statistiques</td>
                                    <td className="py-2">Nombre de followers, vues moyennes, taux d&apos;engagement</td>
                                </tr>
                                <tr className="border-b border-dashed border-[#e8c9b5]">
                                    <td className="py-2 pr-4 text-[#1a1a1a]">Tarifs / Services</td>
                                    <td className="py-2">Évite les allers-retours — les marques voient directement si ça match</td>
                                </tr>
                                <tr className="border-b border-dashed border-[#e8c9b5]">
                                    <td className="py-2 pr-4 text-[#1a1a1a]">Liens sociaux</td>
                                    <td className="py-2">TikTok, Instagram, YouTube — preuve sociale</td>
                                </tr>
                                <tr>
                                    <td className="py-2 pr-4 text-[#1a1a1a]">Contact</td>
                                    <td className="py-2">Email pro ou formulaire — facilite la prise de contact</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* ── 4. Erreurs ─────────────────────────────── */}
                <section id="erreurs" className="mb-12">
                    <h2 className="text-2xl font-bold text-[#1a1a1a] mb-4">4. Les 5 erreurs à éviter</h2>
                    <ol className="list-decimal list-inside space-y-3 text-sm text-[#1a1a1a]/60">
                        <li>
                            <strong className="text-[#1a1a1a]">Mettre TOUT ton contenu.</strong>{' '}
                            Sélectionne 5-10 de tes meilleures créations. La qualité prime sur la quantité.
                        </li>
                        <li>
                            <strong className="text-[#1a1a1a]">Oublier tes statistiques.</strong>{' '}
                            Les marques veulent des chiffres. Ajoute tes vues, ton engagement, ta croissance.
                        </li>
                        <li>
                            <strong className="text-[#1a1a1a]">Ne pas afficher tes tarifs.</strong>{' '}
                            Même une fourchette aide. Les marques avec un petit budget ne te feront pas perdre ton temps.
                        </li>
                        <li>
                            <strong className="text-[#1a1a1a]">Un design non professionnel.</strong>{' '}
                            Utilise un template propre. Un Google Doc ou un Canva ne fait pas pro face à un portfolio dédié.
                        </li>
                        <li>
                            <strong className="text-[#1a1a1a]">Ne pas le partager.</strong>{' '}
                            Mets le lien dans ta bio, tes emails, tes candidatures. Un portfolio invisible ne sert à rien.
                        </li>
                    </ol>
                </section>

                {/* ── 5. Différence ──────────────────────────── */}
                <section id="difference" className="mb-12">
                    <h2 className="text-2xl font-bold text-[#1a1a1a] mb-4">5. Portfolio UGC vs Link-in-bio : quelle différence ?</h2>
                    <div className="overflow-x-auto mb-4">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-dashed border-[#e8c9b5]">
                                    <th className="text-left text-[#1a1a1a]/50 font-mono text-xs py-2 pr-4"> </th>
                                    <th className="text-left text-[#ad7b60] font-mono text-xs py-2 pr-4">Portfolio UGC</th>
                                    <th className="text-left text-[#1a1a1a]/50 font-mono text-xs py-2">Link-in-bio</th>
                                </tr>
                            </thead>
                            <tbody className="text-[#1a1a1a]/60">
                                <tr className="border-b border-dashed border-[#e8c9b5]">
                                    <td className="py-2 pr-4 text-[#1a1a1a]/40">Objectif</td>
                                    <td className="py-2 pr-4">Convaincre les marques</td>
                                    <td className="py-2">Rediriger vers tes liens</td>
                                </tr>
                                <tr className="border-b border-dashed border-[#e8c9b5]">
                                    <td className="py-2 pr-4 text-[#1a1a1a]/40">Contenu</td>
                                    <td className="py-2 pr-4">Vidéos, stats, tarifs, bio</td>
                                    <td className="py-2">Liste de liens</td>
                                </tr>
                                <tr className="border-b border-dashed border-[#e8c9b5]">
                                    <td className="py-2 pr-4 text-[#1a1a1a]/40">Design</td>
                                    <td className="py-2 pr-4">Pro, personnalisable</td>
                                    <td className="py-2">Basique, template limité</td>
                                </tr>
                                <tr className="border-b border-dashed border-[#e8c9b5]">
                                    <td className="py-2 pr-4 text-[#1a1a1a]/40">SEO</td>
                                    <td className="py-2 pr-4">Indexé par Google</td>
                                    <td className="py-2">Peu ou pas indexé</td>
                                </tr>
                                <tr>
                                    <td className="py-2 pr-4 text-[#1a1a1a]/40">Exemples</td>
                                    <td className="py-2 pr-4 text-[#ad7b60]">Creafolio</td>
                                    <td className="py-2">Linktree, Beacons</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* ── 6. Créer le sien ───────────────────────── */}
                <section id="creer" className="mb-12">
                    <h2 className="text-2xl font-bold text-[#1a1a1a] mb-4">6. Comment créer ton portfolio UGC avec Creafolio</h2>
                    <p className="text-sm text-[#1a1a1a]/60 leading-relaxed mb-4">
                        <Link href="/" className="text-[#ad7b60] hover:text-[#9a6b50]">Creafolio</Link> est un builder de portfolios
                        conçu spécifiquement pour les créateurs UGC. Voici comment créer le tien en 5 minutes :
                    </p>
                    <ol className="list-decimal list-inside space-y-3 text-sm text-[#1a1a1a]/60 mb-6">
                        <li>
                            <strong className="text-[#1a1a1a]">Inscris-toi gratuitement</strong> sur{' '}
                            <Link href="/signup" className="text-[#ad7b60] hover:text-[#9a6b50]">creafolio.fr/signup</Link>{' '}
                            — aucune carte bancaire requise.
                        </li>
                        <li>
                            <strong className="text-[#1a1a1a]">Choisis un template</strong> parmi les modèles pensés pour les
                            créateurs UGC (TikTok, Instagram, YouTube).
                        </li>
                        <li>
                            <strong className="text-[#1a1a1a]">Personnalise avec le drag &amp; drop</strong> — glisse tes blocs
                            (bio, vidéos, stats, tarifs, liens sociaux) et arrange-les comme tu veux.
                        </li>
                        <li>
                            <strong className="text-[#1a1a1a]">Publie en 1 clic</strong> — ton portfolio est en ligne sur{' '}
                            <code className="text-[#ad7b60]/80 text-xs">creafolio.fr/tonom</code>. Partage le lien dans ta bio !
                        </li>
                    </ol>

                    {/* CTA */}
                    <div className="rounded-xl border border-dashed border-[#ad7b60]/30 bg-[#ad7b60]/5 p-6 text-center">
                        <p className="text-lg font-bold text-[#1a1a1a] mb-2">Prêt à créer ton portfolio UGC ?</p>
                        <p className="text-sm text-[#1a1a1a]/60 mb-4">Gratuit, sans CB, en 5 minutes.</p>
                        <Link
                            href="/signup"
                            className="inline-block rounded-lg bg-[#ad7b60] px-8 py-3 text-sm font-semibold text-white hover:bg-[#d4a485] transition-colors"
                        >
                            Créer mon portfolio UGC — c&apos;est gratuit
                        </Link>
                    </div>
                </section>

                {/* Cross-links */}
                <div className="border-t border-dashed border-[#e8c9b5] pt-8 mt-12">
                    <p className="font-mono text-[9px] uppercase tracking-widest text-[#1a1a1a]/50 mb-3">
                        À LIRE AUSSI
                    </p>
                    <div className="flex flex-wrap gap-4 text-sm">
                        <Link href="/" className="text-[#ad7b60] hover:text-[#9a6b50] transition-colors flex items-center gap-1">
                            Découvrir Creafolio <ArrowRight className="h-3 w-3" />
                        </Link>
                        <Link href="/pricing" className="text-[#ad7b60] hover:text-[#9a6b50] transition-colors flex items-center gap-1">
                            Voir les plans & tarifs <ArrowRight className="h-3 w-3" />
                        </Link>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
