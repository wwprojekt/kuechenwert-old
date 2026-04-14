import { createClient } from "@/lib/supabase/server";

export default async function AdminCallsPage() {
  const supabase = await createClient();

  const { data: calls } = await supabase
    .from("qualification_calls")
    .select("id, outcome, notes, duration_seconds, created_at, lead:leads(id, first_name, last_name, phone, postal_code)")
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div>
      <h1 className="text-2xl font-bold">Call-Queue</h1>
      <p className="mt-1 text-sm text-zinc-500">Telefonische Qualifizierung</p>
      <div className="mt-6 space-y-3">
        {calls?.map((c: any) => (
          <div key={c.id} className="card flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">{c.lead?.first_name} {c.lead?.last_name} – {c.lead?.phone}</p>
              <p className="text-xs text-zinc-500">PLZ {c.lead?.postal_code} · {c.duration_seconds ? `${c.duration_seconds}s` : "ausstehend"}</p>
              {c.notes && <p className="mt-1 text-xs text-zinc-500">{c.notes}</p>}
            </div>
            <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${c.outcome === "qualified" ? "bg-brand-100 text-brand-700" : c.outcome === "disqualified" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>
              {c.outcome}
            </span>
          </div>
        )) ?? <p className="text-sm text-zinc-500">Keine Calls.</p>}
      </div>
    </div>
  );
}
