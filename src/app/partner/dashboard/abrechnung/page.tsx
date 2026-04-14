import { createClient } from "@/lib/supabase/server";

export default async function DealerAbrechnungPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: dealer } = await supabase
    .from("dealers")
    .select("id, wallet_balance_cents, plan")
    .eq("user_id", user!.id)
    .single();

  const { data: payments } = await supabase
    .from("payments")
    .select("*")
    .eq("dealer_id", dealer?.id ?? "")
    .order("created_at", { ascending: false })
    .limit(20);

  return (
    <div>
      <h1 className="text-2xl font-bold">Abrechnung</h1>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="card">
          <p className="text-sm text-zinc-500">Aktuelles Guthaben</p>
          <p className="mt-1 text-3xl font-bold text-brand-700">
            {((dealer?.wallet_balance_cents ?? 0) / 100).toFixed(2)} €
          </p>
          <button className="btn-primary mt-4 text-sm">Guthaben aufladen</button>
        </div>
        <div className="card">
          <p className="text-sm text-zinc-500">Aktueller Plan</p>
          <p className="mt-1 text-xl font-semibold capitalize">{dealer?.plan ?? "basic"}</p>
          <button className="btn-secondary mt-4 text-sm">Plan ändern</button>
        </div>
      </div>

      <h2 className="mt-10 text-lg font-semibold">Letzte Transaktionen</h2>
      <div className="mt-4 space-y-2">
        {payments && payments.length > 0 ? (
          payments.map((p: any) => (
            <div key={p.id} className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white px-4 py-3">
              <div>
                <p className="text-sm font-medium">{p.description ?? p.type}</p>
                <p className="text-xs text-zinc-500">{new Date(p.created_at).toLocaleDateString("de-DE")}</p>
              </div>
              <span className={`text-sm font-semibold ${p.amount_cents > 0 ? "text-brand-700" : "text-zinc-900"}`}>
                {(p.amount_cents / 100).toFixed(2)} €
              </span>
            </div>
          ))
        ) : (
          <p className="text-sm text-zinc-500">Noch keine Transaktionen.</p>
        )}
      </div>
    </div>
  );
}
