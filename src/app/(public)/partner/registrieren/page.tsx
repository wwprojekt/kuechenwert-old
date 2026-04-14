"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function DealerRegisterPage() {
  const supabase = createClient();
  const [form, setForm] = useState({
    companyName: "",
    email: "",
    phone: "",
    postalCode: "",
    city: "",
    address: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");

    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: crypto.randomUUID(),
      options: {
        data: { role: "dealer", company_name: form.companyName },
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/partner/dashboard`,
      },
    });

    if (error) {
      setStatus("error");
      setMessage(error.message);
      return;
    }

    setStatus("success");
    setMessage("Registrierung erfolgreich! Bitte prüfen Sie Ihre E-Mails zur Bestätigung.");
  }

  return (
    <div className="section-container py-16">
      <div className="mx-auto max-w-lg">
        <Link href="/partner" className="text-sm text-zinc-500 hover:text-zinc-700">← Zurück</Link>
        <h1 className="mt-4 text-2xl font-bold">Als Händler registrieren</h1>
        <p className="mt-2 text-sm text-zinc-500">
          Erstellen Sie Ihr Konto und erhalten Sie Zugang zum Händler-Dashboard.
        </p>

        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <input className="input-field" placeholder="Firmenname *" value={form.companyName} onChange={(e) => update("companyName", e.target.value)} required />
          <input className="input-field" type="email" placeholder="E-Mail *" value={form.email} onChange={(e) => update("email", e.target.value)} required />
          <input className="input-field" type="tel" placeholder="Telefon" value={form.phone} onChange={(e) => update("phone", e.target.value)} />
          <div className="grid grid-cols-2 gap-4">
            <input className="input-field" placeholder="PLZ *" value={form.postalCode} onChange={(e) => update("postalCode", e.target.value)} required />
            <input className="input-field" placeholder="Ort *" value={form.city} onChange={(e) => update("city", e.target.value)} required />
          </div>
          <input className="input-field" placeholder="Adresse *" value={form.address} onChange={(e) => update("address", e.target.value)} required />

          <button type="submit" disabled={status === "loading"} className="btn-primary w-full">
            {status === "loading" ? "Wird registriert…" : "Registrieren"}
          </button>

          {message && (
            <p className={`text-sm ${status === "error" ? "text-red-600" : "text-brand-700"}`}>
              {message}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
