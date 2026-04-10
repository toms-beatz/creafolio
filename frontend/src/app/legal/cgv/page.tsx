import type { Metadata } from 'next';
import Link from 'next/link';
import { CreditCard, ArrowLeft } from 'lucide-react';
import { Nav } from '@/components/landing/nav';
import { Footer } from '@/components/landing/footer';

export const metadata: Metadata = {
    title: 'Conditions Générales de Vente',
    description:
        'CGV de Creafolio — Conditions applicables aux abonnements Premium et aux paiements.',
};

export default function CgvPage() {
    const lastUpdated = '23 février 2026';

    return (
        <div className="min-h-screen bg-[#f4eeea] text-[#1a1a1a]">
            <Nav />
            <main id="main-content" className="mx-auto max-w-3xl px-4 py-16">
                <p className="font-mono text-[10px] text-[#ad7b60]/60 tracking-widest mb-4 flex items-center gap-1">
                    <CreditCard className="h-3.5 w-3.5" aria-hidden="true" /> LEGAL // CGV
                </p>
                <h1 className="text-3xl font-bold mb-2">
                    Conditions Générales de Vente
                </h1>
                <p className="text-sm text-[#1a1a1a]/50 mb-10">
                    Dernière mise à jour : {lastUpdated}
                </p>

                <div className="prose prose-sm prose-stone max-w-none space-y-8">
                    {/* ── 1. Objet ──────────────────────────────────────────── */}
                    <section>
                        <h2 className="text-lg font-semibold text-[#1a1a1a] border-b border-dashed border-[#e8c9b5] pb-2 mb-4">
                            1. Objet
                        </h2>
                        <p className="text-[#1a1a1a]/70 leading-relaxed">
                            Les présentes Conditions Générales de Vente (CGV) régissent les conditions d&apos;achat
                            des abonnements payants (ci-après &quot;Abonnement Premium&quot;) proposés par Creafolio,
                            édité par TOM$ (micro-entreprise, France), accessible à l&apos;adresse{' '}
                            <a href="https://creafolio.fr" className="text-[#ad7b60] hover:underline">creafolio.fr</a>.
                        </p>
                        <p className="text-[#1a1a1a]/70 leading-relaxed mt-2">
                            Les présentes CGV complètent les{' '}
                            <Link href="/legal/terms" className="text-[#ad7b60] hover:underline">
                                Conditions Générales d&apos;Utilisation (CGU)
                            </Link>{' '}
                            et la{' '}
                            <Link href="/legal/privacy" className="text-[#ad7b60] hover:underline">
                                Politique de Confidentialité
                            </Link>.
                        </p>
                    </section>

                    {/* ── 2. Vendeur ─────────────────────────────────────────── */}
                    <section>
                        <h2 className="text-lg font-semibold text-[#1a1a1a] border-b border-dashed border-[#e8c9b5] pb-2 mb-4">
                            2. Vendeur
                        </h2>
                        <ul className="list-disc list-inside text-[#1a1a1a]/70 space-y-1.5">
                            <li><strong className="text-[#1a1a1a]/80">Dénomination :</strong> TOM$ (micro-entreprise).</li>
                            <li><strong className="text-[#1a1a1a]/80">Pays :</strong> France.</li>
                            <li><strong className="text-[#1a1a1a]/80">Contact :</strong>{' '}
                                <a href="mailto:hello@creafolio.fr" className="text-[#ad7b60] hover:underline">hello@creafolio.fr</a>.
                            </li>
                            <li><strong className="text-[#1a1a1a]/80">TVA :</strong> Non applicable (article 293 B du CGI — régime micro-entreprise).</li>
                        </ul>
                    </section>

                    {/* ── 3. Description des offres ──────────────────────────── */}
                    <section>
                        <h2 className="text-lg font-semibold text-[#1a1a1a] border-b border-dashed border-[#e8c9b5] pb-2 mb-4">
                            3. Description des offres
                        </h2>

                        <h3 className="text-sm font-semibold text-[#1a1a1a]/80 mt-4 mb-2">
                            3.1 Plan Free (gratuit)
                        </h3>
                        <ul className="list-disc list-inside text-[#1a1a1a]/70 space-y-1.5">
                            <li>1 portfolio avec un maximum de 6 blocs.</li>
                            <li>Sous-domaine : creafolio.fr/username.</li>
                            <li>Templates de base.</li>
                            <li>Analytics de base (vues, visiteurs uniques).</li>
                            <li>Watermark Creafolio sur le portfolio.</li>
                            <li>Support standard (email, délai 72h).</li>
                        </ul>

                        <h3 className="text-sm font-semibold text-[#1a1a1a]/80 mt-6 mb-2">
                            3.2 Plan Premium (payant)
                        </h3>
                        <ul className="list-disc list-inside text-[#1a1a1a]/70 space-y-1.5">
                            <li>3 à 5 portfolios avec blocs illimités.</li>
                            <li>Domaine personnalisé (optionnel).</li>
                            <li>Tous les templates disponibles (de base + premium).</li>
                            <li>Analytics avancées (sources de trafic, géolocalisation, taux de clic).</li>
                            <li>Sans watermark Creafolio.</li>
                            <li>Support prioritaire (email, délai 24h).</li>
                        </ul>
                    </section>

                    {/* ── 4. Prix et tarification ────────────────────────────── */}
                    <section>
                        <h2 className="text-lg font-semibold text-[#1a1a1a] border-b border-dashed border-[#e8c9b5] pb-2 mb-4">
                            4. Prix et tarification
                        </h2>
                        <div className="overflow-x-auto mt-3 mb-4">
                            <table className="w-full text-sm text-left" role="table">
                                <thead>
                                    <tr className="border-b border-[#e8c9b5]">
                                        <th className="py-2 pr-4 text-[#1a1a1a]/80 font-semibold">Formule</th>
                                        <th className="py-2 pr-4 text-[#1a1a1a]/80 font-semibold">Prix</th>
                                        <th className="py-2 text-[#1a1a1a]/80 font-semibold">Économie</th>
                                    </tr>
                                </thead>
                                <tbody className="text-[#1a1a1a]/70">
                                    <tr className="border-b border-[#e8c9b5]/50">
                                        <td className="py-2 pr-4">Premium Mensuel</td>
                                        <td className="py-2 pr-4">11 € / mois</td>
                                        <td className="py-2">—</td>
                                    </tr>
                                    <tr>
                                        <td className="py-2 pr-4">Premium Annuel</td>
                                        <td className="py-2 pr-4">79 € / an (soit ~6,58 €/mois)</td>
                                        <td className="py-2">53 € économisés par rapport au mensuel</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <ul className="list-disc list-inside text-[#1a1a1a]/70 space-y-2">
                            <li>Les prix sont affichés en euros (€), toutes taxes comprises (TTC). TVA non applicable (micro-entreprise, article 293 B du CGI).</li>
                            <li>Creafolio se réserve le droit de modifier ses tarifs à tout moment. Les prix applicables sont ceux en vigueur au moment de la souscription.</li>
                            <li>Toute modification tarifaire sera communiquée aux abonnés au moins 30 jours avant la prochaine échéance de renouvellement.</li>
                        </ul>
                    </section>

                    {/* ── 5. Essai gratuit ───────────────────────────────────── */}
                    <section>
                        <h2 className="text-lg font-semibold text-[#1a1a1a] border-b border-dashed border-[#e8c9b5] pb-2 mb-4">
                            5. Essai gratuit
                        </h2>
                        <ul className="list-disc list-inside text-[#1a1a1a]/70 space-y-2">
                            <li>À l&apos;inscription, chaque nouvel utilisateur bénéficie automatiquement de <strong className="text-[#1a1a1a]/80">7 jours d&apos;essai Premium gratuit</strong>.</li>
                            <li>L&apos;essai ne nécessite aucune carte bancaire.</li>
                            <li>À l&apos;expiration de l&apos;essai, le compte passe automatiquement au plan Free si aucun abonnement n&apos;a été souscrit.</li>
                            <li>L&apos;essai gratuit est accordé une seule fois par utilisateur (vérifié par email).</li>
                        </ul>
                    </section>

                    {/* ── 6. Commande et paiement ────────────────────────────── */}
                    <section>
                        <h2 className="text-lg font-semibold text-[#1a1a1a] border-b border-dashed border-[#e8c9b5] pb-2 mb-4">
                            6. Commande et paiement
                        </h2>

                        <h3 className="text-sm font-semibold text-[#1a1a1a]/80 mt-4 mb-2">
                            6.1 Processus de souscription
                        </h3>
                        <ul className="list-disc list-inside text-[#1a1a1a]/70 space-y-1.5">
                            <li>L&apos;utilisateur choisit sa formule (mensuelle ou annuelle) depuis la page{' '}
                                <Link href="/pricing" className="text-[#ad7b60] hover:underline">Pricing</Link> ou son Dashboard.</li>
                            <li>Il est redirigé vers Stripe Checkout pour le paiement sécurisé.</li>
                            <li>L&apos;abonnement est activé immédiatement après confirmation du paiement.</li>
                        </ul>

                        <h3 className="text-sm font-semibold text-[#1a1a1a]/80 mt-6 mb-2">
                            6.2 Moyens de paiement
                        </h3>
                        <ul className="list-disc list-inside text-[#1a1a1a]/70 space-y-1.5">
                            <li>Carte bancaire (Visa, Mastercard, American Express) via Stripe.</li>
                            <li>Les données de paiement ne sont jamais stockées sur les serveurs de Creafolio. Elles sont traitées exclusivement par Stripe (PCI-DSS Level 1).</li>
                        </ul>

                        <h3 className="text-sm font-semibold text-[#1a1a1a]/80 mt-6 mb-2">
                            6.3 Facturation
                        </h3>
                        <ul className="list-disc list-inside text-[#1a1a1a]/70 space-y-1.5">
                            <li>Un reçu de paiement est envoyé par email après chaque transaction.</li>
                            <li>L&apos;historique de facturation est accessible depuis le Dashboard → Compte.</li>
                            <li>Les factures sont conservées 10 ans conformément aux obligations légales.</li>
                        </ul>
                    </section>

                    {/* ── 7. Renouvellement ──────────────────────────────────── */}
                    <section>
                        <h2 className="text-lg font-semibold text-[#1a1a1a] border-b border-dashed border-[#e8c9b5] pb-2 mb-4">
                            7. Renouvellement automatique
                        </h2>
                        <ul className="list-disc list-inside text-[#1a1a1a]/70 space-y-2">
                            <li>L&apos;abonnement Premium est renouvelé automatiquement à chaque échéance (mensuelle ou annuelle).</li>
                            <li>Un email de rappel est envoyé 7 jours avant le renouvellement.</li>
                            <li>L&apos;utilisateur peut désactiver le renouvellement automatique à tout moment depuis son Dashboard ou le portail Stripe.</li>
                            <li>En cas de désactivation, l&apos;accès Premium reste actif jusqu&apos;à la fin de la période payée.</li>
                        </ul>
                    </section>

                    {/* ── 8. Résiliation ──────────────────────────────────────── */}
                    <section>
                        <h2 className="text-lg font-semibold text-[#1a1a1a] border-b border-dashed border-[#e8c9b5] pb-2 mb-4">
                            8. Résiliation
                        </h2>
                        <ul className="list-disc list-inside text-[#1a1a1a]/70 space-y-2">
                            <li><strong className="text-[#1a1a1a]/80">Par l&apos;utilisateur :</strong> l&apos;abonnement peut être résilié à tout moment via le Dashboard → Compte, ou en contactant hello@creafolio.fr. Aucun engagement de durée.</li>
                            <li><strong className="text-[#1a1a1a]/80">Par Creafolio :</strong> en cas de violation des CGU, de la{' '}
                                <Link href="/legal/charter" className="text-[#ad7b60] hover:underline">Charte d&apos;utilisation</Link>,
                                ou en cas de fraude au paiement, Creafolio peut suspendre ou résilier l&apos;abonnement sans préavis.
                            </li>
                            <li>En cas de résiliation, aucun prorata n&apos;est appliqué : l&apos;accès reste actif jusqu&apos;à la fin de la période en cours.</li>
                        </ul>
                    </section>

                    {/* ── 9. Droit de rétractation ────────────────────────────── */}
                    <section>
                        <h2 className="text-lg font-semibold text-[#1a1a1a] border-b border-dashed border-[#e8c9b5] pb-2 mb-4">
                            9. Droit de rétractation et remboursement
                        </h2>
                        <p className="text-[#1a1a1a]/70 leading-relaxed mb-3">
                            Conformément à l&apos;article L221-28 du Code de la consommation, le droit de rétractation
                            ne s&apos;applique pas aux services numériques pleinement exécutés avant la fin du délai
                            de rétractation, ce que l&apos;utilisateur accepte expressément lors de la souscription.
                        </p>
                        <p className="text-[#1a1a1a]/70 leading-relaxed mb-3">
                            Toutefois, Creafolio propose une <strong className="text-[#1a1a1a]/80">garantie satisfait ou remboursé de 14 jours</strong> :
                        </p>
                        <ul className="list-disc list-inside text-[#1a1a1a]/70 space-y-1.5">
                            <li>Dans les 14 jours suivant le premier paiement, vous pouvez demander un remboursement intégral, sans justification.</li>
                            <li>Pour les renouvellements suivants, aucun remboursement n&apos;est possible, mais la résiliation prend effet immédiatement.</li>
                            <li>Pour demander un remboursement, envoyez un email à{' '}
                                <a href="mailto:hello@creafolio.fr" className="text-[#ad7b60] hover:underline">hello@creafolio.fr</a>{' '}
                                avec votre email de compte. Le remboursement est traité sous 5 jours ouvrés via Stripe.</li>
                        </ul>
                    </section>

                    {/* ── 10. Échec de paiement ──────────────────────────────── */}
                    <section>
                        <h2 className="text-lg font-semibold text-[#1a1a1a] border-b border-dashed border-[#e8c9b5] pb-2 mb-4">
                            10. Échec de paiement
                        </h2>
                        <ul className="list-disc list-inside text-[#1a1a1a]/70 space-y-2">
                            <li>En cas d&apos;échec du prélèvement (carte expirée, fonds insuffisants), Stripe effectue automatiquement jusqu&apos;à 3 tentatives sur 7 jours.</li>
                            <li>L&apos;utilisateur est notifié par email à chaque tentative.</li>
                            <li>Si le paiement échoue définitivement, l&apos;abonnement est annulé et le compte repasse au plan Free.</li>
                            <li>Les portfolios et données existants sont conservés, mais les fonctionnalités Premium sont désactivées.</li>
                        </ul>
                    </section>

                    {/* ── 11. Responsabilités ────────────────────────────────── */}
                    <section>
                        <h2 className="text-lg font-semibold text-[#1a1a1a] border-b border-dashed border-[#e8c9b5] pb-2 mb-4">
                            11. Limitation de responsabilité
                        </h2>
                        <ul className="list-disc list-inside text-[#1a1a1a]/70 space-y-2">
                            <li>Creafolio s&apos;engage à fournir un service disponible et fonctionnel, mais ne garantit pas une disponibilité de 100 %.</li>
                            <li>En cas d&apos;interruption prolongée (plus de 72h) imputable à Creafolio, une extension de la période d&apos;abonnement équivalente sera accordée.</li>
                            <li>La responsabilité de Creafolio ne saurait excéder le montant total payé par l&apos;utilisateur au cours des 12 derniers mois.</li>
                        </ul>
                    </section>

                    {/* ── 12. Données personnelles ────────────────────────────── */}
                    <section>
                        <h2 className="text-lg font-semibold text-[#1a1a1a] border-b border-dashed border-[#e8c9b5] pb-2 mb-4">
                            12. Données personnelles et paiement
                        </h2>
                        <ul className="list-disc list-inside text-[#1a1a1a]/70 space-y-2">
                            <li>Les données de paiement sont traitées par{' '}
                                <a href="https://stripe.com/fr/privacy" target="_blank" rel="noopener noreferrer" className="text-[#ad7b60] hover:underline">Stripe</a>,
                                certifié PCI-DSS Level 1.
                            </li>
                            <li>Creafolio ne stocke jamais les numéros de carte bancaire.</li>
                            <li>Seuls sont conservés : ID Stripe client, ID abonnement, statut de paiement et dates de facturation.</li>
                            <li>Pour plus d&apos;informations, consultez notre{' '}
                                <Link href="/legal/privacy" className="text-[#ad7b60] hover:underline">Politique de Confidentialité</Link>.
                            </li>
                        </ul>
                    </section>

                    {/* ── 13. Médiation ───────────────────────────────────────── */}
                    <section>
                        <h2 className="text-lg font-semibold text-[#1a1a1a] border-b border-dashed border-[#e8c9b5] pb-2 mb-4">
                            13. Médiation et litiges
                        </h2>
                        <p className="text-[#1a1a1a]/70 leading-relaxed mb-3">
                            En cas de litige, l&apos;utilisateur est invité à contacter Creafolio en premier lieu à{' '}
                            <a href="mailto:hello@creafolio.fr" className="text-[#ad7b60] hover:underline">hello@creafolio.fr</a>{' '}
                            pour tenter une résolution amiable.
                        </p>
                        <p className="text-[#1a1a1a]/70 leading-relaxed mb-3">
                            Conformément aux articles L611-1 et suivants du Code de la consommation, le consommateur
                            a le droit de recourir gratuitement à un médiateur de la consommation en vue de la résolution
                            amiable du litige. Creafolio mettra à disposition les informations du médiateur compétent
                            sur demande.
                        </p>
                        <p className="text-[#1a1a1a]/70 leading-relaxed">
                            Le consommateur peut également utiliser la plateforme de résolution en ligne de la Commission européenne :{' '}
                            <a
                                href="https://ec.europa.eu/consumers/odr"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#ad7b60] hover:underline break-all"
                            >
                                https://ec.europa.eu/consumers/odr
                            </a>.
                        </p>
                    </section>

                    {/* ── 14. Droit applicable ───────────────────────────────── */}
                    <section>
                        <h2 className="text-lg font-semibold text-[#1a1a1a] border-b border-dashed border-[#e8c9b5] pb-2 mb-4">
                            14. Droit applicable
                        </h2>
                        <p className="text-[#1a1a1a]/70 leading-relaxed">
                            Les présentes CGV sont régies par le droit français. Tout litige non résolu à l&apos;amiable
                            sera soumis aux tribunaux compétents de France.
                        </p>
                    </section>
                </div>

                <div className="mt-12 pt-6 border-t border-dashed border-[#e8c9b5] flex items-center justify-between">
                    <Link href="/" className="text-sm text-zinc-500 hover:text-[#1a1a1a] transition-colors flex items-center gap-1">
                        <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" /> Retour à l&apos;accueil
                    </Link>
                    <div className="flex items-center gap-4 text-xs text-zinc-600">
                        <Link href="/legal/terms" className="hover:text-[#1a1a1a]/70 transition-colors">CGU</Link>
                        <Link href="/legal/charter" className="hover:text-[#1a1a1a]/70 transition-colors">Charte</Link>
                        <Link href="/legal/privacy" className="hover:text-[#1a1a1a]/70 transition-colors">Confidentialité</Link>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
