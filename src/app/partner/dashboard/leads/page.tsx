import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function DealerLeadsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: dealer } = await supabase
    .from("dealers")
    .select("id")
    .eq("user_id", user!.id)
    .single();

  const { data: matches } = await supabase
    .from("match_candidates")
    .select(`
      id, is_purchased, purchased_at, price_cents,
      lead:leads(id, tier, postal_code, kitchen_form, kitchen_style, budget_midpoint, timeframe_months, has_existing_offer, created_at)
    `)
    .eq("dealer_id", dealer?.id ?? "")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="text-2xl font-bold">Leads</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Verfügbare und gekaufte Leads aus Ihrer Region.
      </p>

      <div className="mt-8 space-y-4">
        {matches && matches.length > 0 ? (
          matches.map((m: any) => (
            <div key={m.id} className="card flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
                    m.lead?.tier === "hot" ? "bg-red-100 text-red-700" :
                    m.lead?.tier === "premium" ? "bg-amber-100 text-amber-700" :
                    m.lead?.tier === "qualified" ? "bg-blue-100 text-blue-700" :
                    "bg-zinc-100 text-zinc-600"
                  }`}>
                    {m.lead?.tier}
                  </span>
                  <span className="text-sm text-zinc-500">PLZ {m.lead?.postal_code}</span>
                </div>
                <p className="mt-1 text-sm">
                  {m.lead?.kitchen_form ?? "–"} · {m.lead?.kitchen_style ?? "–"} ·{" "}
                  {m.lead?.budget_midpoint ? `~${m.lead.budget_midpoint.toLocaleString("de-DE")} €` : "k.A."}
                  {m.lead?.has_existing_offer && " · Angebot vorhanden"}
                </p>
              </div>
              <div>
                {m.is_purchased ? (
                  <span className="text-xs font-medium text-brand-700">Freigeschaltet</span>
                ) : (
                  <button className="btn-primary text-xs">
                    Lead freischalten ({((m.price_cents ?? 0) / 100).toFixed(0)} €)
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-zinc-500">Noch keine passenden Leads in Ihrer Region.</p>
        )}
      </div>
    </div>
  );
}
