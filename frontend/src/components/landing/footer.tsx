import Link from 'next/link';
import Image from 'next/image';
import { Heart } from 'lucide-react';

const productLinks = [
    { label: 'Fonctionnalités', href: '/#features' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Guide Portfolio UGC', href: '/guide/portfolio-ugc' },
    { label: 'FAQ', href: '/#faq' },
];

const legalLinks = [
    { label: 'CGU', href: '/legal/cgu' },
    { label: 'CGV', href: '/legal/cgv' },
    { label: 'Charte', href: '/legal/charter' },
    { label: 'Confidentialité', href: '/legal/privacy' },
    { label: 'Support', href: '/support' },
    { label: 'Contact', href: 'mailto:hello@creafolio.fr' },
];

/**
 * Footer landing — 3 colonnes, annotation [PAGE // EOF].
 * US-1008
 */
export function Footer() {
    const year = new Date().getFullYear();

    return (
        <footer className="relative bg-[#d4a485]" role="contentinfo">
            <div className="mx-auto max-w-6xl px-4 py-12 lg:px-8">
                <div className="grid grid-cols-1 gap-10 sm:grid-cols-3">
                    {/* Colonne Marque */}
                    <div className="flex flex-col gap-3">
                        <Link href="/" className="flex items-center gap-2">
                            <Image src="/logo.png" alt="" width={24} height={24} className="object-contain" aria-hidden="true" />
                            <span className="text-base font-bold tracking-tight text-white">Creafolio</span>
                        </Link>
                        <p className="text-xs text-white/70 leading-relaxed">
                            Le builder de portfolios pour créateurs UGC.
                        </p>
                        <p className="text-xs text-white/60 font-mono mt-auto">
                            © {year} Creafolio
                        </p>
                        <p className="text-xs text-white/60 font-mono flex items-center gap-1">
                            Fait avec <Heart className="h-3 w-3 text-white/50" aria-hidden="true" /><span className="sr-only">amour</span> par TOM$
                        </p>
                    </div>

                    {/* Colonne Produit */}
                    <div className="flex flex-col gap-3">
                        <p className="text-xs font-semibold text-white/60 uppercase tracking-widest font-mono">
                            Produit
                        </p>
                        <nav aria-label="Liens produit">
                            <ul className="flex flex-col gap-2">
                                {productLinks.map((link) => (
                                    <li key={link.label}>
                                        <Link
                                            href={link.href}
                                            className="text-sm text-white/80 hover:text-white transition-colors duration-150"
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </nav>
                    </div>

                    {/* Colonne Légal */}
                    <div className="flex flex-col gap-3">
                        <p className="text-xs font-semibold text-white/60 uppercase tracking-widest font-mono">
                            Légal
                        </p>
                        <nav aria-label="Liens légaux">
                            <ul className="flex flex-col gap-2">
                                {legalLinks.map((link) => (
                                    <li key={link.label}>
                                        <Link
                                            href={link.href}
                                            className="text-sm text-white/80 hover:text-white transition-colors duration-150"
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </nav>
                    </div>
                </div>
            </div>
        </footer>
    );
}
