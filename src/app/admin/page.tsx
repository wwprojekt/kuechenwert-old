import { createClient } from "@/lib/supabase/server";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const { count: totalLeads } = await supabase.from("leads").select("*", { count: "exact", head: true });
  const { count: newLeads } = await supabase.from("leads").select("*", { count: "exact", head: true }).eq("status", "new");
  const { count: qualifiedLeads } = await supabase.from("leads").select("*", { count: "exact", head: true }).eq("status", "qualified");
  const { count: totalDealers } = await supabase.from("dealers").select("*", { count: "exact", head: true });
  const { count: openDisputes } = await supabase.from("disputes").select("*", { count: "exact", head: true }).eq("status", "open");

  return (
    <div>
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="card"><p className="text-sm text-zinc-500">Leads gesamt</p><p className="mt-1 text-3xl font-bold">{totalLeads ?? 0}</p></div>
        <div className="card"><p className="text-sm text-zinc-500">Neue Leads</p><p className="mt-1 text-3xl font-bold text-amber-600">{newLeads ?? 0}</p></div>
        <div className="card"><p className="text-sm text-zinc-500">Qualifiziert</p><p className="mt-1 text-3xl font-bold text-brand-700">{qualifiedLeads ?? 0}</p></div>
        <div className="card"><p className="text-sm text-zinc-500">Händler</p><p className="mt-1 text-3xl font-bold">{totalDealers ?? 0}</p></div>
        <div className="card"><p className="text-sm text-zinc-500">Offene Disputes</p><p className="mt-1 text-3xl font-bold text-red-600">{openDisputes ?? 0}</p></div>
      </div>
    </div>
  );
}
