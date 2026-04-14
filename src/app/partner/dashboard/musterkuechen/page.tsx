import { createClient } from "@/lib/supabase/server";

export default async function DealerMusterkuechenPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: dealer } = await supabase.from("dealers").select("id").eq("user_id", user!.id).single();

  const { data: items } = await supabase
    .from("musterkuechen")
    .select("*")
    .eq("dealer_id", dealer?.id ?? "")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Musterküchen</h1>
          <p className="mt-1 text-sm text-zinc-500">Verwalten Sie Ihre Ausstellungsstücke.</p>
        </div>
        <button className="btn-primary text-sm">Neue Musterküche</button>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items && items.length > 0 ? (
          items.map((item: any) => (
            <div key={item.id} className="card">
              <h3 className="font-semibold">{item.title}</h3>
              <p className="mt-1 text-sm text-zinc-500">{item.description?.slice(0, 80)}</p>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-lg font-bold text-brand-700">{item.sale_price_eur?.toLocaleString("de-DE")} €</span>
                <span className="text-sm text-zinc-400 line-through">{item.original_price_eur?.toLocaleString("de-DE")} €</span>
              </div>
              <span className={`mt-2 inline-block rounded-full px-2 py-0.5 text-xs ${item.is_available ? "bg-brand-100 text-brand-700" : "bg-zinc-100 text-zinc-500"}`}>
                {item.is_available ? "Verfügbar" : "Verkauft"}
              </span>
            </div>
          ))
        ) : (
          <p className="text-sm text-zinc-500">Noch keine Musterküchen eingestellt.</p>
        )}
      </div>
    </div>
  );
}
