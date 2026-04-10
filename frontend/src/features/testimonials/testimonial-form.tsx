'use client';

import { useState } from 'react';
import { Star, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/**
 * TestimonialForm — permet aux utilisateurs connectés de soumettre un avis.
 * Placé dans la section Testimonials de la landing (visible seulement si auth).
 */
export function TestimonialForm() {
    const [content, setContent] = useState('');
    const [rating, setRating] = useState(5);
    const [displayRole, setDisplayRole] = useState('Créateur UGC');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);
    const [hoverRating, setHoverRating] = useState(0);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setResult(null);

        try {
            const res = await fetch('/api/testimonials', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content, rating, displayRole }),
            });

            const data = await res.json();
            if (res.ok) {
                setResult({ ok: true, message: data.message ?? 'Merci pour ton témoignage !' });
                setContent('');
                setRating(5);
            } else {
                setResult({ ok: false, message: data.error ?? 'Erreur, réessaie.' });
            }
        } catch {
            setResult({ ok: false, message: 'Erreur réseau.' });
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Rating */}
            <div className="flex items-center gap-1">
                <span className="text-xs text-zinc-500 mr-2">Note :</span>
                {[1, 2, 3, 4, 5].map((r) => (
                    <button
                        key={r}
                        type="button"
                        onClick={() => setRating(r)}
                        onMouseEnter={() => setHoverRating(r)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="transition-transform hover:scale-110"
                    >
                        <Star
                            className={cn(
                                'h-5 w-5 transition-colors',
                                r <= (hoverRating || rating)
                                    ? 'text-amber-400 fill-amber-400'
                                    : 'text-zinc-700',
                            )}
                        />
                    </button>
                ))}
            </div>

            {/* Content */}
            <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Partage ton expérience avec Creafolio..."
                maxLength={500}
                rows={3}
                required
                className="w-full rounded-lg border border-[#e8c9b5] bg-white px-4 py-3 text-sm text-[#1a1a1a] placeholder:text-[#1a1a1a]/40 focus:border-[#ad7b60]/40 focus:outline-none focus:ring-1 focus:ring-[#ad7b60]/20 resize-none"
            />

            <div className="flex items-center justify-between gap-4">
                {/* Display role */}
                <select
                    value={displayRole}
                    onChange={(e) => setDisplayRole(e.target.value)}
                    className="rounded-lg border border-[#e8c9b5] bg-white px-3 py-2 text-xs text-[#1a1a1a]/70 focus:border-[#ad7b60]/40 focus:outline-none"
                >
                    <option value="Créateur UGC">Créateur UGC</option>
                    <option value="Créateur TikTok">Créateur TikTok</option>
                    <option value="Créateur Instagram">Créateur Instagram</option>
                    <option value="Créateur YouTube">Créateur YouTube</option>
                    <option value="Freelance">Freelance</option>
                </select>

                <div className="flex items-center gap-3">
                    <span className="text-[10px] text-zinc-600 font-mono">
                        {content.length}/500
                    </span>
                    <Button
                        type="submit"
                        disabled={loading || content.length < 10}
                        size="sm"
                        className="bg-[#ad7b60] text-white hover:bg-[#d4a485] disabled:opacity-50"
                    >
                        {loading ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                            <>
                                <Send className="h-3.5 w-3.5 mr-1.5" /> Envoyer
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {/* Result message */}
            {result && (
                <p
                    className={cn(
                        'text-xs rounded-lg px-3 py-2 border',
                        result.ok
                            ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20'
                            : 'text-red-400 bg-red-400/10 border-red-400/20',
                    )}
                >
                    {result.message}
                </p>
            )}
        </form>
    );
}
