import { supabaseAdmin, audit } from "@/lib/supabase/admin";
import { sendMail, esc } from "@/lib/email";
import { COMPANY, PAYMENT_TERMS_DAYS, DUNNING_LEVELS } from "@/config/company";
import { invoicePublicUrl } from "@/lib/invoice-token";

export type InvoiceType =
  | "lead_purchase"
  | "cpa_commission"
  | "wallet_topup"
  | "penalty"
  | "subscription";

export interface InvoiceLineInput {
  description: string;
  quantity?: number;
  /** Einzelpreis NETTO in Cent */
  unit_price_cents: number;
}

export interface CreateInvoiceInput {
  dealerId: string;
  type: InvoiceType;
  lines: InvoiceLineInput[];
  /** Brutto-Betrag aus Wallet-Buchung etc. → Wenn gesetzt, wird `lines` daraus berechnet */
  reference_type?: "lead" | "auction" | "bid" | "wallet" | "manual";
  reference_id?: string | null;
  related_payment_id?: string | null;
  /** Standard 19 % */
  vat_rate?: number;
  /** Wenn true: status='paid' und paid_at=now() (z. B. Lead-Kauf via Wallet) */
  mark_paid_immediately?: boolean;
  payment_method?: "wallet_balance" | "stripe" | "bank_transfer" | "sepa" | "manual";
  /** Tage bis Faelligkeit (default 14) */
  due_in_days?: number;
  notes?: string | null;
  /** Wenn true: Rechnungs-Mail wird sofort versendet */
  send_email?: boolean;
}

export interface InvoiceResult {
  id: string;
  invoice_number: string;
  gross_amount_cents: number;
  status: string;
}

export async function createInvoice(input: CreateInvoiceInput): Promise<InvoiceResult> {
  // Dealer-Daten laden (Snapshot fuer Rechnung)
  const { data: dealer, error: dErr } = await supabaseAdmin
    .from("dealers")
    .select("id, company_name, address, postal_code, city, email")
    .eq("id", input.dealerId)
    .single();
  if (dErr || !dealer) {
    throw new Error(`Dealer ${input.dealerId} not found: ${dErr?.message}`);
  }

  const vatRate = input.vat_rate ?? 19.0;

  // Summen berechnen
  let netCents = 0;
  const itemsToInsert: Array<{
    position: number;
    description: string;
    quantity: number;
    unit_price_cents: number;
    net_total_cents: number;
  }> = [];
  input.lines.forEach((l, i) => {
    const qty = l.quantity ?? 1;
    const lineNet = Math.round(qty * l.unit_price_cents);
    netCents += lineNet;
    itemsToInsert.push({
      position: i + 1,
      description: l.description,
      quantity: qty,
      unit_price_cents: l.unit_price_cents,
      net_total_cents: lineNet,
    });
  });

  const vatCents = Math.round((netCents * vatRate) / 100);
  const grossCents = netCents + vatCents;

  // Rechnungsnummer via DB-Funktion
  const { data: numData, error: numErr } = await supabaseAdmin.rpc("generate_invoice_number");
  if (numErr || !numData) {
    throw new Error(`Invoice number generation failed: ${numErr?.message}`);
  }
  const invoiceNumber = String(numData);

  const dueDays = input.due_in_days ?? PAYMENT_TERMS_DAYS;
  const issuedAt = new Date();
  const dueAt = input.mark_paid_immediately
    ? issuedAt
    : new Date(issuedAt.getTime() + dueDays * 24 * 60 * 60 * 1000);

  const { data: invoice, error: iErr } = await supabaseAdmin
    .from("invoices")
    .insert({
      invoice_number: invoiceNumber,
      dealer_id: dealer.id,
      type: input.type,
      status: input.mark_paid_immediately ? "paid" : "open",
      reference_type: input.reference_type ?? null,
      reference_id: input.reference_id ?? null,
      related_payment_id: input.related_payment_id ?? null,
      net_amount_cents: netCents,
      vat_rate: vatRate,
      vat_amount_cents: vatCents,
      gross_amount_cents: grossCents,
      currency: "eur",
      issued_at: issuedAt.toISOString(),
      due_at: dueAt.toISOString(),
      paid_at: input.mark_paid_immediately ? issuedAt.toISOString() : null,
      payment_method: input.payment_method ?? null,
      recipient_company: dealer.company_name,
      recipient_address: dealer.address,
      recipient_postal_code: dealer.postal_code,
      recipient_city: dealer.city,
      recipient_email: dealer.email,
      notes: input.notes ?? null,
    })
    .select("id, invoice_number, gross_amount_cents, status")
    .single();
  if (iErr || !invoice) {
    throw new Error(`Invoice insert failed: ${iErr?.message}`);
  }

  // Items
  const itemsRows = itemsToInsert.map((it) => ({ ...it, invoice_id: invoice.id }));
  const { error: itErr } = await supabaseAdmin.from("invoice_items").insert(itemsRows);
  if (itErr) {
    console.error("invoice items insert failed:", itErr);
  }

  await audit(null, "invoice.create", "invoice", invoice.id, {
    invoiceNumber,
    type: input.type,
    grossCents,
    dealerId: dealer.id,
  });

  if (input.send_email !== false) {
    await sendInvoiceEmail(invoice.id);
  }

  return invoice;
}

