import Link from 'next/link';

export default function SlugNotFound() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-[#f4eeea] px-6 text-center">
            <p className="font-mono text-6xl text-[#e8c9b5] mb-6">404</p>
            <h1 className="text-xl font-bold text-[#1a1a1a] mb-2">Portfolio introuvable</h1>
            <p className="text-sm text-[#1a1a1a]/50 max-w-sm mb-8">
                Ce portfolio n&apos;existe pas ou n&apos;est plus publié.
            </p>
            <Link
                href="/"
                className="rounded-lg bg-[#ad7b60] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#d4a485] transition-colors"
            >
                Retour à l&apos;accueil
            </Link>

            <p className="mt-12 font-mono text-[9px] uppercase tracking-widest text-[#1a1a1a]/30">
                <a href="https://creafolio.fr" className="hover:text-[#ad7b60]/60 transition-colors">
                    Creafolio
                </a>
            </p>
        </main>
    );
}
