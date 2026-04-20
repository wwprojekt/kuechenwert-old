import Link from "next/link";
import { FileText, ChevronRight } from "lucide-react";
import { requireDealer } from "@/lib/supabase/dealer";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { invoicePublicUrl } from "@/lib/invoice-token";

export const dynamic = "force-dynamic";

const TYPE_LABEL: Record<string, string> = {
  lead_purchase: "Lead-Kauf",
  cpa_commission: "Provision",
  wallet_topup: "Wallet-Aufladung",
  penalty: "Vertragsstrafe",
  subscription: "Abonnement",
};

const STATUS_COLOR: Record<string, string> = {
  paid: "bg-accent-100 text-accent-700",
  open: "bg-amber-100 text-amber-700",
  overdue: "bg-red-100 text-red-700",
  in_collection: "bg-red-200 text-red-800",
  cancelled: "bg-slate-100 text-slate-600",
  refunded: "bg-slate-100 text-slate-600",
  draft: "bg-slate-100 text-slate-600",
};

export default async function DealerInvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const { filter } = await searchParams;
  const ctx = await requireDealer("/dealer/invoices");

  let q = supabaseAdmin
    .from("invoices")
    .select("id, invoice_number, type, status, gross_amount_cents, issued_at, due_at, paid_at, dunning_level")
    .eq("dealer_id", ctx.dealer.id)
    .order("issued_at", { ascending: false })
    .limit(200);
  if (filter && ["open", "overdue", "paid", "cancelled"].includes(filter)) {
    q = q.eq("status", filter);
  } else if (filter === "due") {
    q = q.in("status", ["open", "overdue", "in_collection"]);
  }
  const { data: invoices = [] } = await q;

  // Summen
  const { data: openSum } = await supabaseAdmin
    .from("invoices")
    .select("gross_amount_cents")
    .eq("dealer_id", ctx.dealer.id)
    .in("status", ["open", "overdue", "in_collection"]);
  const totalOpen = (openSum ?? []).reduce((s, r) => s + Number(r.gross_amount_cents), 0);

  return (
    <div>
      <div className="flex items-center gap-3">
        <FileText className="h-6 w-6 text-brand-700" />
        <h1 className="font-display text-2xl font-bold text-ink">Rechnungen</h1>
      </div>
      <p className="mt-1 text-sm text-ink-muted">
        Alle Rechnungen für Lead-Käufe, Provisionen, Wallet-Aufladungen und ggf.
        Vertragsstrafen. Bezahlung per Banküberweisung an die auf der Rechnung
        angegebene IBAN unter Angabe der Rechnungs-Nr.
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <Card label="Offene Forderungen" value={`${(totalOpen / 100).toLocaleString("de-DE", { minimumFractionDigits: 2 })} €`} tone={totalOpen > 0 ? "warning" : "ok"} />
        <Card label="Wallet-Stand" value={`${(ctx.dealer.wallet_balance_cents / 100).toLocaleString("de-DE", { minimumFractionDigits: 2 })} €`} />
        <Card label="Anzahl Rechnungen" value={String(invoices?.length ?? 0)} />
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2 text-xs">
        <FilterChip href="/dealer/invoices" active={!filter} label="Alle" />
        <FilterChip href="/dealer/invoices?filter=due" active={filter === "due"} label="Offen / fällig" />
        <FilterChip href="/dealer/invoices?filter=overdue" active={filter === "overdue"} label="Überfällig" />
        <FilterChip href="/dealer/invoices?filter=paid" active={filter === "paid"} label="Bezahlt" />
        <FilterChip href="/dealer/invoices?filter=cancelled" active={filter === "cancelled"} label="Storniert" />
      </div>

      <div className="mt-4 overflow-x-auto rounded-card border border-slate-200 bg-white shadow-card">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-surface-soft text-xs uppercase tracking-wider text-ink-subtle">
            <tr>
              <th className="px-4 py-3">Rechnungs-Nr.</th>
              <th className="px-4 py-3">Typ</th>
              <th className="px-4 py-3">Datum</th>
              <th className="px-4 py-3">Fällig</th>
              <th className="px-4 py-3 text-right">Betrag (brutto)</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {invoices?.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-ink-muted">Keine Rechnungen.</td></tr>
            )}
            {invoices?.map((inv) => {
              const link = invoicePublicUrl(inv.id);
              return (
                <tr key={inv.id} className="hover:bg-surface-soft">
                  <td className="px-4 py-3 font-mono text-xs">{inv.invoice_number}</td>
                  <td className="px-4 py-3 text-xs">{TYPE_LABEL[inv.type] ?? inv.type}</td>
                  <td className="px-4 py-3 text-xs text-ink-muted">{new Date(inv.issued_at).toLocaleDateString("de-DE")}</td>
                  <td className="px-4 py-3 text-xs">{inv.due_at ? new Date(inv.due_at).toLocaleDateString("de-DE") : "–"}</td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {(inv.gross_amount_cents / 100).toLocaleString("de-DE", { minimumFractionDigits: 2 })} €
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${STATUS_COLOR[inv.status] ?? STATUS_COLOR.draft}`}>
                      {inv.status}
                    </span>
                    {inv.dunning_level > 0 && (
                      <span className="ml-1 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-700">
                        Mahnstufe {inv.dunning_level}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <a
                      href={link}
                      target="_blank"
                      rel="noopener"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-brand-700 hover:underline"
                    >
                      Öffnen <ChevronRight className="h-3 w-3" />
                    </a>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Card({ label, value, tone }: { label: string; value: string; tone?: "ok" | "warning" }) {
  const colorClass = tone === "warning" ? "text-red-700" : "text-ink";
  return (
    <div className="card">
      <div className="text-xs uppercase tracking-wider text-ink-subtle">{label}</div>
      <div className={`mt-1 text-2xl font-bold ${colorClass}`}>{value}</div>
    </div>
  );
}

function FilterChip({ href, active, label }: { href: string; active: boolean; label: string }) {
  return (
    <Link href={href} className={`rounded-full px-3 py-1 transition ${active ? "bg-brand-700 text-white" : "bg-white text-ink-muted ring-1 ring-slate-200 hover:bg-surface-strong"}`}>
      {label}
    </Link>
  );
}
