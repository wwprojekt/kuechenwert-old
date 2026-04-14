import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Ratgeber – Küchenwissen" };

const ARTICLES = [
  { slug: "was-kostet-eine-kueche", title: "Was kostet eine Küche? Budget-Guide 2026", excerpt: "Von der Einsteiger-Küche bis zur Luxus-Ausstattung: So setzen Sie Ihr Budget realistisch an." },
  { slug: "arbeitsplatten-vergleich", title: "Arbeitsplatten im Vergleich: Granit, Quarz, Keramik & Co.", excerpt: "Material, Pflege, Preis – der objektive Vergleich der beliebtesten Arbeitsflächen." },
  { slug: "versteckte-kosten-kuechenkauf", title: "Versteckte Kosten beim Küchenkauf vermeiden", excerpt: "Auf diese Positionen im Angebot sollten Sie besonders achten." },
  { slug: "kuechenplanung-checkliste", title: "Checkliste Küchenplanung: Nichts vergessen", excerpt: "Vom Aufmaß bis zur Steckdose – die komplette Planungsliste für Ihre neue Küche." },
  { slug: "kuechenstudio-besuch-tipps", title: "10 Tipps für den Küchenstudio-Besuch", excerpt: "Welche Fragen Sie stellen sollten und worauf Sie bei Verträgen achten müssen." },
];

export default function RatgeberPage() {
  return (
    <div className="section-container py-16">
      <h1 className="text-3xl font-bold tracking-tight">Ratgeber</h1>
      <p className="mt-2 text-zinc-600">Expertenwissen rund um den Küchenkauf – unabhängig und verständlich.</p>

      <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {ARTICLES.map((a) => (
          <Link key={a.slug} href={`/ratgeber/${a.slug}`} className="card group transition hover:shadow-md">
            <h2 className="font-semibold text-zinc-900 group-hover:text-brand-700">{a.title}</h2>
            <p className="mt-2 text-sm text-zinc-500">{a.excerpt}</p>
            <p className="mt-4 text-xs font-medium text-brand-600">Weiterlesen →</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
