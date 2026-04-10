"use server";

import { api } from "@/lib/api-server";

export interface Testimonial {
  id: string;
  user_id: number;
  content: string;
  rating: number;
  status: "pending" | "approved" | "rejected";
  display_name: string | null;
  display_role: string | null;
  featured: boolean;
  created_at: string;
}

export async function getApprovedTestimonials(): Promise<Testimonial[]> {
  try {
    const data = await api.get<{ data: Testimonial[] }>("/testimonials");
    return data.data;
  } catch {
    return [];
  }
}

export async function submitTestimonialAction(_prev: unknown, formData: FormData) {
  const content = formData.get("content") as string;
  const rating = Number(formData.get("rating"));
  const display_name = formData.get("display_name") as string;
  const display_role = formData.get("display_role") as string;

  if (!content || content.length < 10) return { error: "Le témoignage doit contenir au moins 10 caractères." };
  if (!rating || rating < 1 || rating > 5) return { error: "Note invalide." };

  try {
    await api.post("/testimonials", { content, rating, display_name, display_role });
    return { success: "Merci pour ton témoignage ! Il sera visible après modération." };
  } catch (err: unknown) {
    const e = err as { status?: number; message?: string };
    if (e.status === 422) return { error: "Tu as déjà soumis un témoignage." };
    return { error: e.message ?? "Erreur lors de l'envoi." };
  }
}

// ============================================================
// Admin testimonial actions (also usable from admin pages)
// ============================================================
export async function approveTestimonialAction(
  id: string,
  status: "approved" | "rejected",
  adminNote?: string,
): Promise<{ error?: string }> {
  try {
    await (await import("@/lib/api-server")).api.patch(`/v1/admin/testimonials/${id}`, { status, admin_note: adminNote });
    return {};
  } catch (err: unknown) {
    return { error: (err as Error).message };
  }
}

export async function rejectTestimonialAction(id: string, reason?: string): Promise<{ error?: string }> {
  return approveTestimonialAction(id, "rejected", reason);
}

export async function toggleFeaturedAction(id: string, featured: boolean): Promise<{ error?: string }> {
  try {
    await (await import("@/lib/api-server")).api.patch(`/v1/admin/testimonials/${id}`, { is_featured: featured });
    return {};
  } catch (err: unknown) {
    return { error: (err as Error).message };
  }
}

export async function deleteTestimonialAction(id: string): Promise<{ error?: string }> {
  try {
    await (await import("@/lib/api-server")).api.delete(`/v1/admin/testimonials/${id}`);
    return {};
  } catch (err: unknown) {
    return { error: (err as Error).message };
  }
}
