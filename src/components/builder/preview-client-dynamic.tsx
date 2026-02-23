'use client';

import dynamic from 'next/dynamic';
import type { ComponentProps } from 'react';
import type { PreviewClient } from './preview-client';

/**
 * Wrap PreviewClient avec dynamic import ssr:false.
 * Craft.js ne supporte pas le SSR — US-206.
 */
const PreviewClientDynamic = dynamic(
    () => import('./preview-client').then((m) => m.PreviewClient),
    {
        ssr: false,
        loading: () => (
            <div className="flex h-screen flex-col items-center justify-center gap-4 bg-zinc-950">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-sky-400" />
                <p className="font-mono text-xs text-zinc-600">Chargement du preview...</p>
            </div>
        ),
    }
) as React.ComponentType<ComponentProps<typeof PreviewClient>>;

export { PreviewClientDynamic };
