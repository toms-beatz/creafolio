import Link from 'next/link';

export default function NotFound() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-[#f4eeea] px-6 text-center">
            <p className="font-mono text-6xl text-[#e8c9b5] mb-6">404</p>
            <h1 className="text-xl font-bold text-[#1a1a1a] mb-2">Page introuvable</h1>
            <p className="text-sm text-[#1a1a1a]/50 max-w-sm mb-8">
                Cette page n&apos;existe pas ou a été déplacée.
            </p>
            <Link
                href="/"
                className="rounded-lg bg-[#ad7b60] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#d4a485] transition-colors"
            >
                Retour à l&apos;accueil
            </Link>
        </main>
    );
}