// =====================================================
// EMAIL-VERSAND (initial)
// =====================================================
export async function sendInvoiceEmail(invoiceId: string) {
  const { data: inv, error } = await supabaseAdmin
    .from("invoices")
    .select("*, invoice_items(*)")
    .eq("id", invoiceId)
    .single();
  if (error || !inv) throw new Error(`invoice ${invoiceId} not found`);

  const link = invoicePublicUrl(invoiceId);
  const html = renderInvoiceEmailHtml(inv as InvoiceWithItems, link);
  const subject =
    inv.status === "paid"
      ? `Zahlungsbestätigung & Rechnung ${inv.invoice_number}`
      : `Rechnung ${inv.invoice_number} – ${(inv.gross_amount_cents / 100).toFixed(2)} € fällig bis ${formatDate(inv.due_at)}`;

  const result = await sendMail({
    to: inv.recipient_email,
    subject,
    html,
  });

  if (result.ok) {
    await supabaseAdmin
      .from("invoices")
      .update({ email_sent: true, email_sent_at: new Date().toISOString() })
      .eq("id", invoiceId);
  }
  return result;
}

// =====================================================
// MAHNWESEN
// =====================================================
export async function sendDunningEmail(invoiceId: string, level: 1 | 2 | 3 | 4 | 5, triggeredBy: "cron" | "admin" = "cron") {
  const cfg = DUNNING_LEVELS.find((d) => d.level === level);
  if (!cfg) throw new Error("invalid dunning level");

  const { data: inv } = await supabaseAdmin
    .from("invoices")
    .select("*, invoice_items(*)")
    .eq("id", invoiceId)
    .single();
  if (!inv) throw new Error(`invoice ${invoiceId} not found`);

  // Mahngebuehr addieren
  const newDunningFee = inv.dunning_fee_cents + cfg.fee_cents;
  const newGross = inv.gross_amount_cents + cfg.fee_cents; // Mahngebuehr kommt on top, ohne USt fuer 5 EUR Pauschalen

  await supabaseAdmin
    .from("invoices")
    .update({
      dunning_level: level,
      dunning_last_sent_at: new Date().toISOString(),
      dunning_fee_cents: newDunningFee,
      gross_amount_cents: newGross,
      status: level >= 5 ? "in_collection" : "overdue",
    })
    .eq("id", invoiceId);

  // Bei Stufe 5: Dealer sperren (is_active=false)
  if (level >= 5) {
    await supabaseAdmin
      .from("dealers")
      .update({ is_active: false })
      .eq("id", inv.dealer_id);
    await audit(null, "dealer.suspend.collection", "dealer", inv.dealer_id, { invoiceId });
  }

  await supabaseAdmin.from("dunning_logs").insert({
    invoice_id: invoiceId,
    level,
    fee_added_cents: cfg.fee_cents,
    triggered_by: triggeredBy,
  });

  // Mail
  const link = invoicePublicUrl(invoiceId);
  const html = renderDunningEmailHtml(inv as InvoiceWithItems, level, cfg.label, cfg.fee_cents, newGross, link);
  const subject = `${cfg.label}: Rechnung ${inv.invoice_number} – ${(newGross / 100).toFixed(2)} € überfällig`;

  const result = await sendMail({ to: inv.recipient_email, subject, html });
  await supabaseAdmin
    .from("dunning_logs")
    .update({ email_sent: result.ok, email_sent_at: new Date().toISOString() })
    .eq("invoice_id", invoiceId)
    .eq("level", level);

  await audit(null, "invoice.dunning", "invoice", invoiceId, {
    level,
    feeCents: cfg.fee_cents,
    newGrossCents: newGross,
    triggeredBy,
  });

  return result;
}

