'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface NavLink {
    label: string;
    href: string;
}

export function NavMobile({ links, isLoggedIn }: { links: NavLink[]; isLoggedIn?: boolean }) {
    const [open, setOpen] = useState(false);
    const drawerRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    // Close on Escape key
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.key === 'Escape' && open) {
            setOpen(false);
            buttonRef.current?.focus();
        }
    }, [open]);

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    // Focus first link when drawer opens
    useEffect(() => {
        if (open && drawerRef.current) {
            const firstLink = drawerRef.current.querySelector('a');
            firstLink?.focus();
        }
    }, [open]);

    return (
        <div className="md:hidden">
            {/* Hamburger */}
            <button
                ref={buttonRef}
                onClick={() => setOpen(!open)}
                aria-label={open ? 'Fermer le menu de navigation' : 'Ouvrir le menu de navigation'}
                aria-expanded={open}
                aria-controls="mobile-nav-drawer"
                className="flex flex-col gap-1.5 p-1 text-zinc-400"
            >
                <span className={`block h-px w-5 bg-current transition-all duration-200 ${open ? 'translate-y-2 rotate-45' : ''}`} aria-hidden="true" />
                <span className={`block h-px w-5 bg-current transition-all duration-200 ${open ? 'opacity-0' : ''}`} aria-hidden="true" />
                <span className={`block h-px w-5 bg-current transition-all duration-200 ${open ? '-translate-y-2 -rotate-45' : ''}`} aria-hidden="true" />
            </button>

            {/* Drawer */}
            {open && (
                <nav
                    id="mobile-nav-drawer"
                    ref={drawerRef}
                    aria-label="Navigation mobile"
                    className="absolute left-0 right-0 top-14 z-50 border-b border-dashed border-zinc-800 bg-zinc-950 px-4 py-6 flex flex-col gap-4"
                    role="navigation"
                >
                    {links.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => setOpen(false)}
                            className="text-sm text-zinc-300 hover:text-white transition-colors"
                        >
                            {link.label}
                        </Link>
                    ))}
                    <div className="mt-2 flex flex-col gap-2 border-t border-dashed border-zinc-800 pt-4">
                        {isLoggedIn ? (
                            <Button
                                size="sm"
                                asChild
                                className="bg-sky-400 text-zinc-950 hover:bg-sky-300 font-semibold"
                            >
                                <Link href="/dashboard" onClick={() => setOpen(false)}>Dashboard</Link>
                            </Button>
                        ) : (
                            <>
                                <Button variant="ghost" size="sm" asChild className="justify-start text-zinc-400">
                                    <Link href="/login" onClick={() => setOpen(false)}>Connexion</Link>
                                </Button>
                                <Button
                                    size="sm"
                                    asChild
                                    className="bg-sky-400 text-zinc-950 hover:bg-sky-300 font-semibold"
                                >
                                    <Link href="/signup" onClick={() => setOpen(false)}>Commencer</Link>
                                </Button>
                            </>
                        )}
                    </div>
                </nav>
            )}
        </div>
    );
}
