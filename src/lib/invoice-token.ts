import crypto from "crypto";

const SECRET = (process.env.INVOICE_SIGN_SECRET || "dev-fallback-not-for-prod").toString();

/** Erzeugt einen kurzen, signierten Token fuer eine Rechnung. */
export function signInvoiceToken(invoiceId: string): string {
  return crypto.createHmac("sha256", SECRET).update(invoiceId).digest("hex").slice(0, 32);
}

export function verifyInvoiceToken(invoiceId: string, token: string): boolean {
  const expected = signInvoiceToken(invoiceId);
  if (expected.length !== token.length) return false;
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(token));
}

export function invoicePublicUrl(invoiceId: string, baseUrl?: string): string {
  const base = baseUrl ?? process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return `${base}/invoice/${invoiceId}/${signInvoiceToken(invoiceId)}`;
}
