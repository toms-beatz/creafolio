'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import type { PortfolioTheme } from '@/types/theme';
import { DEFAULT_THEME } from '@/lib/themes';
import { saveThemeAction } from '@/features/builder/actions';

interface ThemeContextValue {
    theme: PortfolioTheme;
    setTheme: (theme: PortfolioTheme) => void;
    updateColor: (key: keyof PortfolioTheme['colors'], value: string) => void;
    updateTypography: (key: keyof PortfolioTheme['typography'], value: string | number) => void;
    updateBorderRadius: (value: PortfolioTheme['borderRadius']) => void;
    updateSpacing: (value: PortfolioTheme['spacing']) => void;
    isSaving: boolean;
    saveTheme: () => Promise<void>;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({
    children,
    portfolioId,
    initialTheme,
}: {
    children: React.ReactNode;
    portfolioId: string;
    initialTheme?: PortfolioTheme | null;
}) {
    const [theme, setThemeState] = useState<PortfolioTheme>(initialTheme ?? DEFAULT_THEME);
    const [isSaving, setIsSaving] = useState(false);

    const setTheme = useCallback((t: PortfolioTheme) => {
        setThemeState(t);
    }, []);

    const updateColor = useCallback((key: keyof PortfolioTheme['colors'], value: string) => {
        setThemeState((prev) => ({
            ...prev,
            colors: { ...prev.colors, [key]: value },
        }));
    }, []);

    const updateTypography = useCallback(
        (key: keyof PortfolioTheme['typography'], value: string | number) => {
            setThemeState((prev) => ({
                ...prev,
                typography: { ...prev.typography, [key]: value },
            }));
        },
        []
    );

    const updateBorderRadius = useCallback((value: PortfolioTheme['borderRadius']) => {
        setThemeState((prev) => ({ ...prev, borderRadius: value }));
    }, []);

    const updateSpacing = useCallback((value: PortfolioTheme['spacing']) => {
        setThemeState((prev) => ({ ...prev, spacing: value }));
    }, []);

    const saveTheme = useCallback(async () => {
        setIsSaving(true);
        await saveThemeAction(portfolioId, theme);
        setIsSaving(false);
    }, [portfolioId, theme]);

    return (
        <ThemeContext.Provider
            value={{
                theme,
                setTheme,
                updateColor,
                updateTypography,
                updateBorderRadius,
                updateSpacing,
                isSaving,
                saveTheme,
            }}
        >
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme(): ThemeContextValue {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
    return ctx;
}
