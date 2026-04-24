import { Receipt, Info, ExternalLink, AlertTriangle } from "lucide-react";
import { requireDealer } from "@/lib/supabase/dealer";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { COMPANY, PAYMENT_TERMS_DAYS } from "@/config/company";
import { invoicePublicUrl } from "@/lib/invoice-token";

export const dynamic = "force-dynamic";

/**
 * Dealer-Abrechnungs-Übersicht (früher „Wallet").
 *
 * Kein Stripe / keine Vorauszahlung mehr. Jeder Lead-Kauf und jede
 * Auktions-Provision erzeugt direkt eine Rechnung mit 14 Tagen Zahlungsziel
 * per SEPA-Überweisung. Diese Seite zeigt dem Händler:
 *   – Summe offener Rechnungen
 *   – Liste aller Rechnungen inkl. Status & Mahnstufe
 *   – Buchhaltungsrelevante Bankverbindung
 */
export default async function DealerWalletPage() {
  const ctx = await requireDealer("/dealer/wallet");

  const { data: invoicesRaw } = await supabaseAdmin
    .from("invoices")
    .select(
      "id, invoice_number, type, status, gross_amount_cents, issued_at, due_at, paid_at, dunning_level",
    )
    .eq("dealer_id", ctx.dealer.id)
    .order("issued_at", { ascending: false })
    .limit(100);
  const invoices = invoicesRaw ?? [];

  const open = invoices.filter((i) => ["open", "overdue", "in_collection"].includes(i.status));
  const openTotalCents = open.reduce((s, i) => s + i.gross_amount_cents, 0);
  const overdueCount = invoices.filter((i) => ["overdue", "in_collection"].includes(i.status)).length;

  return (
    <div>
      <div className="flex items-center gap-3">
        <Receipt className="h-6 w-6 text-brand-700" />
        <h1 className="font-display text-2xl font-bold text-ink">Abrechnung &amp; Rechnungen</h1>
      </div>
      <p className="mt-2 max-w-prose text-sm text-ink-muted">
        KüchenWert rechnet jeden Lead-Kauf und jede Auktions-Provision direkt per Rechnung
        mit {PAYMENT_TERMS_DAYS} Tagen Zahlungsziel per SEPA-Überweisung ab.
        Es gibt keine Vorkasse, keine Gebühren bei Registrierung und keine externe
        Zahlungsabwicklung.
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="card md:col-span-1">
          <div className="text-xs uppercase tracking-wider text-ink-subtle">Offene Rechnungen</div>
          <div className="mt-1 text-3xl font-bold text-ink">
            {(openTotalCents / 100).toLocaleString("de-DE", { maximumFractionDigits: 2 })} €
          </div>
          <p className="mt-1 text-xs text-ink-muted">{open.length} Rechnung(en) offen</p>

          {overdueCount > 0 && (
            <div className="mt-4 flex items-start gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-xs text-red-700">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <div>
                <strong>{overdueCount}</strong> überfällige Rechnung(en).
                Bitte zeitnah überweisen, sonst drohen Mahngebühren und ab Stufe 5 eine Account-Sperre.
              </div>
            </div>
          )}

          <div className="mt-4 rounded-md border border-slate-200 bg-surface-soft p-3 text-xs leading-relaxed">
            <strong className="block text-ink">Bankverbindung</strong>
            <div className="mt-1 text-ink-muted">
              {COMPANY.bank_account_holder}<br />
              IBAN: <span className="font-mono">{COMPANY.bank_iban}</span><br />
              BIC: <span className="font-mono">{COMPANY.bank_bic}</span><br />
              {COMPANY.bank_name}
            </div>
            <div className="mt-2 text-ink-subtle">
              Bitte Rechnungsnummer als Verwendungszweck angeben.
            </div>
          </div>
        </div>

        <div className="card md:col-span-2">
          <h2 className="mb-3 font-semibold text-ink">Rechnungshistorie</h2>
          {invoices.length === 0 ? (
            <p className="rounded-md bg-surface-soft p-4 text-sm text-ink-muted">
              <Info className="mr-1 inline h-4 w-4" />
              Noch keine Rechnungen. Sobald Sie Ihren ersten Lead kaufen oder eine Auktion gewinnen,
              erhalten Sie hier und per E-Mail die Rechnung.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-md border border-slate-200">
              <table className="w-full text-left text-sm">
                <thead className="bg-surface-soft text-xs uppercase tracking-wider text-ink-subtle">
                  <tr>
                    <th className="px-3 py-2">Datum</th>
                    <th className="px-3 py-2">Nr.</th>
                    <th className="px-3 py-2">Typ</th>
                    <th className="px-3 py-2 text-right">Betrag</th>
                    <th className="px-3 py-2">Fällig</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {invoices.map((inv) => (
                    <tr key={inv.id}>
                      <td className="px-3 py-2 text-xs text-ink-subtle">
                        {new Date(inv.issued_at).toLocaleDateString("de-DE")}
                      </td>
                      <td className="px-3 py-2 font-mono text-xs">{inv.invoice_number}</td>
                      <td className="px-3 py-2 text-xs">{labelType(inv.type)}</td>
                      <td className="px-3 py-2 text-right font-medium">
                        {(inv.gross_amount_cents / 100).toLocaleString("de-DE", {
                          maximumFractionDigits: 2,
                        })} €
                      </td>
                      <td className="px-3 py-2 text-xs">
                        {inv.due_at ? new Date(inv.due_at).toLocaleDateString("de-DE") : "–"}
                      </td>
                      <td className="px-3 py-2 text-xs">
                        <StatusChip status={inv.status} dunningLevel={inv.dunning_level} />
                      </td>
                      <td className="px-3 py-2 text-right">
                        <a
                          href={invoicePublicUrl(inv.id)}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-semibold text-brand-700 hover:underline"
                        >
                          ansehen
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function labelType(t: string) {
  switch (t) {
    case "lead_purchase":
      return "Lead-Kauf";
    case "cpa_commission":
      return "Auktions-Provision";
    case "penalty":
      return "Vertragsstrafe";
    case "subscription":
      return "Abonnement";
    default:
      return t;
  }
}

function StatusChip({ status, dunningLevel }: { status: string; dunningLevel: number | null }) {
  const cls =
    status === "paid"
      ? "bg-success-100 text-success-700"
      : status === "cancelled"
        ? "bg-slate-100 text-slate-600"
        : status === "overdue"
          ? "bg-amber-100 text-amber-700"
          : status === "in_collection"
            ? "bg-red-100 text-red-700"
            : "bg-brand-100 text-brand-800";
  const label =
    status === "paid"
      ? "bezahlt"
      : status === "open"
        ? "offen"
        : status === "overdue"
          ? `überfällig · Stufe ${dunningLevel ?? 0}`
          : status === "in_collection"
            ? "Inkasso"
            : status === "cancelled"
              ? "storniert"
              : status;
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${cls}`}>
      {label}
    </span>
  );
}
