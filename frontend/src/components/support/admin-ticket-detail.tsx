"use client";

import { useActionState, useRef } from "react";
import { Lock, User, Globe, Check } from 'lucide-react';
import {
    adminReplyAction,
    updateTicketStatusAction,
    updateTicketPriorityAction,
    updateTicketNoteAction,
} from "@/features/support/actions";

const statusOptions = [
    { value: "open", label: "Ouvert" },
    { value: "in_progress", label: "En cours" },
    { value: "waiting_user", label: "Attente user" },
    { value: "resolved", label: "Résolu" },
    { value: "closed", label: "Fermé" },
];

const priorityOptions = [
    { value: "low", label: "Basse" },
    { value: "normal", label: "Normal" },
    { value: "high", label: "Haute" },
    { value: "urgent", label: "Urgent" },
];

type Message = {
    id: string;
    sender_type: string;
    sender_id: string | null;
    content: string;
    is_internal: boolean;
    created_at: string;
};

type Ticket = {
    id: string;
    user_id: string | null;
    guest_email: string | null;
    guest_name: string | null;
    subject: string;
    category: string;
    status: string;
    priority: string;
    admin_note: string | null;
    created_at: string;
    resolved_at: string | null;
};

type ActionResult = { error?: string; success?: string } | null;

/**
 * US-1305 + US-1307 : Client component for admin ticket detail
 * - Chat thread (left column)
 * - Ticket info panel (right column)  
 * - Admin reply / internal note forms
 * - Status & priority controls
 */
