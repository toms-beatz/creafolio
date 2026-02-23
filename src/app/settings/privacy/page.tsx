"use client";

import { useState } from "react";
import { exportUserDataAction } from "@/features/settings/actions";
import { ExternalLink } from 'lucide-react';
import Link from "next/link";

/**
 * /settings/privacy — US-803
 * Export RGPD (Art. 20) + liens légaux.
 */
export default function PrivacyPage() {
    const [exporting, setExporting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleExport() {
        setExporting(true);
        setError(null);

        try {
            const result = await exportUserDataAction();

            if (result.error) {
                setError(result.error);
                return;
            }

            if (result.data) {
                // Télécharger le fichier JSON
                const blob = new Blob([result.data], { type: "application/json" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `blooprint-export-${new Date().toISOString().slice(0, 10)}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }
        } catch {
            setError("Erreur lors de l'export. Réessaie.");
        } finally {
            setExporting(false);
        }
    }

    return (
        <>
            <h1 className="text-2xl font-bold text-white mb-1">Vie privée</h1>
            <p className="text-sm text-zinc-500 mb-8">
                Gère tes données personnelles et tes droits RGPD.
            </p>

            {/* ── Export données ──────────────────────── */}
            <section className="rounded-xl border border-dashed border-zinc-700 bg-zinc-900/40 p-6 mb-6">
                <p className="font-mono text-[9px] uppercase tracking-widest text-zinc-600 mb-3">
                    EXPORT DE DONNÉES
                </p>
                <p className="text-sm text-zinc-400 mb-4 leading-relaxed">
                    Conformément au RGPD (Art. 20 &mdash; Droit à la portabilité),
                    tu peux exporter toutes tes données au format JSON.
                    L&apos;export inclut ton profil, tes portfolios, tes analytics
                    et l&apos;historique de ton abonnement.
                </p>

                {error && (
                    <p className="text-sm text-red-400 mb-3">{error}</p>
                )}

                <button
                    onClick={handleExport}
                    disabled={exporting}
                    className="rounded-lg border border-dashed border-sky-500/30 bg-sky-500/10 px-6 py-2 text-sm font-medium text-sky-400 hover:bg-sky-500/20 transition-colors disabled:opacity-50"
                >
                    {exporting ? "Export en cours..." : "Exporter mes données (JSON)"}
                </button>
            </section>

            {/* ── Droits RGPD ────────────────────────── */}
            <section className="rounded-xl border border-dashed border-zinc-700 bg-zinc-900/40 p-6 mb-6">
                <p className="font-mono text-[9px] uppercase tracking-widest text-zinc-600 mb-3">
                    TES DROITS
                </p>
                <ul className="space-y-2 text-sm text-zinc-400">
                    <li>
                        <span className="text-zinc-200">Droit d&apos;accès</span> &mdash; tu peux consulter tes données via l&apos;export ci-dessus.
                    </li>
                    <li>
                        <span className="text-zinc-200">Droit de rectification</span> &mdash; modifie tes infos dans{" "}
                        <Link href="/settings/profile" className="text-sky-400 hover:text-sky-300">Profil</Link>.
                    </li>
                    <li>
                        <span className="text-zinc-200">Droit à l&apos;effacement</span> &mdash; supprime ton compte dans{" "}
                        <Link href="/settings/account" className="text-sky-400 hover:text-sky-300">Compte</Link>.
                    </li>
                    <li>
                        <span className="text-zinc-200">Droit à la portabilité</span> &mdash; export JSON ci-dessus.
                    </li>
                    <li>
                        <span className="text-zinc-200">Réclamation CNIL</span> &mdash;{" "}
                        <a
                            href="https://www.cnil.fr/fr/plaintes"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sky-400 hover:text-sky-300"
                        >
                            cnil.fr/fr/plaintes
                        </a>
                    </li>
                </ul>
            </section>

            {/* ── Liens légaux ───────────────────────── */}
            <section className="rounded-xl border border-dashed border-zinc-700 bg-zinc-900/40 p-6">
                <p className="font-mono text-[9px] uppercase tracking-widest text-zinc-600 mb-3">
                    DOCUMENTS LÉGAUX
                </p>
                <div className="flex flex-wrap gap-4 text-sm">
                    <Link href="/legal/privacy" className="text-sky-400 hover:text-sky-300 transition-colors flex items-center gap-1">
                        Politique de confidentialité <ExternalLink className="h-3 w-3" />
                    </Link>
                    <Link href="/legal/terms" className="text-sky-400 hover:text-sky-300 transition-colors flex items-center gap-1">
                        Conditions d&apos;utilisation <ExternalLink className="h-3 w-3" />
                    </Link>
                </div>
            </section>
        </>
    );
}
