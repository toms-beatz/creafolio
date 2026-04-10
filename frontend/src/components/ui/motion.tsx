'use client';

import { type ReactNode } from 'react';
import { motion, type Variants } from 'framer-motion';

/* ── Shared spring config ─────────────────────────────────── */
const ease: [number, number, number, number] = [0.16, 1, 0.3, 1];

/* ── FadeIn ───────────────────────────────────────────────── */
interface FadeInProps {
    children: ReactNode;
    className?: string;
    /** Direction d'apparition */
    direction?: 'up' | 'down' | 'left' | 'right' | 'none';
    /** Délai en secondes */
    delay?: number;
    /** Durée en secondes */
    duration?: number;
    /** Distance de déplacement en px */
    distance?: number;
    /** Déclencher dès que 20% est visible (défaut) */
    threshold?: number;
    /** Ne jouer qu'une fois */
    once?: boolean;
}

export function FadeIn({
    children,
    className,
    direction = 'up',
    delay = 0,
    duration = 0.6,
    distance = 30,
    threshold = 0.2,
    once = true,
}: FadeInProps) {
    const offsets = {
        up: { y: distance },
        down: { y: -distance },
        left: { x: distance },
        right: { x: -distance },
        none: {},
    };

    return (
        <motion.div
            className={className}
            initial={{ opacity: 0, ...offsets[direction] }}
            whileInView={{ opacity: 1, x: 0, y: 0 }}
            viewport={{ once, amount: threshold }}
            transition={{ duration, ease, delay }}
        >
            {children}
        </motion.div>
    );
}

/* ── Stagger container + item ─────────────────────────────── */
const staggerContainer: Variants = {
    hidden: {},
    show: {
        transition: {
            staggerChildren: 0.12,
            delayChildren: 0.1,
        },
    },
};

const staggerItem: Variants = {
    hidden: { opacity: 0, y: 24 },
    show: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.55, ease },
    },
};

interface StaggerProps {
    children: ReactNode;
    className?: string;
    /** Viewport threshold */
    threshold?: number;
    once?: boolean;
}

export function Stagger({ children, className, threshold = 0.15, once = true }: StaggerProps) {
    return (
        <motion.div
            className={className}
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once, amount: threshold }}
        >
            {children}
        </motion.div>
    );
}

export function StaggerItem({ children, className }: { children: ReactNode; className?: string }) {
    return (
        <motion.div className={className} variants={staggerItem}>
            {children}
        </motion.div>
    );
}

/* ── ScaleIn ──────────────────────────────────────────────── */
export function ScaleIn({
    children,
    className,
    delay = 0,
    duration = 0.7,
    once = true,
}: {
    children: ReactNode;
    className?: string;
    delay?: number;
    duration?: number;
    once?: boolean;
}) {
    return (
        <motion.div
            className={className}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once, amount: 0.2 }}
            transition={{ duration, ease, delay }}
        >
            {children}
        </motion.div>
    );
}
