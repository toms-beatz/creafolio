import { Quote } from 'lucide-react';
import { CoordLabel } from '@/components/ui/coord-label';
import { TestimonialsClient } from '@/components/landing/testimonials-client';

/**
 * Section Testimonials — avis réels de créateurs.
 * Fetch les testimonials approuvés via API.
 */
export async function Testimonials() {
    let items: Array<{
        id: string;
        content: string;
        rating: number;
        displayName: string;
        displayRole: string;
        featured: boolean;
    }> = [];

    try {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
        const res = await fetch(`${baseUrl}/api/testimonials`, {
            next: { revalidate: 300 },
        });

        if (res.ok) {
            const json = await res.json();
            if (json.testimonials && json.testimonials.length >= 2) {
                items = json.testimonials;
            }
        }
    } catch {
        // Silently fail
    }

    // Pas assez de testimonials → placeholder
    if (items.length < 2) {
        return (
            <section className="relative py-20 lg:py-28">
                <div className="mx-auto max-w-4xl px-4 lg:px-8 text-center">
                    <CoordLabel text="[AVIS // 00.08]" className="mb-4 block" />
                    <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl mb-4">
                        Ce que disent les{' '}
                        <span className="text-sky-400">créateurs</span>
                    </h2>
                    <div className="rounded-xl border border-dashed border-zinc-800 p-12">
                        <Quote className="h-8 w-8 text-zinc-800 mx-auto mb-4" />
                        <p className="text-sm text-zinc-500">
                            Les premiers avis arrivent bientôt. Crée ton portfolio et partage ton expérience !
                        </p>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="relative py-20 lg:py-28 overflow-hidden">
            {/* Gradient background */}
            <div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                    backgroundImage: 'radial-gradient(circle, #38bdf8 1px, transparent 1px)',
                    backgroundSize: '20px 20px',
                }}
                aria-hidden="true"
            />

            <div className="relative mx-auto max-w-6xl px-4 lg:px-8">
                <div className="text-center mb-12">
                    <CoordLabel text="[AVIS // 00.08]" className="mb-4 block" />
                    <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                        Ce que disent les{' '}
                        <span className="text-sky-400">créateurs</span>
                    </h2>
                    <p className="mt-3 text-sm text-zinc-400 max-w-md mx-auto">
                        Des créateurs UGC partagent leur expérience avec Blooprint.
                    </p>
                </div>

                {/* Marquee testimonials */}
                <TestimonialsClient items={items} />
            </div>
        </section>
    );
}
