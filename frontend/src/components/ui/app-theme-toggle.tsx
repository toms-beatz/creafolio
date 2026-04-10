'use client';

import { Sun, Moon } from 'lucide-react';
import { useAppTheme } from '@/providers/app-theme-provider';

export function AppThemeToggle({ className }: { className?: string }) {
    const { theme, toggle } = useAppTheme();

    return (
        <button
            onClick={toggle}
            aria-label={theme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'}
            className={`flex h-7 w-7 items-center justify-center rounded-full border border-dashed transition-colors ${theme === 'dark'
                ? 'border-zinc-700 bg-zinc-900/70 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200'
                : 'border-zinc-300 bg-zinc-100 text-zinc-500 hover:border-zinc-400 hover:text-zinc-700'
                } ${className ?? ''}`}
        >
            {theme === 'dark' ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
        </button>
    );
}
