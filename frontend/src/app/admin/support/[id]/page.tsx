import { api } from "@/lib/api-server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from 'lucide-react';
import { AdminTicketDetail } from "@/components/support/admin-ticket-detail";

interface SupportMessage {
    id: string;
    sender_type: string;
    sender_id?: string;
    content: string;
    is_internal: boolean;
    created_at: string;
}

interface SupportTicket {
    id: string;
    user_id?: string;
    guest_email?: string;
    guest_name?: string;
    subject: string;
    category: string;
    status: string;
    priority: string;
    admin_note?: string;
    created_at: string;
    resolved_at?: string;
    messages: SupportMessage[];
}

export default async function AdminTicketDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    const result = await api.get<{ data: SupportTicket; user_email?: string }>(`/v1/admin/support/${id}`).catch(() => null);
    if (!result?.data) redirect("/admin/support");

    const ticket = result.data;
    const messages = ticket.messages ?? [];
    const userEmail = result.user_email ?? null;

    const statusLabel: Record<string, string> = {
        open: "Ouvert",
        in_progress: "En cours",
        waiting_user: "Attente user",
        resolved: "Résolu",
        closed: "Fermé",
    };
    const statusColor: Record<string, string> = {
        open: "text-amber-400 bg-amber-400/10 border-amber-400/30",
        in_progress: "text-sky-400 bg-sky-400/10 border-sky-400/30",
        waiting_user: "text-amber-400 bg-amber-400/10 border-amber-400/30",
        resolved: "text-emerald-400 bg-emerald-400/10 border-emerald-400/30",
        closed: "text-zinc-500 bg-zinc-800 border-zinc-700",
    };

    const st = statusLabel[ticket.status] ?? "Ouvert";
    const sc = statusColor[ticket.status] ?? statusColor.open;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <Link href="/admin/support" className="font-mono text-[9px] uppercase tracking-widest text-orange-400/60 hover:text-orange-400 transition-colors mb-1 inline-block">
                        <ArrowLeft className="inline h-3 w-3" /> FILE D&apos;ATTENTE
                    </Link>
                    <h1 className="text-xl font-bold text-white">{ticket.subject}</h1>
                    <p className="font-mono text-[9px] uppercase tracking-widest text-zinc-600 mt-1">
                        {ticket.category} · #{ticket.id.slice(0, 8)}
                    </p>
                </div>
                <span className={`rounded-full border border-dashed px-3 py-1 font-mono text-[9px] uppercase tracking-widest ${sc}`}>
                    {st}
                </span>
            </div>

            <AdminTicketDetail
                ticket={{
                    id: ticket.id,
                    user_id: ticket.user_id ?? null,
                    guest_email: ticket.guest_email ?? null,
                    guest_name: ticket.guest_name ?? null,
                    subject: ticket.subject,
                    category: ticket.category,
                    status: ticket.status,
                    priority: ticket.priority,
                    admin_note: ticket.admin_note ?? null,
                    created_at: ticket.created_at,
                    resolved_at: ticket.resolved_at ?? null,
                }}
                messages={messages.map((m) => ({
                    id: m.id,
                    sender_type: m.sender_type,
                    sender_id: m.sender_id ?? null,
                    content: m.content,
                    is_internal: m.is_internal,
                    created_at: m.created_at,
                }))}
                userEmail={userEmail}
            />
        </div>
    );
}
