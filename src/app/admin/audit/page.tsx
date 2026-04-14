import { createClient } from "@/lib/supabase/server";

export default async function AdminAuditPage() {
  const supabase = await createClient();
  const { data: logs } = await supabase.from("audit_log").select("*").order("created_at", { ascending: false }).limit(50);

  return (
    <div>
      <h1 className="text-2xl font-bold">Audit-Log</h1>
      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-zinc-200 text-xs uppercase text-zinc-500">
            <tr><th className="py-3 pr-4">Aktion</th><th className="py-3 pr-4">Typ</th><th className="py-3 pr-4">Entity ID</th><th className="py-3 pr-4">Datum</th></tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {logs?.map((l) => (
              <tr key={l.id} className="hover:bg-zinc-50">
                <td className="py-3 pr-4">{l.action}</td>
                <td className="py-3 pr-4">{l.entity_type}</td>
                <td className="py-3 pr-4 font-mono text-xs">{l.entity_id?.slice(0, 8)}</td>
                <td className="py-3 pr-4 text-xs text-zinc-500">{new Date(l.created_at).toLocaleString("de-DE")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
