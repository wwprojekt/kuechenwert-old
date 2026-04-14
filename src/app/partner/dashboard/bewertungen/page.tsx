import { createClient } from "@/lib/supabase/server";

export default async function DealerBewertungenPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: dealer } = await supabase
    .from("dealers")
    .select("id")
    .eq("user_id", user!.id)
    .single();

  const { data: reviews } = await supabase
    .from("reviews")
    .select("*")
    .eq("dealer_id", dealer?.id ?? "")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="text-2xl font-bold">Bewertungen</h1>
      <p className="mt-1 text-sm text-zinc-500">Kundenbewertungen verwalten und beantworten.</p>

      <div className="mt-8 space-y-4">
        {reviews && reviews.length > 0 ? (
          reviews.map((r: any) => (
            <div key={r.id} className="card">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span>
                  <span className="text-xs text-zinc-500">{r.author_name ?? "Anonym"}</span>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-xs ${
                  r.moderation_status === "approved" ? "bg-brand-100 text-brand-700" :
                  r.moderation_status === "rejected" ? "bg-red-100 text-red-700" :
                  "bg-amber-100 text-amber-700"
                }`}>{r.moderation_status}</span>
              </div>
              {r.text && <p className="mt-2 text-sm text-zinc-600">{r.text}</p>}
              {r.reply && (
                <div className="mt-3 rounded-lg bg-zinc-50 p-3 text-sm text-zinc-600">
                  <p className="text-xs font-semibold text-zinc-500">Ihre Antwort:</p>
                  {r.reply}
                </div>
              )}
            </div>
          ))
        ) : (
          <p className="text-sm text-zinc-500">Noch keine Bewertungen.</p>
        )}
      </div>
    </div>
  );
}
