import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL =
  process.env.SUPPORT_FROM_EMAIL || "Blooprint Support <support@blooprint.fr>";

/**
 * Envoie un email de réponse support au demandeur.
 * Retourne { success: true } ou { success: false, error: string }.
 */
export async function sendSupportReplyEmail({
  to,
  ticketSubject,
  adminMessage,
  ticketUrl,
}: {
  to: string;
  ticketSubject: string;
  adminMessage: string;
  ticketUrl?: string;
}) {
  try {
    const htmlBody = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #09090b; color: #fafafa; padding: 32px; border-radius: 12px;">
        <div style="border-bottom: 1px dashed #27272a; padding-bottom: 16px; margin-bottom: 24px;">
          <span style="color: #38bdf8; font-weight: bold; font-size: 16px;">B</span><span style="color: #fafafa; font-weight: bold;">looprint</span>
          <span style="color: #71717a; font-size: 10px; text-transform: uppercase; letter-spacing: 2px; margin-left: 8px;">SUPPORT</span>
        </div>
        
        <p style="color: #a1a1aa; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">
          Re: ${ticketSubject}
        </p>
        
        <div style="background: #18181b; border: 1px dashed #27272a; border-radius: 8px; padding: 20px; margin: 16px 0; white-space: pre-wrap; font-size: 14px; line-height: 1.6; color: #e4e4e7;">
${adminMessage}
        </div>

        ${
          ticketUrl
            ? `<p style="margin-top: 24px;"><a href="${ticketUrl}" style="color: #38bdf8; font-size: 13px;">Voir mon ticket sur Blooprint →</a></p>`
            : `<p style="color: #71717a; font-size: 12px; margin-top: 24px;">Vous pouvez répondre directement à cet email.</p>`
        }
        
        <div style="border-top: 1px dashed #27272a; padding-top: 16px; margin-top: 32px;">
          <p style="color: #52525b; font-size: 11px;">
            Blooprint — Le builder de portfolios pour créateurs UGC<br/>
            <a href="https://blooprint.fr" style="color: #52525b;">blooprint.fr</a>
          </p>
        </div>
      </div>
    `;

    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Re: ${ticketSubject} — Blooprint Support`,
      html: htmlBody,
      replyTo: "support@blooprint.fr",
    });

    return { success: true as const };
  } catch (error) {
    console.error("[support-email] Failed to send:", error);
    return {
      success: false as const,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
