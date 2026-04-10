'use client';

import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export function ColorModeToggle({ hasLight }: { hasLight: boolean }) {
    const [mode, setMode] = useState<'dark' | 'light'>('dark');

    useEffect(() => {
        // Restore from localStorage or system preference
        const stored = localStorage.getItem('bp-color-mode') as 'dark' | 'light' | null;
        const initial = stored ?? (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
        setMode(initial);
        document.documentElement.setAttribute('data-bp-mode', initial);
    }, []);

    function toggle() {
        const next = mode === 'dark' ? 'light' : 'dark';
        setMode(next);
        document.documentElement.setAttribute('data-bp-mode', next);
        localStorage.setItem('bp-color-mode', next);
    }

    if (!hasLight) return null;

    return (
        <button
            onClick={toggle}
            aria-label={mode === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'}
            className="fixed top-4 right-4 z-50 flex h-8 w-8 items-center justify-center rounded-full border border-dashed border-zinc-700 bg-zinc-900/70 text-zinc-400 backdrop-blur-sm transition-colors hover:border-zinc-500 hover:text-zinc-200"
        >
            {mode === 'dark' ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
        </button>
    );
}
