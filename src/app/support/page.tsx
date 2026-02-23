import { TicketForm } from "@/components/support/ticket-form";
import Link from "next/link";

const guestCategories = [
    { value: "inscription", label: "Problème d'inscription" },
    { value: "general", label: "Question générale" },
    { value: "autre", label: "Autre" },
];

export const metadata = {
    title: "Support",
    description: "Contactez l'équipe Blooprint pour toute question ou problème.",
};

/**
 * Page support publique — US-1301
 * Accessible sans authentification pour les visiteurs.
 */
export default function SupportPage() {
    return (
        <div className="min-h-screen bg-zinc-950 text-white">
            {/* Header */}
            <header className="border-b border-dashed border-zinc-800 bg-zinc-950/90 backdrop-blur-sm sticky top-0 z-40">
                <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
                    <Link
                        href="/"
                        className="text-base font-bold tracking-tight"
                    >
                        <span className="text-sky-400">B</span>looprint
                    </Link>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-600">
                        SUPPORT
                    </p>
                </div>
            </header>

            <main className="mx-auto max-w-3xl px-4 py-12">
                <div className="mb-8">
                    <p className="font-mono text-[9px] uppercase tracking-widest text-zinc-600 mb-1">
                        SUPPORT // CONTACT
                    </p>
                    <h1 className="text-2xl font-bold text-white">
                        Besoin d&apos;aide ?
                    </h1>
                    <p className="mt-2 text-sm text-zinc-500">
                        Remplissez le formulaire ci-dessous et nous vous répondrons par
                        email sous 24-48h.
                    </p>
                </div>

                <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-900/30 p-6 sm:p-8">
                    <TicketForm
                        isGuest={true}
                        categories={guestCategories}
                        apiEndpoint="/api/support"
                    />
                </div>

                <p className="mt-6 text-center text-xs text-zinc-600">
                    Déjà inscrit ?{" "}
                    <Link
                        href="/dashboard/support"
                        className="text-sky-400 hover:underline"
                    >
                        Accédez à votre espace support
                    </Link>
                </p>
            </main>
        </div>
    );
}
