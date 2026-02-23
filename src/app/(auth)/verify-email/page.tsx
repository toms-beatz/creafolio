import Link from 'next/link';
import { Mail, ArrowLeft } from 'lucide-react';

export default function VerifyEmailPage() {
    return (
        <>
            <div className="mb-6 flex justify-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-dashed border-sky-400/40 bg-sky-400/10">
                    <Mail className="h-6 w-6 text-sky-400" />
                </div>
            </div>

            <h1 className="mb-2 text-center text-xl font-semibold text-white">
                Vérifie ta boîte mail
            </h1>
            <p className="mb-6 text-center text-sm text-zinc-400">
                On t&apos;a envoyé un lien de confirmation. Clique dessus pour activer
                ton compte et accéder à ton essai Premium gratuit.
            </p>

            <div className="rounded-lg border border-dashed border-zinc-700 bg-zinc-800/50 px-4 py-3 text-sm text-zinc-400">
                <strong className="text-zinc-300">Le lien n&apos;est pas arrivé ?</strong>
                <ul className="mt-2 list-disc pl-4 space-y-1">
                    <li>Vérifie ton dossier Spam / Indésirables</li>
                    <li>L&apos;email peut prendre 1-2 minutes</li>
                </ul>
            </div>

            <p className="mt-6 text-center text-sm text-zinc-500">
                <Link href="/login" className="text-sky-400 hover:text-sky-300 transition-colors">
                    <ArrowLeft className="inline h-3 w-3" /> Retour à la connexion
                </Link>
            </p>
        </>
    );
}
