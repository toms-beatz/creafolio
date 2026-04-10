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
                a.download = `creafolio-export-${new Date().toISOString().slice(0, 10)}.json`;
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
            <h1 className="text-2xl font-bold text-[#1a1a1a] mb-1">Vie privée</h1>
            <p className="text-sm text-[#1a1a1a]/60 mb-8">
                Gère tes données personnelles et tes droits RGPD.
            </p>

            {/* ── Export données ──────────────────────── */}
            <section className="rounded-xl border border-dashed border-[#e8c9b5] bg-white/60 p-6 mb-6">
                <p className="font-mono text-[9px] uppercase tracking-widest text-[#1a1a1a]/50 mb-3">
                    EXPORT DE DONNÉES
                </p>
                <p className="text-sm text-[#1a1a1a]/60 mb-4 leading-relaxed">
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
                    className="rounded-lg border border-dashed border-[#ad7b60]/30 bg-[#ad7b60]/10 px-6 py-2 text-sm font-medium text-[#ad7b60] hover:bg-[#ad7b60]/20 transition-colors disabled:opacity-50"
                >
                    {exporting ? "Export en cours..." : "Exporter mes données (JSON)"}
                </button>
            </section>

            {/* ── Droits RGPD ────────────────────────── */}
            <section className="rounded-xl border border-dashed border-[#e8c9b5] bg-white/60 p-6 mb-6">
                <p className="font-mono text-[9px] uppercase tracking-widest text-[#1a1a1a]/50 mb-3">
                    TES DROITS
                </p>
                <ul className="space-y-2 text-sm text-[#1a1a1a]/60">
                    <li>
                        <span className="text-[#1a1a1a]">Droit d&apos;accès</span> &mdash; tu peux consulter tes données via l&apos;export ci-dessus.
                    </li>
                    <li>
                        <span className="text-[#1a1a1a]">Droit de rectification</span> &mdash; modifie tes infos dans{" "}
                        <Link href="/settings/profile" className="text-[#ad7b60] hover:text-[#9a6b50]">Profil</Link>.
                    </li>
                    <li>
                        <span className="text-[#1a1a1a]">Droit à l&apos;effacement</span> &mdash; supprime ton compte dans{" "}
                        <Link href="/settings/account" className="text-[#ad7b60] hover:text-[#9a6b50]">Compte</Link>.
                    </li>
                    <li>
                        <span className="text-[#1a1a1a]">Droit à la portabilité</span> &mdash; export JSON ci-dessus.
                    </li>
                    <li>
                        <span className="text-[#1a1a1a]">Réclamation CNIL</span> &mdash;{" "}
                        <a
                            href="https://www.cnil.fr/fr/plaintes"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#ad7b60] hover:text-[#9a6b50]"
                        >
                            cnil.fr/fr/plaintes
                        </a>
                    </li>
                </ul>
            </section>

            {/* ── Liens légaux ───────────────────────── */}
            <section className="rounded-xl border border-dashed border-[#e8c9b5] bg-white/60 p-6">
                <p className="font-mono text-[9px] uppercase tracking-widest text-[#1a1a1a]/50 mb-3">
                    DOCUMENTS LÉGAUX
                </p>
                <div className="flex flex-wrap gap-4 text-sm">
                    <Link href="/legal/privacy" className="text-[#ad7b60] hover:text-[#9a6b50] transition-colors flex items-center gap-1">
                        Politique de confidentialité <ExternalLink className="h-3 w-3" />
                    </Link>
                    <Link href="/legal/terms" className="text-[#ad7b60] hover:text-[#9a6b50] transition-colors flex items-center gap-1">
                        Conditions d&apos;utilisation <ExternalLink className="h-3 w-3" />
                    </Link>
                </div>
            </section>
        </>
    );
}
