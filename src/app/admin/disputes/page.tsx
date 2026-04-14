import { createClient } from "@/lib/supabase/server";

export default async function AdminDisputesPage() {
  const supabase = await createClient();
  const { data: disputes } = await supabase.from("disputes").select("*, dealer:dealers(company_name), lead:leads(first_name, last_name)").order("created_at", { ascending: false }).limit(30);

  return (
    <div>
      <h1 className="text-2xl font-bold">Disputes</h1>
      <div className="mt-6 space-y-3">
        {disputes?.map((d: any) => (
          <div key={d.id} className="card">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">{d.type} – {d.dealer?.company_name} / {d.lead?.first_name} {d.lead?.last_name}</p>
              <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${d.status === "open" ? "bg-red-100 text-red-700" : "bg-zinc-100 text-zinc-600"}`}>{d.status}</span>
            </div>
            <p className="mt-2 text-sm text-zinc-600">{d.reason}</p>
          </div>
        )) ?? <p className="text-sm text-zinc-500">Keine Disputes.</p>}
      </div>
    </div>
  );
}
