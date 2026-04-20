import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { verifyInvoiceToken } from "@/lib/invoice-token";
import { COMPANY } from "@/config/company";
import { PrintButton } from "@/components/invoice/print-button";

export const dynamic = "force-dynamic";
export const metadata = { title: "Rechnung – KüchenWert" };

function fmt(cents: number) {
  return (cents / 100).toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
}
function formatDate(d: string | null | undefined) {
  if (!d) return "–";
  return new Date(d).toLocaleDateString("de-DE", { year: "numeric", month: "2-digit", day: "2-digit" });
}

export default async function InvoicePrintablePage({
  params,
}: {
  params: Promise<{ id: string; token: string }>;
}) {
  const { id, token } = await params;
  if (!verifyInvoiceToken(id, token)) notFound();

  const { data: inv } = await supabaseAdmin
    .from("invoices")
    .select("*, invoice_items(*), dunning_logs(*)")
    .eq("id", id)
    .single();
  if (!inv) notFound();

  const items = (inv.invoice_items ?? []).sort(
    (a: { position: number }, b: { position: number }) => a.position - b.position,
  );
  const dunningLogs = (inv.dunning_logs ?? []).sort(
    (a: { level: number }, b: { level: number }) => a.level - b.level,
  );

  const isPaid = inv.status === "paid";
  const isOverdue = inv.status === "overdue" || inv.status === "in_collection";

  return (
    <div className="min-h-screen bg-slate-100 py-8 print:bg-white print:py-0">
      <div className="mx-auto max-w-3xl print:max-w-none">
        {/* Toolbar – nicht drucken */}
        <div className="mb-4 flex items-center justify-between rounded-md bg-white p-3 shadow-sm print:hidden">
          <div className="text-sm">
            <strong className="text-ink">{inv.invoice_number}</strong>
            {" · "}
            <span className={isPaid ? "text-accent-700" : isOverdue ? "text-red-600" : "text-amber-600"}>
              {inv.status}
            </span>
          </div>
          <PrintButton />
        </div>

        <div className="bg-white p-12 shadow-md print:p-0 print:shadow-none">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="grid h-9 w-9 place-items-center rounded-md bg-brand-700 text-sm font-bold text-white">K</span>
                <strong className="text-lg text-ink">{COMPANY.name}</strong>
              </div>
              <p className="mt-2 text-xs text-ink-muted">
                {COMPANY.address}<br />
                {COMPANY.postal_code} {COMPANY.city}<br />
                USt-IdNr.: {COMPANY.vat_id}
              </p>
            </div>
            <div className="text-right text-xs text-ink-muted">
              {COMPANY.register && <p>{COMPANY.register}</p>}
              {COMPANY.director && <p>Geschäftsführer: {COMPANY.director}</p>}
            </div>
          </div>

          {/* Empfaenger + Meta */}
          <div className="mt-12 grid gap-8 md:grid-cols-2">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-ink-subtle">Rechnung an</p>
              <p className="mt-1 text-sm">
                <strong>{inv.recipient_company}</strong><br />
                {inv.recipient_address}<br />
                {inv.recipient_postal_code} {inv.recipient_city}
              </p>
              <p className="mt-2 text-xs text-ink-muted">{inv.recipient_email}</p>
            </div>
            <div className="text-sm">
              <Row label="Rechnungs-Nr." value={inv.invoice_number} bold />
              <Row label="Rechnungsdatum" value={formatDate(inv.issued_at)} />
              <Row label="Leistungsdatum" value={formatDate(inv.issued_at)} />
              <Row label="Fällig am" value={formatDate(inv.due_at)} />
              {isPaid && <Row label="Bezahlt am" value={formatDate(inv.paid_at)} />}
            </div>
          </div>

          {/* Title */}
          <h1 className="mt-12 text-2xl font-bold text-ink">
            {inv.type === "lead_purchase" && "Rechnung – Lead-Kauf"}
            {inv.type === "cpa_commission" && "Rechnung – Erfolgsprovision"}
            {inv.type === "wallet_topup" && "Rechnung – Wallet-Aufladung"}
            {inv.type === "penalty" && "Rechnung – Vertragsstrafe"}
            {inv.type === "subscription" && "Rechnung – Abonnement"}
          </h1>

          {/* Items */}
          <table className="mt-6 w-full text-sm">
            <thead>
              <tr className="border-b-2 border-slate-300 text-left text-xs uppercase tracking-wider text-ink-subtle">
                <th className="py-2">Pos.</th>
                <th className="py-2">Beschreibung</th>
                <th className="py-2 text-right">Menge</th>
                <th className="py-2 text-right">Einzel netto</th>
                <th className="py-2 text-right">Netto</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it: { id: string; position: number; description: string; quantity: number; unit_price_cents: number; net_total_cents: number }) => (
                <tr key={it.id} className="border-b border-slate-100">
                  <td className="py-3">{it.position}</td>
                  <td className="py-3">{it.description}</td>
                  <td className="py-3 text-right">{it.quantity}</td>
                  <td className="py-3 text-right">{fmt(it.unit_price_cents)}</td>
                  <td className="py-3 text-right">{fmt(it.net_total_cents)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Summen */}
          <div className="mt-6 ml-auto w-72 text-sm">
            <Row label="Summe netto" value={fmt(inv.net_amount_cents)} />
            <Row label={`USt. ${inv.vat_rate} %`} value={fmt(inv.vat_amount_cents)} />
            {inv.dunning_fee_cents > 0 && (
              <Row label="Mahngebühren" value={fmt(inv.dunning_fee_cents)} highlight />
            )}
            <div className="mt-2 border-t-2 border-slate-300 pt-2">
              <Row label="Gesamtbetrag" value={fmt(inv.gross_amount_cents)} bold large />
            </div>
          </div>

          {/* Status-Box */}
          <div className="mt-10">
            {isPaid ? (
              <div className="rounded-md border border-accent-300 bg-accent-50 p-4 text-sm text-accent-800">
                <strong>✓ Bereits bezahlt</strong> am {formatDate(inv.paid_at)}
                {inv.payment_method ? ` (${labelMethod(inv.payment_method)})` : ""}.
              </div>
            ) : (
              <div className="rounded-md border border-slate-200 bg-slate-50 p-4 text-sm">
                <strong>Zahlungsdaten</strong>
                <table className="mt-2 text-xs">
                  <tbody>
                    <tr><td className="pr-3 text-ink-subtle">Empfänger</td><td>{COMPANY.name}</td></tr>
                    <tr><td className="pr-3 text-ink-subtle">IBAN</td><td className="font-mono">{COMPANY.bank_iban}</td></tr>
                    <tr><td className="pr-3 text-ink-subtle">BIC</td><td className="font-mono">{COMPANY.bank_bic}</td></tr>
                    <tr><td className="pr-3 text-ink-subtle">Bank</td><td>{COMPANY.bank_name}</td></tr>
                    <tr><td className="pr-3 text-ink-subtle">Verwendungszweck</td><td className="font-mono"><strong>{inv.invoice_number}</strong></td></tr>
                  </tbody>
                </table>
                <p className="mt-3 text-xs text-ink-muted">
                  Bitte überweisen Sie den Gesamtbetrag bis spätestens <strong>{formatDate(inv.due_at)}</strong> auf das oben genannte Konto.
                </p>
              </div>
            )}
          </div>

          {/* Mahn-Historie */}
          {dunningLogs.length > 0 && (
            <div className="mt-8">
              <h3 className="text-sm font-semibold text-ink">Mahn-Historie</h3>
              <ul className="mt-2 space-y-1 text-xs text-ink-muted">
                {dunningLogs.map((d: { id: string; level: number; created_at: string; fee_added_cents: number }) => (
                  <li key={d.id}>
                    Stufe {d.level} am {formatDate(d.created_at)}
                    {d.fee_added_cents > 0 && ` · Mahngebühr +${fmt(d.fee_added_cents)}`}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {inv.notes && (
            <div className="mt-8 rounded-md bg-slate-50 p-4 text-xs text-ink-muted">
              <strong className="text-ink">Notizen:</strong> {inv.notes}
            </div>
          )}

          {/* Footer */}
          <div className="mt-16 border-t border-slate-200 pt-4 text-[10px] text-ink-subtle">
            {COMPANY.name} · {COMPANY.address} · {COMPANY.postal_code} {COMPANY.city} ·
            USt-IdNr.: {COMPANY.vat_id}{COMPANY.register ? ` · ${COMPANY.register}` : ""}
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  bold,
  highlight,
  large,
}: {
  label: string;
  value: string;
  bold?: boolean;
  highlight?: boolean;
  large?: boolean;
}) {
  return (
    <div className={`flex items-baseline justify-between gap-3 ${bold ? "font-semibold" : ""} ${large ? "text-base" : ""}`}>
      <span className={`text-ink-subtle text-[10px] uppercase tracking-wider ${highlight ? "text-red-700" : ""}`}>{label}</span>
      <span className={`tabular-nums ${highlight ? "text-red-700" : "text-ink"}`}>{value}</span>
    </div>
  );
}

function labelMethod(m: string) {
  switch (m) {
    case "wallet_balance": return "Wallet-Verrechnung";
    case "stripe": return "Online-Zahlung";
    case "bank_transfer": return "Banküberweisung";
    case "sepa": return "SEPA-Lastschrift";
    case "manual": return "manuell";
    default: return m;
  }
}
