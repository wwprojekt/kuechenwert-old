"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, X, Send, Mail, Loader2 } from "lucide-react";

export function InvoiceActions({
  invoiceId,
  status,
  dunningLevel,
}: {
  invoiceId: string;
  status: string;
  dunningLevel: number;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [, startTransition] = useTransition();

  const call = async (action: string, prompt: string) => {
    if (!confirm(prompt)) return;
    setBusy(true);
    const res = await fetch(`/api/admin/invoices/${invoiceId}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action }),
    });
    const json = await res.json();
    setBusy(false);
    if (!res.ok) {
      alert(json.error ?? "Fehler");
      return;
    }
    startTransition(() => router.refresh());
  };

  if (busy) return <Loader2 className="inline h-3 w-3 animate-spin text-ink-muted" />;

  const isOpen = ["open", "overdue", "in_collection"].includes(status);

  return (
    <span className="inline-flex items-center gap-3 text-xs">
      {isOpen && (
        <button onClick={() => call("mark_paid", "Rechnung als bezahlt markieren?")} className="inline-flex items-center gap-1 font-semibold text-accent-700 hover:underline">
          <Check className="h-3 w-3" /> bezahlt
        </button>
      )}
      {isOpen && (
        <button onClick={() => call("trigger_dunning", `Mahnung Stufe ${Math.min(dunningLevel + 1, 5)} jetzt senden?`)} className="inline-flex items-center gap-1 text-red-700 hover:underline">
          <Send className="h-3 w-3" /> mahnen
        </button>
      )}
      <button onClick={() => call("resend", "Rechnung erneut per Mail senden?")} className="inline-flex items-center gap-1 text-ink-muted hover:text-ink">
        <Mail className="h-3 w-3" /> mail
      </button>
      {status !== "cancelled" && status !== "paid" && (
        <button onClick={() => call("cancel", "Rechnung stornieren?")} className="inline-flex items-center gap-1 text-ink-muted hover:text-red-700">
          <X className="h-3 w-3" /> storno
        </button>
      )}
    </span>
  );
}
