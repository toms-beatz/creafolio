"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { logAdminAction, requireAdmin } from "@/features/admin/actions";
import { sendSupportReplyEmail } from "@/features/support/email";

// ============================================================
// User-facing actions
// ============================================================

/**
 * US-1302 : Créer un ticket support (user connecté)
 */
export async function createUserTicketAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const subject = (formData.get("subject") as string)?.trim();
  const category = formData.get("category") as string;
  const message = (formData.get("message") as string)?.trim();

  if (!subject || !message || message.length < 10) return;

  const validCategories = ["technique", "billing", "general", "autre"];
  const cat = validCategories.includes(category) ? category : "general";

  // Rate limit: max 5 open tickets
  const { count } = await supabase
    .from("support_tickets")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .in("status", ["open", "in_progress"]);

  if ((count ?? 0) >= 5) return;

  // Create ticket
  const admin = createAdminClient();
  const { data: ticket } = await admin
    .from("support_tickets")
    .insert({
      user_id: user.id,
      subject,
      category: cat as "general" | "technique" | "billing" | "autre",
    })
    .select("id")
    .single();

  if (!ticket) return;

  // Create first message
  await admin.from("support_messages").insert({
    ticket_id: ticket.id,
    sender_type: "user",
    sender_id: user.id,
    content: message,
  });

  revalidatePath("/dashboard/support");
  redirect("/dashboard/support");
}

/**
 * US-1303 : Répondre à un ticket (user connecté)
 */
export async function replyToTicketAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const ticketId = formData.get("ticketId") as string;
  const message = (formData.get("message") as string)?.trim();

  if (!ticketId || !message || message.length < 2) return;

  // Verify ticket ownership
  const { data: ticket } = await supabase
    .from("support_tickets")
    .select("id, status")
    .eq("id", ticketId)
    .eq("user_id", user.id)
    .single();

  if (!ticket || ["closed", "resolved"].includes(ticket.status)) return;

  const admin = createAdminClient();
  await admin.from("support_messages").insert({
    ticket_id: ticketId,
    sender_type: "user",
    sender_id: user.id,
    content: message,
  });

  // Update ticket status if waiting_user
  if (ticket.status === "waiting_user") {
    await admin
      .from("support_tickets")
      .update({
        status: "open",
        updated_at: new Date().toISOString(),
      })
      .eq("id", ticketId);
  } else {
    await admin
      .from("support_tickets")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", ticketId);
  }

  revalidatePath(`/dashboard/support`);
}

/**
 * US-1303 : User marque un ticket comme résolu
 */
