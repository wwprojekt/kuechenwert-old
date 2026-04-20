import { Wallet, Info } from "lucide-react";
import { requireDealer } from "@/lib/supabase/dealer";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { WalletTopup } from "@/components/dealer/wallet-topup";

export const dynamic = "force-dynamic";

export default async function DealerWalletPage() {
  const ctx = await requireDealer("/dealer/wallet");

  const { data: paymentsRaw } = await supabaseAdmin
    .from("payments")
    .select("id, type, amount_cents, currency, status, description, created_at")
    .eq("dealer_id", ctx.dealer.id)
    .order("created_at", { ascending: false })
    .limit(50);
  const payments = paymentsRaw ?? [];

  return (
    <div>
      <div className="flex items-center gap-3">
        <Wallet className="h-6 w-6 text-brand-700" />
        <h1 className="font-display text-2xl font-bold text-ink">Wallet</h1>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="card md:col-span-1">
          <div className="text-xs uppercase tracking-wider text-ink-subtle">Aktueller Stand</div>
          <div className="mt-1 text-3xl font-bold text-ink">
            {(ctx.dealer.wallet_balance_cents / 100).toLocaleString("de-DE", { maximumFractionDigits: 2 })} €
          </div>
          <p className="mt-3 text-xs text-ink-muted">
            Wallet wird automatisch für Lead-Käufe verwendet.
          </p>
          <div className="mt-4">
            <WalletTopup />
          </div>
        </div>

        <div className="card md:col-span-2">
          <h2 className="mb-3 font-semibold text-ink">Transaktionen</h2>
          {payments.length === 0 ? (
            <p className="rounded-md bg-surface-soft p-4 text-sm text-ink-muted">
              <Info className="mr-1 inline h-4 w-4" />
              Noch keine Transaktionen.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-md border border-slate-200">
              <table className="w-full text-left text-sm">
                <thead className="bg-surface-soft text-xs uppercase tracking-wider text-ink-subtle">
                  <tr>
                    <th className="px-3 py-2">Datum</th>
                    <th className="px-3 py-2">Typ</th>
                    <th className="px-3 py-2">Beschreibung</th>
                    <th className="px-3 py-2 text-right">Betrag</th>
                    <th className="px-3 py-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payments.map((p) => (
                    <tr key={p.id}>
                      <td className="px-3 py-2 text-xs text-ink-subtle">{new Date(p.created_at).toLocaleString("de-DE")}</td>
                      <td className="px-3 py-2 text-xs">{p.type}</td>
                      <td className="px-3 py-2 text-xs">{p.description ?? "–"}</td>
                      <td className="px-3 py-2 text-right font-medium">
                        {p.type === "wallet_topup" ? "+" : "−"}
                        {(p.amount_cents / 100).toLocaleString("de-DE", { maximumFractionDigits: 2 })} €
                      </td>
                      <td className="px-3 py-2 text-xs">
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${p.status === "completed" ? "bg-accent-100 text-accent-700" : p.status === "pending" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>
                          {p.status}
                        </span>
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
