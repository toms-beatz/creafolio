import { createAdminClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { Star, Check, X, Trash2, Award } from 'lucide-react';
import {
    approveTestimonialAction,
    rejectTestimonialAction,
    toggleFeaturedAction,
    deleteTestimonialAction,
} from '@/features/testimonials/actions';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = (): any => createAdminClient();

const statusLabels: Record<string, { label: string; color: string }> = {
    pending: { label: 'En attente', color: 'text-amber-400 bg-amber-400/10 border-amber-400/30' },
    approved: { label: 'Approuvé', color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30' },
    rejected: { label: 'Rejeté', color: 'text-red-400 bg-red-400/10 border-red-400/30' },
};

/**
 * Admin Testimonials — modération des avis créateurs.
 */
export default async function AdminTestimonialsPage({
    searchParams,
}: {
    searchParams: Promise<{ filter?: string }>;
}) {
    const params = await searchParams;
    const filter = params.filter || 'pending';
    const admin = db();

    let query = admin
        .from('testimonials')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

    if (filter !== 'all') {
        query = query.eq('status', filter);
    }

    const { data: testimonials } = await query;

    // Fetch usernames
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userIds = [...new Set((testimonials ?? []).map((t: any) => t.user_id))];
    const { data: profiles } = userIds.length > 0
        ? await admin.from('profiles').select('id, username, email').in('id', userIds)
        : { data: [] };

    const profileMap = new Map<string, { id: string; username: string; email: string }>(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (profiles ?? []).map((p: any) => [p.id, p]),
    );

    // Counts par status
    const { count: pendingCount } = await admin
        .from('testimonials')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

    const { count: approvedCount } = await admin
        .from('testimonials')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'approved');

    return (
        <div>
            {/* Header */}
            <div className="mb-6">
                <p className="font-mono text-[9px] uppercase tracking-widest text-zinc-600 mb-1">
                    ADMIN // TESTIMONIALS
                </p>
                <h1 className="text-2xl font-bold text-white">Témoignages</h1>
                <p className="mt-1 text-sm text-zinc-500">
                    {pendingCount ?? 0} en attente · {approvedCount ?? 0} approuvés
                </p>
            </div>

            {/* Filters */}
            <div className="flex gap-2 mb-6">
                {['pending', 'approved', 'rejected', 'all'].map((f) => (
                    <a
                        key={f}
                        href={`/admin/testimonials?filter=${f}`}
                        className={`rounded-full border px-4 py-1.5 text-xs font-medium transition-colors ${filter === f
                            ? 'border-orange-400/40 bg-orange-400/10 text-orange-400'
                            : 'border-zinc-700 text-zinc-500 hover:text-zinc-300 hover:border-zinc-600'
                            }`}
                    >
                        {f === 'pending'
                            ? `En attente (${pendingCount ?? 0})`
                            : f === 'approved'
                                ? `Approuvés (${approvedCount ?? 0})`
                                : f === 'rejected'
                                    ? 'Rejetés'
                                    : 'Tous'}
                    </a>
                ))}
            </div>

            {/* List */}
            {!testimonials || testimonials.length === 0 ? (
                <div className="rounded-xl border border-dashed border-zinc-800 p-12 text-center">
                    <p className="text-sm text-zinc-500">Aucun témoignage trouvé.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {testimonials.map((t: any) => {
                        const profile = profileMap.get(t.user_id);
                        const status = statusLabels[t.status as string] ?? statusLabels.pending;

                        return (
                            <div
                                key={t.id}
                                className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5"
                            >
                                <div className="flex items-start justify-between gap-4 mb-3">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-sm font-medium text-white">
                                                {t.display_name || profile?.username || 'Anonyme'}
                                            </span>
                                            <span
                                                className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[9px] font-mono ${status.color}`}
                                            >
                                                {status.label}
                                            </span>
                                            {t.featured && (
                                                <span className="inline-flex items-center gap-1 rounded-full bg-sky-400/10 border border-sky-400/30 px-2 py-0.5 text-[9px] text-sky-400">
                                                    <Award className="h-2.5 w-2.5" /> Featured
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-[10px] text-zinc-600 font-mono">
                                            {profile?.email ?? t.user_id} · {t.display_role}
                                        </p>
                                    </div>

                                    {/* Rating */}
                                    <div className="flex gap-0.5 shrink-0">
                                        {Array.from({ length: 5 }, (_, i) => (
                                            <Star
                                                key={i}
                                                className={`h-3 w-3 ${i < (t.rating as number) ? 'text-amber-400 fill-amber-400' : 'text-zinc-700'}`}
                                            />
                                        ))}
                                    </div>
                                </div>

                                {/* Content */}
                                <p className="text-sm text-zinc-300 leading-relaxed mb-3">
                                    &ldquo;{t.content}&rdquo;
                                </p>

                                <div className="flex items-center justify-between">
                                    <p className="text-[10px] text-zinc-600 font-mono">
                                        {new Date(t.created_at as string).toLocaleDateString('fr-FR')}
                                    </p>

                                    {/* Actions */}
                                    <div className="flex gap-2">
                                        {t.status === 'pending' && (
                                            <>
                                                <form action={approveTestimonialAction}>
                                                    <input type="hidden" name="testimonialId" value={t.id} />
                                                    <Button
                                                        type="submit"
                                                        size="sm"
                                                        className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 h-7 text-xs"
                                                    >
                                                        <Check className="h-3 w-3 mr-1" /> Approuver
                                                    </Button>
                                                </form>
                                                <form action={rejectTestimonialAction}>
                                                    <input type="hidden" name="testimonialId" value={t.id} />
                                                    <Button
                                                        type="submit"
                                                        size="sm"
                                                        variant="outline"
                                                        className="border-red-400/30 text-red-400 hover:bg-red-400/10 h-7 text-xs"
                                                    >
                                                        <X className="h-3 w-3 mr-1" /> Rejeter
                                                    </Button>
                                                </form>
                                            </>
                                        )}

                                        {t.status === 'approved' && (
                                            <form action={toggleFeaturedAction}>
                                                <input type="hidden" name="testimonialId" value={t.id} />
                                                <input type="hidden" name="featured" value={String(t.featured)} />
                                                <Button
                                                    type="submit"
                                                    size="sm"
                                                    variant="outline"
                                                    className={`h-7 text-xs ${t.featured
                                                        ? 'border-sky-400/30 text-sky-400 hover:bg-sky-400/10'
                                                        : 'border-zinc-700 text-zinc-400 hover:text-white'
                                                        }`}
                                                >
                                                    <Award className="h-3 w-3 mr-1" />
                                                    {t.featured ? 'Retirer featured' : 'Mettre en avant'}
                                                </Button>
                                            </form>
                                        )}

                                        <form action={deleteTestimonialAction}>
                                            <input type="hidden" name="testimonialId" value={t.id} />
                                            <Button
                                                type="submit"
                                                size="sm"
                                                variant="outline"
                                                className="border-zinc-700 text-zinc-500 hover:text-red-400 hover:border-red-400/30 h-7 text-xs"
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        </form>
                                    </div>
                                </div>

                                {t.admin_note && (
                                    <div className="mt-3 rounded-lg bg-zinc-800/50 p-3 border border-zinc-700">
                                        <p className="text-[10px] text-zinc-500 font-mono mb-1">Note admin</p>
                                        <p className="text-xs text-zinc-400">{t.admin_note}</p>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
