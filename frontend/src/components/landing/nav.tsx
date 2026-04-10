import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { NavMobile } from '@/components/landing/nav-mobile';
import { getMe } from "@/lib/api-server";

const navLinks = [
    { label: 'Fonctionnalités', href: '/#features' },
    { label: 'Aperçu', href: '/#showcase' },
    { label: 'Abonnements', href: '/pricing' },
    { label: 'Guide UGC', href: '/guide/portfolio-ugc' },
    { label: 'FAQ', href: '/#faq' },
];

/**
 * Navigation principale de la landing — Server Component.
 * Sticky, backdrop-blur, ligne dashed en bas.
 * Affiche "Dashboard" si connecté, sinon Connexion / Commencer.
 * US-1001
 */
export async function Nav() {
    let isLoggedIn = false;
    try {
        await getMe();
        isLoggedIn = true;
    } catch {
        isLoggedIn = false;
    }
    return (
        <header className="sticky top-0 z-50 w-full bg-[#d4a485]">
            <nav aria-label="Navigation principale" className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 lg:px-8">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 shrink-0">
                    <Image src="/logo.png" alt="" width={28} height={28} className="object-contain" aria-hidden="true" />
                    <span className="text-base font-bold tracking-tight text-white">
                        Creafolio
                    </span>
                </Link>

                {/* Nav centre — desktop uniquement */}
                <ul className="hidden md:flex items-center gap-6">
                    {navLinks.map((link) => (
                        <li key={link.href}>
                            <Link
                                href={link.href}
                                className="text-sm text-white/80 hover:text-white transition-colors duration-150"
                                style={{ fontFamily: "var(--font-habibi, 'Habibi'), serif" }}
                            >
                                {link.label}
                            </Link>
                        </li>
                    ))}
                </ul>

                {/* CTAs droite — desktop */}
                <div className="hidden md:flex items-center gap-2">
                    {isLoggedIn ? (
                        <Button
                            size="sm"
                            asChild
                            className="bg-[#ad7b60] text-white hover:bg-[#96664d] font-semibold border-0"
                        >
                            <Link href="/dashboard">Dashboard</Link>
                        </Button>
                    ) : (
                        <>
                            <Button variant="ghost" size="sm" asChild className="text-white/80 hover:text-white hover:bg-white/10">
                                <Link href="/login">Connexion</Link>
                            </Button>
                            <Button
                                size="sm"
                                asChild
                                className="bg-[#ad7b60] text-white hover:bg-[#96664d] font-semibold border-0"
                            >
                                <Link href="/signup">Commencer</Link>
                            </Button>
                        </>
                    )}
                </div>

                {/* Menu mobile */}
                <NavMobile links={navLinks} isLoggedIn={isLoggedIn} />
            </nav>
        </header>
    );
}
