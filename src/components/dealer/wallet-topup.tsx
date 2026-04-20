"use client";

import { useState } from "react";
import { Loader2, Wallet } from "lucide-react";

const PRESETS = [100, 250, 500, 1000, 2500];

export function WalletTopup() {
  const [amount, setAmount] = useState<number>(250);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const start = async () => {
    setErr(null);
    setBusy(true);
    const res = await fetch("/api/dealer/wallet/topup", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ amount_eur: amount }),
    });
    const json = await res.json();
    if (!res.ok || !json.url) {
      setBusy(false);
      setErr(json.error ?? "Topup fehlgeschlagen");
      return;
    }
    window.location.href = json.url;
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <button
            key={p}
            onClick={() => setAmount(p)}
            className={`rounded-md px-3 py-1.5 text-sm font-semibold transition ${
              amount === p ? "bg-brand-700 text-white" : "bg-white text-ink-muted ring-1 ring-slate-200 hover:bg-surface-strong"
            }`}
          >
            {p} €
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <input
          type="number"
          min={10}
          max={10000}
          step={10}
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          className="input-field w-32"
        />
        <span className="text-sm text-ink-muted">€</span>
      </div>
      <button onClick={start} disabled={busy} className="btn-primary w-full">
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : (
          <>
            <Wallet className="h-4 w-4" />
            Aufladen via Stripe
          </>
        )}
      </button>
      {err && <p className="rounded-md border border-red-200 bg-red-50 p-2 text-xs text-red-700">{err}</p>}
      <p className="text-[11px] text-ink-subtle">
        Sicherer Checkout via Stripe. Rechnung erhalten Sie automatisch per E-Mail.
      </p>
    </div>
  );
}
