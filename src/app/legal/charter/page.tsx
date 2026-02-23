import type { Metadata } from 'next';
import Link from 'next/link';
import { Shield, ArrowLeft, AlertTriangle, Ban, CheckCircle2, Scale } from 'lucide-react';
import { Nav } from '@/components/landing/nav';
import { Footer } from '@/components/landing/footer';

export const metadata: Metadata = {
    title: 'Charte d\'utilisation et d\'éthique',
    description:
        'Charte d\'utilisation et d\'éthique de Blooprint — Règles de contenu et limites applicables aux portfolios publiés.',
};

export default function CharterPage() {
    const lastUpdated = '23 février 2026';

    return (
        <div className="min-h-screen bg-zinc-950 text-white">
            <Nav />
            <main id="main-content" className="mx-auto max-w-3xl px-4 py-16">
                <p className="font-mono text-[10px] text-sky-400/60 tracking-widest mb-4 flex items-center gap-1">
                    <Shield className="h-3.5 w-3.5" aria-hidden="true" /> LEGAL // CHARTE
                </p>
                <h1 className="text-3xl font-bold mb-2">
                    Charte d&apos;utilisation et d&apos;éthique
                </h1>
                <p className="text-sm text-zinc-500 mb-10">
                    Dernière mise à jour : {lastUpdated}
                </p>

                <div className="prose prose-invert prose-sm prose-zinc max-w-none space-y-8">
                    {/* ── Préambule ─────────────────────────────────────────── */}
                    <section>
                        <h2 className="text-lg font-semibold text-white border-b border-dashed border-zinc-800 pb-2 mb-4">
                            Préambule
                        </h2>
                        <p className="text-zinc-400 leading-relaxed">
                            Blooprint est une plateforme de création de portfolios pour créateurs de contenu UGC (User Generated Content).
                            Les portfolios publiés via Blooprint sont accessibles publiquement sur Internet. Cette charte définit
                            les règles de contenu que chaque utilisateur s&apos;engage à respecter en utilisant le service.
                            Elle complète les{' '}
                            <Link href="/legal/terms" className="text-sky-400 hover:underline">
                                Conditions Générales d&apos;Utilisation
                            </Link>{' '}
                            et les{' '}
                            <Link href="/legal/cgv" className="text-sky-400 hover:underline">
                                Conditions Générales de Vente
                            </Link>.
                        </p>
                    </section>

                    {/* ── 1. Principe général ────────────────────────────────── */}
                    <section>
                        <h2 className="text-lg font-semibold text-white border-b border-dashed border-zinc-800 pb-2 mb-4">
                            1. Principe général
                        </h2>
                        <p className="text-zinc-400 leading-relaxed">
                            Tout contenu publié sur un portfolio Blooprint doit être <strong className="text-zinc-200">légal,
                                authentique, respectueux et professionnel</strong>. Blooprint se destine à la promotion professionnelle
                            de créateurs de contenu : les portfolios doivent refléter cette vocation.
                        </p>
                    </section>

                    {/* ── 2. Contenus autorisés ───────────────────────────────── */}
                    <section>
                        <h2 className="text-lg font-semibold text-white border-b border-dashed border-zinc-800 pb-2 mb-4">
                            <span className="inline-flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-emerald-400" aria-hidden="true" />
                                2. Contenus autorisés
                            </span>
                        </h2>
                        <p className="text-zinc-400 leading-relaxed mb-3">
                            Les contenus suivants sont acceptés sur les portfolios Blooprint :
                        </p>
                        <ul className="list-disc list-inside text-zinc-400 space-y-2">
                            <li>Vidéos et photos de créations UGC (publicités, reviews produits, unboxings, tutoriels, etc.).</li>
                            <li>Bio professionnelle, présentation personnelle et photo de profil.</li>
                            <li>Statistiques de performance (vues, engagement, abonnés) — véridiques et vérifiables.</li>
                            <li>Tarifs et grilles de prix pour les prestations UGC.</li>
                            <li>Liens vers vos réseaux sociaux (Instagram, TikTok, YouTube, LinkedIn, etc.).</li>
                            <li>Témoignages et avis de marques/clients avec leur consentement.</li>
                            <li>Logos de marques avec lesquelles vous avez collaboré, dans un cadre de référence professionnelle.</li>
                            <li>Textes de présentation, FAQ, conditions de collaboration.</li>
                            <li>Coordonnées de contact professionnelles (email, formulaire).</li>
                        </ul>
                    </section>

                    {/* ── 3. Contenus strictement interdits ──────────────────── */}
                    <section>
                        <h2 className="text-lg font-semibold text-white border-b border-dashed border-zinc-800 pb-2 mb-4">
                            <span className="inline-flex items-center gap-2">
                                <Ban className="h-4 w-4 text-red-400" aria-hidden="true" />
                                3. Contenus strictement interdits
                            </span>
                        </h2>
                        <p className="text-zinc-400 leading-relaxed mb-3">
                            Les contenus suivants sont <strong className="text-red-400">formellement interdits</strong> et
                            entraîneront la suspension ou la suppression immédiate du portfolio :
                        </p>

                        <h3 className="text-sm font-semibold text-zinc-200 mt-6 mb-2">
                            3.1 Contenu à caractère sexuel ou pornographique
                        </h3>
                        <ul className="list-disc list-inside text-zinc-400 space-y-1.5">
                            <li>Nudité explicite totale ou partielle (hors contexte artistique légitime).</li>
                            <li>Contenu sexuellement suggestif destiné à la promotion de services pour adultes.</li>
                            <li>Liens vers des plateformes de contenu pour adultes (OnlyFans NSFW, sites pornographiques, etc.).</li>
                            <li>Sollicitation sexuelle sous toute forme.</li>
                        </ul>

                        <h3 className="text-sm font-semibold text-zinc-200 mt-6 mb-2">
                            3.2 Contenu haineux et discriminatoire
                        </h3>
                        <ul className="list-disc list-inside text-zinc-400 space-y-1.5">
                            <li>Propos racistes, xénophobes, antisémites, islamophobes ou homophobes.</li>
                            <li>Discrimination fondée sur le sexe, l&apos;orientation sexuelle, l&apos;identité de genre, le handicap, l&apos;âge, la religion ou l&apos;origine ethnique.</li>
                            <li>Apologie du terrorisme, de la violence, ou de mouvements extrémistes.</li>
                            <li>Harcèlement, cyberharcèlement ou intimidation envers un individu ou un groupe.</li>
                        </ul>

                        <h3 className="text-sm font-semibold text-zinc-200 mt-6 mb-2">
                            3.3 Contenu violent ou dangereux
                        </h3>
                        <ul className="list-disc list-inside text-zinc-400 space-y-1.5">
                            <li>Images ou vidéos de violence explicite, gore ou cruauté.</li>
                            <li>Promotion d&apos;armes, de drogues ou de substances illicites.</li>
                            <li>Incitation à l&apos;automutilation, au suicide ou aux troubles alimentaires.</li>
                            <li>Tutoriels ou guides pour des activités illégales ou dangereuses.</li>
                        </ul>

                        <h3 className="text-sm font-semibold text-zinc-200 mt-6 mb-2">
                            3.4 Contenu frauduleux ou trompeur
                        </h3>
                        <ul className="list-disc list-inside text-zinc-400 space-y-1.5">
                            <li>Usurpation d&apos;identité : se faire passer pour une autre personne, marque ou organisation.</li>
                            <li>Fausses statistiques de performance (vues, abonnés, engagement gonflés artificiellement).</li>
                            <li>Faux témoignages ou avis inventés.</li>
                            <li>Phishing, arnaques, liens malveillants ou redirection vers des sites frauduleux.</li>
                            <li>Spam, contenu généré en masse sans valeur ou portfolio créé uniquement pour le référencement (SEO spam).</li>
                        </ul>

                        <h3 className="text-sm font-semibold text-zinc-200 mt-6 mb-2">
                            3.5 Atteinte à la propriété intellectuelle
                        </h3>
                        <ul className="list-disc list-inside text-zinc-400 space-y-1.5">
                            <li>Utilisation de vidéos, photos ou musiques dont vous n&apos;êtes pas l&apos;auteur ou sans licence.</li>
                            <li>Reproduction non autorisée de logos, marques déposées ou contenus protégés par le droit d&apos;auteur.</li>
                            <li>Plagiat de portfolios d&apos;autres créateurs.</li>
                        </ul>

                        <h3 className="text-sm font-semibold text-zinc-200 mt-6 mb-2">
                            3.6 Contenu impliquant des mineurs
                        </h3>
                        <ul className="list-disc list-inside text-zinc-400 space-y-1.5">
                            <li>Tout contenu sexualisant, exploitant ou mettant en danger des mineurs.</li>
                            <li>Toute violation sera signalée aux autorités compétentes conformément à la loi française.</li>
                        </ul>
                    </section>

                    {/* ── 4. Contenus soumis à vigilance ─────────────────────── */}
                    <section>
                        <h2 className="text-lg font-semibold text-white border-b border-dashed border-zinc-800 pb-2 mb-4">
                            <span className="inline-flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4 text-amber-400" aria-hidden="true" />
                                4. Contenus soumis à vigilance
                            </span>
                        </h2>
                        <p className="text-zinc-400 leading-relaxed mb-3">
                            Les contenus suivants sont autorisés sous conditions et pourront faire l&apos;objet d&apos;une vérification :
                        </p>
                        <ul className="list-disc list-inside text-zinc-400 space-y-2">
                            <li>
                                <strong className="text-zinc-300">Contenu beauté/fitness :</strong> accepté tant qu&apos;il reste professionnel et ne verse pas dans le contenu sexuellement suggestif.
                            </li>
                            <li>
                                <strong className="text-zinc-300">Promotions de produits de santé :</strong> autorisé si le contenu ne contient pas de fausses allégations médicales.
                            </li>
                            <li>
                                <strong className="text-zinc-300">Jeux d&apos;argent / paris :</strong> contenu de créateurs sponsorisés par des plateformes de paris autorisé uniquement si la législation locale du créateur le permet et que la mention &quot;publicité&quot; est clairement visible.
                            </li>
                            <li>
                                <strong className="text-zinc-300">Alcool / tabac :</strong> contenu sponsorisé accepté uniquement si conforme à la loi Évin et aux réglementations en vigueur.
                            </li>
                            <li>
                                <strong className="text-zinc-300">Cryptomonnaies / NFT :</strong> autorisé sans promesse de gain garanti, avec mention &quot;investissement à risque&quot;.
                            </li>
                            <li>
                                <strong className="text-zinc-300">Contenu politique :</strong> autorisé dans un cadre informatif et respectueux, sans propagande, désinformation ou incitation à la haine.
                            </li>
                        </ul>
                    </section>

                    {/* ── 5. Obligations de transparence ──────────────────────── */}
                    <section>
                        <h2 className="text-lg font-semibold text-white border-b border-dashed border-zinc-800 pb-2 mb-4">
                            5. Obligations de transparence
                        </h2>
                        <ul className="list-disc list-inside text-zinc-400 space-y-2">
                            <li>Les collaborations commerciales doivent être identifiées comme telles (mention &quot;partenariat&quot;, &quot;sponsorisé&quot; ou &quot;collaboration&quot;).</li>
                            <li>Les statistiques affichées doivent être exactes et à jour. Blooprint se réserve le droit de demander une preuve.</li>
                            <li>L&apos;identité du créateur doit être authentique. Les pseudonymes sont autorisés tant qu&apos;ils ne constituent pas une usurpation d&apos;identité.</li>
                            <li>Le portfolio ne doit pas induire en erreur les marques ou les visiteurs sur la nature des services proposés.</li>
                        </ul>
                    </section>

                    {/* ── 6. Politique de modération ──────────────────────────── */}
                    <section>
                        <h2 className="text-lg font-semibold text-white border-b border-dashed border-zinc-800 pb-2 mb-4">
                            <span className="inline-flex items-center gap-2">
                                <Scale className="h-4 w-4 text-sky-400" aria-hidden="true" />
                                6. Politique de modération
                            </span>
                        </h2>

                        <h3 className="text-sm font-semibold text-zinc-200 mt-4 mb-2">
                            6.1 Signalement
                        </h3>
                        <p className="text-zinc-400 leading-relaxed mb-3">
                            Tout visiteur peut signaler un portfolio contenant du contenu contraire à cette charte
                            via le bouton de signalement présent sur chaque portfolio, ou en contactant{' '}
                            <a href="mailto:hello@blooprint.fr" className="text-sky-400 hover:underline">hello@blooprint.fr</a>.
                        </p>

                        <h3 className="text-sm font-semibold text-zinc-200 mt-4 mb-2">
                            6.2 Procédure de traitement
                        </h3>
                        <ul className="list-disc list-inside text-zinc-400 space-y-1.5">
                            <li><strong className="text-zinc-300">Examen :</strong> chaque signalement est traité manuellement sous 48 heures ouvrées.</li>
                            <li><strong className="text-zinc-300">Avertissement :</strong> pour une première infraction mineure, un avertissement est envoyé avec 48h pour corriger.</li>
                            <li><strong className="text-zinc-300">Suspension :</strong> le portfolio est dépublié temporairement en cas d&apos;infraction grave ou de récidive.</li>
                            <li><strong className="text-zinc-300">Suppression :</strong> le portfolio et/ou le compte sont supprimés définitivement en cas d&apos;infraction majeure.</li>
                        </ul>

                        <h3 className="text-sm font-semibold text-zinc-200 mt-4 mb-2">
                            6.3 Barème des sanctions
                        </h3>
                        <div className="overflow-x-auto mt-3">
                            <table className="w-full text-sm text-left" role="table">
                                <thead>
                                    <tr className="border-b border-zinc-800">
                                        <th className="py-2 pr-4 text-zinc-300 font-semibold">Infraction</th>
                                        <th className="py-2 pr-4 text-zinc-300 font-semibold">1ère fois</th>
                                        <th className="py-2 text-zinc-300 font-semibold">Récidive</th>
                                    </tr>
                                </thead>
                                <tbody className="text-zinc-400">
                                    <tr className="border-b border-zinc-800/50">
                                        <td className="py-2 pr-4">Statistiques exagérées</td>
                                        <td className="py-2 pr-4">Avertissement</td>
                                        <td className="py-2">Suspension 7 jours</td>
                                    </tr>
                                    <tr className="border-b border-zinc-800/50">
                                        <td className="py-2 pr-4">Contenu trompeur / spam</td>
                                        <td className="py-2 pr-4">Suspension 7 jours</td>
                                        <td className="py-2">Suppression du portfolio</td>
                                    </tr>
                                    <tr className="border-b border-zinc-800/50">
                                        <td className="py-2 pr-4">Atteinte propriété intellectuelle</td>
                                        <td className="py-2 pr-4">Suspension + retrait du contenu</td>
                                        <td className="py-2">Suppression du compte</td>
                                    </tr>
                                    <tr className="border-b border-zinc-800/50">
                                        <td className="py-2 pr-4">Contenu NSFW / sexuel</td>
                                        <td className="py-2 pr-4">Suppression du portfolio</td>
                                        <td className="py-2">Suppression du compte</td>
                                    </tr>
                                    <tr className="border-b border-zinc-800/50">
                                        <td className="py-2 pr-4">Contenu haineux / violent</td>
                                        <td className="py-2 pr-4">Suppression immédiate</td>
                                        <td className="py-2">Suppression du compte</td>
                                    </tr>
                                    <tr>
                                        <td className="py-2 pr-4">Contenu impliquant des mineurs</td>
                                        <td className="py-2 pr-4" colSpan={2}>Suppression immédiate + signalement aux autorités</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* ── 7. Droit de recours ────────────────────────────────── */}
                    <section>
                        <h2 className="text-lg font-semibold text-white border-b border-dashed border-zinc-800 pb-2 mb-4">
                            7. Droit de recours
                        </h2>
                        <p className="text-zinc-400 leading-relaxed">
                            Tout utilisateur dont le portfolio a été suspendu ou supprimé peut exercer un droit de recours
                            en contactant{' '}
                            <a href="mailto:hello@blooprint.fr" className="text-sky-400 hover:underline">hello@blooprint.fr</a>{' '}
                            dans un délai de 15 jours suivant la notification. Le recours sera examiné sous 5 jours ouvrés.
                            La décision finale de Blooprint est définitive.
                        </p>
                    </section>

                    {/* ── 8. Engagement éthique ───────────────────────────────── */}
                    <section>
                        <h2 className="text-lg font-semibold text-white border-b border-dashed border-zinc-800 pb-2 mb-4">
                            8. Engagement éthique de Blooprint
                        </h2>
                        <p className="text-zinc-400 leading-relaxed mb-3">
                            De notre côté, Blooprint s&apos;engage à :
                        </p>
                        <ul className="list-disc list-inside text-zinc-400 space-y-2">
                            <li>Traiter chaque signalement de manière impartiale et sans discrimination.</li>
                            <li>Ne jamais utiliser le contenu des portfolios à des fins publicitaires sans consentement explicite.</li>
                            <li>Communiquer clairement les raisons d&apos;une suspension ou suppression.</li>
                            <li>Respecter la liberté d&apos;expression dans les limites de la loi et de la présente charte.</li>
                            <li>Protéger les données personnelles des utilisateurs conformément au RGPD.</li>
                        </ul>
                    </section>

                    {/* ── 9. Évolutions ───────────────────────────────────────── */}
                    <section>
                        <h2 className="text-lg font-semibold text-white border-b border-dashed border-zinc-800 pb-2 mb-4">
                            9. Évolution de cette charte
                        </h2>
                        <p className="text-zinc-400 leading-relaxed">
                            Cette charte peut être mise à jour à tout moment. Les utilisateurs seront notifiés par email
                            en cas de modification substantielle. L&apos;utilisation du service après notification vaut
                            acceptation des nouvelles conditions.
                        </p>
                    </section>

                    {/* ── Contact ─────────────────────────────────────────────── */}
                    <section>
                        <h2 className="text-lg font-semibold text-white border-b border-dashed border-zinc-800 pb-2 mb-4">
                            10. Contact
                        </h2>
                        <p className="text-zinc-400 leading-relaxed">
                            Pour toute question relative à cette charte, contactez-nous à{' '}
                            <a href="mailto:hello@blooprint.fr" className="text-sky-400 hover:underline">hello@blooprint.fr</a>.
                        </p>
                    </section>
                </div>

                <div className="mt-12 pt-6 border-t border-dashed border-zinc-800 flex items-center justify-between">
                    <Link href="/" className="text-sm text-zinc-500 hover:text-white transition-colors flex items-center gap-1">
                        <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" /> Retour à l&apos;accueil
                    </Link>
                    <div className="flex items-center gap-4 text-xs text-zinc-600">
                        <Link href="/legal/terms" className="hover:text-zinc-400 transition-colors">CGU</Link>
                        <Link href="/legal/cgv" className="hover:text-zinc-400 transition-colors">CGV</Link>
                        <Link href="/legal/privacy" className="hover:text-zinc-400 transition-colors">Confidentialité</Link>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
