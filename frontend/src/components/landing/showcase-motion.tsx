'use client';

import { type ReactNode } from 'react';
import { FadeIn, Stagger, StaggerItem, ScaleIn } from '@/components/ui/motion';

/**
 * Client wrapper pour animer les éléments du Showcase via Framer Motion.
 */

export function ShowcaseHeader({ children }: { children: ReactNode }) {
    return <FadeIn direction="up" className="mb-10 text-center">{children}</FadeIn>;
}

export function ShowcaseGrid({ children }: { children: ReactNode }) {
    return (
        <Stagger className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {children}
        </Stagger>
    );
}

export function ShowcaseCard({ children }: { children: ReactNode }) {
    return <StaggerItem>{children}</StaggerItem>;
}

export function ShowcaseFallback({ children }: { children: ReactNode }) {
    return <ScaleIn delay={0.1}>{children}</ScaleIn>;
}
