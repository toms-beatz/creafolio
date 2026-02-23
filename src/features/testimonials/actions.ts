"use server";

import { createAdminClient } from "@/lib/supabase/server";
import { requireAdmin, logAdminAction } from "@/features/admin/actions";
import { revalidatePath } from "next/cache";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = (): any => createAdminClient();

/**
 * Admin: approuver un testimonial.
 */
export async function approveTestimonialAction(formData: FormData) {
  const { userId } = await requireAdmin();
  const testimonialId = formData.get("testimonialId") as string;
  if (!testimonialId) return;

  const admin = db();
  await admin
    .from("testimonials")
    .update({ status: "approved" })
    .eq("id", testimonialId);

  await logAdminAction(
    userId,
    "approve_testimonial",
    "testimonial",
    testimonialId,
  );
  revalidatePath("/admin/testimonials");
  revalidatePath("/");
}

/**
 * Admin: rejeter un testimonial.
 */
export async function rejectTestimonialAction(formData: FormData) {
  const { userId } = await requireAdmin();
  const testimonialId = formData.get("testimonialId") as string;
  const adminNote = (formData.get("adminNote") as string) ?? "";
  if (!testimonialId) return;

  const admin = db();
  await admin
    .from("testimonials")
    .update({ status: "rejected", admin_note: adminNote || null })
    .eq("id", testimonialId);

  await logAdminAction(
    userId,
    "reject_testimonial",
    "testimonial",
    testimonialId,
    {
      reason: adminNote,
    },
  );
  revalidatePath("/admin/testimonials");
}

/**
 * Admin: toggle featured.
 */
export async function toggleFeaturedAction(formData: FormData) {
  const { userId } = await requireAdmin();
  const testimonialId = formData.get("testimonialId") as string;
  const featured = formData.get("featured") === "true";
  if (!testimonialId) return;

  const admin = db();
  await admin
    .from("testimonials")
    .update({ featured: !featured })
    .eq("id", testimonialId);

  await logAdminAction(
    userId,
    "toggle_featured_testimonial",
    "testimonial",
    testimonialId,
    {
      featured: !featured,
    },
  );
  revalidatePath("/admin/testimonials");
  revalidatePath("/");
}

/**
 * Admin: supprimer un testimonial.
 */
export async function deleteTestimonialAction(formData: FormData) {
  const { userId } = await requireAdmin();
  const testimonialId = formData.get("testimonialId") as string;
  if (!testimonialId) return;

  const admin = db();
  await admin.from("testimonials").delete().eq("id", testimonialId);

  await logAdminAction(
    userId,
    "delete_testimonial",
    "testimonial",
    testimonialId,
  );
  revalidatePath("/admin/testimonials");
  revalidatePath("/");
}
