'use client';

import dynamic from 'next/dynamic';
import type { ComponentProps } from 'react';
import type { BuilderEditor } from './builder-editor';

/**
 * Wrap le BuilderEditor avec dynamic import ssr:false.
 * Craft.js ne supporte pas le SSR — US-201 CA-5.
 */
const BuilderEditorDynamic = dynamic(
    () => import('./builder-editor').then((m) => m.BuilderEditor),
    {
        ssr: false,
        loading: () => (
            <div className="flex h-screen flex-col items-center justify-center gap-4 bg-zinc-950">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-sky-400" />
                <p className="font-mono text-xs text-zinc-600">Chargement du builder...</p>
            </div>
        ),
    }
) as React.ComponentType<ComponentProps<typeof BuilderEditor>>;

export { BuilderEditorDynamic };
