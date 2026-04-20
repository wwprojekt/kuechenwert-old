"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, X, Loader2 } from "lucide-react";

export function DealerVerifyButton({
  dealerId,
  isVerified,
  isActive,
}: {
  dealerId: string;
  isVerified: boolean;
  isActive: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [, startTransition] = useTransition();

  const call = async (patch: Record<string, unknown>, label: string) => {
    if (!confirm(`${label}?`)) return;
    setBusy(true);
    const res = await fetch(`/api/admin/dealers/${dealerId}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(patch),
    });
    const json = await res.json();
    setBusy(false);
    if (!res.ok) {
      alert(json.error ?? "Fehler");
      return;
    }
    startTransition(() => router.refresh());
  };

  if (busy) return <span className="inline-flex items-center gap-1 text-ink-muted"><Loader2 className="h-3 w-3 animate-spin" /></span>;

  return (
    <span className="inline-flex items-center gap-2">
      {!isVerified && (
        <button
          onClick={() => call({ is_verified: true }, "Diesen Händler freischalten")}
          className="inline-flex items-center gap-1 font-semibold text-accent-700 hover:underline"
        >
          <Check className="h-3 w-3" /> Freischalten
        </button>
      )}
      {isVerified && isActive && (
        <button
          onClick={() => call({ is_active: false }, "Händler sperren")}
          className="inline-flex items-center gap-1 text-red-600 hover:underline"
        >
          <X className="h-3 w-3" /> Sperren
        </button>
      )}
      {!isActive && (
        <button
          onClick={() => call({ is_active: true }, "Sperre aufheben")}
          className="inline-flex items-center gap-1 text-accent-700 hover:underline"
        >
          <Check className="h-3 w-3" /> Aktivieren
        </button>
      )}
    </span>
  );
}
