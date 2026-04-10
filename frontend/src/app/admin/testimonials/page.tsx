import { api } from "@/lib/api-server";
import { approveTestimonialAction } from "@/features/admin/actions";

interface Testimonial {
    id: string;
    user_id: string;
    content: string;
    rating: number;
    status: string;
    admin_note?: string;
    created_at: string;
}

const statusConfig: Record<string, { label: string; color: string }> = {
    pending: { label: "En attente", color: "text-amber-400 border-amber-400/30" },
    approved: { label: "Approuvé", color: "text-emerald-400 border-emerald-400/30" },
    rejected: { label: "Rejeté", color: "text-red-400 border-red-400/30" },
};

export default async function AdminTestimonialsPage() {
    const result = await api.get<{ data: Testimonial[] }>("/v1/admin/testimonials").catch(() => null);
    const testimonials: Testimonial[] = result?.data ?? [];

    return (
        <div className="space-y-6">
            <div>
                <p className="font-mono text-[9px] uppercase tracking-widest text-orange-400/60 mb-1">ADMIN // TÉMOIGNAGES</p>
                <h1 className="text-2xl font-bold text-white">Témoignages</h1>
            </div>
            <div className="space-y-4">
                {testimonials.length === 0 && (
                    <div className="rounded-xl border border-dashed border-zinc-800 p-8 text-center text-zinc-600">Aucun témoignage.</div>
                )}
                {testimonials.map((t) => {
                    const st = statusConfig[t.status] ?? statusConfig.pending;
                    return (
                        <div key={t.id} className="rounded-xl border border-dashed border-zinc-800 bg-zinc-900/30 p-4">
                            <div className="flex items-center justify-between gap-3 mb-3">
                                <div className="flex items-center gap-2">
                                    <span className="font-mono text-[9px] uppercase tracking-widest text-zinc-600">
                                        {String(t.user_id).slice(0, 8)}
                                    </span>
                                    <span className="text-amber-400 text-xs">{"★".repeat(t.rating)}</span>
                                </div>
                                <span className={`rounded-full border border-dashed px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest ${st.color}`}>{st.label}</span>
                            </div>
                            <p className="text-sm text-zinc-300 mb-4">&ldquo;{t.content}&rdquo;</p>
                            {t.status === "pending" && (
                                <div className="flex gap-3">
                                    <form action={approveTestimonialAction.bind(null, t.id, "approved", undefined)}>
                                        <button type="submit" className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors">Approuver</button>
                                    </form>
                                    <form action={approveTestimonialAction.bind(null, t.id, "rejected", undefined)}>
                                        <button type="submit" className="text-xs text-red-400 hover:text-red-300 transition-colors">Rejeter</button>
                                    </form>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
