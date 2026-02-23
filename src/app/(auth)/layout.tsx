import type { Metadata } from 'next';
import Link from 'next/link';
import { BlueprintGrid } from '@/components/ui/blueprint-grid';

export const metadata: Metadata = {
    title: 'Blooprint — Connexion',
};

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="relative flex min-h-screen flex-col bg-zinc-950 overflow-hidden">
            {/* Grille blueprint visible */}
            <BlueprintGrid opacity={8} />

            {/* Halo accent */}
            <div
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(ellipse at center, rgba(56,189,248,0.06) 0%, transparent 70%)' }}
                aria-hidden="true"
            />

            {/* Navbar — logo top-left */}
            <header className="relative z-10 w-full border-b border-dashed border-zinc-800 bg-zinc-950/80 backdrop-blur-sm">
                <nav aria-label="Retour accueil" className="mx-auto flex h-14 max-w-6xl items-center px-4 lg:px-8">
                    <Link href="/" className="text-base font-bold tracking-tight text-white hover:opacity-90 transition-opacity">
                        <span className="text-sky-400">B</span>looprint
                    </Link>
                </nav>
            </header>

            {/* Contenu centré */}
            <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 py-12">
                <main id="main-content" className="w-full max-w-md animate-bp-fade-up">
                    {/* Card */}
                    <div className="relative rounded-2xl border border-dashed border-zinc-700 bg-zinc-900/80 backdrop-blur-sm p-8">
                        {/* Coin coord en haut à droite */}
                        <span className="absolute top-4 right-4 font-mono text-[9px] text-zinc-700 select-none tracking-widest">
                            AUTH // 00.00
                        </span>
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}

