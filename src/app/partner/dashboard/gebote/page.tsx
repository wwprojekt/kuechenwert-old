import { createClient } from "@/lib/supabase/server";

export default async function DealerGebotePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: dealer } = await supabase
    .from("dealers")
    .select("id")
    .eq("user_id", user!.id)
    .single();

  const { data: bids } = await supabase
    .from("bids")
    .select(`
      id, price_eur, delivery_weeks, notes, created_at,
      auction:auctions(id, status, ends_at, lead:leads(postal_code, kitchen_form, budget_midpoint))
    `)
    .eq("dealer_id", dealer?.id ?? "")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="text-2xl font-bold">Gebote</h1>
      <p className="mt-1 text-sm text-zinc-500">Ihre abgegebenen Angebote auf Kundenanfragen.</p>

      <div className="mt-8 space-y-4">
        {bids && bids.length > 0 ? (
          bids.map((bid: any) => (
            <div key={bid.id} className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">
                    {bid.price_eur?.toLocaleString("de-DE")} € · {bid.delivery_weeks} Wochen Lieferzeit
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">
                    PLZ {bid.auction?.lead?.postal_code} · {bid.auction?.lead?.kitchen_form ?? "–"} · Status: {bid.auction?.status}
                  </p>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                  bid.auction?.status === "active" ? "bg-brand-100 text-brand-700" : "bg-zinc-100 text-zinc-600"
                }`}>
                  {bid.auction?.status}
                </span>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-zinc-500">Noch keine Gebote abgegeben.</p>
        )}
      </div>
    </div>
  );
}
