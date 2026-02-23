'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface NavLink {
    label: string;
    href: string;
}

export function NavMobile({ links, isLoggedIn }: { links: NavLink[]; isLoggedIn?: boolean }) {
    const [open, setOpen] = useState(false);

    return (
        <div className="md:hidden">
            {/* Hamburger */}
            <button
                onClick={() => setOpen(!open)}
                aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
                className="flex flex-col gap-1.5 p-1 text-zinc-400"
            >
                <span className={`block h-px w-5 bg-current transition-all duration-200 ${open ? 'translate-y-2 rotate-45' : ''}`} />
                <span className={`block h-px w-5 bg-current transition-all duration-200 ${open ? 'opacity-0' : ''}`} />
                <span className={`block h-px w-5 bg-current transition-all duration-200 ${open ? '-translate-y-2 -rotate-45' : ''}`} />
            </button>

            {/* Drawer */}
            {open && (
                <div className="absolute left-0 right-0 top-14 z-50 border-b border-dashed border-zinc-800 bg-zinc-950 px-4 py-6 flex flex-col gap-4">
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
                </div>
            )}
        </div>
    );
}
