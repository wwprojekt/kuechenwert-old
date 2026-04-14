import type { Metadata } from "next";
import Link from "next/link";

interface Props { params: Promise<{ slug: string }> }

const CONTENT: Record<string, { title: string; body: string }> = {
  "was-kostet-eine-kueche": {
    title: "Was kostet eine Küche? Budget-Guide 2026",
    body: "Eine neue Küche kostet je nach Ausstattung, Material und Marke zwischen 3.000 € und weit über 30.000 €. Die wichtigsten Kostentreiber sind Fronten, Arbeitsplatten, Elektrogeräte und Montage. Eine realistische Planung beginnt mit einem ehrlichen Budget-Rahmen.\n\nBasis-Küchen (3.000–8.000 €) bieten solide Qualität für Einsteiger. Im mittleren Segment (8.000–15.000 €) erhalten Sie markentypische Geräte und langlebige Oberflächen. Premium-Küchen (15.000–25.000 €+) setzen auf Materialien wie Keramik, echtes Holz und High-End-Geräte.\n\nTipp: Holen Sie mindestens 2–3 Vergleichsangebote ein. Bei KüchenWert können Sie das kostenlos und unverbindlich tun.",
  },
  "arbeitsplatten-vergleich": {
    title: "Arbeitsplatten im Vergleich: Granit, Quarz, Keramik & Co.",
    body: "Die Arbeitsplatte prägt Look und Nutzbarkeit Ihrer Küche. Granit ist robust und hitzebeständig, aber pflegeintensiver als Quarz-Komposit. Keramik-Arbeitsplatten sind kratzfest und hygienisch, aber teurer. Holz bringt Wärme, braucht aber regelmäßige Pflege.\n\nPreise pro laufendem Meter (inkl. Einbau): Laminat ab 80 €, Massivholz ab 200 €, Granit ab 250 €, Quarz-Komposit ab 300 €, Keramik ab 400 €.\n\nWichtig: Die Arbeitsplatte macht oft 5–15 % der Gesamtkosten aus. Sparen Sie hier nicht am falschen Ende.",
  },
  "versteckte-kosten-kuechenkauf": {
    title: "Versteckte Kosten beim Küchenkauf vermeiden",
    body: "Viele Küchenangebote wirken günstiger, als sie sind. Häufige versteckte Posten: Lieferung und Montage (500–2.000 €), Elektro-/Wasseranschlüsse (200–800 €), Demontage der Altküche (150–500 €), Sockelleisten und Nischenrückwände.\n\nSo schützen Sie sich: Fordern Sie ein Komplettangebot inkl. aller Nebenkosten. Vergleichen Sie nur Angebote mit identischem Leistungsumfang. Bei KüchenWert neutralisieren wir Angebote, damit Sie echte Äpfel-mit-Äpfel-Vergleiche erhalten.",
  },
  "kuechenplanung-checkliste": {
    title: "Checkliste Küchenplanung: Nichts vergessen",
    body: "Eine gute Küchenplanung beginnt mit dem Aufmaß. Messen Sie Raummaße, Fenster, Türen, Steckdosen und Anschlüsse exakt aus. Klären Sie: Welche Geräte brauche ich? Welche Stauraumlösung passt? Brauche ich eine Kochinsel oder reicht eine L-Form?\n\nWeitere Punkte: Beleuchtungskonzept, Abfallsystem, Arbeitshöhe (Ergonomie), Belüftung (Dunstabzug vs. Muldenlüfter).\n\nLaden Sie unsere kostenlose Planungscheckliste als PDF herunter – damit vergessen Sie nichts.",
  },
  "kuechenstudio-besuch-tipps": {
    title: "10 Tipps für den Küchenstudio-Besuch",
    body: "1. Bringen Sie einen Grundriss mit genauen Maßen mit.\n2. Setzen Sie ein festes Budget – und kommunizieren Sie es.\n3. Fragen Sie nach den enthaltenen Leistungen (Montage, Lieferung, Entsorgung).\n4. Lassen Sie sich Geräte vorführen.\n5. Prüfen Sie die Vertragsbedingungen vor Unterschrift.\n6. Fragen Sie nach Garantiezeiten.\n7. Vergleichen Sie mindestens 2 Angebote.\n8. Achten Sie auf die Zahlungsbedingungen (Anzahlung, Restzahlung).\n9. Fragen Sie nach Referenzen oder Bewertungen.\n10. Nehmen Sie sich Zeit – lassen Sie sich nicht unter Druck setzen.",
  },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return { title: CONTENT[slug]?.title ?? "Ratgeber" };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = CONTENT[slug];

  if (!article) {
    return <div className="section-container py-16"><h1 className="text-2xl font-bold">Artikel nicht gefunden</h1></div>;
  }

  return (
    <div className="section-container py-16">
      <Link href="/ratgeber" className="text-sm text-zinc-500 hover:text-zinc-700">← Alle Ratgeber</Link>
      <h1 className="mt-4 text-3xl font-bold tracking-tight">{article.title}</h1>
      <div className="prose mt-8 max-w-none text-zinc-600">
        {article.body.split("\n\n").map((p, i) => <p key={i} className="mt-4">{p}</p>)}
      </div>
      <div className="mt-12 rounded-2xl bg-brand-50 p-8 text-center">
        <h2 className="text-xl font-bold">Bereit für den nächsten Schritt?</h2>
        <p className="mt-2 text-sm text-zinc-600">Vergleichen Sie jetzt kostenlos regionale Angebote.</p>
        <Link href="/funnel/kuechenform" className="btn-primary mt-4 inline-block">Angebote erhalten</Link>
      </div>
    </div>
  );
}

export function generateStaticParams() {
  return Object.keys(CONTENT).map((slug) => ({ slug }));
}
