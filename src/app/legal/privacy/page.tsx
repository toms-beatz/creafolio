import type { Metadata } from 'next';
import Link from 'next/link';
import { Scale, ArrowLeft } from 'lucide-react';
import { Nav } from '@/components/landing/nav';
import { Footer } from '@/components/landing/footer';

export const metadata: Metadata = {
    title: 'Politique de Confidentialité',
    description:
        'Politique de confidentialité de Blooprint — comment nous collectons, utilisons et protégeons vos données personnelles.',
};

export default function PrivacyPage() {
    const lastUpdated = '21 février 2026';

    return (
        <div className="min-h-screen bg-zinc-950 text-white">
            <Nav />
            <main className="mx-auto max-w-3xl px-4 py-16">
                <p className="font-mono text-[10px] text-sky-400/60 tracking-widest mb-4 flex items-center gap-1">
                    <Scale className="h-3.5 w-3.5" /> LEGAL // PRIVACY
                </p>
                <h1 className="text-3xl font-bold mb-2">Politique de Confidentialité</h1>
                <p className="text-sm text-zinc-500 mb-10">
                    Dernière mise à jour : {lastUpdated}
                </p>

                <div className="prose prose-invert prose-sm prose-zinc max-w-none space-y-8">
                    <section>
                        <h2 className="text-lg font-semibold text-white border-b border-dashed border-zinc-800 pb-2 mb-4">
                            1. Responsable du traitement
                        </h2>
                        <p className="text-zinc-400 leading-relaxed">
                            Blooprint est édité par TOM$ (micro-entreprise). Pour toute question relative à vos
                            données : <a href="mailto:hello@blooprint.fr" className="text-sky-400 hover:underline">hello@blooprint.fr</a>.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-white border-b border-dashed border-zinc-800 pb-2 mb-4">
                            2. Données collectées
                        </h2>
                        <ul className="list-disc list-inside text-zinc-400 space-y-2">
                            <li><strong className="text-zinc-300">Compte :</strong> email, mot de passe (hashé), username.</li>
                            <li><strong className="text-zinc-300">Portfolio :</strong> contenu Craft.js (textes, images, liens sociaux), titre, slug.</li>
                            <li><strong className="text-zinc-300">Analytics :</strong> hash de session (SHA-256, non réversible), referrer, date de visite. Aucune adresse IP stockée.</li>
                            <li><strong className="text-zinc-300">Facturation :</strong> identifiant Stripe. Les données de carte bancaire sont collectées et traitées exclusivement par Stripe.</li>
                            <li><strong className="text-zinc-300">Signalements :</strong> motif, description, hash IP (non réversible).</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-white border-b border-dashed border-zinc-800 pb-2 mb-4">
                            3. Finalités du traitement
                        </h2>
                        <ul className="list-disc list-inside text-zinc-400 space-y-2">
                            <li>Fournir et améliorer le service Blooprint.</li>
                            <li>Gérer les comptes et les abonnements.</li>
                            <li>Mesurer la fréquentation des portfolios (analytics anonymisées).</li>
                            <li>Assurer la sécurité de la plateforme (modération).</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-white border-b border-dashed border-zinc-800 pb-2 mb-4">
                            4. Bases légales
                        </h2>
                        <ul className="list-disc list-inside text-zinc-400 space-y-2">
                            <li><strong className="text-zinc-300">Exécution du contrat :</strong> gestion du compte, hébergement du portfolio.</li>
                            <li><strong className="text-zinc-300">Consentement :</strong> cookies d&apos;analyse (refusable via le banner).</li>
                            <li><strong className="text-zinc-300">Intérêt légitime :</strong> sécurité, modération, amélioration du service.</li>
                            <li><strong className="text-zinc-300">Obligation légale :</strong> conservation des factures (10 ans).</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-white border-b border-dashed border-zinc-800 pb-2 mb-4">
                            5. Durée de conservation
                        </h2>
                        <ul className="list-disc list-inside text-zinc-400 space-y-2">
                            <li>Données de compte : durée de vie du compte + 30 jours après suppression.</li>
                            <li>Analytics : 12 mois glissants.</li>
                            <li>Factures Stripe : 10 ans (obligation légale).</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-white border-b border-dashed border-zinc-800 pb-2 mb-4">
                            6. Cookies
                        </h2>
                        <ul className="list-disc list-inside text-zinc-400 space-y-2">
                            <li><strong className="text-zinc-300">Cookies essentiels :</strong> session d&apos;authentification Supabase. Exemptés de consentement (nécessaires au fonctionnement).</li>
                            <li><strong className="text-zinc-300">Cookies d&apos;analyse :</strong> soumis au consentement. Refusables via le banner. Aucun cookie tiers (pas de Google Analytics, pas de Facebook Pixel).</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-white border-b border-dashed border-zinc-800 pb-2 mb-4">
                            7. Vos droits (RGPD)
                        </h2>
                        <p className="text-zinc-400 leading-relaxed mb-3">
                            Conformément au RGPD, vous disposez des droits suivants :
                        </p>
                        <ul className="list-disc list-inside text-zinc-400 space-y-2">
                            <li><strong className="text-zinc-300">Accès :</strong> obtenir une copie de vos données.</li>
                            <li><strong className="text-zinc-300">Rectification :</strong> corriger vos données via les paramètres.</li>
                            <li><strong className="text-zinc-300">Effacement :</strong> supprimer votre compte (Paramètres → Compte).</li>
                            <li><strong className="text-zinc-300">Portabilité :</strong> exporter vos données en JSON (Paramètres → Confidentialité).</li>
                            <li><strong className="text-zinc-300">Opposition :</strong> refuser les cookies d&apos;analyse via le banner.</li>
                        </ul>
                        <p className="text-zinc-400 leading-relaxed mt-3">
                            Pour exercer vos droits : <a href="mailto:hello@blooprint.fr" className="text-sky-400 hover:underline">hello@blooprint.fr</a>.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-white border-b border-dashed border-zinc-800 pb-2 mb-4">
                            8. Sous-traitants
                        </h2>
                        <ul className="list-disc list-inside text-zinc-400 space-y-2">
                            <li><strong className="text-zinc-300">Supabase :</strong> hébergement BDD et authentification (EU/US, clauses contractuelles types).</li>
                            <li><strong className="text-zinc-300">Vercel :</strong> hébergement application (US, clauses contractuelles types).</li>
                            <li><strong className="text-zinc-300">Stripe :</strong> paiement et facturation (certifié PCI-DSS, EU).</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-white border-b border-dashed border-zinc-800 pb-2 mb-4">
                            9. Réclamation
                        </h2>
                        <p className="text-zinc-400 leading-relaxed">
                            En cas de litige, vous pouvez adresser une réclamation à la CNIL :{' '}
                            <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:underline">
                                www.cnil.fr
                            </a>.
                        </p>
                    </section>
                </div>

                <div className="mt-12 pt-6 border-t border-dashed border-zinc-800">
                    <Link href="/" className="text-sm text-zinc-500 hover:text-white transition-colors flex items-center gap-1">
                        <ArrowLeft className="h-3.5 w-3.5" /> Retour à l&apos;accueil
                    </Link>
                </div>
            </main>
            <Footer />
        </div>
    );
}
