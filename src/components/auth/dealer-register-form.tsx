"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

interface FormState {
  company_name: string;
  contact_first_name: string;
  contact_last_name: string;
  email: string;
  phone: string;
  password: string;
  password_confirm: string;
  address: string;
  postal_code: string;
  city: string;
  website: string;
  service_radius_km: number;
  brands: string;
  consent_agb: boolean;
}

const initial: FormState = {
  company_name: "",
  contact_first_name: "",
  contact_last_name: "",
  email: "",
  phone: "",
  password: "",
  password_confirm: "",
  address: "",
  postal_code: "",
  city: "",
  website: "",
  service_radius_km: 50,
  brands: "",
  consent_agb: false,
};

export function DealerRegisterForm() {
  const router = useRouter();
  const [data, setData] = useState<FormState>(initial);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setData((d) => ({ ...d, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (data.password.length < 8) {
      setError("Passwort muss mindestens 8 Zeichen haben.");
      return;
    }
    if (data.password !== data.password_confirm) {
      setError("Passwörter stimmen nicht überein.");
      return;
    }
    if (!data.consent_agb) {
      setError("Bitte AGB akzeptieren.");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/auth/register-dealer", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(json.error ?? "Registrierung fehlgeschlagen");
      return;
    }
    router.push("/auth/login?registered=1");
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      {/* Firma */}
      <Section title="Unternehmen">
        <Grid>
          <Field label="Firmenname *" wide>
            <input className="input-field" required value={data.company_name} onChange={(e) => set("company_name", e.target.value)} />
          </Field>
          <Field label="Anschrift *" wide>
            <input className="input-field" required value={data.address} onChange={(e) => set("address", e.target.value)} />
          </Field>
          <Field label="PLZ *">
            <input className="input-field" required pattern="\d{5}" maxLength={5} value={data.postal_code} onChange={(e) => set("postal_code", e.target.value)} />
          </Field>
          <Field label="Stadt *">
            <input className="input-field" required value={data.city} onChange={(e) => set("city", e.target.value)} />
          </Field>
          <Field label="Service-Radius (km)">
            <input type="number" min={5} max={500} className="input-field" value={data.service_radius_km} onChange={(e) => set("service_radius_km", Number(e.target.value))} />
          </Field>
          <Field label="Website">
            <input type="url" className="input-field" placeholder="https://" value={data.website} onChange={(e) => set("website", e.target.value)} />
          </Field>
          <Field label="Marken (Komma-getrennt)" wide>
            <input className="input-field" placeholder="z. B. Nobilia, Häcker, SieMatic" value={data.brands} onChange={(e) => set("brands", e.target.value)} />
          </Field>
        </Grid>
      </Section>

      {/* Kontakt */}
      <Section title="Hauptansprechpartner">
        <Grid>
          <Field label="Vorname *">
            <input className="input-field" required value={data.contact_first_name} onChange={(e) => set("contact_first_name", e.target.value)} />
          </Field>
          <Field label="Nachname *">
            <input className="input-field" required value={data.contact_last_name} onChange={(e) => set("contact_last_name", e.target.value)} />
          </Field>
          <Field label="E-Mail *">
            <input type="email" className="input-field" required value={data.email} onChange={(e) => set("email", e.target.value)} />
          </Field>
          <Field label="Telefon *">
            <input type="tel" className="input-field" required value={data.phone} onChange={(e) => set("phone", e.target.value)} />
          </Field>
        </Grid>
      </Section>

      {/* Login */}
      <Section title="Login-Daten">
        <Grid>
          <Field label="Passwort * (min. 8 Zeichen)">
            <input type="password" className="input-field" required minLength={8} autoComplete="new-password" value={data.password} onChange={(e) => set("password", e.target.value)} />
          </Field>
          <Field label="Passwort wiederholen *">
            <input type="password" className="input-field" required minLength={8} autoComplete="new-password" value={data.password_confirm} onChange={(e) => set("password_confirm", e.target.value)} />
          </Field>
        </Grid>
      </Section>

      <label className="flex items-start gap-3 text-sm">
        <input
          type="checkbox"
          required
          className="mt-0.5 h-4 w-4 accent-brand-700"
          checked={data.consent_agb}
          onChange={(e) => set("consent_agb", e.target.checked)}
        />
        <span className="text-ink-muted">
          Ich akzeptiere die{" "}
          <a href="/agb" className="underline">AGB für Händler</a> und die{" "}
          <a href="/datenschutz" className="underline">Datenschutzerklärung</a>.
          Ich bestätige, dass ich berechtigt bin, das Unternehmen zu vertreten.
        </span>
      </label>

      {error && <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Registrieren & zur Freischaltung anmelden"}
      </button>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink-subtle">{title}</div>
      {children}
    </div>
  );
}
function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-3 sm:grid-cols-2">{children}</div>;
}
function Field({ label, wide, children }: { label: string; wide?: boolean; children: React.ReactNode }) {
  return (
    <div className={wide ? "sm:col-span-2" : ""}>
      <label className="label-field">{label}</label>
      {children}
    </div>
  );
}
