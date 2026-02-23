import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

/**
 * API Route pour création ticket visiteur — US-1301
 * POST /api/support
 * Body: FormData { name, email, subject, category, message, website (honeypot) }
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // Honeypot
    if (formData.get("website")) {
      return NextResponse.json({ ok: true }); // Silent reject
    }

    const name = (formData.get("name") as string)?.trim();
    const email = (formData.get("email") as string)?.trim();
    const subject = (formData.get("subject") as string)?.trim();
    const category = (formData.get("category") as string) || "general";
    const message = (formData.get("message") as string)?.trim();

    // Validation
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: "Tous les champs requis doivent être remplis." },
        { status: 400 },
      );
    }

    if (message.length < 10) {
      return NextResponse.json(
        { error: "Le message doit faire au moins 10 caractères." },
        { status: 400 },
      );
    }

    // Email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Format email invalide." },
        { status: 400 },
      );
    }

    const validCategories = ["inscription", "general", "autre"];
    const cat = validCategories.includes(category) ? category : "general";

    const admin = createAdminClient();

    // Rate limit: max 3 tickets per email per 24h
    const twentyFourHoursAgo = new Date(
      Date.now() - 24 * 60 * 60 * 1000,
    ).toISOString();
    const { count } = await admin
      .from("support_tickets")
      .select("*", { count: "exact", head: true })
      .eq("guest_email", email)
      .gte("created_at", twentyFourHoursAgo);

    if ((count ?? 0) >= 3) {
      return NextResponse.json(
        {
          error:
            "Vous avez atteint la limite de 3 demandes par 24h. Réessayez plus tard.",
        },
        { status: 429 },
      );
    }

    // Create ticket
    const { data: ticket, error: ticketError } = await admin
      .from("support_tickets")
      .insert({
        user_id: null,
        guest_email: email,
        guest_name: name,
        subject,
        category: cat as "general" | "inscription" | "autre",
      })
      .select("id")
      .single();

    if (ticketError || !ticket) {
      console.error("[support-api] Ticket creation failed:", ticketError);
      return NextResponse.json(
        { error: "Erreur lors de la création du ticket." },
        { status: 500 },
      );
    }

    // Create first message
    await admin.from("support_messages").insert({
      ticket_id: ticket.id,
      sender_type: "guest",
      sender_id: null,
      content: message,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[support-api] Error:", error);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
