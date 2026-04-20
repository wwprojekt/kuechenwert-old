/**
 * Schlanker E-Mail-Wrapper.
 * - Wenn RESEND_API_KEY gesetzt: HTTPS-POST an Resend-API (kein npm-Dep noetig).
 * - Sonst: console.log (Dev-Fallback).
 */

export interface SendMailParams {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  bcc?: string | string[];
  attachments?: Array<{
    filename: string;
    /** base64-encoded content */
    content: string;
    contentType?: string;
  }>;
  /** Optional override; falls leer wird EMAIL_FROM env verwendet */
  from?: string;
}

export interface SendMailResult {
  ok: boolean;
  id?: string;
  error?: string;
  delivered: "resend" | "console";
}

const FROM_DEFAULT = process.env.EMAIL_FROM || "KüchenWert <noreply@kuechenwert.de>";

export async function sendMail(params: SendMailParams): Promise<SendMailResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = params.from || FROM_DEFAULT;
  const to = Array.isArray(params.to) ? params.to : [params.to];
  const bccEnv = process.env.EMAIL_BCC_BUCHHALTUNG?.trim();
  const bccList = [
    ...(Array.isArray(params.bcc) ? params.bcc : params.bcc ? [params.bcc] : []),
    ...(bccEnv ? [bccEnv] : []),
  ];

  if (!apiKey) {
    console.log("[email:dev] →", { from, to, subject: params.subject, bcc: bccList });
    console.log(params.text ?? params.html.replace(/<[^>]+>/g, ""));
    return { ok: true, delivered: "console" };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to,
        bcc: bccList.length > 0 ? bccList : undefined,
        subject: params.subject,
        html: params.html,
        text: params.text,
        attachments: params.attachments,
      }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      console.error("[email] Resend failed:", res.status, json);
      return { ok: false, delivered: "resend", error: (json as { message?: string }).message ?? `HTTP ${res.status}` };
    }
    return { ok: true, delivered: "resend", id: (json as { id?: string }).id };
  } catch (err) {
    console.error("[email] network error:", err);
    return { ok: false, delivered: "resend", error: (err as Error).message };
  }
}

/** HTML-escape Helper */
export function esc(s: string | null | undefined): string {
  return String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
