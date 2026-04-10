'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type AppTheme = 'dark' | 'light';

interface AppThemeContextValue {
    theme: AppTheme;
    toggle: () => void;
}

const AppThemeContext = createContext<AppThemeContextValue>({
    theme: 'dark',
    toggle: () => { },
});

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<AppTheme>('dark');

    useEffect(() => {
        // Sync state with what the FOUC script already applied to <html>
        const stored = localStorage.getItem('bp-app-theme') as AppTheme | null;
        const resolved: AppTheme = stored ?? 'dark';
        setTheme(resolved);
        if (resolved === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, []);

    function toggle() {
        setTheme((prev) => {
            const next: AppTheme = prev === 'dark' ? 'light' : 'dark';
            localStorage.setItem('bp-app-theme', next);
            if (next === 'dark') {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
            return next;
        });
    }

    return (
        <AppThemeContext.Provider value={{ theme, toggle }}>
            {children}
        </AppThemeContext.Provider>
    );
}

export function useAppTheme() {
    return useContext(AppThemeContext);
}
