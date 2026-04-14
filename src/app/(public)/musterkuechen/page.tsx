import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Musterküchen – Ausstellungsküchen zum Sonderpreis" };

export default async function MusterkuechenPage() {
  const supabase = await createClient();
  const { data: items } = await supabase
    .from("musterkuechen")
    .select("*, dealer:dealers(company_name, city)")
    .eq("is_available", true)
    .order("created_at", { ascending: false });

  return (
    <div className="section-container py-16">
      <h1 className="text-3xl font-bold tracking-tight">Musterküchen</h1>
      <p className="mt-2 text-zinc-600">Ausstellungsküchen von geprüften Händlern zum Sonderpreis.</p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items && items.length > 0 ? items.map((item: any) => (
          <div key={item.id} className="card">
            <h3 className="font-semibold">{item.title}</h3>
            <p className="mt-1 text-xs text-zinc-500">{item.dealer?.company_name} · {item.dealer?.city}</p>
            <p className="mt-2 text-sm text-zinc-600">{item.description?.slice(0, 100)}</p>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-xl font-bold text-brand-700">{item.sale_price_eur?.toLocaleString("de-DE")} €</span>
              <span className="text-sm text-zinc-400 line-through">{item.original_price_eur?.toLocaleString("de-DE")} €</span>
            </div>
            {item.brand && <p className="mt-1 text-xs text-zinc-500">Marke: {item.brand}</p>}
            {item.is_highlighted && <span className="mt-2 inline-block rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700">Highlight</span>}
          </div>
        )) : (
          <p className="text-sm text-zinc-500">Aktuell keine Musterküchen verfügbar.</p>
        )}
      </div>
    </div>
  );
}
