import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from 'lucide-react';
import { createAdminClient } from "@/lib/supabase/server";
import { AdminTicketDetail } from "@/components/support/admin-ticket-detail";

/**
 * US-1305 + US-1307 : Admin ticket detail page
 * Server component fetching ticket + messages, delegates to client component.
 */
export default async function AdminTicketDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const admin = createAdminClient();

    // Fetch ticket
    const { data: ticket } = await admin
        .from("support_tickets")
        .select("*")
        .eq("id", id)
        .single();

    if (!ticket) redirect("/admin/support");

    // Fetch all messages (including internal notes for admin)
    const { data: messages } = await admin
        .from("support_messages")
        .select("*")
        .eq("ticket_id", ticket.id)
        .order("created_at", { ascending: true });

    // If user ticket, fetch email from auth.users via admin client
    let userEmail: string | null = null;
    if (ticket.user_id) {
        const { data: userData } = await admin.auth.admin.getUserById(ticket.user_id);
        userEmail = userData?.user?.email ?? null;
    }

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
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <Link
                        href="/admin/support"
                        className="font-mono text-[9px] uppercase tracking-widest text-orange-400/60 hover:text-orange-400 transition-colors mb-1 inline-block"
                    >
                        <ArrowLeft className="inline h-3 w-3" /> FILE D&apos;ATTENTE
                    </Link>
                    <h1 className="text-xl font-bold text-white">{ticket.subject}</h1>
                    <p className="font-mono text-[9px] uppercase tracking-widest text-zinc-600 mt-1">
                        {ticket.category} · #{ticket.id.slice(0, 8)}
                    </p>
                </div>
                <span
                    className={`rounded-full border border-dashed px-3 py-1 font-mono text-[9px] uppercase tracking-widest ${sc}`}
                >
                    {st}
                </span>
            </div>

            {/* Client component with all interactive features */}
            <AdminTicketDetail
                ticket={{
                    id: ticket.id,
                    user_id: ticket.user_id,
                    guest_email: ticket.guest_email,
                    guest_name: ticket.guest_name,
                    subject: ticket.subject,
                    category: ticket.category,
                    status: ticket.status,
                    priority: ticket.priority,
                    admin_note: ticket.admin_note,
                    created_at: ticket.created_at,
                    resolved_at: ticket.resolved_at,
                }}
                messages={(messages ?? []).map((m) => ({
                    id: m.id,
                    sender_type: m.sender_type,
                    sender_id: m.sender_id,
                    content: m.content,
                    is_internal: m.is_internal,
                    created_at: m.created_at,
                }))}
                userEmail={userEmail}
            />
        </div>
    );
}
