import { createClient } from "@/lib/supabase/server";

export default async function AdminModerationPage() {
  const supabase = await createClient();
  const { data: reviews } = await supabase.from("reviews").select("*, dealer:dealers(company_name)").eq("moderation_status", "pending").order("created_at", { ascending: false }).limit(20);

  return (
    <div>
      <h1 className="text-2xl font-bold">Moderation</h1>
      <p className="mt-1 text-sm text-zinc-500">Bewertungen und Inhalte prüfen.</p>
      <div className="mt-8 space-y-4">
        {reviews?.map((r: any) => (
          <div key={r.id} className="card">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">{r.author_name ?? "Anonym"} → {r.dealer?.company_name}</p>
              <span className="text-sm">{"★".repeat(r.rating)}</span>
            </div>
            {r.text && <p className="mt-2 text-sm text-zinc-600">{r.text}</p>}
            <div className="mt-3 flex gap-2">
              <button className="btn-primary text-xs">Freigeben</button>
              <button className="btn-secondary text-xs">Ablehnen</button>
            </div>
          </div>
        )) ?? <p className="text-sm text-zinc-500">Keine ausstehenden Reviews.</p>}
      </div>
    </div>
  );
}
