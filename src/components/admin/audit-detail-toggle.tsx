"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

export function AuditDetailToggle({
  details,
}: {
  details: Record<string, unknown> | null;
}) {
  const [open, setOpen] = useState(false);
  const hasContent = details && Object.keys(details).length > 0;
  if (!hasContent) {
    return <span className="text-xs text-ink-subtle">—</span>;
  }
  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1 text-xs font-medium text-brand-700 hover:text-brand-800"
      >
        {open ? (
          <ChevronDown className="h-3 w-3" />
        ) : (
          <ChevronRight className="h-3 w-3" />
        )}
        {open ? "Verbergen" : `${Object.keys(details).length} Feld(er)`}
      </button>
      {open && (
        <pre className="mt-2 max-w-md overflow-x-auto rounded-md bg-slate-50 p-2 text-[11px] leading-tight text-slate-700">
          {JSON.stringify(details, null, 2)}
        </pre>
      )}
    </div>
  );
}
