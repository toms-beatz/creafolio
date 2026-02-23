'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface NumberTickerProps {
    /** Valeur cible */
    value: number;
    /** Suffixe affiché après le nombre (ex: "+", "%") */
    suffix?: string;
    /** Préfixe affiché avant le nombre (ex: "$") */
    prefix?: string;
    /** Durée de l'animation en ms */
    duration?: number;
    /** Nombre de décimales */
    decimals?: number;
    className?: string;
}

/**
 * NumberTicker — anime un nombre de 0 à la valeur cible quand visible dans le viewport.
 * Inspiré de Magic UI.
 */
export function NumberTicker({
    value,
    suffix = '',
    prefix = '',
    duration = 1600,
    decimals = 0,
    className,
}: NumberTickerProps) {
    const ref = useRef<HTMLSpanElement>(null);
    const [display, setDisplay] = useState(`${prefix}0${suffix}`);
    const hasAnimated = useRef(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !hasAnimated.current) {
                    hasAnimated.current = true;
                    animate();
                    observer.disconnect();
                }
            },
            { threshold: 0.3 },
        );
        observer.observe(el);
        return () => observer.disconnect();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]);

    function animate() {
        const start = performance.now();
        const step = (now: number) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = eased * value;
            setDisplay(`${prefix}${current.toFixed(decimals)}${suffix}`);
            if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    }

    return (
        <span ref={ref} className={cn('tabular-nums', className)}>
            {display}
        </span>
    );
}
