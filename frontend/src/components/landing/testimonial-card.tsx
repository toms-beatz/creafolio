import { Star } from 'lucide-react';

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
    const initial = displayName?.charAt(0)?.toUpperCase() ?? '?';

    return (
        <article
            aria-label={`Témoignage de ${displayName}`}
            className={`relative flex flex-col gap-4 rounded-2xl border p-6 w-[300px] transition-shadow hover:shadow-md ${featured
                ? 'border-[#ad7b60]/40 bg-white shadow-sm shadow-[#ad7b60]/10'
                : 'border-[#e8c9b5] bg-white'
                }`}
        >
            {/* Étoiles en haut */}
            <div className="flex gap-0.5" role="img" aria-label={`${rating} étoiles sur 5`}>
                {Array.from({ length: 5 }, (_, i) => (
                    <Star
                        key={i}
                        className={`h-3 w-3 ${i < rating ? 'text-amber-400 fill-amber-400' : 'fill-[#e8c9b5] text-[#e8c9b5]'}`}
                        aria-hidden="true"
                    />
                ))}
            </div>

            {/* Contenu */}
            <blockquote className="text-sm text-[#1a1a1a]/75 leading-relaxed line-clamp-4 flex-1">
                &ldquo;{content}&rdquo;
            </blockquote>

            {/* Auteur */}
            <div className="flex items-center gap-3">
                {/* Avatar initiale */}
                <div className="h-8 w-8 shrink-0 rounded-full bg-[#e8c9b5] flex items-center justify-center">
                    <span className="text-xs font-semibold text-[#ad7b60]">{initial}</span>
                </div>
                <div>
                    <p className="text-xs font-semibold text-[#1a1a1a]">{displayName}</p>
                    <p className="text-[11px] text-[#ad7b60]">{displayRole}</p>
                </div>
            </div>
        </article>
    );
}

