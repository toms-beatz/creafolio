'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface ParticlesProps {
    className?: string;
    /** Nombre de particules */
    quantity?: number;
    /** Couleur des particules (hex) */
    color?: string;
    /** Taille min / max des particules */
    size?: { min: number; max: number };
    /** Vitesse de déplacement */
    speed?: number;
    /** Refresh rate (ms) */
    refresh?: boolean;
}

/**
 * Particles — champ de particules flottantes en arrière-plan.
 * Inspiré de Magic UI. Canvas-based, performant.
 */
export function Particles({
    className,
    quantity = 40,
    color = '#38bdf8',
    size = { min: 0.4, max: 1.2 },
    speed = 0.3,
}: ParticlesProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const contextRef = useRef<CanvasRenderingContext2D | null>(null);
    const particlesRef = useRef<Particle[]>([]);
    const animationRef = useRef<number>(0);
    const [dimensions, setDimensions] = useState({ w: 0, h: 0 });

    interface Particle {
        x: number;
        y: number;
        size: number;
        alpha: number;
        dx: number;
        dy: number;
        targetAlpha: number;
    }

    const hexToRgb = useCallback((hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result
            ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
            : { r: 56, g: 189, b: 248 };
    }, []);

    const createParticle = useCallback((): Particle => {
        const s = size.min + Math.random() * (size.max - size.min);
        return {
            x: Math.random() * dimensions.w,
            y: Math.random() * dimensions.h,
            size: s,
            alpha: 0,
            dx: (Math.random() - 0.5) * speed,
            dy: (Math.random() - 0.5) * speed,
            targetAlpha: 0.1 + Math.random() * 0.5,
        };
    }, [dimensions, size, speed]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const parent = canvas.parentElement;
        if (!parent) return;

        const observer = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const { width, height } = entry.contentRect;
                setDimensions({ w: width, h: height });
            }
        });
        observer.observe(parent);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || dimensions.w === 0) return;

        canvas.width = dimensions.w;
        canvas.height = dimensions.h;
        contextRef.current = canvas.getContext('2d');
        particlesRef.current = Array.from({ length: quantity }, () => createParticle());
    }, [dimensions, quantity, createParticle]);

    useEffect(() => {
        const ctx = contextRef.current;
        if (!ctx || dimensions.w === 0) return;

        const rgb = hexToRgb(color);

        const animate = () => {
            ctx.clearRect(0, 0, dimensions.w, dimensions.h);

            for (const p of particlesRef.current) {
                // Move
                p.x += p.dx;
                p.y += p.dy;

                // Wrap around
                if (p.x < 0) p.x = dimensions.w;
                if (p.x > dimensions.w) p.x = 0;
                if (p.y < 0) p.y = dimensions.h;
                if (p.y > dimensions.h) p.y = 0;

                // Fade in
                p.alpha += (p.targetAlpha - p.alpha) * 0.02;

                // Draw
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${p.alpha})`;
                ctx.fill();
            }

            animationRef.current = requestAnimationFrame(animate);
        };

        animate();
        return () => cancelAnimationFrame(animationRef.current);
    }, [dimensions, color, hexToRgb]);

    return (
        <div className={cn('absolute inset-0 overflow-hidden pointer-events-none', className)} aria-hidden="true">
            <canvas ref={canvasRef} className="h-full w-full" />
        </div>
    );
}
