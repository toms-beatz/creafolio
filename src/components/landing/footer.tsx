import Link from 'next/link';
import { Heart } from 'lucide-react';
import { CoordLabel } from '@/components/ui/coord-label';

const productLinks = [
    { label: 'Features', href: '/#features' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Guide Portfolio UGC', href: '/guide/portfolio-ugc' },
    { label: 'FAQ', href: '/#faq' },
];

const legalLinks = [
    { label: 'CGU', href: '/legal/cgu' },
    { label: 'Confidentialité', href: '/legal/privacy' },
    { label: 'Support', href: '/support' },
    { label: 'Contact', href: 'mailto:hello@blooprint.fr' },
];

/**
 * Footer landing — 3 colonnes, annotation [PAGE // EOF].
 * US-1008
 */
export function Footer() {
    const year = new Date().getFullYear();

    return (
        <footer className="relative border-t border-dashed border-zinc-800" role="contentinfo">
            <div className="mx-auto max-w-6xl px-4 py-12 lg:px-8">
                <div className="grid grid-cols-1 gap-10 sm:grid-cols-3">
                    {/* Colonne Marque */}
                    <div className="flex flex-col gap-3">
                        <Link href="/" className="text-base font-bold tracking-tight text-white">
                            <span className="text-sky-400">B</span>looprint
                        </Link>
                        <p className="text-xs text-zinc-500 leading-relaxed">
                            Le builder de portfolios pour créateurs UGC.
                        </p>
                        <p className="text-xs text-zinc-600 font-mono mt-auto">
                            © {year} Blooprint
                        </p>
                        <p className="text-xs text-zinc-700 font-mono flex items-center gap-1">
                            Fait avec <Heart className="h-3 w-3 text-sky-400/60" aria-hidden="true" /><span className="sr-only">amour</span> par TOM$
                        </p>
                    </div>

                    {/* Colonne Produit */}
                    <div className="flex flex-col gap-3">
                        <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest font-mono">
                            Produit
                        </p>
                        <nav aria-label="Liens produit">
                            <ul className="flex flex-col gap-2">
                                {productLinks.map((link) => (
                                    <li key={link.label}>
                                        <Link
                                            href={link.href}
                                            className="text-sm text-zinc-500 hover:text-white transition-colors duration-150"
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
                        <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest font-mono">
                            Légal
                        </p>
                        <nav aria-label="Liens légaux">
                            <ul className="flex flex-col gap-2">
                                {legalLinks.map((link) => (
                                    <li key={link.label}>
                                        <Link
                                            href={link.href}
                                            className="text-sm text-zinc-500 hover:text-white transition-colors duration-150"
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </nav>
                    </div>
                </div>

                {/* Annotation EOF */}
                <div className="mt-12 flex items-center justify-end border-t border-dashed border-zinc-900 pt-4">
                    <CoordLabel text="[PAGE // EOF]" />
                </div>
            </div>
        </footer>
    );
}
