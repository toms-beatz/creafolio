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
        const backendUrl = process.env.LARAVEL_API_URL ?? 'http://backend:8000/api';
        const res = await fetch(`${backendUrl}/testimonials`, {
            next: { revalidate: 300 },
        });

        if (res.ok) {
            const json = await res.json();
            if (Array.isArray(json.data) && json.data.length > 0) {
                items = json.data.map((t: {
                    id: string;
                    content: string;
                    rating: number;
                    display_name?: string;
                    display_role?: string;
                    featured: boolean;
                }) => ({
                    id: t.id,
                    content: t.content,
                    rating: t.rating,
                    displayName: t.display_name ?? 'Créateur',
                    displayRole: t.display_role ?? 'Créateur UGC',
                    featured: t.featured,
                }));
            }
        }
    } catch {
        // Silently fail
    }

    // Aucun témoignage approuvé → section masquée
    if (items.length === 0) {
        return null;
    }

    return (
        <section aria-labelledby="testimonials-heading" className="relative py-20 lg:py-28 overflow-hidden bg-[#f4eeea]">
            <div className="relative mx-auto max-w-6xl px-4 lg:px-8">
                <div className="text-center mb-12">
                    <h2 id="testimonials-heading" className="text-3xl font-black tracking-tight text-[#ad7b60] uppercase" style={{ fontFamily: "var(--font-habibi, 'Habibi'), serif" }}>
                        Avis Clients
                    </h2>
                    <p className="mt-3 text-sm text-[#ad7b60]/70 max-w-md mx-auto">
                        Des créateurs partagent leur expérience avec Creafolio.
                    </p>
                </div>

                {/* Marquee testimonials */}
                <div aria-label="Témoignages de créateurs" role="region">
                    <TestimonialsClient items={items} />
                </div>
            </div>
        </section>
    );
}
