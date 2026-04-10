import { TicketForm } from "@/components/support/ticket-form";
import Link from "next/link";
import { Nav } from "@/components/landing/nav";
import { Footer } from "@/components/landing/footer";

const guestCategories = [
    { value: "inscription", label: "Problème d'inscription" },
    { value: "general", label: "Question générale" },
    { value: "autre", label: "Autre" },
];

export const metadata = {
    title: "Support",
    description: "Contactez l'équipe Creafolio pour toute question ou problème.",
};

/**
 * Page support publique — US-1301
 * Accessible sans authentification pour les visiteurs.
 */
export default function SupportPage() {
    return (
        <div className="min-h-screen bg-[#f4eeea] text-[#1a1a1a]">
            <Nav />

            <main className="mx-auto max-w-3xl px-4 py-12">
                <div className="mb-8">
                    <p className="font-mono text-[9px] uppercase tracking-widest text-[#ad7b60]/60 mb-1">
                        SUPPORT // CONTACT
                    </p>
                    <h1 className="text-2xl font-bold text-[#1a1a1a]">
                        Besoin d&apos;aide ?
                    </h1>
                    <p className="mt-2 text-sm text-[#1a1a1a]/50">
                        Remplissez le formulaire ci-dessous et nous vous répondrons par
                        email sous 24-48h.
                    </p>
                </div>

                <div className="rounded-xl border border-dashed border-[#e8c9b5] bg-white p-6 sm:p-8">
                    <TicketForm
                        isGuest={true}
                        categories={guestCategories}
                        apiEndpoint="/api/support"
                    />
                </div>

                <p className="mt-6 text-center text-xs text-[#1a1a1a]/50">
                    Déjà inscrit ?{" "}
                    <Link
                        href="/dashboard/support"
                        className="text-[#ad7b60] hover:underline"
                    >
                        Accédez à votre espace support
                    </Link>
                </p>
            </main>
            <Footer />
        </div>
    );
}
