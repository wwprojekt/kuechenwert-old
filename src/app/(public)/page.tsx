import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Gavel,
  Search,
  Sparkles,
  ClipboardCheck,
  Headphones,
  Wallet,
} from "lucide-react";

const FAQ = [
  {
    q: "Ist der Service wirklich kostenlos?",
    a: "Ja, für Sie als Verbraucher ist KüchenWert komplett kostenlos und unverbindlich. Wir finanzieren uns über Provisionen der Küchenstudios.",
  },
  {
    q: "Wie funktioniert der Vergleich eines bestehenden Angebots?",
    a: "Sie geben uns die Eckdaten Ihres Angebots (Hersteller, Fronten, Arbeitsplatte, Geräte usw.) und laden falls vorhanden Angebot, Grundriss oder Foto hoch. Ein Experte ruft Sie an und ergänzt fehlende Details. Anschließend stellen wir Ihre Anfrage neutralisiert in eine 72-Stunden-Auktion ein – verifizierte Händler unterbieten den Preis Ihres Studios.",
  },
  {
    q: "Wie verbindlich ist die Auktion?",
    a: "Beide Seiten sind verbindlich gebunden: Der Händler muss zum gebotenen Preis liefern, und Sie verpflichten sich, das beste Angebot anzunehmen. Bei grundlosem Abbruch wird eine Bearbeitungsgebühr fällig.",
  },
  {
    q: "Warum kann ein anderes Studio meine Küche günstiger anbieten?",
    a: "Küchenstudios kalkulieren mit unterschiedlichen Margen, Konditionen und Auslastung. Durch echten Wettbewerb auf einer neutralen Spec-Liste werden Preisunterschiede sichtbar – häufig zwischen 5 % und 25 %.",
  },
  {
    q: "Was passiert mit meinen Daten?",
    a: "Ihre Kontaktdaten (Name, Adresse, Telefon, E-Mail) sehen Händler erst nach erfolgter Lead-Freischaltung bzw. Auktions-Abschluss. SSL-Verschlüsselung, Server in Deutschland, DSGVO-konform.",
  },
];

