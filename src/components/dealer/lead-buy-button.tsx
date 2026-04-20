"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ShoppingCart } from "lucide-react";

export function LeadBuyButton({ leadId, priceCents }: { leadId: string; priceCents: number }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const buy = async () => {
    setErr(null);
    if (!confirm(`Lead jetzt verbindlich für ${(priceCents / 100).toFixed(2)} € kaufen?`)) return;
    setBusy(true);
    const res = await fetch(`/api/dealer/leads/${leadId}/buy`, { method: "POST" });
    const json = await res.json();
    setBusy(false);
    if (!res.ok) {
      setErr(json.error ?? "Kauf fehlgeschlagen");
      return;
    }
    startTransition(() => router.refresh());
  };

  return (
    <>
      <button onClick={buy} disabled={busy} className="btn-primary w-full">
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : (
          <>
            <ShoppingCart className="h-4 w-4" />
            Verbindlich kaufen
          </>
        )}
      </button>
      {err && (
        <p className="mt-2 rounded-md border border-red-200 bg-red-50 p-2 text-xs text-red-700">{err}</p>
      )}
    </>
  );
}
