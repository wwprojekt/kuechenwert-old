"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, AlertTriangle } from "lucide-react";

interface DealerLite {
  id: string;
  company_name: string;
}

export function PenaltyButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [dealers, setDealers] = useState<DealerLite[]>([]);
  const [dealerId, setDealerId] = useState<string>("");
  const [reason, setReason] = useState("Vertragsstrafe gem. AGB §X – Stornierung nach Auktionssieg");
  const [refType, setRefType] = useState<"manual" | "auction" | "lead">("manual");
  const [refId, setRefId] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const openDialog = async () => {
    setOpen(true);
    setErr(null);
    if (dealers.length === 0) {
      const res = await fetch("/api/admin/dealers-list");
      if (res.ok) {
        const json = await res.json();
        setDealers(json.rows ?? []);
      }
    }
  };

  const submit = async () => {
    setErr(null);
    if (!dealerId) return setErr("Händler wählen");
    if (!confirm("Vertragsstrafe 299 € jetzt verbindlich erstellen und Rechnung per Mail versenden?")) return;
    setBusy(true);
    const res = await fetch("/api/admin/invoices", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        dealer_id: dealerId,
        type: "penalty",
        description: reason,
        reference_type: refType,
        reference_id: refId || null,
      }),
    });
    const json = await res.json();
    setBusy(false);
    if (!res.ok) return setErr(json.error ?? "Fehler");
    setOpen(false);
    router.refresh();
  };

  return (
    <>
      <button onClick={openDialog} className="btn-secondary text-xs">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        Penalty 299 €
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setOpen(false)}>
          <div onClick={(e) => e.stopPropagation()} className="card w-full max-w-md">
            <h3 className="font-display text-lg font-bold text-ink">Vertragsstrafe 299 €</h3>
            <p className="mt-1 text-xs text-ink-muted">Erstellt eine Rechnung Typ &quot;penalty&quot; und versendet sie sofort per E-Mail.</p>
            <div className="mt-4 space-y-3 text-sm">
              <div>
                <label className="label-field">Händler</label>
                <select value={dealerId} onChange={(e) => setDealerId(e.target.value)} className="input-field">
                  <option value="">– wählen –</option>
                  {dealers.map((d) => (
                    <option key={d.id} value={d.id}>{d.company_name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label-field">Begründung (auf Rechnung)</label>
                <textarea rows={2} value={reason} onChange={(e) => setReason(e.target.value)} className="input-field" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label-field">Bezug</label>
                  <select value={refType} onChange={(e) => setRefType(e.target.value as typeof refType)} className="input-field">
                    <option value="manual">manuell</option>
                    <option value="auction">Auktion</option>
                    <option value="lead">Lead</option>
                  </select>
                </div>
                <div>
                  <label className="label-field">Bezugs-ID (UUID)</label>
                  <input value={refId} onChange={(e) => setRefId(e.target.value)} className="input-field" placeholder="optional" />
                </div>
              </div>
              {err && <div className="rounded-md border border-red-200 bg-red-50 p-2 text-xs text-red-700">{err}</div>}
              <div className="flex justify-end gap-2 pt-2">
                <button onClick={() => setOpen(false)} className="btn-ghost text-xs">Abbrechen</button>
                <button onClick={submit} disabled={busy} className="btn-primary text-xs">
                  {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : "299 € verbindlich erstellen"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
