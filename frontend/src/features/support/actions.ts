"use server";

import { api } from "@/lib/api-server";
import { revalidatePath } from "next/cache";

type ActionState = { error?: string; success?: string };

export async function submitSupportAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const subject = formData.get("subject") as string;
  const category = formData.get("category") as string;
  const message = formData.get("message") as string;
  const guest_email = formData.get("email") as string;
  const guest_name = formData.get("name") as string;

  if (!subject || !category || !message)
    return { error: "Tous les champs sont requis." };

  try {
    await api.post("/support", {
      subject,
      category,
      message,
      guest_email,
      guest_name,
    });
    return {
      success: "Ton message a bien été envoyé. Nous te répondrons sous 24h.",
    };
  } catch (err: unknown) {
    return { error: (err as Error).message ?? "Erreur lors de l'envoi." };
  }
}

export async function createUserTicketAction(
  formData: FormData,
): Promise<ActionState> {
  const subject = formData.get("subject") as string;
  const category = formData.get("category") as string;
  const message = formData.get("message") as string;

  if (!subject || !category || !message)
    return { error: "Tous les champs sont requis." };

  try {
    await api.post("/v1/support/tickets", { subject, category, message });
    revalidatePath("/dashboard/support");
    return { success: "Ticket créé ! Nous vous répondrons sous 24-48h." };
  } catch (err: unknown) {
    return { error: (err as Error).message ?? "Erreur lors de la création." };
  }
}

export async function replyToTicketAction(formData: FormData): Promise<void> {
  const ticketId = formData.get("ticketId") as string;
  const message = formData.get("message") as string;

  if (!ticketId || !message) return;

  try {
    await api.post(`/v1/support/tickets/${ticketId}/messages`, { message });
    revalidatePath("/dashboard/support");
  } catch {
    // silent fail — client will retry
  }
}

export async function closeTicketAction(formData: FormData): Promise<void> {
  const ticketId = formData.get("ticketId") as string;
  if (!ticketId) return;

  try {
    await api.patch(`/v1/support/tickets/${ticketId}/status`, {
      status: "resolved",
    });
    revalidatePath("/dashboard/support");
  } catch {
    // silent fail
  }
}

// ============================================================
// Admin support actions
// ============================================================

export async function adminReplyAction(
  ticketId: string,
  message: string,
  isInternal = false,
): Promise<ActionState> {
  try {
    await api.post(`/v1/admin/support/${ticketId}/messages`, {
      message,
      is_internal: isInternal,
    });
    revalidatePath("/admin/support");
    return { success: "Réponse envoyée." };
  } catch (err: unknown) {
    return { error: (err as Error).message };
  }
}

export async function updateTicketStatusAction(
  ticketId: string,
  status: string,
): Promise<ActionState> {
  try {
    await api.patch(`/v1/admin/support/${ticketId}`, { status });
    revalidatePath("/admin/support");
    return { success: "Statut mis à jour." };
  } catch (err: unknown) {
    return { error: (err as Error).message };
  }
}

export async function updateTicketPriorityAction(
  ticketId: string,
  priority: string,
): Promise<ActionState> {
  try {
    await api.patch(`/v1/admin/support/${ticketId}`, { priority });
    revalidatePath("/admin/support");
    return { success: "Priorité mise à jour." };
  } catch (err: unknown) {
    return { error: (err as Error).message };
  }
}

export async function updateTicketNoteAction(
  ticketId: string,
  adminNote: string,
): Promise<ActionState> {
  try {
    await api.patch(`/v1/admin/support/${ticketId}`, { admin_note: adminNote });
    revalidatePath("/admin/support");
    return { success: "Note sauvegardée." };
  } catch (err: unknown) {
    return { error: (err as Error).message };
  }
}
