import Link from 'next/link';

export default function SlugNotFound() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 px-6 text-center">
            <p className="font-mono text-6xl text-zinc-700 mb-6">404</p>
            <h1 className="text-xl font-bold text-white mb-2">Portfolio introuvable</h1>
            <p className="text-sm text-zinc-500 max-w-sm mb-8">
                Ce portfolio n&apos;existe pas ou n&apos;est plus publié.
            </p>
            <Link
                href="/"
                className="rounded-lg bg-sky-400 px-5 py-2.5 text-sm font-semibold text-zinc-950 hover:bg-sky-300 transition-colors"
            >
                Retour à l&apos;accueil
            </Link>

            <p className="mt-12 font-mono text-[9px] uppercase tracking-widest text-zinc-800">
                <a href="https://blooprint.fr" className="hover:text-sky-400/60 transition-colors">
                    Blooprint
                </a>
            </p>
        </main>
    );
}
