'use client';

import { useCallback, useRef, useEffect } from 'react';
import { useNode } from '@craftjs/core';

interface EditableTextProps {
    /** Clé de la prop Craft.js à modifier */
    propKey: string;
    /** Valeur courante */
    value: string;
    className?: string;
    style?: React.CSSProperties;
    /** Tag HTML à utiliser */
    as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span' | 'div' | 'a';
    /** Si true, Enter = blur (pas de saut de ligne) */
    singleLine?: boolean;
    placeholder?: string;
}

/**
 * Texte éditable inline dans le builder Craft.js.
 * Quand le bloc parent est sélectionné, le texte devient contentEditable.
 * EPIC 14 — US-1402
 */
export function EditableText({
    propKey,
    value,
    className,
    style,
    as: Tag = 'span',
    singleLine = true,
    placeholder = 'Cliquer pour éditer…',
}: EditableTextProps) {
    const ref = useRef<HTMLElement>(null);

    const {
        isSelected,
        actions: { setProp },
    } = useNode((node) => ({
        isSelected: node.events.selected,
    }));

    // Sync DOM content si la valeur change depuis l'extérieur
    useEffect(() => {
        if (ref.current && ref.current.textContent !== value && !isSelected) {
            ref.current.textContent = value;
        }
    }, [value, isSelected]);

    const handleBlur = useCallback(
        (e: React.FocusEvent<HTMLElement>) => {
            const newText = e.currentTarget.textContent ?? '';
            if (newText !== value) {
                setProp((props: Record<string, unknown>) => {
                    props[propKey] = newText;
                });
            }
        },
        [propKey, value, setProp],
    );

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent<HTMLElement>) => {
            if (singleLine && e.key === 'Enter') {
                e.preventDefault();
                (e.currentTarget as HTMLElement).blur();
            }
            if (e.key === 'Escape') {
                if (ref.current) ref.current.textContent = value;
                (e.currentTarget as HTMLElement).blur();
            }
        },
        [singleLine, value],
    );

    const handleMouseDown = useCallback(
        (e: React.MouseEvent) => {
            // Empêche le drag Craft.js quand on édite
            if (isSelected) e.stopPropagation();
        },
        [isSelected],
    );

    const TagComponent = Tag as React.ElementType;

    return (
        <TagComponent
            ref={ref}
            contentEditable={isSelected || undefined}
            suppressContentEditableWarning
            className={className}
            style={{
                ...style,
                cursor: isSelected ? 'text' : 'inherit',
                outline: isSelected ? 'none' : undefined,
                minWidth: isSelected ? '1ch' : undefined,
            }}
            data-placeholder={!value && placeholder ? placeholder : undefined}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            onMouseDown={handleMouseDown}
        >
            {value}
        </TagComponent>
    );
}
