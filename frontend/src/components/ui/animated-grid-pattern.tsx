'use client';

import { useEffect, useRef, useState, useId, useCallback } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AnimatedGridPatternProps {
    /** Taille de cellule en px */
    cellSize?: number;
    /** Nombre max de cellules visibles simultanément */
    maxActive?: number;
    /** Durée du flash en secondes */
    duration?: number;
    /** Couleur du stroke */
    strokeColor?: string;
    className?: string;
}

/**
 * AnimatedGridPattern — grille blueprint avec cellules qui s'illuminent aléatoirement.
 * Inspiré de Magic UI. Remplace la BlueprintGrid statique pour les sections hero.
 */
export function AnimatedGridPattern({
    cellSize = 40,
    maxActive = 6,
    duration = 3,
    strokeColor = '#38bdf8',
    className,
}: AnimatedGridPatternProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [grid, setGrid] = useState<{ cols: number; rows: number }>({ cols: 0, rows: 0 });
    const [activeSquares, setActiveSquares] = useState<Set<string>>(new Set());
    const patternId = useId();

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        const observer = new ResizeObserver(([entry]) => {
            const { width, height } = entry.contentRect;
            setGrid({
                cols: Math.ceil(width / cellSize),
                rows: Math.ceil(height / cellSize),
            });
        });
        observer.observe(el);
        return () => observer.disconnect();
    }, [cellSize]);

    const getRandomCell = useCallback(() => {
        if (grid.cols === 0 || grid.rows === 0) return null;
        const col = Math.floor(Math.random() * grid.cols);
        const row = Math.floor(Math.random() * grid.rows);
        return `${col}-${row}`;
    }, [grid]);

    useEffect(() => {
        if (grid.cols === 0) return;

        const interval = setInterval(() => {
            setActiveSquares((prev) => {
                const next = new Set(prev);
                // Remove oldest if maxActive
                if (next.size >= maxActive) {
                    const first = next.values().next().value;
                    if (first) next.delete(first);
                }
                const cell = getRandomCell();
                if (cell) next.add(cell);
                return next;
            });
        }, (duration * 1000) / maxActive);

        return () => clearInterval(interval);
    }, [grid, maxActive, duration, getRandomCell]);

    return (
        <div
            ref={containerRef}
            className={cn('absolute inset-0 overflow-hidden pointer-events-none', className)}
            aria-hidden="true"
        >
            {/* Grille dashed de base */}
            <svg className="absolute inset-0 h-full w-full">
                <defs>
                    <pattern
                        id={patternId}
                        x="0"
                        y="0"
                        width={cellSize}
                        height={cellSize}
                        patternUnits="userSpaceOnUse"
                    >
                        <line
                            x1="0" y1={cellSize} x2={cellSize} y2={cellSize}
                            stroke={strokeColor}
                            strokeWidth="0.9"
                            strokeDasharray="3 5"
                        />
                        <line
                            x1={cellSize} y1="0" x2={cellSize} y2={cellSize}
                            stroke={strokeColor}
                            strokeWidth="0.9"
                            strokeDasharray="3 5"
                        />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill={`url(#${patternId})`} opacity={0.12} />
            </svg>

            {/* Cellules animées qui s'illuminent */}
            {Array.from(activeSquares).map((key) => {
                const [col, row] = key.split('-').map(Number);
                return (
                    <ActiveCell
                        key={key}
                        x={col * cellSize}
                        y={row * cellSize}
                        size={cellSize}
                        color={strokeColor}
                        duration={duration}
                    />
                );
            })}
        </div>
    );
}

function ActiveCell({
    x,
    y,
    size,
    color,
    duration,
}: {
    x: number;
    y: number;
    size: number;
    color: string;
    duration: number;
}) {
    const controls = useAnimation();

    useEffect(() => {
        controls.start({
            opacity: [0, 0.15, 0],
            transition: { duration, ease: 'easeInOut' },
        });
    }, [controls, duration]);

    return (
        <motion.div
            className="absolute"
            style={{
                left: x,
                top: y,
                width: size,
                height: size,
                backgroundColor: color,
            }}
            initial={{ opacity: 0 }}
            animate={controls}
        />
    );
}
