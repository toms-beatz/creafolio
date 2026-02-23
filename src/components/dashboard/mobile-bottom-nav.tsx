'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItem {
    label: string;
    href: string;
    id: string;
    icon: ReactNode;
}

interface MobileBottomNavProps {
    items: NavItem[];
}

/**
 * Bottom navigation bar for mobile — visible only on small screens.
 * Fixed at bottom, 4 tabs.
 */
export function MobileBottomNav({ items }: MobileBottomNavProps) {
    const pathname = usePathname();

    const isActive = (href: string) => {
        if (href === '/dashboard') return pathname === '/dashboard' || pathname === '/dashboard/new';
        return pathname.startsWith(href);
    };

    return (
        <nav aria-label="Navigation mobile" className="fixed bottom-0 inset-x-0 z-50 border-t border-dashed border-zinc-800 bg-zinc-950/95 backdrop-blur-sm md:hidden">
            <div className="flex items-stretch">
                {items.map((item) => {
                    const active = isActive(item.href);
                    return (
                        <Link
                            key={item.id}
                            href={item.href}
                            aria-current={active ? 'page' : undefined}
                            className={`flex flex-1 flex-col items-center justify-center gap-0.5 py-2.5 text-[10px] font-medium transition-colors ${active
                                ? 'text-sky-400'
                                : 'text-zinc-500 active:text-zinc-300'
                                }`}
                        >
                            <span className="text-sm">{item.icon}</span>
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
