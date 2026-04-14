import { createClient } from "@/lib/supabase/server";

export default async function DealerDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: dealer } = await supabase
    .from("dealers")
    .select("*")
    .eq("user_id", user!.id)
    .single();

  const { count: leadCount } = await supabase
    .from("match_candidates")
    .select("*", { count: "exact", head: true })
    .eq("dealer_id", dealer?.id ?? "")
    .eq("is_purchased", false);

  const { count: purchasedCount } = await supabase
    .from("match_candidates")
    .select("*", { count: "exact", head: true })
    .eq("dealer_id", dealer?.id ?? "")
    .eq("is_purchased", true);

  return (
    <div>
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="mt-1 text-sm text-zinc-500">Willkommen, {dealer?.company_name ?? "Händler"}</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card">
          <p className="text-sm text-zinc-500">Verfügbare Leads</p>
          <p className="mt-1 text-3xl font-bold text-brand-700">{leadCount ?? 0}</p>
        </div>
        <div className="card">
          <p className="text-sm text-zinc-500">Gekaufte Leads</p>
          <p className="mt-1 text-3xl font-bold">{purchasedCount ?? 0}</p>
        </div>
        <div className="card">
          <p className="text-sm text-zinc-500">Guthaben</p>
          <p className="mt-1 text-3xl font-bold">{((dealer?.wallet_balance_cents ?? 0) / 100).toFixed(2)} €</p>
        </div>
        <div className="card">
          <p className="text-sm text-zinc-500">Plan</p>
          <p className="mt-1 text-xl font-semibold capitalize">{dealer?.plan ?? "basic"}</p>
        </div>
      </div>
    </div>
  );
}
