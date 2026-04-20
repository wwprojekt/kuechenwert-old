"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Save, PlayCircle, Plus, Trash2, Pencil, X, Check, Loader2 } from "lucide-react";

const SPEC_CATEGORIES = [
  "fronten",
  "griffe",
  "arbeitsplatte",
  "geraet",
  "sanitaer",
  "mülltrennung",
  "beleuchtung",
  "steckdosen",
  "besteckeinsatz",
  "sonstiges",
];

interface SpecItem {
  id: string;
  category: string;
  label: string;
  brand?: string | null;
  model?: string | null;
  material?: string | null;
  designation?: string | null;
  quantity?: number | null;
  notes?: string | null;
  sort_order?: number | null;
}

interface AuctionFormState {
  offer_price_eur: number | string;
  duration_hours: number | string;
  min_bid_eur: number | string;
  status: string;
}

export function AuctionEditor({
  auctionId,
  initial,
  startsAt,
  endsAt,
  initialSpecItems,
}: {
  auctionId: string;
  initial: AuctionFormState;
  startsAt: string | null;
  endsAt: string | null;
  initialSpecItems: Array<Record<string, unknown> & { id: string }>;
}) {
  const router = useRouter();
  const [data, setData] = useState<AuctionFormState>(initial);
  const [items, setItems] = useState<SpecItem[]>(
    initialSpecItems.map((r) => ({
      id: r.id,
      category: String(r.category),
      label: String(r.label),
      brand: r.brand as string | null,
      model: r.model as string | null,
      material: r.material as string | null,
      designation: r.designation as string | null,
      quantity: r.quantity as number | null,
      notes: r.notes as string | null,
      sort_order: r.sort_order as number | null,
    })),
  );
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [draftItem, setDraftItem] = useState<Partial<SpecItem>>({});
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [, startTransition] = useTransition();

  const set = <K extends keyof AuctionFormState>(k: K, v: AuctionFormState[K]) =>
    setData((d) => ({ ...d, [k]: v }));

  const saveCore = async () => {
    setSaving(true);
    setError(null);
    const body = {
      offer_price_eur: data.offer_price_eur === "" ? null : Number(data.offer_price_eur),
      duration_hours: data.duration_hours === "" ? null : Number(data.duration_hours),
      min_bid_eur: data.min_bid_eur === "" ? null : Number(data.min_bid_eur),
      status: data.status,
    };
    const res = await fetch(`/api/admin/auctions/${auctionId}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = await res.json();
    setSaving(false);
    if (!res.ok) {
      setError(json.error ?? "Speichern fehlgeschlagen");
      return;
    }
    startTransition(() => router.refresh());
  };

  const publish = async () => {
    if (!confirm("Auktion jetzt freigeben? Sie wird sofort live & verifizierte Händler können bieten.")) {
      return;
    }
    setPublishing(true);
    setError(null);
    const res = await fetch(`/api/admin/auctions/${auctionId}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ publish: true }),
    });
    const json = await res.json();
    setPublishing(false);
    if (!res.ok) {
      setError(json.error ?? "Freigabe fehlgeschlagen");
      return;
    }
    startTransition(() => router.refresh());
  };

  // Spec-Item handlers
  const startNewItem = () => {
    setDraftItem({ category: "sonstiges", label: "", quantity: 1, sort_order: (items.length + 1) * 10 });
    setEditingItem("__new__");
  };
  const startEditItem = (it: SpecItem) => {
    setDraftItem({ ...it });
    setEditingItem(it.id);
  };
  const cancelItem = () => {
    setEditingItem(null);
    setDraftItem({});
  };
  const saveItem = async () => {
    if (!draftItem.category || !draftItem.label) {
      setError("Kategorie + Label sind Pflicht");
      return;
    }
    const isNew = editingItem === "__new__";
    const url = isNew
      ? `/api/admin/auctions/${auctionId}/spec-items`
      : `/api/admin/auctions/${auctionId}/spec-items?itemId=${editingItem}`;
    const res = await fetch(url, {
      method: isNew ? "POST" : "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(draftItem),
    });
    const json = await res.json();
    if (!res.ok) {
      setError(json.error ?? "Spec-Item fehlgeschlagen");
      return;
    }
    if (isNew) setItems((it) => [...it, json.row]);
    else setItems((it) => it.map((x) => (x.id === editingItem ? json.row : x)));
    cancelItem();
    setError(null);
    startTransition(() => router.refresh());
  };
  const removeItem = async (id: string) => {
    if (!confirm("Eintrag löschen?")) return;
    const res = await fetch(`/api/admin/auctions/${auctionId}/spec-items?itemId=${id}`, {
      method: "DELETE",
    });
    const json = await res.json();
    if (!res.ok) {
      alert(json.error ?? "Löschen fehlgeschlagen");
      return;
    }
    setItems((it) => it.filter((x) => x.id !== id));
    startTransition(() => router.refresh());
  };

  const isDraft = data.status === "draft";

  return (
    <div className="space-y-5">
      {/* Core fields */}
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label className="label-field">Studio-Preis (€) *</label>
          <input
            type="number"
            step="0.01"
            className="input-field"
            value={data.offer_price_eur}
            onChange={(e) => set("offer_price_eur", e.target.value === "" ? "" : Number(e.target.value))}
          />
        </div>
        <div>
          <label className="label-field">Laufzeit (Stunden)</label>
          <input
            type="number"
            className="input-field"
            value={data.duration_hours}
            onChange={(e) => set("duration_hours", e.target.value === "" ? "" : Number(e.target.value))}
          />
        </div>
        <div>
          <label className="label-field">Min-Gebot (€)</label>
          <input
            type="number"
            step="0.01"
            className="input-field"
            value={data.min_bid_eur}
            onChange={(e) => set("min_bid_eur", e.target.value === "" ? "" : Number(e.target.value))}
          />
        </div>
      </div>

      {(startsAt || endsAt) && (
        <div className="rounded-md bg-surface-soft p-3 text-xs text-ink-muted">
          Live von <strong className="text-ink">{startsAt ? new Date(startsAt).toLocaleString("de-DE") : "?"}</strong>{" "}
          bis <strong className="text-ink">{endsAt ? new Date(endsAt).toLocaleString("de-DE") : "?"}</strong>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <button onClick={saveCore} disabled={saving} className="btn-secondary">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Speichern
        </button>
        {isDraft && (
          <button onClick={publish} disabled={publishing} className="btn-accent">
            {publishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlayCircle className="h-4 w-4" />}
            Auktion freigeben (72h live)
          </button>
        )}
      </div>

      {/* Spec items */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <h4 className="text-sm font-semibold text-ink">
            Auktions-Positionen ({items.length})
          </h4>
          <button onClick={startNewItem} className="btn-ghost text-xs">
            <Plus className="h-3.5 w-3.5" /> Position hinzufügen
          </button>
        </div>
        <div className="overflow-x-auto rounded-md border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-soft text-ink-subtle">
              <tr>
                <th className="px-2 py-2">#</th>
                <th className="px-2 py-2">Kategorie</th>
                <th className="px-2 py-2">Label</th>
                <th className="px-2 py-2">Marke / Modell</th>
                <th className="px-2 py-2">Material / Bezeichnung</th>
                <th className="px-2 py-2 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {editingItem === "__new__" && (
                <SpecRowEdit
                  draft={draftItem}
                  setDraft={setDraftItem}
                  onSave={saveItem}
                  onCancel={cancelItem}
                />
              )}
              {items.length === 0 && editingItem !== "__new__" && (
                <tr>
                  <td colSpan={6} className="px-2 py-6 text-center text-ink-subtle">
                    Noch keine Positionen.
                  </td>
                </tr>
              )}
              {items.map((it, idx) =>
                editingItem === it.id ? (
                  <SpecRowEdit
                    key={it.id}
                    draft={draftItem}
                    setDraft={setDraftItem}
                    onSave={saveItem}
                    onCancel={cancelItem}
                  />
                ) : (
                  <tr key={it.id}>
                    <td className="px-2 py-2 text-ink-subtle">{idx + 1}</td>
                    <td className="px-2 py-2">{it.category}</td>
                    <td className="px-2 py-2 font-medium text-ink">{it.label}</td>
                    <td className="px-2 py-2 text-ink-muted">
                      {[it.brand, it.model].filter(Boolean).join(" / ") || "–"}
                    </td>
                    <td className="px-2 py-2 text-ink-muted">
                      {[it.material, it.designation].filter(Boolean).join(" / ") || "–"}
                    </td>
                    <td className="whitespace-nowrap px-2 py-2 text-right">
                      <button onClick={() => startEditItem(it)} className="text-brand-700 hover:underline">
                        <Pencil className="inline h-3 w-3" />
                      </button>
                      <button onClick={() => removeItem(it.id)} className="ml-2 text-red-600 hover:underline">
                        <Trash2 className="inline h-3 w-3" />
                      </button>
                    </td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
        </div>
      </div>

      {error && (
        <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>
      )}
    </div>
  );
}

function SpecRowEdit({
  draft,
  setDraft,
  onSave,
  onCancel,
}: {
  draft: Partial<SpecItem>;
  setDraft: React.Dispatch<React.SetStateAction<Partial<SpecItem>>>;
  onSave: () => void;
  onCancel: () => void;
}) {
  const upd = (patch: Partial<SpecItem>) => setDraft((d) => ({ ...d, ...patch }));
  return (
    <tr className="bg-amber-50/40">
      <td className="px-2 py-1"></td>
      <td className="px-2 py-1">
        <select
          className="input-field !py-1 !text-xs"
          value={draft.category ?? ""}
          onChange={(e) => upd({ category: e.target.value })}
        >
          {SPEC_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </td>
      <td className="px-2 py-1">
        <input
          className="input-field !py-1 !text-xs"
          placeholder="Label *"
          value={draft.label ?? ""}
          onChange={(e) => upd({ label: e.target.value })}
        />
      </td>
      <td className="px-2 py-1">
        <input
          className="input-field !mb-1 !py-1 !text-xs"
          placeholder="Marke"
          value={draft.brand ?? ""}
          onChange={(e) => upd({ brand: e.target.value })}
        />
        <input
          className="input-field !py-1 !text-xs"
          placeholder="Modell"
          value={draft.model ?? ""}
          onChange={(e) => upd({ model: e.target.value })}
        />
      </td>
      <td className="px-2 py-1">
        <input
          className="input-field !mb-1 !py-1 !text-xs"
          placeholder="Material"
          value={draft.material ?? ""}
          onChange={(e) => upd({ material: e.target.value })}
        />
        <input
          className="input-field !py-1 !text-xs"
          placeholder="Bezeichnung"
          value={draft.designation ?? ""}
          onChange={(e) => upd({ designation: e.target.value })}
        />
      </td>
      <td className="whitespace-nowrap px-2 py-1 text-right">
        <button onClick={onSave} className="text-accent-700 hover:underline" title="Speichern">
          <Check className="inline h-3.5 w-3.5" />
        </button>
        <button onClick={onCancel} className="ml-2 text-ink-muted hover:underline" title="Abbrechen">
          <X className="inline h-3.5 w-3.5" />
        </button>
      </td>
    </tr>
  );
}
