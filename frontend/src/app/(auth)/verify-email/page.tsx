import Link from 'next/link';
import { Mail, ArrowLeft } from 'lucide-react';

export default function VerifyEmailPage() {
    return (
        <>
            <div className="mb-6 flex justify-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-dashed border-[#ad7b60]/40 bg-[#ad7b60]/10">
                    <Mail className="h-6 w-6 text-[#ad7b60]" aria-hidden="true" />
                </div>
            </div>

            <h1 className="mb-2 text-center text-xl font-semibold text-[#1a1a1a]">
                Vérifie ta boîte mail
            </h1>
            <p className="mb-6 text-center text-sm text-[#1a1a1a]/60">
                On t&apos;a envoyé un lien de confirmation. Clique dessus pour activer
                ton compte et accéder à ton essai Premium gratuit.
            </p>

            <div className="rounded-lg border border-dashed border-[#e8c9b5] bg-[#f4eeea] px-4 py-3 text-sm text-[#1a1a1a]/70">
                <strong className="text-[#1a1a1a]/80">Le lien n&apos;est pas arrivé ?</strong>
                <ul className="mt-2 list-disc pl-4 space-y-1">
                    <li>Vérifie ton dossier Spam / Indésirables</li>
                    <li>L&apos;email peut prendre 1-2 minutes</li>
                </ul>
            </div>

            <p className="mt-6 text-center text-sm text-[#1a1a1a]/50">
                <Link href="/login" className="text-[#ad7b60] hover:text-[#d4a485] transition-colors">
                    <ArrowLeft className="inline h-3 w-3" aria-hidden="true" /> Retour à la connexion
                </Link>
            </p>
        </>
    );
}
