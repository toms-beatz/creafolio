'use client';

import { useNode } from '@craftjs/core';
import { SPACING_PX } from '@/lib/block-styles';

interface TextBlockProps {
    text?: string;
    fontSize?: 'sm' | 'base' | 'lg' | 'xl' | '2xl';
    align?: 'left' | 'center' | 'right';
    color?: string;
    paddingTop?: string;
    paddingBottom?: string;
    bgColor?: string;
    customId?: string;
    customClass?: string;
    hideOnMobile?: boolean;
    hideOnDesktop?: boolean;
    animateIn?: string;
}

const fontSizeMap = {
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
};

export function TextBlock({
    text = 'Clique pour éditer ce texte.',
    fontSize = 'base',
    align = 'left',
    color,
    paddingTop = 'xs',
    paddingBottom = 'xs',
    bgColor = '',
    customId = '',
    customClass = '',
    hideOnMobile = false,
    hideOnDesktop = false,
    animateIn = 'none',
}: TextBlockProps) {
    const { connectors: { connect, drag }, selected } = useNode((node) => ({
        selected: node.events.selected,
    }));

    return (
        <div
            ref={(ref) => { if (ref) connect(drag(ref)); }}
            id={customId || undefined}
            className={[
                'px-4 rounded-lg transition-all',
                fontSizeMap[fontSize],
                `text-${align}`,
                hideOnMobile ? 'hidden md:block' : '',
                hideOnDesktop ? 'block md:hidden' : '',
                animateIn !== 'none' ? `bp-animate-${animateIn}` : '',
                customClass,
                selected ? 'ring-2 ring-sky-400' : 'ring-1 ring-transparent hover:ring-zinc-600',
            ].filter(Boolean).join(' ')}
            style={{ color: color ?? 'var(--theme-text, #f4f4f5)', paddingTop: SPACING_PX[paddingTop] ?? '16px', paddingBottom: SPACING_PX[paddingBottom] ?? '16px', background: bgColor || undefined }}
        >
            {text}
        </div>
    );
}

TextBlock.craft = {
    displayName: 'Texte',
    props: {
        text: 'Clique pour éditer ce texte.',
        fontSize: 'base',
        align: 'left',
        color: '#ffffff',
        paddingTop: 'xs', paddingBottom: 'xs', bgColor: '',
        customId: '', customClass: '', hideOnMobile: false, hideOnDesktop: false, animateIn: 'none',
    },
    rules: { canDrag: () => true },
};