export async function closeTicketAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const ticketId = formData.get("ticketId") as string;

  const { data: ticket } = await supabase
    .from("support_tickets")
    .select("id")
    .eq("id", ticketId)
    .eq("user_id", user.id)
    .single();

  if (!ticket) return;

  const admin = createAdminClient();
  await admin
    .from("support_tickets")
    .update({
      status: "resolved",
      resolved_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", ticketId);

  revalidatePath("/dashboard/support");
}

// ============================================================
// Admin actions
// ============================================================

/**
 * US-1305 : Admin envoie une réponse (déclenche email)
 */
export async function adminReplyAction(formData: FormData) {
  const { userId } = await requireAdmin();
  const ticketId = formData.get("ticketId") as string;
  const message = (formData.get("message") as string)?.trim();
  const isInternal = formData.get("isInternal") === "true";

  if (!ticketId || !message) return { error: "Champs requis manquants" };

  const admin = createAdminClient();

  // Insert message
  await admin.from("support_messages").insert({
    ticket_id: ticketId,
    sender_type: "admin",
    sender_id: userId,
    content: message,
    is_internal: isInternal,
  });

  // Update ticket status to waiting_user (if not internal note)
  if (!isInternal) {
    await admin
      .from("support_tickets")
      .update({
        status: "waiting_user",
        updated_at: new Date().toISOString(),
      })
      .eq("id", ticketId);
  }

  // Send email (only for non-internal messages)
  if (!isInternal) {
    const { data: ticket } = await admin
      .from("support_tickets")
      .select("subject, user_id, guest_email")
      .eq("id", ticketId)
      .single();

    if (ticket) {
      let recipientEmail: string | null = null;
      let ticketUrl: string | undefined;

      if (ticket.user_id) {
        const { data: profile } = await admin
          .from("profiles")
          .select("email")
          .eq("id", ticket.user_id)
          .single();
        recipientEmail = profile?.email ?? null;
        ticketUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/support`;
      } else {
        recipientEmail = ticket.guest_email;
      }

      if (recipientEmail) {
        const result = await sendSupportReplyEmail({
          to: recipientEmail,
          ticketSubject: ticket.subject,
          adminMessage: message,
          ticketUrl,
        });

        if (!result.success) {
          console.error(
            `[admin-reply] Email failed for ticket ${ticketId}: ${result.error}`,
          );
        }
      }
    }
  }

  await logAdminAction(userId, "support.reply", "ticket", ticketId, {
    is_internal: isInternal,
  });

  revalidatePath(`/admin/support/${ticketId}`);
  revalidatePath("/admin/support");
  return { success: true };
}

/**
 * US-1305/1307 : Admin modifie le statut d'un ticket
 */
export async function updateTicketStatusAction(formData: FormData) {
  const { userId } = await requireAdmin();
  const ticketId = formData.get("ticketId") as string;
  const status = formData.get("status") as string;

  const validStatuses = [
    "open",
    "in_progress",
    "waiting_user",
    "resolved",
    "closed",
  ];
  if (!validStatuses.includes(status)) return { error: "Statut invalide" };

  const admin = createAdminClient();

  const { data: old } = await admin
    .from("support_tickets")
    .select("status")
    .eq("id", ticketId)
    .single();

  const updateData: Record<string, unknown> = {
    status,
    updated_at: new Date().toISOString(),
  };
  if (status === "resolved") {
    updateData.resolved_at = new Date().toISOString();
  }

  await admin
    .from("support_tickets")
    .update(
      updateData as {
        status: "open" | "in_progress" | "waiting_user" | "resolved" | "closed";
        updated_at: string;
        resolved_at?: string;
      },
    )
    .eq("id", ticketId);

  await logAdminAction(userId, "support.status_changed", "ticket", ticketId, {
    old_status: old?.status,
    new_status: status,
  });

  revalidatePath(`/admin/support/${ticketId}`);
  revalidatePath("/admin/support");
  return { success: true };
}

/**
 * US-1307 : Admin modifie la priorité d'un ticket
 */
export async function updateTicketPriorityAction(formData: FormData) {
  const { userId } = await requireAdmin();
  const ticketId = formData.get("ticketId") as string;
  const priority = formData.get("priority") as string;

  const validPriorities = ["low", "normal", "high", "urgent"];
  if (!validPriorities.includes(priority))
    return { error: "Priorité invalide" };

  const admin = createAdminClient();

  const { data: old } = await admin
    .from("support_tickets")
    .select("priority")
    .eq("id", ticketId)
    .single();

  await admin
    .from("support_tickets")
    .update({
      priority: priority as "low" | "normal" | "high" | "urgent",
      updated_at: new Date().toISOString(),
    })
    .eq("id", ticketId);

  await logAdminAction(userId, "support.priority_changed", "ticket", ticketId, {
    old_priority: old?.priority,
    new_priority: priority,
  });

  revalidatePath(`/admin/support/${ticketId}`);
  revalidatePath("/admin/support");
  return { success: true };
}

/**
 * US-1307 : Admin sauvegarde une note interne
 */
export async function updateTicketNoteAction(formData: FormData) {
  const { userId } = await requireAdmin();
  const ticketId = formData.get("ticketId") as string;
  const note = (formData.get("note") as string) ?? "";

  const admin = createAdminClient();
  await admin
    .from("support_tickets")
    .update({
      admin_note: note || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", ticketId);

  await logAdminAction(userId, "support.note_updated", "ticket", ticketId);
  revalidatePath(`/admin/support/${ticketId}`);
  return { success: true };
}
