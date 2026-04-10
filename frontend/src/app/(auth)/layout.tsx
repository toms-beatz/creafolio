import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';

export const metadata: Metadata = {
    title: 'Creafolio — Connexion',
};

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="relative flex min-h-screen flex-col bg-[#f4eeea] overflow-hidden">

            {/* Halo accent */}
            <div
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(ellipse at center, rgba(173,123,96,0.08) 0%, transparent 70%)' }}
                aria-hidden="true"
            />

            {/* Navbar — logo top-left */}
            <header className="relative z-10 w-full border-b border-dashed border-[#e8c9b5] bg-[#f4eeea]/80 backdrop-blur-sm">
                <nav aria-label="Retour accueil" className="mx-auto flex h-14 max-w-6xl items-center px-4 lg:px-8">
                    <Link href="/" className="flex items-center gap-2 text-base font-bold tracking-tight text-[#ad7b60] hover:opacity-90 transition-opacity">
                        <Image src="/logo.png" alt="" width={22} height={22} className="object-contain opacity-80" aria-hidden="true" />
                        Creafolio
                    </Link>
                </nav>
            </header>

            {/* Contenu centré */}
            <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 py-12">
                <main id="main-content" className="w-full max-w-md animate-bp-fade-up">
                    {/* Card */}
                    <div className="relative rounded-2xl border border-dashed border-[#e8c9b5] bg-white/80 backdrop-blur-sm p-8">
                        {/* Coin coord en haut à droite */}
                        <span className="absolute top-4 right-4 font-mono text-[9px] text-[#1a1a1a]/20 select-none tracking-widest">
                            AUTH // 00.00
                        </span>
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}

