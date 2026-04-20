import Link from "next/link";
import { FileText, ChevronRight } from "lucide-react";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { invoicePublicUrl } from "@/lib/invoice-token";
import { InvoiceActions } from "@/components/admin/invoice-actions";
import { PenaltyButton } from "@/components/admin/penalty-button";

export const dynamic = "force-dynamic";

const STATUS_FILTERS = ["open", "overdue", "in_collection", "paid", "cancelled"];

const STATUS_COLOR: Record<string, string> = {
  paid: "bg-accent-100 text-accent-700",
  open: "bg-amber-100 text-amber-700",
  overdue: "bg-red-100 text-red-700",
  in_collection: "bg-red-200 text-red-800",
  cancelled: "bg-slate-100 text-slate-600",
  refunded: "bg-slate-100 text-slate-600",
  draft: "bg-slate-100 text-slate-600",
};

const TYPE_LABEL: Record<string, string> = {
  lead_purchase: "Lead-Kauf",
  cpa_commission: "Provision",
  wallet_topup: "Wallet",
  penalty: "Vertragsstrafe",
  subscription: "Abo",
};

export default async function AdminInvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; dealer_id?: string }>;
}) {
  const { status, dealer_id } = await searchParams;

  let q = supabaseAdmin
    .from("invoices")
    .select("id, invoice_number, dealer_id, type, status, gross_amount_cents, dunning_level, dunning_fee_cents, issued_at, due_at, paid_at, recipient_company, recipient_email, email_sent")
    .order("issued_at", { ascending: false })
    .limit(200);
  if (status && STATUS_FILTERS.includes(status)) q = q.eq("status", status);
  if (dealer_id) q = q.eq("dealer_id", dealer_id);
  const { data: invoices = [] } = await q;

  // Totals
  const totals = await Promise.all(
    STATUS_FILTERS.map(async (s) => {
      const { data } = await supabaseAdmin
        .from("invoices")
        .select("gross_amount_cents")
        .eq("status", s);
      const sum = (data ?? []).reduce((a, r) => a + Number(r.gross_amount_cents), 0);
      return [s, { count: data?.length ?? 0, sum }] as const;
    }),
  );
  const totalMap = Object.fromEntries(totals);

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <FileText className="h-6 w-6 text-brand-700" />
          <h1 className="font-display text-2xl font-bold text-ink">Rechnungen</h1>
        </div>
        <PenaltyButton />
      </div>
      <p className="mt-2 max-w-2xl text-sm text-ink-muted">
        Alle Rechnungen (Lead-Käufe, Provisionen, Wallet-Aufladungen, Vertragsstrafen).
        Mahnstufen werden automatisch täglich vom Cron-Job erhöht; Sie können hier
        manuell &quot;mark paid&quot;, stornieren oder eine Mahnung sofort senden.
      </p>

      {/* KPIs */}
      <div className="mt-6 grid gap-3 sm:grid-cols-5">
        {STATUS_FILTERS.map((s) => {
          const t = totalMap[s] ?? { count: 0, sum: 0 };
          return (
            <Link
              key={s}
              href={`/admin/invoices?status=${s}`}
              className={`card transition hover:-translate-y-0.5 hover:shadow-card-hover ${status === s ? "ring-2 ring-brand-300" : ""}`}
            >
              <div className="text-[10px] uppercase tracking-wider text-ink-subtle">{s}</div>
              <div className="mt-1 text-xl font-bold text-ink">{t.count}</div>
              <div className="text-[11px] text-ink-muted">{(t.sum / 100).toLocaleString("de-DE", { maximumFractionDigits: 0 })} €</div>
            </Link>
          );
        })}
      </div>

      {/* Filter chips */}
      <div className="mt-6 flex items-center gap-2 text-xs">
        <Link href="/admin/invoices" className={`rounded-full px-3 py-1 ${!status ? "bg-brand-700 text-white" : "bg-white text-ink-muted ring-1 ring-slate-200 hover:bg-surface-strong"}`}>
          Alle anzeigen
        </Link>
      </div>

      <div className="mt-4 overflow-x-auto rounded-card border border-slate-200 bg-white shadow-card">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-surface-soft text-xs uppercase tracking-wider text-ink-subtle">
            <tr>
              <th className="px-4 py-3">Nr.</th>
              <th className="px-4 py-3">Empfänger</th>
              <th className="px-4 py-3">Typ</th>
              <th className="px-4 py-3">Datum / Fällig</th>
              <th className="px-4 py-3 text-right">Brutto</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Aktion</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {invoices?.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-ink-muted">Keine Rechnungen.</td></tr>
            )}
            {invoices?.map((inv) => (
              <tr key={inv.id} className="hover:bg-surface-soft">
                <td className="px-4 py-3 font-mono text-xs">
                  <a href={invoicePublicUrl(inv.id)} target="_blank" rel="noopener" className="text-brand-700 hover:underline">
                    {inv.invoice_number}
                  </a>
                </td>
                <td className="px-4 py-3 text-xs">
                  <div className="font-medium text-ink">{inv.recipient_company}</div>
                  <div className="text-ink-subtle">{inv.recipient_email}</div>
                </td>
                <td className="px-4 py-3 text-xs">{TYPE_LABEL[inv.type] ?? inv.type}</td>
                <td className="px-4 py-3 text-xs">
                  <div>{new Date(inv.issued_at).toLocaleDateString("de-DE")}</div>
                  <div className="text-ink-subtle">{inv.due_at ? new Date(inv.due_at).toLocaleDateString("de-DE") : "–"}</div>
                </td>
                <td className="px-4 py-3 text-right tabular-nums">{(inv.gross_amount_cents / 100).toLocaleString("de-DE", { minimumFractionDigits: 2 })} €</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${STATUS_COLOR[inv.status] ?? STATUS_COLOR.draft}`}>
                    {inv.status}
                  </span>
                  {inv.dunning_level > 0 && (
                    <div className="mt-1 text-[10px] text-red-700">Mahnstufe {inv.dunning_level}{inv.dunning_fee_cents > 0 ? ` · +${(inv.dunning_fee_cents / 100).toFixed(2)} €` : ""}</div>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <InvoiceActions invoiceId={inv.id} status={inv.status} dunningLevel={inv.dunning_level} />
                  <a href={invoicePublicUrl(inv.id)} target="_blank" rel="noopener" className="ml-2 inline-flex items-center gap-1 text-xs text-brand-700 hover:underline">
                    Öffnen <ChevronRight className="h-3 w-3" />
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
