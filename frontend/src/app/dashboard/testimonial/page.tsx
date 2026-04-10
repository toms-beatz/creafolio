import { Quote } from 'lucide-react';
import { TestimonialForm } from '@/features/testimonials/testimonial-form';

export const metadata = {
    title: 'Mon témoignage — Creafolio',
};

/**
 * /dashboard/testimonial — Page dédiée pour déposer un avis.
 * Le témoignage est soumis en "pending" puis modéré par l'admin.
 */
export default function TestimonialPage() {
    return (
        <div className="max-w-xl">
            <div className="mb-6">
                <p className="font-mono text-[9px] uppercase tracking-widest text-zinc-600 mb-1">
                    DASHBOARD // TÉMOIGNAGE
                </p>
                <h1 className="text-2xl font-bold text-white">Partage ton avis</h1>
                <p className="mt-1 text-sm text-zinc-500">
                    Ton témoignage sera examiné par l&apos;équipe avant d&apos;apparaître sur la page d&apos;accueil.
                </p>
            </div>

            <section className="rounded-xl border border-dashed border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/40 p-6">
                <div className="flex items-center gap-2 mb-5">
                    <Quote className="h-5 w-5 text-[#ad7b60]/60" />
                    <h2 className="text-sm font-medium text-white">Nouveau témoignage</h2>
                </div>

                <TestimonialForm />

                <div className="mt-5 pt-4 border-t border-dashed border-zinc-200 dark:border-zinc-800">
                    <p className="text-[10px] text-zinc-600 leading-relaxed">
                        En soumettant ton avis, tu acceptes qu&apos;il soit publié sur la page d&apos;accueil de Creafolio
                        avec ton nom d&apos;utilisateur et le rôle choisi. Tu peux avoir maximum 1 témoignage en attente à la fois.
                    </p>
                </div>
            </section>
        </div>
    );
}
