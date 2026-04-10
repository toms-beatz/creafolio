'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import type { PortfolioTheme } from '@/types/theme';
import { DEFAULT_THEME, COLOR_VARIANTS } from '@/lib/themes';
import { saveThemeAction } from '@/features/builder/actions';

interface ThemeContextValue {
    theme: PortfolioTheme;
    setTheme: (theme: PortfolioTheme) => void;
    updateColor: (key: keyof PortfolioTheme['colors'], value: string) => void;
    updateTypography: (key: keyof PortfolioTheme['typography'], value: string | number) => void;
    updateBorderRadius: (value: PortfolioTheme['borderRadius']) => void;
    updateSpacing: (value: PortfolioTheme['spacing']) => void;
    updateColorMode: (mode: 'dark' | 'light') => void;
    updateBaseFontSize: (value: PortfolioTheme['baseFontSize']) => void;
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

    const updateBaseFontSize = useCallback((value: PortfolioTheme['baseFontSize']) => {
        setThemeState((prev) => ({ ...prev, baseFontSize: value }));
    }, []);

    const updateColorMode = useCallback((mode: 'dark' | 'light') => {
        setThemeState((prev) => {
            // 1. Persist current colors into prev mode's slot
            const savedSlot = prev.colorMode === 'dark'
                ? { darkColors: prev.colors }
                : { lightColors: prev.colors };

            // 2. Resolve colors for new mode: saved slot > COLOR_VARIANTS preset > keep current
            const variants = COLOR_VARIANTS[prev.id];
            const newColors = mode === 'dark'
                ? (prev.darkColors ?? variants?.dark ?? prev.colors)
                : (prev.lightColors ?? variants?.light ?? prev.colors);

            return { ...prev, ...savedSlot, colorMode: mode, colors: newColors };
        });
    }, []);

    const saveTheme = useCallback(async () => {
        setIsSaving(true);
        // Persist current colors into the active mode slot before saving
        const toSave: PortfolioTheme = {
            ...theme,
            ...(theme.colorMode === 'dark' ? { darkColors: theme.colors } : { lightColors: theme.colors }),
        };
        await saveThemeAction(portfolioId, toSave);
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
                updateColorMode,
                updateBaseFontSize,
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
