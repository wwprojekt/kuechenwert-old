import type { Metadata } from "next";
import Link from "next/link";
import { PlzInput } from "@/components/ui/plz-input";

interface Props {
  params: Promise<{ slug: string }>;
}

const ADVERTORIALS: Record<string, { title: string; hook: string; body: string[] }> = {
  "fehler-beim-kuechenkauf": {
    title: "Paukenschlag im Küchenmarkt: So vermeiden Sie die größten Fehler beim Küchenkauf",
    hook: "Tausende Deutsche zahlen jedes Jahr zu viel für ihre Küche – weil sie diese 5 Fehler machen.",
    body: [
      "Der Küchenkauf ist für die meisten Menschen eine der größten Anschaffungen nach dem Eigenheim. Trotzdem gehen viele Käufer unvorbereitet ins Küchenstudio – und zahlen am Ende deutlich mehr als nötig.",
      "Fehler Nr. 1: Nur ein einziges Angebot einholen. Ohne Vergleich fehlt jede Verhandlungsbasis. Studien zeigen, dass Käufer mit 2–3 Vergleichsangeboten im Schnitt 15–25 % sparen.",
      "Fehler Nr. 2: Versteckte Kosten übersehen. Lieferung, Montage, Elektro-Anschlüsse, Entsorgung der Altküche – all das fehlt oft im ersten Angebot.",
      "Fehler Nr. 3: Sich unter Druck setzen lassen. \"Dieses Angebot gilt nur heute\" ist ein klassischer Verkaufstrick. Ein seriöser Händler gibt Ihnen Zeit.",
      "Fehler Nr. 4: Kein festes Budget setzen. Ohne Obergrenze wird jeder Besuch im Studio teurer als geplant.",
      "Fehler Nr. 5: Keinen unabhängigen Check. Angebote sind schwer vergleichbar, wenn Ausstattungen nicht identisch aufgeschlüsselt sind.",
      "Die Lösung: KüchenWert neutralisiert Angebote, prüft versteckte Kosten und vermittelt bis zu 3 geprüfte Studios aus Ihrer Region – kostenlos und unverbindlich.",
    ],
  },
  "angebote-vergleichen": {
    title: "Küchenangebote vergleichen: Warum sich ein zweiter Blick immer lohnt",
    hook: "Ein Angebot allein sagt wenig. Erst der Vergleich zeigt, ob Preis und Leistung stimmen.",
    body: [
      "Sie haben ein Küchenangebot vor sich liegen und fragen sich: Ist das ein guter Preis? Die ehrliche Antwort: Ohne Vergleichswert wissen Sie es nicht.",
      "Küchenstudios kalkulieren unterschiedlich. Manche bieten günstige Fronten, aber teure Geräte. Andere locken mit Geräte-Paketen, legen aber bei der Montage drauf.",
      "Der einzige Weg zu Klarheit: Vergleichbare Angebote von mehreren Studios – idealerweise auf Basis identischer Ausstattung (gleiche Geräte, gleiches Material, gleiche Maße).",
      "KüchenWert macht genau das: Wir neutralisieren Ihr bestehendes Angebot, erstellen ein strukturiertes Anforderungsprofil und lassen passende Studios aus Ihrer Region ein Gegenangebot erstellen.",
      "So sehen Sie auf einen Blick, wo Sie fair behandelt werden – und wo nicht. Ohne Kosten, ohne Verpflichtung.",
    ],
  },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return { title: ADVERTORIALS[slug]?.title ?? "KüchenWert" };
}

export default async function AdvertorialPage({ params }: Props) {
  const { slug } = await params;
  const article = ADVERTORIALS[slug];

  if (!article) {
    return (
      <div className="section-container py-16">
        <h1 className="text-2xl font-bold">Seite nicht gefunden</h1>
      </div>
    );
  }

  return (
    <div className="section-container py-16">
      <article className="mx-auto max-w-3xl">
        <p className="text-sm font-medium text-brand-700">Sponsored</p>
        <h1 className="mt-2 text-3xl font-bold leading-tight tracking-tight lg:text-4xl">
          {article.title}
        </h1>
        <p className="mt-4 text-lg font-medium text-zinc-700">{article.hook}</p>

        <div className="mt-8 space-y-5 text-zinc-600">
          {article.body.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>

        <div className="mt-12 rounded-2xl bg-brand-50 p-8 text-center">
          <h2 className="text-xl font-bold">Jetzt kostenlos Angebote vergleichen</h2>
          <p className="mt-2 text-sm text-zinc-600">
            Geben Sie Ihre PLZ ein und starten Sie den unverbindlichen Vergleich.
          </p>
          <div className="mx-auto mt-6 max-w-md">
            <PlzInput size="large" />
          </div>
        </div>
      </article>
    </div>
  );
}

export function generateStaticParams() {
  return Object.keys(ADVERTORIALS).map((slug) => ({ slug }));
}