export function AdminTicketDetail({
    ticket,
    messages,
    userEmail,
}: {
    ticket: Ticket;
    messages: Message[];
    userEmail: string | null;
}) {
    const formRef = useRef<HTMLFormElement>(null);

    const [replyState, replyAction, replyPending] = useActionState<ActionResult, FormData>(
        async (_prev, formData) => {
            const ticketId = formData.get("ticketId") as string;
            const message = formData.get("message") as string;
            const isInternal = formData.get("isInternal") === "true";
            const result = await adminReplyAction(ticketId, message, isInternal);
            if (result && !result.error) {
                formRef.current?.reset();
            }
            return result ?? null;
        },
        null,
    );

    const [statusState, statusAction] = useActionState<ActionResult, FormData>(
        async (_prev, formData) => {
            const ticketId = formData.get("ticketId") as string;
            const status = formData.get("status") as string;
            const result = await updateTicketStatusAction(ticketId, status);
            return result ?? null;
        },
        null,
    );

    const [priorityState, priorityAction] = useActionState<ActionResult, FormData>(
        async (_prev, formData) => {
            const ticketId = formData.get("ticketId") as string;
            const priority = formData.get("priority") as string;
            const result = await updateTicketPriorityAction(ticketId, priority);
            return result ?? null;
        },
        null,
    );

    const [noteState, noteAction] = useActionState<ActionResult, FormData>(
        async (_prev, formData) => {
            const ticketId = formData.get("ticketId") as string;
            const adminNote = formData.get("admin_note") as string;
            const result = await updateTicketNoteAction(ticketId, adminNote);
            return result ?? null;
        },
        null,
    );

    const contactEmail = ticket.guest_email ?? userEmail;
    const contactName = ticket.guest_name ?? (ticket.user_id ? `User ${ticket.user_id.slice(0, 8)}` : "Inconnu");

    return (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
            {/* LEFT — Chat thread */}
            <div className="space-y-4">
                {/* Messages */}
                <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-900/30 p-4 space-y-4 max-h-[60vh] overflow-y-auto">
                    {messages.map((msg) => {
                        const isAdmin = msg.sender_type === "admin";
                        const isInternal = msg.is_internal;

                        return (
                            <div
                                key={msg.id}
                                className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}
                            >
                                <div
                                    className={`max-w-[80%] rounded-xl px-4 py-3 ${isInternal
                                        ? "bg-orange-400/10 border border-dashed border-orange-400/30"
                                        : isAdmin
                                            ? "bg-sky-400/10 border border-dashed border-sky-400/30"
                                            : "bg-zinc-800 border border-dashed border-zinc-700"
                                        }`}
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <p className="font-mono text-[9px] uppercase tracking-widest opacity-60">
                                            {isInternal
                                                ? "Note interne"
                                                : isAdmin
                                                    ? "Admin"
                                                    : msg.sender_type === "guest"
                                                        ? `${contactName}`
                                                        : `User`}
                                        </p>
                                        {isInternal && (
                                            <Lock className="h-3 w-3 text-orange-400" />
                                        )}
                                    </div>
                                    <p className="text-sm text-zinc-200 whitespace-pre-wrap">
                                        {msg.content}
                                    </p>
                                    <p className="text-[10px] text-zinc-600 mt-2">
                                        {new Date(msg.created_at).toLocaleString("fr-FR", {
                                            dateStyle: "short",
                                            timeStyle: "short",
                                        })}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Reply form */}
                {!["closed"].includes(ticket.status) && (
                    <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-900/30 p-4 space-y-3">
                        <form ref={formRef} action={replyAction}>
                            <input type="hidden" name="ticketId" value={ticket.id} />
                            <textarea
                                name="message"
                                required
                                minLength={2}
                                rows={3}
                                className="w-full rounded-lg border border-dashed border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-white placeholder-zinc-600 focus:border-orange-400/50 focus:outline-none transition-colors resize-none"
                                placeholder="Réponse au ticket (visible par l'utilisateur + envoi email)..."
                            />
                            <div className="flex items-center gap-2 mt-2">
                                <button
                                    type="submit"
                                    disabled={replyPending}
                                    className="rounded-lg bg-sky-400 px-4 py-2 text-xs font-medium text-zinc-950 hover:bg-sky-300 transition-colors disabled:opacity-50"
                                >
                                    {replyPending ? "Envoi..." : "Envoyer réponse"}
                                </button>
                                <button
                                    type="submit"
                                    name="isInternal"
                                    value="true"
                                    disabled={replyPending}
                                    className="rounded-lg bg-orange-400/10 border border-dashed border-orange-400/30 px-4 py-2 text-xs text-orange-400 hover:bg-orange-400/20 transition-colors disabled:opacity-50"
                                >
                                    Note interne
                                </button>
                            </div>
                            {replyState?.error && (
                                <p className="text-xs text-red-400 mt-2">{replyState.error}</p>
                            )}
                            {replyState?.success && (
                                <p className="text-xs text-emerald-400 mt-2 flex items-center gap-1"><Check className="h-3 w-3" /> Message envoyé</p>
                            )}
                        </form>
                    </div>
                )}
            </div>

            {/* RIGHT — Ticket info panel */}
            <div className="space-y-4">
                {/* Demandeur */}
                <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-900/30 p-4">
                    <p className="font-mono text-[9px] uppercase tracking-widest text-zinc-600 mb-3">
                        DEMANDEUR
                    </p>
                    <div className="space-y-2 text-sm">
                        <div>
                            <span className="text-zinc-500">Type:</span>{" "}
                            <span className="text-white">
                                {ticket.user_id ? <><User className="inline h-3.5 w-3.5" /> Utilisateur</> : <><Globe className="inline h-3.5 w-3.5" /> Visiteur</>}
                            </span>
                        </div>
                        <div>
                            <span className="text-zinc-500">Nom:</span>{" "}
                            <span className="text-white">{contactName}</span>
                        </div>
                        {contactEmail && (
                            <div>
                                <span className="text-zinc-500">Email:</span>{" "}
                                <span className="text-white text-xs break-all">{contactEmail}</span>
                            </div>
                        )}
                        {ticket.user_id && (
                            <div>
                                <span className="text-zinc-500">ID:</span>{" "}
                                <span className="font-mono text-[10px] text-zinc-400">
                                    {ticket.user_id}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Status */}
                <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-900/30 p-4">
                    <p className="font-mono text-[9px] uppercase tracking-widest text-zinc-600 mb-3">
                        STATUT
                    </p>
                    <form action={statusAction} className="flex gap-2">
                        <input type="hidden" name="ticketId" value={ticket.id} />
                        <select
                            name="status"
                            defaultValue={ticket.status}
                            className="flex-1 rounded-lg border border-dashed border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-orange-400/50 focus:outline-none"
                        >
                            {statusOptions.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                        <button
                            type="submit"
                            className="rounded-lg bg-orange-400/10 border border-dashed border-orange-400/30 px-3 py-2 text-xs text-orange-400 hover:bg-orange-400/20 transition-colors"
                        >
                            <Check className="h-3.5 w-3.5" />
                        </button>
                    </form>
                    {statusState?.error && (
                        <p className="text-xs text-red-400 mt-1">{statusState.error}</p>
                    )}
                </div>

                {/* Priority */}
                <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-900/30 p-4">
                    <p className="font-mono text-[9px] uppercase tracking-widest text-zinc-600 mb-3">
                        PRIORITÉ
                    </p>
                    <form action={priorityAction} className="flex gap-2">
                        <input type="hidden" name="ticketId" value={ticket.id} />
                        <select
                            name="priority"
                            defaultValue={ticket.priority}
                            className="flex-1 rounded-lg border border-dashed border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-orange-400/50 focus:outline-none"
                        >
                            {priorityOptions.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                        <button
                            type="submit"
                            className="rounded-lg bg-orange-400/10 border border-dashed border-orange-400/30 px-3 py-2 text-xs text-orange-400 hover:bg-orange-400/20 transition-colors"
                        >
                            <Check className="h-3.5 w-3.5" />
                        </button>
                    </form>
                    {priorityState?.error && (
                        <p className="text-xs text-red-400 mt-1">{priorityState.error}</p>
                    )}
                </div>

                {/* Category & dates */}
                <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-900/30 p-4">
                    <p className="font-mono text-[9px] uppercase tracking-widest text-zinc-600 mb-3">
                        DÉTAILS
                    </p>
                    <div className="space-y-2 text-sm">
                        <div>
                            <span className="text-zinc-500">Catégorie:</span>{" "}
                            <span className="text-white capitalize">{ticket.category}</span>
                        </div>
                        <div>
                            <span className="text-zinc-500">Créé:</span>{" "}
                            <span className="text-zinc-400 text-xs">
                                {new Date(ticket.created_at).toLocaleString("fr-FR")}
                            </span>
                        </div>
                        {ticket.resolved_at && (
                            <div>
                                <span className="text-zinc-500">Résolu:</span>{" "}
                                <span className="text-emerald-400 text-xs">
                                    {new Date(ticket.resolved_at).toLocaleString("fr-FR")}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Admin note */}
                <div className="rounded-xl border border-dashed border-orange-900/30 bg-orange-400/5 p-4">
                    <p className="font-mono text-[9px] uppercase tracking-widest text-orange-400/60 mb-3">
                        NOTE ADMIN
                    </p>
                    <form action={noteAction}>
                        <input type="hidden" name="ticketId" value={ticket.id} />
                        <textarea
                            name="note"
                            rows={3}
                            defaultValue={ticket.admin_note ?? ""}
                            className="w-full rounded-lg border border-dashed border-orange-900/30 bg-zinc-950 px-3 py-2 text-sm text-white placeholder-zinc-600 focus:border-orange-400/50 focus:outline-none resize-none"
                            placeholder="Notes privées sur ce ticket..."
                        />
                        <button
                            type="submit"
                            className="mt-2 rounded-lg bg-orange-400/10 border border-dashed border-orange-400/30 px-3 py-1.5 text-xs text-orange-400 hover:bg-orange-400/20 transition-colors"
                        >
                            Sauvegarder note
                        </button>
                    </form>
                    {noteState?.error && (
                        <p className="text-xs text-red-400 mt-1">{noteState.error}</p>
                    )}
                    {noteState?.success && (
                        <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1"><Check className="h-3 w-3" /> Note sauvegardée</p>
                    )}
                </div>
            </div>
        </div>
    );
}
