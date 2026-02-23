import * as React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface DashedCardProps extends React.HTMLAttributes<HTMLDivElement> {
    /** Active la teinte accent lime sur la bordure */
    accent?: boolean;
    header?: React.ReactNode;
    children: React.ReactNode;
}

/**
 * Variante blueprint de shadcn Card — bordure dashed avec option accent lime.
 */
export function DashedCard({ accent, header, children, className, ...props }: DashedCardProps) {
    return (
        <Card
            className={cn(
                'relative border border-dashed bg-zinc-950 rounded-xl overflow-hidden',
                accent
                    ? 'border-sky-400/50'
                    : 'border-zinc-700',
                'transition-colors duration-200 hover:border-sky-400/30 hover:bg-zinc-900/80',
                className,
            )}
            {...props}
        >
            {header && <CardHeader>{header}</CardHeader>}
            <CardContent className={header ? '' : 'p-0'}>{children}</CardContent>
        </Card>
    );
}
