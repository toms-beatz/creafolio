'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface TypingEffectProps {
    /** Mots qui se succèdent */
    words: string[];
    className?: string;
    /** Durée d'affichage de chaque mot (ms) */
    displayDuration?: number;
    /** Vitesse de frappe par caractère (ms) */
    typingSpeed?: number;
}

/**
 * TypingEffect — effet machine à écrire avec rotation de mots.
 * Curseur clignotant + transition fluide entre les mots.
 */
export function TypingEffect({
    words,
    className,
    displayDuration = 2500,
    typingSpeed = 60,
}: TypingEffectProps) {
    const [index, setIndex] = useState(0);
    const [displayedText, setDisplayedText] = useState('');
    const [phase, setPhase] = useState<'typing' | 'display' | 'erasing'>('typing');

    useEffect((): void | (() => void) => {
        const word = words[index];

        if (phase === 'typing') {
            if (displayedText.length < word.length) {
                const timeout = setTimeout(() => {
                    setDisplayedText(word.slice(0, displayedText.length + 1));
                }, typingSpeed);
                return () => clearTimeout(timeout);
            } else {
                const timeout = setTimeout(() => setPhase('display'), displayDuration);
                return () => clearTimeout(timeout);
            }
        }

        if (phase === 'display') {
            setPhase('erasing');
            return;
        }

        if (phase === 'erasing') {
            if (displayedText.length > 0) {
                const timeout = setTimeout(() => {
                    setDisplayedText(displayedText.slice(0, -1));
                }, typingSpeed / 2);
                return () => clearTimeout(timeout);
            } else {
                setIndex((prev) => (prev + 1) % words.length);
                setPhase('typing');
                return;
            }
        }
    }, [displayedText, phase, index, words, displayDuration, typingSpeed]);

    return (
        <span className={cn('inline-flex items-baseline', className)}>
            <AnimatePresence mode="popLayout">
                <motion.span
                    key={displayedText}
                    className="text-sky-400"
                    initial={{ opacity: 0.8 }}
                    animate={{ opacity: 1 }}
                >
                    {displayedText}
                </motion.span>
            </AnimatePresence>
            <motion.span
                className="inline-block w-[2px] h-[0.9em] bg-sky-400 ml-0.5 -mb-[1px]"
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, repeatType: 'reverse' }}
            />
        </span>
    );
}
