import { api } from "@/lib/api-server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from 'lucide-react';

import {
    createUserTicketAction,
    replyToTicketAction,
    closeTicketAction,
} from "@/features/support/actions";
import { TicketForm } from "@/components/support/ticket-form";
import { Button } from "@/components/ui/button";

const userCategories = [
    { value: "technique", label: "Problème technique" },
    { value: "billing", label: "Facturation / Abonnement" },
    { value: "general", label: "Question générale" },
    { value: "autre", label: "Autre" },
];

const statusConfig: Record<string, { label: string; color: string }> = {
    open: { label: "Ouvert", color: "text-amber-400 bg-amber-400/10 border-amber-400/30" },
    in_progress: { label: "En cours", color: "text-[#ad7b60] bg-[#ad7b60]/10 border-[#ad7b60]/30" },
    waiting_user: { label: "Réponse attendue", color: "text-amber-400 bg-amber-400/10 border-amber-400/30" },
    resolved: { label: "Résolu", color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/30" },
    closed: { label: "Fermé", color: "text-zinc-500 bg-zinc-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700" },
};

interface Ticket {
    id: string;
    subject: string;
    category: string;
    status: string;
    priority: string;
    admin_note?: string;
    created_at: string;
    resolved_at?: string;
}

interface Message {
    id: string;
    sender_type: string;
    content: string;
    created_at: string;
}

export default async function DashboardSupportPage({
    searchParams,
}: {
    searchParams: Promise<{ view?: string; ticket?: string }>;
}) {
    const params = await searchParams;

    if (params.view === "new") {
        return (
            <div className="space-y-6 max-w-3xl">
                <div className="flex items-center justify-between">
                    <Link href="/dashboard/support" className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 hover:text-white transition-colors">
                        <ArrowLeft className="inline h-3 w-3" /> Mes tickets
                    </Link>
                </div>
                <div>
                    <p className="font-mono text-[9px] uppercase tracking-widest text-zinc-600 mb-1">
                        SUPPORT // NOUVEAU TICKET
                    </p>
                    <h1 className="text-2xl font-bold text-white">Créer un ticket support</h1>
                    <p className="mt-2 text-sm text-zinc-500">
                        Décrivez votre problème et nous vous répondrons rapidement.
                    </p>
                </div>
                <div className="rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/30 p-6 sm:p-8">
                    <TicketForm isGuest={false} categories={userCategories} action={createUserTicketAction} />
                </div>
            </div>
        );
    }

    if (params.ticket) {
        const result = await api.get<{ data: Ticket & { messages: Message[] } }>(`/v1/support/tickets/${params.ticket}`).catch(() => null);
        if (!result?.data) redirect("/dashboard/support");

        const ticket = result.data;
        const messages: Message[] = ticket.messages ?? [];
        const st = statusConfig[ticket.status] ?? statusConfig.open;
        const canReply = !["closed", "resolved"].includes(ticket.status);

        return (
            <div className="space-y-6 max-w-3xl">
                <div className="flex items-center justify-between">
                    <Link href="/dashboard/support" className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 hover:text-white transition-colors">
                        <ArrowLeft className="inline h-3 w-3" /> Mes tickets
                    </Link>
                    <span className={`rounded-full border border-dashed px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest ${st.color}`}>
                        {st.label}
                    </span>
                </div>
                <div>
                    <p className="font-mono text-[9px] uppercase tracking-widest text-zinc-600 mb-1">
                        TICKET // {ticket.category.toUpperCase()}
                    </p>
                    <h1 className="text-xl font-bold text-white">{ticket.subject}</h1>
                    <p className="text-xs text-zinc-600 mt-1">
                        Créé le {new Date(ticket.created_at).toLocaleString("fr-FR", { dateStyle: "long", timeStyle: "short" })}
                    </p>
                </div>
                <div className="space-y-4">
                    {messages.map((msg) => {
                        const isAdmin = msg.sender_type === "admin";
                        return (
                            <div key={msg.id} className={`flex ${isAdmin ? "justify-start" : "justify-end"}`}>
                                <div className={`max-w-[80%] rounded-xl px-4 py-3 ${isAdmin ? "bg-[#ad7b60]/10 border border-dashed border-[#ad7b60]/30" : "bg-zinc-100 dark:bg-zinc-800 border border-dashed border-zinc-200 dark:border-zinc-700"}`}>
                                    <p className="font-mono text-[9px] uppercase tracking-widest mb-1 opacity-60">
                                        {isAdmin ? "Creafolio Support" : "Vous"}
                                    </p>
                                    <p className="text-sm text-zinc-200 whitespace-pre-wrap">{msg.content}</p>
                                    <p className="text-[10px] text-zinc-600 mt-2">
                                        {new Date(msg.created_at).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
                {canReply ? (
                    <div className="space-y-3">
                        <form action={replyToTicketAction}>
                            <input type="hidden" name="ticketId" value={ticket.id} />
                            <textarea name="message" required minLength={2} rows={3}
                                className="w-full rounded-lg border border-dashed border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-4 py-3 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 focus:border-[#ad7b60]/50 focus:outline-none transition-colors resize-none"
                                placeholder="Votre réponse..."
                            />
                            <Button type="submit" className="mt-2 bg-[#ad7b60] text-zinc-950 hover:bg-[#d4a485]">Envoyer</Button>
                        </form>
                        <form action={closeTicketAction} className="text-center">
                            <input type="hidden" name="ticketId" value={ticket.id} />
                            <Button type="submit" variant="ghost" className="text-xs text-zinc-500 hover:text-emerald-400">
                                Marquer comme résolu
                            </Button>
                        </form>
                    </div>
                ) : (
                    <div className="rounded-xl border border-dashed border-zinc-800 p-4 text-center">
                        <p className="text-sm text-zinc-500">Ce ticket est {ticket.status === "resolved" ? "résolu" : "fermé"}.</p>
                    </div>
                )}
            </div>
        );
    }

    // Default: list view
    const result = await api.get<{ data: Ticket[] }>('/v1/support/tickets').catch(() => null);
    const tickets: Ticket[] = result?.data ?? [];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <p className="font-mono text-[9px] uppercase tracking-widest text-zinc-600 mb-1">DASHBOARD // SUPPORT</p>
                    <h1 className="text-2xl font-bold text-white">Support</h1>
                </div>
                <Link href="/dashboard/support?view=new">
                    <Button className="bg-[#ad7b60] text-zinc-950 hover:bg-[#d4a485]">Nouveau ticket</Button>
                </Link>
            </div>

            {tickets.length === 0 ? (
                <div className="rounded-xl border border-dashed border-zinc-800 p-8 text-center">
                    <p className="text-zinc-500 text-sm mb-4">Vous n&apos;avez pas encore de tickets.</p>
                    <Link href="/dashboard/support?view=new">
                        <Button variant="ghost" className="text-[#ad7b60] hover:text-[#d4a485]">Créer un ticket</Button>
                    </Link>
                </div>
            ) : (
                <div className="space-y-3">
                    {tickets.map((ticket) => {
                        const st = statusConfig[ticket.status] ?? statusConfig.open;
                        return (
                            <Link key={ticket.id} href={`/dashboard/support?ticket=${ticket.id}`}
                                className="block rounded-xl border border-dashed border-zinc-800 bg-zinc-900/30 p-4 hover:border-zinc-600 transition-colors">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-white truncate">{ticket.subject}</p>
                                        <p className="text-xs text-zinc-600 mt-1">
                                            {ticket.category} · {new Date(ticket.created_at).toLocaleDateString("fr-FR")}
                                        </p>
                                    </div>
                                    <span className={`shrink-0 rounded-full border border-dashed px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest ${st.color}`}>
                                        {st.label}
                                    </span>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