export default function HomePage() {
  return (
    <>
      {/* ======================== HERO mit 2-Card-Wahl ======================== */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-950 via-brand-900 to-brand-800 pb-20 pt-16 lg:pb-28 lg:pt-24">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(255,255,255,0.08),_transparent_60%)]" />
        <div className="section-container relative">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-accent-500/15 px-4 py-1.5 text-xs font-semibold text-accent-300">
              <Sparkles className="h-3.5 w-3.5" /> Transparenz für Ihren Küchenkauf
            </span>
            <h1 className="mt-6 font-display text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              In 2 Minuten zum{" "}
              <span className="text-accent-400">besten Küchenpreis</span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base text-brand-100 sm:text-lg">
              Vergleichen Sie ein bestehendes Angebot Ihres Küchenstudios oder
              erhalten Sie neue Angebote von verifizierten Händlern in Ihrer Region.
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-brand-200">
              {["100 % kostenlos", "Unverbindlich", "Verifizierte Händler", "DSGVO-konform"].map(
                (item) => (
                  <span key={item} className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-accent-400" />
                    {item}
                  </span>
                ),
              )}
            </div>
          </div>

          {/* 2-Card-Hero-Wahl */}
          <div className="mx-auto mt-12 grid max-w-5xl gap-5 md:grid-cols-2">
            <Link href="/funnel/b" className="hero-choice-card group text-left">
              <div className="flex items-center justify-between">
                <span className="grid h-12 w-12 place-items-center rounded-lg bg-brand-100 text-brand-700">
                  <ClipboardCheck className="h-6 w-6" />
                </span>
                <span className="chip-success">Spart bis zu 25 %</span>
              </div>
              <div>
                <h2 className="h-card">Bestehendes Angebot vergleichen</h2>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                  Sie haben bereits ein Angebot von einem Küchenstudio? Wir starten
                  eine 72-h-Auktion mit verifizierten Händlern – die unterbieten den
                  Preis bei gleicher Ausstattung.
                </p>
              </div>
              <div className="mt-auto flex items-center gap-2 text-sm font-semibold text-brand-700 group-hover:text-brand-800">
                Auktion starten <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </div>
            </Link>

            <Link href="/funnel/a" className="hero-choice-card group text-left">
              <div className="flex items-center justify-between">
                <span className="grid h-12 w-12 place-items-center rounded-lg bg-accent-50 text-accent-700">
                  <Search className="h-6 w-6" />
                </span>
                <span className="chip">In 2 Min. fertig</span>
              </div>
              <div>
                <h2 className="h-card">Angebot erhalten</h2>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                  Sie planen eine neue Küche? Beantworten Sie wenige Fragen –
                  wir vermitteln Sie an bis zu 3 verifizierte Küchenstudios in
                  Ihrer Region, die individuelle Angebote erstellen.
                </p>
              </div>
              <div className="mt-auto flex items-center gap-2 text-sm font-semibold text-brand-700 group-hover:text-brand-800">
                Anfrage starten <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ======================== STATS ======================== */}
      <section className="border-y border-slate-200 bg-white py-10">
        <div className="section-container">
          <div className="grid grid-cols-2 gap-6 text-center md:grid-cols-4">
            <Stat value="72 h" label="Auktionsdauer" />
            <Stat value="< 25 %" label="Ø Ersparnis im Vergleich" />
            <Stat value="0 €" label="Kosten für Verbraucher" />
            <Stat value="100 %" label="Verifizierte Händler" />
          </div>
        </div>
      </section>

      {/* ======================== ZWEI WEGE EXPLAINER ======================== */}
      <section className="section-padding">
        <div className="section-container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="h-section">Zwei Wege zum besten Preis</h2>
            <p className="mt-3 text-lead">
              Egal ob Sie schon ein konkretes Angebot haben oder bei null starten –
              wir bringen Sie zum fairen Marktpreis.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2">
            <PathExplainer
              icon={<ClipboardCheck className="h-6 w-6" />}
              tone="brand"
              tag="Reverse-Auktion"
              title="Bestehendes Angebot vergleichen"
              steps={[
                "Eckdaten Ihrer Wunschküche erfassen (Hersteller, Fronten, Arbeitsplatte, Geräte, Sanitär, Lieferung, Zahlung)",
                "Optional: Angebot, Grundriss und Bild hochladen",
                "Experte ruft Sie an und ergänzt Details",
                "72-h-Auktion: verifizierte Händler unterbieten Ihr Angebot",
                "Sie nehmen das beste Gebot verbindlich an",
              ]}
              cta={{ href: "/funnel/b", label: "Auktion starten" }}
            />
            <PathExplainer
              icon={<Search className="h-6 w-6" />}
              tone="accent"
              tag="Lead-Vermittlung"
              title="Angebot erhalten"
              steps={[
                "Küchenform und Stil wählen",
                "Anlass, Wünsche und Zeitrahmen angeben",
                "Budget & Wohnsituation (Miete / Eigentum) angeben",
                "PLZ und Kontaktdaten",
                "Bis zu 3 verifizierte Studios erstellen kostenlose Angebote",
              ]}
              cta={{ href: "/funnel/a", label: "Anfrage starten" }}
            />
          </div>
        </div>
      </section>

      {/* ======================== VORTEILE 6-GRID ======================== */}
      <section className="bg-surface-strong section-padding">
        <div className="section-container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="h-section">Warum KüchenWert?</h2>
            <p className="mt-3 text-lead">
              Wir kombinieren Marktdruck mit echtem Service – damit Sie
              nicht raten müssen, ob Ihr Preis fair ist.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Benefit
              icon={<Gavel className="h-5 w-5" />}
              title="Echte Reverse-Auktion"
              text="Verifizierte Händler unterbieten sich auf eine neutrale Spec-Liste – kein Vergleich von Äpfeln mit Birnen."
            />
            <Benefit
              icon={<ShieldCheck className="h-5 w-5" />}
              title="Verbindlich für beide Seiten"
              text="Der Sieger liefert zum Auktionspreis, Sie nehmen das beste Gebot an. Kein faules Spiel."
            />
            <Benefit
              icon={<Headphones className="h-5 w-5" />}
              title="Persönlicher Experte"
              text="Vor jeder Auktion ruft Sie ein Spec-Experte an und ergänzt fehlende Details."
            />
            <Benefit
              icon={<CheckCircle2 className="h-5 w-5" />}
              title="0 € für Verbraucher"
              text="Keine versteckten Kosten, keine Monatsgebühr. Wir verdienen ausschließlich an erfolgreichen Vermittlungen."
            />
            <Benefit
              icon={<Wallet className="h-5 w-5" />}
              title="Transparente Provision"
              text="Wir kommunizieren offen, was Händler an uns zahlen. Keine versteckte Marge auf Ihrer Küche."
            />
            <Benefit
              icon={<ShieldCheck className="h-5 w-5" />}
              title="DSGVO-konform"
              text="Daten in Deutschland gehostet. Kontaktdaten erst nach verbindlichem Lead-/Auktions-Abschluss sichtbar für Händler."
            />
          </div>
        </div>
      </section>

      {/* ======================== SO LÄUFT ES ======================== */}
      <section className="section-padding">
        <div className="section-container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="h-section">In 4 Schritten zum besten Preis</h2>
          </div>
          <ol className="mx-auto mt-12 grid max-w-5xl gap-6 md:grid-cols-4">
            <Step
              num={1}
              title="Pfad wählen"
              text="Bestehendes Angebot vergleichen oder neues erhalten."
            />
            <Step
              num={2}
              title="Daten erfassen"
              text="Alle relevanten Eckdaten in 2-5 Minuten eingeben."
            />
            <Step
              num={3}
              title="Experten-Check"
              text="Wir prüfen, rufen Sie an und ergänzen Details."
            />
            <Step
              num={4}
              title="Angebote / Auktion"
              text="Händler bieten – Sie wählen das beste Angebot."
            />
          </ol>
        </div>
      </section>

      {/* ======================== FAQ ======================== */}
      <section className="border-t border-slate-200 bg-white section-padding">
        <div className="section-container max-w-3xl">
          <div className="text-center">
            <h2 className="h-section">Häufig gestellte Fragen</h2>
          </div>
          <div className="mt-10 divide-y divide-slate-200">
            {FAQ.map((item) => (
              <details key={item.q} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-ink">
                  {item.q}
                  <span className="text-ink-subtle transition group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-ink-muted">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ======================== BOTTOM CTA ======================== */}
      <section className="bg-brand-950 py-16 lg:py-20">
        <div className="section-container text-center">
          <h2 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Bereit für den fairen Küchenpreis?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-brand-200">
            Wählen Sie Ihren Pfad – kostenlos und in 2 Minuten gestartet.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/funnel/b" className="btn-accent">
              Bestehendes Angebot vergleichen
            </Link>
            <Link href="/funnel/a" className="btn-secondary border-white/20 bg-transparent text-white hover:bg-white/10">
              Angebot erhalten
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

/* ---------------------- Sub-components ---------------------- */

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="font-display text-3xl font-bold text-brand-900 sm:text-4xl">{value}</div>
      <div className="mt-1 text-xs text-ink-muted sm:text-sm">{label}</div>
    </div>
  );
}

function Benefit({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="card">
      <span className="grid h-10 w-10 place-items-center rounded-md bg-accent-50 text-accent-700">
        {icon}
      </span>
      <h3 className="mt-4 text-base font-semibold text-ink">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-ink-muted">{text}</p>
    </div>
  );
}

function Step({ num, title, text }: { num: number; title: string; text: string }) {
  return (
    <li className="text-center">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-brand-700 font-bold text-white shadow-card-active">
        {num}
      </div>
      <h3 className="mt-4 text-base font-semibold text-ink">{title}</h3>
      <p className="mt-1.5 text-sm text-ink-muted">{text}</p>
    </li>
  );
}

function PathExplainer({
  icon,
  tone,
  tag,
  title,
  steps,
  cta,
}: {
  icon: React.ReactNode;
  tone: "brand" | "accent";
  tag: string;
  title: string;
  steps: string[];
  cta: { href: string; label: string };
}) {
  const toneClasses = tone === "brand"
    ? "bg-brand-100 text-brand-700"
    : "bg-accent-50 text-accent-700";
  return (
    <div className="card flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <span className={`grid h-12 w-12 place-items-center rounded-lg ${toneClasses}`}>
          {icon}
        </span>
        <div>
          <span className="text-xs font-semibold uppercase tracking-wide text-ink-subtle">
            {tag}
          </span>
          <h3 className="text-lg font-semibold text-ink">{title}</h3>
        </div>
      </div>
      <ol className="space-y-2.5 text-sm text-ink-muted">
        {steps.map((s, i) => (
          <li key={i} className="flex gap-2.5">
            <span className="mt-0.5 grid h-5 w-5 flex-none place-items-center rounded-full bg-surface-strong text-xs font-semibold text-ink">
              {i + 1}
            </span>
            <span>{s}</span>
          </li>
        ))}
      </ol>
      <Link href={cta.href} className={tone === "brand" ? "btn-primary" : "btn-accent"}>
        {cta.label} <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
