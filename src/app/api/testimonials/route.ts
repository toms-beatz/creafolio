import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = (): any => createAdminClient();

/**
 * API Route — Testimonials
 * GET /api/testimonials — récupère les testimonials approuvés (landing)
 * POST /api/testimonials — soumettre un testimonial (auth required)
 */

export async function GET() {
  const admin = db();

  const { data, error } = await admin
    .from("testimonials")
    .select(
      "id, content, rating, display_name, display_role, featured, created_at, user_id",
    )
    .eq("status", "approved")
    .order("featured", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }

  // Fetch usernames for display
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userIds = [...new Set((data ?? []).map((t: any) => t.user_id))];
  const { data: profiles } =
    userIds.length > 0
      ? await admin.from("profiles").select("id, username").in("id", userIds)
      : { data: [] };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const usernameMap = new Map(
    (profiles ?? []).map((p: any) => [p.id, p.username]),
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const testimonials = (data ?? []).map((t: any) => ({
    id: t.id,
    content: t.content,
    rating: t.rating,
    displayName: t.display_name ?? usernameMap.get(t.user_id) ?? "Créateur UGC",
    displayRole: t.display_role,
    featured: t.featured,
  }));

  return NextResponse.json({ testimonials });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json(
      { error: "Authentification requise" },
      { status: 401 },
    );
  }

  const body = await request.json();
  const content = (body.content as string)?.trim();
  const rating = Number(body.rating) || 5;
  const displayName = (body.displayName as string)?.trim() || null;
  const displayRole = (body.displayRole as string)?.trim() || "Créateur UGC";

  // Validation
  if (!content || content.length < 10) {
    return NextResponse.json(
      { error: "Le témoignage doit faire au moins 10 caractères." },
      { status: 400 },
    );
  }

  if (content.length > 500) {
    return NextResponse.json(
      { error: "Le témoignage ne doit pas dépasser 500 caractères." },
      { status: 400 },
    );
  }

  if (rating < 1 || rating > 5) {
    return NextResponse.json(
      { error: "La note doit être entre 1 et 5." },
      { status: 400 },
    );
  }

  // Rate limit: max 1 pending testimonial per user
  const admin = db();
  const { count } = await admin
    .from("testimonials")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("status", "pending");

  if ((count ?? 0) >= 1) {
    return NextResponse.json(
      { error: "Tu as déjà un témoignage en attente de validation." },
      { status: 429 },
    );
  }

  const { error } = await admin.from("testimonials").insert({
    user_id: user.id,
    content,
    rating,
    display_name: displayName,
    display_role: displayRole,
  });

  if (error) {
    return NextResponse.json(
      { error: "Erreur lors de la soumission." },
      { status: 500 },
    );
  }

  return NextResponse.json({
    ok: true,
    message: "Merci ! Ton témoignage sera examiné.",
  });
}
