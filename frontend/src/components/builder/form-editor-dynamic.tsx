'use client';

import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';
import type { PortfolioTheme } from '@/types/theme';

const FormEditor = dynamic(() => import('./form-editor').then((m) => m.FormEditor), {
    ssr: false,
    loading: () => (
        <div className="flex h-screen items-center justify-center bg-zinc-950">
            <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
        </div>
    ),
});

interface FormEditorDynamicProps {
    portfolioId: string;
    portfolioTitle: string;
    portfolioStatus: string;
    portfolioSlug: string;
    craftStateJson: string | null;
    updatedAt: string | null;
    isPremium: boolean;
    username: string;
    initialTheme: PortfolioTheme | null;
}

export function FormEditorDynamic(props: FormEditorDynamicProps) {
    return <FormEditor {...props} />;
}
