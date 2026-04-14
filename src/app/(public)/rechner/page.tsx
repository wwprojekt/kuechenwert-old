"use client";

import { useState } from "react";
import Link from "next/link";
import { KITCHEN_FORMS } from "@/config/funnel-steps";

const SIZE_OPTIONS = [
  { id: "small", label: "Klein (bis 8 m²)", factor: 0.8 },
  { id: "medium", label: "Mittel (8–14 m²)", factor: 1.0 },
  { id: "large", label: "Groß (über 14 m²)", factor: 1.3 },
];

const QUALITY_OPTIONS = [
  { id: "basis", label: "Basis", baseEur: 4000 },
  { id: "mittel", label: "Mittelklasse", baseEur: 8000 },
  { id: "premium", label: "Premium", baseEur: 15000 },
  { id: "luxus", label: "Luxus", baseEur: 25000 },
];

const FORM_FACTORS: Record<string, number> = {
  zeile: 0.85, "l-form": 1.0, "u-form": 1.15, insel: 1.3, unsicher: 1.0,
};

export default function RechnerPage() {
  const [form, setForm] = useState("");
  const [size, setSize] = useState("");
  const [quality, setQuality] = useState("");
  const [result, setResult] = useState<{ min: number; max: number } | null>(null);

  function calculate() {
    const q = QUALITY_OPTIONS.find((o) => o.id === quality);
    const s = SIZE_OPTIONS.find((o) => o.id === size);
    if (!q || !s) return;
    const base = q.baseEur * s.factor * (FORM_FACTORS[form] ?? 1);
    setResult({ min: Math.round(base * 0.85), max: Math.round(base * 1.2) });
  }

  return (
    <div className="section-container py-16">
      <h1 className="text-3xl font-bold tracking-tight">Küchenrechner</h1>
      <p className="mt-2 text-zinc-600">Erhalten Sie in 30 Sekunden eine grobe Preisindikation für Ihre neue Küche.</p>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold">Küchenform</label>
            <select className="input-field mt-1" value={form} onChange={(e) => setForm(e.target.value)}>
              <option value="">Bitte wählen</option>
              {KITCHEN_FORMS.map((f) => <option key={f.id} value={f.id}>{f.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold">Raumgröße</label>
            <select className="input-field mt-1" value={size} onChange={(e) => setSize(e.target.value)}>
              <option value="">Bitte wählen</option>
              {SIZE_OPTIONS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold">Ausstattungsniveau</label>
            <select className="input-field mt-1" value={quality} onChange={(e) => setQuality(e.target.value)}>
              <option value="">Bitte wählen</option>
              {QUALITY_OPTIONS.map((q) => <option key={q.id} value={q.id}>{q.label}</option>)}
            </select>
          </div>
          <button onClick={calculate} disabled={!form || !size || !quality} className="btn-primary w-full">
            Preis berechnen
          </button>
        </div>

        <div className="flex items-center justify-center">
          {result ? (
            <div className="card text-center">
              <p className="text-sm text-zinc-500">Geschätzte Preisspanne</p>
              <p className="mt-2 text-4xl font-bold text-brand-700">
                {result.min.toLocaleString("de-DE")} – {result.max.toLocaleString("de-DE")} €
              </p>
              <p className="mt-3 text-xs text-zinc-400">
                Unverbindliche Indikation. Tatsächliche Preise hängen von Ausstattung, Region und Händler ab.
              </p>
              <Link href="/funnel/kuechenform" className="btn-primary mt-6 inline-block">
                Jetzt konkrete Angebote erhalten
              </Link>
            </div>
          ) : (
            <div className="text-center text-zinc-400">
              <p className="text-6xl">🍳</p>
              <p className="mt-4 text-sm">Wählen Sie Ihre Eckdaten für eine Schätzung.</p>
            </div>
          )}
        </div>
      </div>

      <p className="mt-12 text-xs text-zinc-400">
        Hinweis: Der Küchenrechner liefert eine grobe Preisindikation auf Basis typischer Marktdaten. Er ersetzt keine individuelle Beratung oder ein verbindliches Angebot.
      </p>
    </div>
  );
}
