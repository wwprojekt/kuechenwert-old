"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Pencil, X, Check } from "lucide-react";
import type { CatalogField } from "@/config/admin-catalogs";

type Row = Record<string, unknown> & { id: string };

export function CatalogEditor({
  slug,
  fields,
  initialRows,
  fkOptionsMap,
}: {
  slug: string;
  fields: CatalogField[];
  initialRows: Row[];
  fkOptionsMap: Record<string, { value: string; label: string }[]>;
}) {
  const router = useRouter();
  const [rows, setRows] = useState<Row[]>(initialRows);
  const [editing, setEditing] = useState<string | null>(null); // row id or "__new__"
  const [draft, setDraft] = useState<Record<string, unknown>>({});
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const visibleFields = fields.filter((f) => !f.hiddenInList);

  const startCreate = () => {
    const init: Record<string, unknown> = {};
    fields.forEach((f) => {
      init[f.key] = f.type === "boolean" ? true : f.type === "number" ? 100 : "";
    });
    setDraft(init);
    setEditing("__new__");
    setError(null);
  };

  const startEdit = (row: Row) => {
    const init: Record<string, unknown> = {};
    fields.forEach((f) => {
      init[f.key] = row[f.key] ?? (f.type === "boolean" ? false : "");
    });
    setDraft(init);
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
    const url = isNew
      ? `/api/admin/catalog/${slug}`
      : `/api/admin/catalog/${slug}?id=${editing}`;
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
    if (isNew) {
      setRows((r) => [...r, json.row]);
    } else {
      setRows((r) => r.map((x) => (x.id === editing ? json.row : x)));
    }
    cancelEdit();
    startTransition(() => router.refresh());
  };

  const remove = async (id: string) => {
    if (!confirm("Wirklich löschen?")) return;
    const res = await fetch(`/api/admin/catalog/${slug}?id=${id}`, { method: "DELETE" });
    const json = await res.json();
    if (!res.ok) {
      alert(json.error ?? "Fehler");
      return;
    }
    setRows((r) => r.filter((x) => x.id !== id));
    startTransition(() => router.refresh());
  };

  const renderCell = (f: CatalogField, row: Row) => {
    const v = row[f.key];
    if (v === null || v === undefined || v === "") return <span className="text-ink-subtle">–</span>;
    switch (f.type) {
      case "boolean":
        return v ? (
          <span className="chip-success">Ja</span>
        ) : (
          <span className="chip">Nein</span>
        );
      case "select": {
        const opt = f.options?.find((o) => o.value === v);
        return <span>{opt?.label ?? String(v)}</span>;
      }
      case "fk": {
        const opt = fkOptionsMap[f.key]?.find((o) => o.value === v);
        return <span>{opt?.label ?? String(v).slice(0, 8)}</span>;
      }
      default:
        return <span>{String(v)}</span>;
    }
  };

  const renderInput = (f: CatalogField) => {
    const value = draft[f.key] ?? "";
    const onChange = (val: unknown) => setDraft((d) => ({ ...d, [f.key]: val }));

    switch (f.type) {
      case "boolean":
        return (
          <input
            type="checkbox"
            className="h-4 w-4 accent-brand-700"
            checked={Boolean(value)}
            onChange={(e) => onChange(e.target.checked)}
          />
        );
      case "number":
        return (
          <input
            type="number"
            className="input-field"
            value={value === null ? "" : (value as number | string)}
            onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))}
          />
        );
      case "select":
        return (
          <select
            className="input-field"
            value={String(value ?? "")}
            onChange={(e) => onChange(e.target.value)}
          >
            <option value="">– Wählen –</option>
            {f.options?.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        );
      case "fk": {
        const opts = fkOptionsMap[f.key] ?? [];
        return (
          <select
            className="input-field"
            value={String(value ?? "")}
            onChange={(e) => onChange(e.target.value)}
          >
            <option value="">– Wählen –</option>
            {opts.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        );
      }
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
        <p className="text-sm text-ink-muted">{rows.length} Einträge</p>
        <button onClick={startCreate} className="btn-primary">
          <Plus className="h-4 w-4" /> Neu anlegen
        </button>
      </div>

      <div className="overflow-x-auto rounded-card border border-slate-200 bg-white shadow-card">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-surface-soft text-xs uppercase tracking-wider text-ink-subtle">
            <tr>
              {visibleFields.map((f) => (
                <th key={f.key} className="px-4 py-3 font-semibold">{f.label}</th>
              ))}
              <th className="px-4 py-3 text-right">Aktion</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {editing === "__new__" && (
              <EditRow
                fields={visibleFields}
                renderInput={renderInput}
                onSave={save}
                onCancel={cancelEdit}
                isNew
              />
            )}
            {rows.length === 0 && editing !== "__new__" && (
              <tr>
                <td colSpan={visibleFields.length + 1} className="px-4 py-10 text-center text-ink-muted">
                  Noch keine Einträge. Klicken Sie oben auf „Neu anlegen".
                </td>
              </tr>
            )}
            {rows.map((row) =>
              editing === row.id ? (
                <EditRow
                  key={row.id}
                  fields={visibleFields}
                  renderInput={renderInput}
                  onSave={save}
                  onCancel={cancelEdit}
                />
              ) : (
                <tr key={row.id} className="hover:bg-surface-soft">
                  {visibleFields.map((f) => (
                    <td key={f.key} className="px-4 py-3 align-top">
                      {renderCell(f, row)}
                    </td>
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
        <p className="mt-3 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}

function EditRow({
  fields,
  renderInput,
  onSave,
  onCancel,
  isNew,
}: {
  fields: CatalogField[];
  renderInput: (f: CatalogField) => React.ReactNode;
  onSave: () => void;
  onCancel: () => void;
  isNew?: boolean;
}) {
  return (
    <tr className={isNew ? "bg-brand-50/40" : "bg-amber-50/40"}>
      {fields.map((f) => (
        <td key={f.key} className="px-4 py-2 align-top">
          {renderInput(f)}
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
