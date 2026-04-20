"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Pencil, X, Check } from "lucide-react";

export interface RangeRuleColumn {
  key: string;
  label: string;
  type: "number" | "text" | "boolean" | "select";
  /** in der Eingabe & in der Anzeige als „€" formatiert. Wert wird in EUR gespeichert. */
  isEur?: boolean;
  /** Pflichtfeld auf Form-Ebene */
  required?: boolean;
  options?: { value: string; label: string }[];
  hint?: string;
  /** Spalten-Suffix in der Anzeige, z. B. „%" */
  suffix?: string;
}

type Row = Record<string, unknown> & { id: string };

/**
 * Generischer Editor für Tabellen mit „Range + Action"-Logik
 * (Lead-Pricing-Matrix, Commission-Tiers …).
 *
 * - sendet/empfängt EUR (nicht Cents) auf der API-Ebene; die zugehörige
 *   API-Route wandelt selbst in `*_cents` um.
 * - `id` wird vom Server vergeben.
 */
export function RangeRuleEditor({
  apiPath,
  columns,
  initialRows,
  rowToForm,
  formatCell,
}: {
  apiPath: string;
  columns: RangeRuleColumn[];
  initialRows: Row[];
  /** wandelt einen DB-Row (z.B. min_cents -> min_eur) in das Form-Modell um */
  rowToForm: (row: Row) => Record<string, unknown>;
  /** Optional eigene Zellen-Formatierung – sonst Default je Typ */
  formatCell?: (col: RangeRuleColumn, value: unknown) => React.ReactNode;
}) {
  const router = useRouter();
  const [rows, setRows] = useState<Row[]>(initialRows);
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState<Record<string, unknown>>({});
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const startCreate = () => {
    const init: Record<string, unknown> = {};
    columns.forEach((c) => {
      init[c.key] = c.type === "boolean" ? true : "";
    });
    setDraft(init);
    setEditing("__new__");
    setError(null);
  };

  const startEdit = (row: Row) => {
    setDraft(rowToForm(row));
    setEditing(row.id);
    setError(null);
  };

  const cancelEdit = () => {
    setEditing(null);
    setDraft({});
    setError(null);
  };

  const save = async () => {
    setError(null);
    const isNew = editing === "__new__";
    const url = isNew ? apiPath : `${apiPath}?id=${editing}`;
    const res = await fetch(url, {
      method: isNew ? "POST" : "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(draft),
    });
    const json = await res.json();
    if (!res.ok) {
      setError(json.error ?? "Fehler");
      return;
    }
    if (isNew) setRows((r) => [...r, json.row]);
    else setRows((r) => r.map((x) => (x.id === editing ? json.row : x)));
    cancelEdit();
    startTransition(() => router.refresh());
  };

  const remove = async (id: string) => {
    if (!confirm("Wirklich löschen?")) return;
    const res = await fetch(`${apiPath}?id=${id}`, { method: "DELETE" });
    const json = await res.json();
    if (!res.ok) {
      alert(json.error ?? "Fehler");
      return;
    }
    setRows((r) => r.filter((x) => x.id !== id));
    startTransition(() => router.refresh());
  };

  const defaultCellFmt = (c: RangeRuleColumn, v: unknown) => {
    if (v === null || v === undefined || v === "") {
      // for max_cents (open-ended), display ∞
      if (c.key.includes("max")) return <span className="text-ink-subtle">∞</span>;
      return <span className="text-ink-subtle">–</span>;
    }
    if (c.type === "boolean") {
      return v ? <span className="chip-success">Aktiv</span> : <span className="chip">Inaktiv</span>;
    }
    if (c.type === "select") {
      const opt = c.options?.find((o) => o.value === v);
      return opt?.label ?? String(v);
    }
    if (c.isEur) {
      const eur = typeof v === "number" ? v / 100 : Number(v) / 100;
      return `${eur.toLocaleString("de-DE", { maximumFractionDigits: 2 })} €`;
    }
    if (c.suffix) return `${v}${c.suffix}`;
    return String(v);
  };

  const renderCell = (c: RangeRuleColumn, row: Row) => {
    const v = row[c.key];
    return formatCell ? formatCell(c, v) : defaultCellFmt(c, v);
  };

  const renderInput = (c: RangeRuleColumn) => {
    const value = draft[c.key];
    const onChange = (val: unknown) => setDraft((d) => ({ ...d, [c.key]: val }));
    switch (c.type) {
      case "boolean":
        return (
          <input
            type="checkbox"
            className="h-4 w-4 accent-brand-700"
            checked={Boolean(value)}
            onChange={(e) => onChange(e.target.checked)}
          />
        );
      case "select":
        return (
          <select className="input-field" value={String(value ?? "")} onChange={(e) => onChange(e.target.value)}>
            <option value="">– Wählen –</option>
            {c.options?.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        );
      case "number":
        return (
          <input
            type="number"
            step={c.isEur ? "0.01" : "any"}
            className="input-field"
            value={value === null || value === undefined ? "" : (value as number)}
            placeholder={c.isEur ? "€" : c.suffix ?? ""}
            onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))}
          />
        );
      case "text":
      default:
        return (
          <input
            type="text"
            className="input-field"
            value={String(value ?? "")}
            onChange={(e) => onChange(e.target.value)}
          />
        );
    }
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-ink-muted">{rows.length} Regeln</p>
        <button onClick={startCreate} className="btn-primary">
          <Plus className="h-4 w-4" /> Neue Regel
        </button>
      </div>

      <div className="overflow-x-auto rounded-card border border-slate-200 bg-white shadow-card">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-surface-soft text-xs uppercase tracking-wider text-ink-subtle">
            <tr>
              {columns.map((c) => (
                <th key={c.key} className="px-4 py-3 font-semibold">{c.label}</th>
              ))}
              <th className="px-4 py-3 text-right">Aktion</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {editing === "__new__" && (
              <EditRow columns={columns} renderInput={renderInput} onSave={save} onCancel={cancelEdit} isNew />
            )}
            {rows.length === 0 && editing !== "__new__" && (
              <tr>
                <td colSpan={columns.length + 1} className="px-4 py-10 text-center text-ink-muted">
                  Noch keine Regeln. Bitte oben anlegen.
                </td>
              </tr>
            )}
            {rows.map((row) =>
              editing === row.id ? (
                <EditRow key={row.id} columns={columns} renderInput={renderInput} onSave={save} onCancel={cancelEdit} />
              ) : (
                <tr key={row.id} className="hover:bg-surface-soft">
                  {columns.map((c) => (
                    <td key={c.key} className="px-4 py-3 align-top">{renderCell(c, row)}</td>
                  ))}
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    <button
                      onClick={() => startEdit(row)}
                      className="inline-flex items-center gap-1 text-xs text-brand-700 hover:underline"
                    >
                      <Pencil className="h-3.5 w-3.5" /> Bearbeiten
                    </button>
                    <button
                      onClick={() => remove(row.id)}
                      className="ml-3 inline-flex items-center gap-1 text-xs text-red-600 hover:underline"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Löschen
                    </button>
                  </td>
                </tr>
              ),
            )}
          </tbody>
        </table>
      </div>

      {error && (
        <p className="mt-3 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>
      )}
    </div>
  );
}

function EditRow({
  columns,
  renderInput,
  onSave,
  onCancel,
  isNew,
}: {
  columns: RangeRuleColumn[];
  renderInput: (c: RangeRuleColumn) => React.ReactNode;
  onSave: () => void;
  onCancel: () => void;
  isNew?: boolean;
}) {
  return (
    <tr className={isNew ? "bg-brand-50/40" : "bg-amber-50/40"}>
      {columns.map((c) => (
        <td key={c.key} className="px-4 py-2 align-top">
          {renderInput(c)}
          {c.hint && <div className="mt-0.5 text-[10px] text-ink-subtle">{c.hint}</div>}
        </td>
      ))}
      <td className="whitespace-nowrap px-4 py-2 text-right">
        <button onClick={onSave} className="inline-flex items-center gap-1 text-xs text-accent-700 hover:underline">
          <Check className="h-3.5 w-3.5" /> Speichern
        </button>
        <button onClick={onCancel} className="ml-3 inline-flex items-center gap-1 text-xs text-ink-muted hover:underline">
          <X className="h-3.5 w-3.5" /> Abbrechen
        </button>
      </td>
    </tr>
  );
}
