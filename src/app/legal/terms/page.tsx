import type { Metadata } from 'next';
import Link from 'next/link';
import { Scale, ArrowLeft } from 'lucide-react';
import { Nav } from '@/components/landing/nav';
import { Footer } from '@/components/landing/footer';

export const metadata: Metadata = {
    title: 'Conditions Générales d\'Utilisation',
    description:
        'CGU de Blooprint — Conditions d\'utilisation du service de création de portfolios UGC.',
};

export default function TermsPage() {
    const lastUpdated = '21 février 2026';

    return (
        <div className="min-h-screen bg-zinc-950 text-white">
            <Nav />
            <main className="mx-auto max-w-3xl px-4 py-16">
                <p className="font-mono text-[10px] text-sky-400/60 tracking-widest mb-4 flex items-center gap-1">
                    <Scale className="h-3.5 w-3.5" /> LEGAL // CGU
                </p>
                <h1 className="text-3xl font-bold mb-2">
                    Conditions Générales d&apos;Utilisation
                </h1>
                <p className="text-sm text-zinc-500 mb-10">
                    Dernière mise à jour : {lastUpdated}
                </p>

                <div className="prose prose-invert prose-sm prose-zinc max-w-none space-y-8">
                    <section>
                        <h2 className="text-lg font-semibold text-white border-b border-dashed border-zinc-800 pb-2 mb-4">
                            1. Objet
                        </h2>
                        <p className="text-zinc-400 leading-relaxed">
                            Blooprint est un service en ligne (SaaS) permettant aux créateurs de contenu UGC de
                            créer, personnaliser et publier un portfolio professionnel. Les présentes CGU régissent
                            l&apos;utilisation du service accessible à l&apos;adresse{' '}
                            <a href="https://blooprint.fr" className="text-sky-400 hover:underline">blooprint.fr</a>.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-white border-b border-dashed border-zinc-800 pb-2 mb-4">
                            2. Éditeur
                        </h2>
                        <p className="text-zinc-400 leading-relaxed">
                            Blooprint est édité par TOM$ (micro-entreprise, France).
                            Contact : <a href="mailto:hello@blooprint.fr" className="text-sky-400 hover:underline">hello@blooprint.fr</a>.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-white border-b border-dashed border-zinc-800 pb-2 mb-4">
                            3. Inscription
                        </h2>
                        <ul className="list-disc list-inside text-zinc-400 space-y-2">
                            <li>L&apos;inscription est gratuite. Un essai Premium de 7 jours est offert automatiquement.</li>
                            <li>L&apos;utilisateur doit fournir une adresse email valide et un mot de passe sécurisé (8 caractères minimum).</li>
                            <li>Le username doit respecter le format : 3-30 caractères, lettres minuscules, chiffres et tirets uniquement.</li>
                            <li>L&apos;acceptation des présentes CGU est obligatoire à l&apos;inscription.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-white border-b border-dashed border-zinc-800 pb-2 mb-4">
                            4. Plans et tarification
                        </h2>
                        <ul className="list-disc list-inside text-zinc-400 space-y-2">
                            <li><strong className="text-zinc-300">Free :</strong> 1 portfolio, 6 blocs maximum, analytics basiques, watermark Blooprint.</li>
                            <li><strong className="text-zinc-300">Premium :</strong> 11€/mois ou 79€/an. 3-5 portfolios, blocs illimités, analytics avancées, sans watermark.</li>
                            <li>Les paiements sont gérés par Stripe. L&apos;abonnement peut être annulé à tout moment sans engagement.</li>
                            <li>Remboursement : 14 jours satisfait ou remboursé, sans question. Écrivez à <a href="mailto:hello@blooprint.fr" className="text-sky-400 hover:underline">hello@blooprint.fr</a>.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-white border-b border-dashed border-zinc-800 pb-2 mb-4">
                            5. Contenu
                        </h2>
                        <p className="text-zinc-400 leading-relaxed mb-3">
                            L&apos;utilisateur est seul responsable du contenu publié sur son portfolio. Sont interdits :
                        </p>
                        <ul className="list-disc list-inside text-zinc-400 space-y-2">
                            <li>Contenu à caractère sexuel explicite (NSFW).</li>
                            <li>Contenus haineux, discriminatoires ou incitant à la violence.</li>
                            <li>Spam, escroquerie, phishing ou contenu trompeur.</li>
                            <li>Contenu portant atteinte aux droits de propriété intellectuelle d&apos;un tiers.</li>
                        </ul>
                        <p className="text-zinc-400 leading-relaxed mt-3">
                            Blooprint se réserve le droit de suspendre tout portfolio signalé et contrevenant aux règles ci-dessus.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-white border-b border-dashed border-zinc-800 pb-2 mb-4">
                            6. Propriété intellectuelle
                        </h2>
                        <ul className="list-disc list-inside text-zinc-400 space-y-2">
                            <li>Le service Blooprint (code, design, marque) est la propriété de TOM$.</li>
                            <li>Le contenu créé par l&apos;utilisateur lui appartient. Blooprint bénéficie d&apos;une licence d&apos;hébergement et d&apos;affichage pour le service.</li>
                            <li>En cas de suppression du compte, le contenu est supprimé sous 30 jours.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-white border-b border-dashed border-zinc-800 pb-2 mb-4">
                            7. Suppression de compte
                        </h2>
                        <ul className="list-disc list-inside text-zinc-400 space-y-2">
                            <li>L&apos;utilisateur peut supprimer son compte à tout moment depuis Paramètres → Compte.</li>
                            <li>La suppression est effective immédiatement (soft delete). Les données sont définitivement effacées après 30 jours.</li>
                            <li>Les données de facturation sont conservées 10 ans (obligation légale).</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-white border-b border-dashed border-zinc-800 pb-2 mb-4">
                            8. Modération
                        </h2>
                        <p className="text-zinc-400 leading-relaxed">
                            Tout visiteur peut signaler un portfolio contenant du contenu inapproprié.
                            Les signalements sont traités manuellement par TOM$. Un portfolio signalé peut être
                            suspendu ou supprimé après vérification.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-white border-b border-dashed border-zinc-800 pb-2 mb-4">
                            9. Limitation de responsabilité
                        </h2>
                        <p className="text-zinc-400 leading-relaxed">
                            Blooprint est fourni &quot;en l&apos;état&quot;. TOM$ ne saurait être tenu responsable de la
                            perte de données, d&apos;une interruption de service ou de tout dommage indirect lié à
                            l&apos;utilisation du service.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-white border-b border-dashed border-zinc-800 pb-2 mb-4">
                            10. Données personnelles
                        </h2>
                        <p className="text-zinc-400 leading-relaxed">
                            Le traitement des données personnelles est décrit dans notre{' '}
                            <Link href="/legal/privacy" className="text-sky-400 hover:underline">
                                Politique de Confidentialité
                            </Link>.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-white border-b border-dashed border-zinc-800 pb-2 mb-4">
                            11. Droit applicable
                        </h2>
                        <p className="text-zinc-400 leading-relaxed">
                            Les présentes CGU sont soumises au droit français.
                            Tout litige sera soumis aux tribunaux compétents de France.
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
