'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface AdminNavItem {
    label: string;
    href: string;
    id: string;
    icon: ReactNode;
    badgeCount?: number;
}

interface AdminMobileNavProps {
    items: AdminNavItem[];
}

/**
 * Bottom navigation bar for admin mobile — orange accent, badge support.
 * Fixed at bottom, visible only on small screens (md:hidden).
 */
export function AdminMobileNav({ items }: AdminMobileNavProps) {
    const pathname = usePathname();

    const isActive = (href: string) => {
        if (href === '/admin') return pathname === '/admin';
        return pathname.startsWith(href);
    };

    return (
        <nav aria-label="Navigation admin mobile" className="fixed bottom-0 inset-x-0 z-50 border-t border-dashed border-orange-900/30 bg-zinc-950/95 backdrop-blur-sm md:hidden">
            <div className="flex items-stretch">
                {items.map((item) => {
                    const active = isActive(item.href);
                    return (
                        <Link
                            key={item.id}
                            href={item.href}
                            aria-current={active ? 'page' : undefined}
                            className={`relative flex flex-1 flex-col items-center justify-center gap-0.5 py-2.5 text-[10px] font-medium transition-colors ${active
                                ? 'text-orange-400'
                                : 'text-zinc-500 active:text-zinc-300'
                                }`}
                        >
                            <span className="relative text-sm">
                                {item.icon}
                                {(item.badgeCount ?? 0) > 0 && (
                                    <span className="absolute -top-1.5 -right-3 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500/90 px-1 font-mono text-[8px] text-white" aria-label={`${item.badgeCount} notifications`}>
                                        {item.badgeCount}
                                    </span>
                                )}
                            </span>
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
