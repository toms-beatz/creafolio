import { Star, Quote } from 'lucide-react';

/**
 * TestimonialCard — carte individuelle dans le Marquee.
 * Fichier séparé pour pouvoir être importé par un Client Component
 * sans tirer les imports serveur de testimonials.tsx.
 */
export function TestimonialCard({
    content,
    displayName,
    displayRole,
    rating,
    featured,
}: {
    content: string;
    displayName: string;
    displayRole: string;
    rating: number;
    featured: boolean;
}) {
    return (
        <article
            aria-label={`Témoignage de ${displayName}`}
            className={`relative flex flex-col gap-3 rounded-xl border p-5 w-[320px] min-h-[200px] transition-colors ${featured
                ? 'border-sky-400/30 bg-zinc-900/80 shadow-lg shadow-sky-400/5'
                : 'border-zinc-800 bg-zinc-900/50'
                }`}
        >
            {/* Quote icon */}
            <Quote className="h-4 w-4 text-sky-400/40" aria-hidden="true" />

            {/* Content */}
            <blockquote className="text-sm text-zinc-300 leading-relaxed line-clamp-4">
                &ldquo;{content}&rdquo;
            </blockquote>

            {/* Footer */}
            <div className="flex items-center justify-between mt-auto pt-2 border-t border-zinc-800/50">
                <div>
                    <p className="text-xs font-medium text-white">{displayName}</p>
                    <p className="text-[10px] text-zinc-500">{displayRole}</p>
                </div>
                <div className="flex gap-0.5" role="img" aria-label={`${rating} étoiles sur 5`}>
                    {Array.from({ length: 5 }, (_, i) => (
                        <Star
                            key={i}
                            className={`h-2.5 w-2.5 ${i < rating ? 'text-amber-400 fill-amber-400' : 'text-zinc-700'
                                }`}
                            aria-hidden="true"
                        />
                    ))}
                </div>
            </div>
        </article>
    );
}
