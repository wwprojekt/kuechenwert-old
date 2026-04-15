export interface KitchenFormConfig {
  slug: string;
  name: string;
  tagline: string;
  heroDescription: string;
  gradient: string;
  advantages: string[];
  idealFor: string[];
  minSpace: string;
  priceRange: string;
  seoTitle: string;
  seoDescription: string;
  sections: {
    title: string;
    content: string;
  }[];
}

export const KITCHEN_FORMS: KitchenFormConfig[] = [
  {
    slug: "kuechenzeile",
    name: "Küchenzeile",
    tagline: "Kompakt, effizient, platzsparend",
    heroDescription:
      "Die Küchenzeile ist die platzsparendste Küchenlösung. Alle Elemente – Spüle, Herd und Kühlschrank – sind in einer Reihe angeordnet. Ideal für kleine Räume und Single-Haushalte.",
    gradient: "from-blue-700 to-blue-900",
    advantages: [
      "Minimaler Platzbedarf",
      "Günstigste Küchenlösung",
      "Einfache Planung und Montage",
      "Ideal für Mietwohnungen",
      "Alle wichtigen Funktionen auf kleinem Raum",
    ],
    idealFor: ["Single-Haushalte", "Kleine Küchen", "Mietwohnungen", "Zweitküchen"],
    minSpace: "Ab 2,4 m Wandlänge",
    priceRange: "3.000 – 12.000 €",
    seoTitle: "Küchenzeile – Kompakte Küche planen & kaufen",
    seoDescription:
      "Küchenzeile: Die platzsparendste Küchenlösung. Vorteile, Kosten, Planungstipps und Angebote für Ihre kompakte Küche.",
    sections: [
      {
        title: "Für wen eignet sich eine Küchenzeile?",
        content:
          "Die Küchenzeile ist die beste Wahl, wenn der Platz begrenzt ist. In einer Einzimmerwohnung, einer Studentenbude oder als Zweitküche im Ferienhaus bietet sie alle wichtigen Funktionen auf minimalem Raum. Auch in offenen Wohnküchen kann eine Küchenzeile als schlanke Lösung überzeugen, wenn die Kochgewohnheiten eher unkompliziert sind.",
      },
      {
        title: "Planung und Ergonomie",
        content:
          "Bei einer Küchenzeile ist die Anordnung der drei Hauptzonen (Spülen, Zubereiten, Kochen) besonders wichtig. Die kurzen Wege sind ein Vorteil, aber bei über 4 Metern Länge werden die Laufwege wieder lang. Hängeschränke und geschickte Innenorganisation sind entscheidend, um den begrenzten Stauraum optimal zu nutzen.",
      },
      {
        title: "Kosten und Sparpotenzial",
        content:
          "Küchenzeilen sind die günstigste Küchenform. Einfache Modelle starten bei 3.000 €, hochwertige Ausführungen mit guten Geräten kosten 8.000 – 12.000 €. Tipp: Bei einer Küchenzeile lohnt sich die Investition in gute Elektrogeräte besonders, da weniger in Schranksysteme fließen muss.",
      },
    ],
  },
  {
    slug: "l-form",
    name: "L-Küche",
    tagline: "Vielseitig, ergonomisch, beliebt",
    heroDescription:
      "Die L-Küche nutzt zwei Wände über Eck und schafft so ein natürliches Arbeitsdreieck. Sie ist die beliebteste Küchenform in Deutschland – vielseitig und ergonomisch.",
    gradient: "from-emerald-700 to-emerald-900",
    advantages: [
      "Natürliches Arbeitsdreieck",
      "Guter Stauraum über Eck",
      "Kompatibel mit offenen Wohnräumen",
      "Platz für Essbereich",
      "Hohe Ergonomie",
    ],
    idealFor: ["Mittelgroße Küchen", "Familien", "Offene Wohnküchen", "Vielseitige Grundrisse"],
    minSpace: "Ab 6 m² Grundfläche",
    priceRange: "6.000 – 20.000 €",
    seoTitle: "L-Küche – Die beliebteste Küchenform planen",
    seoDescription:
      "L-Küche: Deutschlands beliebteste Küchenform. Vorteile, Maße, Kosten und Planungstipps für Ihre L-Form-Küche.",
    sections: [
      {
        title: "Warum ist die L-Küche so beliebt?",
        content:
          "Die L-Form ist die beliebteste Küchenform in Deutschland – und das aus gutem Grund. Sie nutzt zwei Wände über Eck, wodurch ein natürliches Arbeitsdreieck zwischen Spüle, Herd und Kühlschrank entsteht. Die offene Seite kann als Essbereich oder für eine Kochinsel genutzt werden. In offenen Wohnräumen trennt sie elegant den Kochbereich vom Wohnbereich.",
      },
      {
        title: "Planung der Eckzone",
        content:
          "Der Eckbereich ist bei L-Küchen die größte Herausforderung – und die größte Chance. Moderne Eckschrank-Lösungen wie Karussellauszüge, LeMans-Böden oder Magic Corner-Systeme nutzen den Platz optimal. Planen Sie den Eckbereich sorgfältig, denn hier geht am meisten Stauraum verloren oder gewonnen.",
      },
      {
        title: "Kosten",
        content:
          "Eine L-Küche kostet in der Regel zwischen 6.000 und 20.000 €. Die Eckschrank-Lösung ist ein wesentlicher Preisfaktor: Ein einfacher Eckschrank kostet wenige hundert Euro, ein hochwertiger LeMans-Auszug bis zu 1.500 €.",
      },
    ],
  },
  {
    slug: "u-form",
    name: "U-Küche",
    tagline: "Maximaler Stauraum auf drei Seiten",
    heroDescription:
      "Die U-Küche nutzt drei Wände und bietet so maximalen Stauraum und Arbeitsfläche. Ideal für leidenschaftliche Köche, die viel Platz brauchen.",
    gradient: "from-orange-700 to-orange-900",
    advantages: [
      "Maximaler Stauraum",
      "Sehr große Arbeitsfläche",
      "Kurze Laufwege",
      "Optimal für engagierte Köche",
      "Ergonomisches Arbeitsdreieck",
    ],
    idealFor: ["Große geschlossene Küchen", "Vielkocher", "Familien mit viel Geschirr"],
    minSpace: "Ab 10 m² Grundfläche",
    priceRange: "10.000 – 30.000 €",
    seoTitle: "U-Küche – Maximaler Stauraum, perfekte Ergonomie",
    seoDescription:
      "U-Küche: Drei Seiten Arbeitsfläche und Stauraum. Vorteile, Mindestmaße, Kosten und Planungstipps für die U-Form.",
    sections: [
      {
        title: "Wann lohnt sich eine U-Küche?",
        content:
          "Die U-Küche ist die richtige Wahl, wenn ausreichend Platz vorhanden ist (mindestens 10 m²) und maximaler Stauraum gefragt ist. Sie bietet die meiste Arbeitsfläche aller Küchenformen und eignet sich hervorragend für Haushalte, die viel und gerne kochen. In geschlossenen Küchenräumen spielt sie ihre Stärken voll aus.",
      },
      {
        title: "Ergonomie und Bewegungsfreiheit",
        content:
          "Zwischen den beiden gegenüberliegenden Zeilen sollten mindestens 120 cm Abstand sein, besser 150 cm. So können Schränke und Auszüge problemlos geöffnet werden und zwei Personen können aneinander vorbeigehen. Das Arbeitsdreieck ist bei einer U-Küche natürlich ergonomisch, da alle Zonen nah beieinander liegen.",
      },
      {
        title: "Kosten und Alternativen",
        content:
          "Eine U-Küche ist durch die drei Zeilen die teuerste Standardform: Rechnen Sie mit 10.000 bis 30.000 €. Alternativ können Sie eine U-Küche mit einer halbhohen Theke statt einer dritten vollen Zeile planen – das spart Kosten und schafft einen Essplatz.",
      },
    ],
  },
  {
    slug: "g-form",
    name: "G-Küche",
    tagline: "Die erweiterte U-Form mit Halbinsel",
    heroDescription:
      "Die G-Küche erweitert die U-Form um eine Halbinsel oder Theke. Sie bietet noch mehr Arbeitsfläche und fungiert gleichzeitig als Raumteiler.",
    gradient: "from-rose-700 to-rose-900",
    advantages: [
      "Noch mehr Stauraum als U-Form",
      "Integrierter Thekenbereich",
      "Natürlicher Raumteiler",
      "Kommunikative Kochzone",
      "Viel Abstellfläche",
    ],
    idealFor: ["Große offene Wohnküchen", "Hobbyköche", "Gesellige Haushalte"],
    minSpace: "Ab 12 m² Grundfläche",
    priceRange: "12.000 – 35.000 €",
    seoTitle: "G-Küche – Die erweiterte U-Form mit Theke",
    seoDescription:
      "G-Küche: Die U-Form mit Halbinsel. Vorteile, Platzbedarf, Kosten und Planungstipps für Ihre G-Form-Küche.",
    sections: [
      {
        title: "Was ist eine G-Küche?",
        content:
          "Die G-Küche ist im Grunde eine U-Küche, bei der eine Seite zu einer Halbinsel oder Theke verlängert wird. Das 'G' entsteht durch die nach innen ragende vierte Seite. Diese Halbinsel kann als Frühstücksbar, zusätzliche Arbeitsfläche oder Raumteiler zwischen Küche und Wohnbereich dienen.",
      },
      {
        title: "Vor- und Nachteile",
        content:
          "Vorteile: Maximaler Stauraum und Arbeitsfläche, kommunikative Kochzone, natürlicher Raumteiler. Nachteile: Benötigt viel Platz, kann in kleinen Räumen erdrückend wirken, die Halbinsel schränkt die Durchgangsmöglichkeiten ein. Mindestens 12 m² Grundfläche sind nötig.",
      },
      {
        title: "Kosten",
        content:
          "Eine G-Küche kostet durch die vierte Seite entsprechend mehr als eine U-Küche: 12.000 bis 35.000 € sind realistisch. Die Halbinsel kann als Theke mit Barhockern gestaltet werden, was einen separaten Esstisch überflüssig machen kann.",
      },
    ],
  },
  {
    slug: "kochinsel",
    name: "Küche mit Kochinsel",
    tagline: "Das Herzstück offener Wohnküchen",
    heroDescription:
      "Die Kochinsel ist das Traumelement vieler Küchenplanungen. Als freistehende Einheit im Raum wird sie zum Mittelpunkt des Wohnens – zum Kochen, Essen und Kommunizieren.",
    gradient: "from-indigo-700 to-indigo-900",
    advantages: [
      "Zentraler Mittelpunkt des Raums",
      "Kommunikatives Kochen",
      "Zusätzliche Arbeitsfläche",
      "Repräsentatives Design",
      "Vielseitig nutzbar (Kochen, Essen, Arbeiten)",
    ],
    idealFor: ["Offene Wohnküchen", "Neue Häuser", "Designbewusste Küchenliebhaber"],
    minSpace: "Ab 15 m² Grundfläche",
    priceRange: "15.000 – 50.000+ €",
    seoTitle: "Kochinsel – Traumküche mit freistehender Insel planen",
    seoDescription:
      "Küche mit Kochinsel: Das Herzstück offener Wohnküchen. Planung, Anschlüsse, Kosten und Design-Inspiration.",
    sections: [
      {
        title: "Warum eine Kochinsel?",
        content:
          "Eine Kochinsel verwandelt die Küche von einem reinen Arbeitsraum in einen Lebensmittelpunkt. Hier wird gekocht, gegessen, geplaudert und manchmal auch gearbeitet. In offenen Grundrissen definiert sie den Kochbereich, ohne Wände zu brauchen. Es ist kein Zufall, dass die Kochinsel auf Platz 1 der Küchenwünsche steht.",
      },
      {
        title: "Planung und Anschlüsse",
        content:
          "Die größte Herausforderung bei einer Kochinsel sind die Anschlüsse: Für Kochfeld und Spüle in der Insel müssen Strom, Wasser und Abwasser durch den Boden geführt werden. Ein Muldenlüfter oder eine Inseldunstabzugshaube muss eingeplant werden. Rund um die Insel sollten mindestens 90 cm Bewegungsfreiraum vorhanden sein, besser 120 cm.",
      },
      {
        title: "Kosten",
        content:
          "Eine Küche mit Kochinsel ist die teuerste Küchenlösung: 15.000 € als Einstieg, Premium-Varianten mit Naturstein-Arbeitsplatte und hochwertigen Geräten schnell 30.000 – 50.000 €+. Die Insel selbst macht etwa 30–40% der Gesamtkosten aus.",
      },
    ],
  },
  {
    slug: "zweizeilig",
    name: "Zweizeilige Küche",
    tagline: "Zwei parallele Zeilen, maximale Effizienz",
    heroDescription:
      "Die zweizeilige Küche (auch Galley Kitchen) ordnet zwei Küchenzeilen gegenüber an. Sie bietet auf vergleichsweise wenig Grundfläche viel Arbeitsfläche und Stauraum.",
    gradient: "from-teal-700 to-teal-900",
    advantages: [
      "Gute Raumnutzung bei schmalem Grundriss",
      "Kurze Laufwege",
      "Viel Stauraum auf zwei Seiten",
      "Professionelle Anmutung",
      "Effizientes Arbeitsdreieck",
    ],
    idealFor: ["Schmale, lange Küchenräume", "Durchgangsküchen", "Profiköche"],
    minSpace: "Ab 8 m² (mind. 2,5 m Raumbreite)",
    priceRange: "8.000 – 25.000 €",
    seoTitle: "Zweizeilige Küche – Effizient planen & einrichten",
    seoDescription:
      "Zweizeilige Küche: Zwei parallele Zeilen für maximale Effizienz. Vorteile, Mindestmaße, Kosten und Planungstipps.",
    sections: [
      {
        title: "Wann eignet sich eine zweizeilige Küche?",
        content:
          "Die zweizeilige Küche ist ideal für schmale, längliche Räume, in denen eine L- oder U-Form nicht funktioniert. In Profiküchen ist sie Standard, weil die parallele Anordnung extrem effiziente Arbeitsabläufe ermöglicht. Auch in Durchgangsküchen (mit einer Tür an jedem Ende) ist sie oft die einzige sinnvolle Lösung.",
      },
      {
        title: "Ergonomie und Abstände",
        content:
          "Der Abstand zwischen den beiden Zeilen sollte 120 bis 150 cm betragen. So können Schranktüren und Auszüge gleichzeitig geöffnet werden. Die ideale Aufteilung: eine Seite für die 'nasse Zone' (Spüle, Geschirrspüler), die andere für die 'heiße Zone' (Herd, Backofen).",
      },
      {
        title: "Kosten",
        content:
          "Eine zweizeilige Küche liegt preislich zwischen einer L-Form und einer U-Form: 8.000 bis 25.000 € sind üblich. Die Kosten hängen stark von der Länge der Zeilen und der gewählten Geräteausstattung ab.",
      },
    ],
  },
];