// =====================================================
// HTML TEMPLATES
// =====================================================
interface InvoiceItemRow {
  position: number;
  description: string;
  quantity: number;
  unit_price_cents: number;
  net_total_cents: number;
}
interface InvoiceWithItems {
  id: string;
  invoice_number: string;
  type: string;
  status: string;
  net_amount_cents: number;
  vat_rate: number;
  vat_amount_cents: number;
  gross_amount_cents: number;
  currency: string;
  issued_at: string;
  due_at: string | null;
  paid_at: string | null;
  recipient_company: string;
  recipient_address: string | null;
  recipient_postal_code: string | null;
  recipient_city: string | null;
  recipient_email: string;
  dealer_id: string;
  dunning_fee_cents: number;
  invoice_items: InvoiceItemRow[];
  notes?: string | null;
}

function fmt(cents: number) {
  return (cents / 100).toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
}
function formatDate(d: string | null) {
  if (!d) return "–";
  return new Date(d).toLocaleDateString("de-DE", { year: "numeric", month: "2-digit", day: "2-digit" });
}

const baseStyle = `
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  color:#0f172a; background:#f8fafc; padding:24px;
`;

export function renderInvoiceEmailHtml(inv: InvoiceWithItems, link: string): string {
  const isPaid = inv.status === "paid";
  return `<!doctype html>
<html><body style="${baseStyle}">
  <div style="max-width:640px;margin:0 auto;background:#fff;border-radius:12px;border:1px solid #e2e8f0;padding:32px">
    <h1 style="margin:0 0 8px;font-size:22px">${esc(COMPANY.name)}</h1>
    <p style="color:#64748b;margin:0 0 24px">${esc(COMPANY.address)} · ${esc(COMPANY.postal_code)} ${esc(COMPANY.city)}</p>

    <h2 style="margin:0 0 12px;font-size:18px">${isPaid ? "Zahlungsbestätigung &amp; Rechnung" : "Rechnung"} ${esc(inv.invoice_number)}</h2>
    <p style="margin:0 0 16px;color:#475569">
      Sehr geehrte Damen und Herren,<br><br>
      ${
        isPaid
          ? `vielen Dank für Ihre Zahlung. Anbei die Rechnung in Höhe von <strong>${fmt(inv.gross_amount_cents)}</strong> zu Ihrer Buchhaltung.`
          : `anbei erhalten Sie unsere Rechnung in Höhe von <strong>${fmt(inv.gross_amount_cents)}</strong>, fällig bis <strong>${formatDate(inv.due_at)}</strong>.`
      }
    </p>

    <table style="width:100%;border-collapse:collapse;margin:16px 0">
      <thead>
        <tr style="background:#f1f5f9;text-align:left">
          <th style="padding:8px;font-size:12px;color:#475569">Pos.</th>
          <th style="padding:8px;font-size:12px;color:#475569">Beschreibung</th>
          <th style="padding:8px;font-size:12px;color:#475569;text-align:right">Menge</th>
          <th style="padding:8px;font-size:12px;color:#475569;text-align:right">Einzel</th>
          <th style="padding:8px;font-size:12px;color:#475569;text-align:right">Netto</th>
        </tr>
      </thead>
      <tbody>
        ${inv.invoice_items
          .sort((a, b) => a.position - b.position)
          .map(
            (it) => `<tr style="border-bottom:1px solid #e2e8f0">
              <td style="padding:8px;font-size:13px">${it.position}</td>
              <td style="padding:8px;font-size:13px">${esc(it.description)}</td>
              <td style="padding:8px;font-size:13px;text-align:right">${it.quantity}</td>
              <td style="padding:8px;font-size:13px;text-align:right">${fmt(it.unit_price_cents)}</td>
              <td style="padding:8px;font-size:13px;text-align:right">${fmt(it.net_total_cents)}</td>
            </tr>`,
          )
          .join("")}
      </tbody>
    </table>

    <table style="width:100%;margin-top:8px">
      <tr><td style="padding:4px;font-size:13px;text-align:right;color:#475569">Netto</td><td style="padding:4px;font-size:13px;text-align:right;width:120px">${fmt(inv.net_amount_cents)}</td></tr>
      <tr><td style="padding:4px;font-size:13px;text-align:right;color:#475569">USt. ${inv.vat_rate}&nbsp;%</td><td style="padding:4px;font-size:13px;text-align:right">${fmt(inv.vat_amount_cents)}</td></tr>
      ${inv.dunning_fee_cents > 0 ? `<tr><td style="padding:4px;font-size:13px;text-align:right;color:#b91c1c">Mahngebühren</td><td style="padding:4px;font-size:13px;text-align:right;color:#b91c1c">${fmt(inv.dunning_fee_cents)}</td></tr>` : ""}
      <tr><td style="padding:8px;font-size:15px;text-align:right;font-weight:bold">Gesamt</td><td style="padding:8px;font-size:15px;text-align:right;font-weight:bold">${fmt(inv.gross_amount_cents)}</td></tr>
    </table>

    ${
      isPaid
        ? `<p style="margin:16px 0;padding:12px;background:#dcfce7;color:#166534;border-radius:8px;font-size:13px">
             ✓ Bereits bezahlt am ${formatDate(inv.paid_at)} (Wallet-Verrechnung).
           </p>`
        : `<div style="margin:24px 0;padding:16px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px">
             <strong>Zahlungsdaten</strong><br>
             Empfänger: ${esc(COMPANY.name)}<br>
             IBAN: ${esc(COMPANY.bank_iban)}<br>
             BIC: ${esc(COMPANY.bank_bic)}<br>
             Verwendungszweck: <strong>${esc(inv.invoice_number)}</strong>
           </div>`
    }

    <p style="text-align:center;margin:24px 0">
      <a href="${esc(link)}" style="display:inline-block;background:#0f3460;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">Rechnung ansehen / drucken</a>
    </p>

    <p style="font-size:11px;color:#94a3b8;border-top:1px solid #e2e8f0;padding-top:16px;margin-top:24px">
      ${esc(COMPANY.name)} · ${esc(COMPANY.address)} · ${esc(COMPANY.postal_code)} ${esc(COMPANY.city)}<br>
      USt-IdNr.: ${esc(COMPANY.vat_id)} ${COMPANY.register ? "· " + esc(COMPANY.register) : ""}<br>
      ${COMPANY.director ? "Geschäftsführer: " + esc(COMPANY.director) : ""}
    </p>
  </div>
</body></html>`;
}

