import crypto from "crypto";
import { getSiteUrlPretty } from "@/lib/site-url";

/**
 * HMAC-Secret für signierte Rechnungs-Druck-URLs.
 *
 * SECURITY: In Production muss INVOICE_SIGN_SECRET gesetzt sein.
 * Sonst wäre der Token vorhersagbar und jeder könnte fremde Rechnungen
 * via /invoice/[id]/[token] einsehen.
 *
 * Im Dev-Modus erlauben wir einen Fallback, aber loggen eine Warnung.
 */
let _secret: string | null = null;

function getSecret(): string {
  if (_secret) return _secret;
  const secret = process.env.INVOICE_SIGN_SECRET?.trim();
  if (secret && secret.length >= 16) {
    _secret = secret;
    return _secret;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "FATAL: INVOICE_SIGN_SECRET fehlt oder ist zu kurz (<16 Zeichen) in Production. " +
        "Rechnungs-Token wären vorhersagbar — DSGVO-Risiko.",
    );
  }

  console.warn(
    "[invoice-token] INVOICE_SIGN_SECRET fehlt – Dev-Fallback aktiv. " +
      "In Production würde dies hart fehlschlagen.",
  );
  _secret = "dev-fallback-not-for-prod";
  return _secret;
}

/** Erzeugt einen kurzen, signierten Token fuer eine Rechnung. */
export function signInvoiceToken(invoiceId: string): string {
  return crypto
    .createHmac("sha256", getSecret())
    .update(invoiceId)
    .digest("hex")
    .slice(0, 32);
}

export function verifyInvoiceToken(invoiceId: string, token: string): boolean {
  const expected = signInvoiceToken(invoiceId);
  if (expected.length !== token.length) return false;
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(token));
}

export function invoicePublicUrl(invoiceId: string, baseUrl?: string): string {
  // Pretty-URL (mit Umlaut) — Empfänger sehen `https://küchenwert.de/invoice/...`
  // in Mails, Rechnungs-PDFs und der Admin-UI.
  const base = baseUrl ?? getSiteUrlPretty();
  return `${base}/invoice/${invoiceId}/${signInvoiceToken(invoiceId)}`;
}
