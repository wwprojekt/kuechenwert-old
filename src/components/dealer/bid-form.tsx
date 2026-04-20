"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Send } from "lucide-react";

export function BidForm({
  auctionId,
  maxAllowedEur,
  minBidStep,
  offerPriceEur,
  lowestBidEur,
}: {
  auctionId: string;
  maxAllowedEur: number | null;
  minBidStep: number;
  offerPriceEur: number | null;
  lowestBidEur: number | null;
}) {
  const router = useRouter();
  const [price, setPrice] = useState<string>(maxAllowedEur ? String(maxAllowedEur) : "");
  const [deliveryWeeks, setDeliveryWeeks] = useState<string>("8");
  const [montage, setMontage] = useState(true);
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    const priceNum = Number(price);
    if (!priceNum || priceNum <= 0) {
      setErr("Preis ungültig");
      return;
    }
    if (maxAllowedEur != null && priceNum > maxAllowedEur) {
      setErr(`Gebot muss höchstens ${maxAllowedEur.toLocaleString("de-DE")} € betragen.`);
      return;
    }
    if (!confirm(`Verbindliches Gebot von ${priceNum.toLocaleString("de-DE")} € abgeben?`)) return;

    setBusy(true);
    const res = await fetch(`/api/dealer/auctions/${auctionId}/bid`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        price_eur: priceNum,
        delivery_weeks: deliveryWeeks ? Number(deliveryWeeks) : null,
        montage_included: montage,
        notes: notes || null,
      }),
    });
    const json = await res.json();
    setBusy(false);
    if (!res.ok) {
      setErr(json.error ?? "Fehler beim Bieten");
      return;
    }
    startTransition(() => router.refresh());
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      <div>
        <label className="label-field">Ihr Gebot (€)</label>
        <input
          type="number"
          required
          step="1"
          min={1}
          max={maxAllowedEur ?? undefined}
          className="input-field"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
        <p className="mt-1 text-[10px] text-ink-subtle">
          {lowestBidEur != null
            ? `< ${lowestBidEur.toLocaleString("de-DE")} € (aktuell niedrigstes − ${minBidStep} €)`
            : offerPriceEur != null
              ? `< ${offerPriceEur.toLocaleString("de-DE")} € (Studio-Preis − ${minBidStep} €)`
              : "Frei wählbar"}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="label-field">Lieferzeit (Wochen)</label>
          <input type="number" min={0} max={52} className="input-field" value={deliveryWeeks} onChange={(e) => setDeliveryWeeks(e.target.value)} />
        </div>
        <div className="flex items-end">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={montage} onChange={(e) => setMontage(e.target.checked)} className="h-4 w-4 accent-brand-700" />
            inkl. Montage
          </label>
        </div>
      </div>

      <div>
        <label className="label-field">Notizen (optional, intern)</label>
        <textarea rows={2} className="input-field" value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>

      {err && <div className="rounded-md border border-red-200 bg-red-50 p-2 text-xs text-red-700">{err}</div>}

      <button type="submit" disabled={busy} className="btn-primary w-full">
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : (
          <>
            <Send className="h-4 w-4" />
            Verbindlich bieten
          </>
        )}
      </button>
    </form>
  );
}
