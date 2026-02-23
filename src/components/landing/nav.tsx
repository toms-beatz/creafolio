import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CoordLabel } from '@/components/ui/coord-label';
import { NavMobile } from '@/components/landing/nav-mobile';
import { createClient } from '@/lib/supabase/server';

const navLinks = [
    { label: 'Features', href: '/#features' },
    { label: 'Aperçu', href: '/#showcase' },
    { label: 'Pricing', href: '/pricing' },
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
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const isLoggedIn = !!user;
    return (
        <header className="sticky top-0 z-50 w-full border-b border-dashed border-zinc-800 bg-zinc-950/80 backdrop-blur-sm">
            <nav aria-label="Navigation principale" className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 lg:px-8">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-1.5 shrink-0">
                    <span className="text-base font-bold tracking-tight text-white">
                        <span className="text-sky-400">B</span>looprint
                    </span>
                </Link>

                {/* Nav centre — desktop uniquement */}
                <ul className="hidden md:flex items-center gap-6">
                    {navLinks.map((link) => (
                        <li key={link.href}>
                            <Link
                                href={link.href}
                                className="text-sm text-zinc-400 hover:text-white transition-colors duration-150"
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
                            className="bg-sky-400 text-zinc-950 hover:bg-sky-300 font-semibold"
                        >
                            <Link href="/dashboard">Dashboard</Link>
                        </Button>
                    ) : (
                        <>
                            <Button variant="ghost" size="sm" asChild className="text-zinc-400 hover:text-white">
                                <Link href="/login">Connexion</Link>
                            </Button>
                            <Button
                                size="sm"
                                asChild
                                className="bg-sky-400 text-zinc-950 hover:bg-sky-300 font-semibold"
                            >
                                <Link href="/signup">Commencer</Link>
                            </Button>
                        </>
                    )}
                </div>

                {/* Annotation blueprint */}
                <CoordLabel text="[NAV // 00.01]" className="hidden lg:block absolute right-2 top-1 text-zinc-800" />

                {/* Menu mobile */}
                <NavMobile links={navLinks} isLoggedIn={isLoggedIn} />
            </nav>
        </header>
    );
}
