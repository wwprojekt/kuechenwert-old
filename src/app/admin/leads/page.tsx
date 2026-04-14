import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function AdminLeadsPage() {
  const supabase = await createClient();

  const { data: leads } = await supabase
    .from("leads")
    .select("id, status, tier, score, postal_code, kitchen_form, budget_midpoint, has_existing_offer, first_name, last_name, email, phone, created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div>
      <h1 className="text-2xl font-bold">Lead-Queue</h1>
      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-zinc-200 text-xs uppercase text-zinc-500">
            <tr>
              <th className="py-3 pr-4">Status</th>
              <th className="py-3 pr-4">Tier</th>
              <th className="py-3 pr-4">Score</th>
              <th className="py-3 pr-4">PLZ</th>
              <th className="py-3 pr-4">Form</th>
              <th className="py-3 pr-4">Budget</th>
              <th className="py-3 pr-4">Name</th>
              <th className="py-3 pr-4">Angebot</th>
              <th className="py-3 pr-4">Datum</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {leads?.map((l) => (
              <tr key={l.id} className="hover:bg-zinc-50">
                <td className="py-3 pr-4"><span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs">{l.status}</span></td>
                <td className="py-3 pr-4"><span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${l.tier === "hot" ? "bg-red-100 text-red-700" : l.tier === "premium" ? "bg-amber-100 text-amber-700" : l.tier === "qualified" ? "bg-blue-100 text-blue-700" : "bg-zinc-100"}`}>{l.tier}</span></td>
                <td className="py-3 pr-4">{l.score}</td>
                <td className="py-3 pr-4">{l.postal_code}</td>
                <td className="py-3 pr-4">{l.kitchen_form ?? "–"}</td>
                <td className="py-3 pr-4">{l.budget_midpoint ? `${l.budget_midpoint.toLocaleString("de-DE")} €` : "–"}</td>
                <td className="py-3 pr-4">{l.first_name} {l.last_name}</td>
                <td className="py-3 pr-4">{l.has_existing_offer ? "Ja" : "–"}</td>
                <td className="py-3 pr-4 text-xs text-zinc-500">{new Date(l.created_at).toLocaleDateString("de-DE")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