export function renderDunningEmailHtml(
  inv: InvoiceWithItems,
  level: number,
  label: string,
  feeAddedCents: number,
  newGrossCents: number,
  link: string,
): string {
  const overdueDays = inv.due_at ? Math.floor((Date.now() - new Date(inv.due_at).getTime()) / 86400000) : 0;
  const isCollection = level >= 5;

  return `<!doctype html>
<html><body style="${baseStyle}">
  <div style="max-width:640px;margin:0 auto;background:#fff;border-radius:12px;border:1px solid #e2e8f0;padding:32px">
    <h1 style="margin:0 0 8px;font-size:22px;color:#b91c1c">${esc(label)}</h1>
    <p style="color:#64748b;margin:0 0 24px">Rechnung ${esc(inv.invoice_number)}</p>

    <p style="margin:0 0 16px">
      Sehr geehrte Damen und Herren,<br><br>
      unsere o. g. Rechnung in Höhe von <strong>${fmt(inv.gross_amount_cents - feeAddedCents)}</strong> ist seit
      <strong>${overdueDays} Tagen</strong> überfällig (Fälligkeit: ${formatDate(inv.due_at)}).
      ${
        isCollection
          ? "Da auch unsere bisherigen Mahnungen erfolglos blieben, geben wir die Forderung nun an unser Inkassobüro ab. Ihr Händler-Account wurde mit sofortiger Wirkung gesperrt."
          : level === 4
            ? "Bei weiterer Nichtzahlung sehen wir uns gezwungen, Ihren Account zu sperren und die Forderung an ein Inkassobüro abzutreten. Wir bitten Sie dringend um Begleichung innerhalb von <strong>7 Tagen</strong>."
            : level >= 2
              ? `Wir bitten Sie um Begleichung der offenen Forderung inkl. Mahngebühr in Höhe von <strong>${fmt(feeAddedCents)}</strong> binnen <strong>7 Tagen</strong>.`
              : "Möglicherweise haben Sie unsere Rechnung übersehen. Bitte begleichen Sie den offenen Betrag binnen <strong>7 Tagen</strong>."
      }
    </p>

    <table style="width:100%;margin:16px 0;border:1px solid #e2e8f0;border-radius:8px;background:#fef2f2">
      <tr><td style="padding:8px 12px;font-size:13px;color:#475569">Rechnungsbetrag (urspr.)</td><td style="padding:8px 12px;font-size:13px;text-align:right">${fmt(inv.gross_amount_cents - inv.dunning_fee_cents)}</td></tr>
      ${inv.dunning_fee_cents - feeAddedCents > 0 ? `<tr><td style="padding:8px 12px;font-size:13px;color:#475569">Bisherige Mahngebühren</td><td style="padding:8px 12px;font-size:13px;text-align:right">${fmt(inv.dunning_fee_cents - feeAddedCents)}</td></tr>` : ""}
      ${feeAddedCents > 0 ? `<tr><td style="padding:8px 12px;font-size:13px;color:#b91c1c">Mahngebühr ${label}</td><td style="padding:8px 12px;font-size:13px;text-align:right;color:#b91c1c">${fmt(feeAddedCents)}</td></tr>` : ""}
      <tr style="border-top:2px solid #fca5a5"><td style="padding:12px;font-weight:bold">Gesamt offen</td><td style="padding:12px;font-weight:bold;text-align:right">${fmt(newGrossCents)}</td></tr>
    </table>

    <div style="margin:24px 0;padding:16px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px">
      <strong>Zahlungsdaten</strong><br>
      Empfänger: ${esc(COMPANY.name)}<br>
      IBAN: ${esc(COMPANY.bank_iban)}<br>
      BIC: ${esc(COMPANY.bank_bic)}<br>
      Verwendungszweck: <strong>${esc(inv.invoice_number)}</strong>
    </div>

    <p style="text-align:center;margin:24px 0">
      <a href="${esc(link)}" style="display:inline-block;background:#0f3460;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">Rechnung &amp; Mahnung ansehen</a>
    </p>

    <p style="font-size:11px;color:#94a3b8;border-top:1px solid #e2e8f0;padding-top:16px;margin-top:24px">
      ${esc(COMPANY.name)} · USt-IdNr.: ${esc(COMPANY.vat_id)}
    </p>
  </div>
</body></html>`;
}
