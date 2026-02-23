'use client';

import { Marquee } from '@/components/ui/marquee';
import { TestimonialCard } from '@/components/landing/testimonial-card';

interface TestimonialItem {
    id: string;
    content: string;
    rating: number;
    displayName: string;
    displayRole: string;
    featured: boolean;
}

/**
 * TestimonialsClient — Marquee scrolling des cartes témoignages.
 * Deux rangées en sens inverse pour un effet premium.
 */
export function TestimonialsClient({ items }: { items: TestimonialItem[] }) {
    // Diviser en 2 rangées
    const half = Math.ceil(items.length / 2);
    const row1 = items.slice(0, half);
    const row2 = items.slice(half);

    return (
        <div className="relative space-y-4">
            {/* Fade edges */}
            <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-20 bg-gradient-to-r from-zinc-950 to-transparent" />
            <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-20 bg-gradient-to-l from-zinc-950 to-transparent" />

            {/* Row 1 — left to right */}
            <Marquee duration={35} pauseOnHover repeat={3} className="[--gap:1.5rem]">
                {row1.map((t) => (
                    <div key={t.id} className="shrink-0 px-2">
                        <TestimonialCard
                            content={t.content}
                            displayName={t.displayName}
                            displayRole={t.displayRole}
                            rating={t.rating}
                            featured={t.featured}
                        />
                    </div>
                ))}
            </Marquee>

            {/* Row 2 — right to left */}
            {row2.length > 0 && (
                <Marquee duration={40} pauseOnHover reverse repeat={3} className="[--gap:1.5rem]">
                    {row2.map((t) => (
                        <div key={t.id} className="shrink-0 px-2">
                            <TestimonialCard
                                content={t.content}
                                displayName={t.displayName}
                                displayRole={t.displayRole}
                                rating={t.rating}
                                featured={t.featured}
                            />
                        </div>
                    ))}
                </Marquee>
            )}
        </div>
    );
}
