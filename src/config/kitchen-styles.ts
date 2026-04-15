export interface KitchenStyleConfig {
  slug: string;
  name: string;
  tagline: string;
  heroDescription: string;
  gradient: string;
  characteristics: string[];
  materials: string[];
  priceRange: string;
  seoTitle: string;
  seoDescription: string;
  sections: {
    title: string;
    content: string;
  }[];
}

export const KITCHEN_STYLES: KitchenStyleConfig[] = [
  {
    slug: "modern",
    name: "Moderne Küche",
    tagline: "Klare Linien, grifflos, zeitlos elegant",
    heroDescription:
      "Die moderne Küche steht für Minimalismus, funktionale Eleganz und hochwertige Materialien. Grifflose Fronten, integrierte Geräte und eine aufgeräumte Optik machen sie zum architektonischen Statement.",
    gradient: "from-zinc-800 to-zinc-950",
    characteristics: [
      "Grifflose Fronten (Push-to-Open oder Griffleisten)",
      "Glatte, matte oder hochglänzende Oberflächen",
      "Integrierte Gerätezeile",
      "Versteckte Stauraumlösungen",
      "Kochinsel als zentrales Element",
      "Zurückhaltende Farbpalette",
    ],
    materials: ["Lackierte MDF-Fronten", "Keramik-Arbeitsplatten", "Edelstahl-Elemente", "Glas-Rückwände"],
    priceRange: "12.000 – 40.000+ €",
    seoTitle: "Moderne Küche – Stile, Preise & Inspiration",
    seoDescription:
      "Alles über moderne Küchen: Grifflose Fronten, Materialien, Kosten und Planungstipps. Lassen Sie sich inspirieren und finden Sie Ihr Küchenstudio.",
    sections: [
      {
        title: "Was zeichnet eine moderne Küche aus?",
        content:
          "Moderne Küchen folgen dem Prinzip 'weniger ist mehr'. Sie zeichnen sich durch klare Linien, symmetrische Formen und eine aufgeräumte Optik aus. Grifflose Fronten, die per Push-to-Open oder mit dezenten Griffleisten bedient werden, sind das Markenzeichen. Die Farbpalette reicht von reinem Weiß über Grautöne bis hin zu mattem Schwarz – oft kombiniert mit warmen Holzakzenten.",
      },
      {
        title: "Materialien und Oberflächen",
        content:
          "Bei modernen Küchen kommen hochwertige Materialien zum Einsatz: Lackierte oder folierte MDF-Fronten, Keramik- oder Quarz-Komposit-Arbeitsplatten, Edelstahl für Geräte und Griffe, sowie Glas für Rückwände und Vitrinen. Besonders beliebt sind Anti-Fingerprint-Beschichtungen, die matte Oberflächen pflegeleicht machen.",
      },
      {
        title: "Planung und Kosten",
        content:
          "Eine moderne Küche beginnt bei etwa 12.000 € für Standardausführungen und kann bei Premium-Marken mit Kochinsel und hochwertigen Geräten deutlich über 40.000 € kosten. Die größten Kostentreiber sind die Arbeitsplatte, Elektrogeräte und die Frontenqualität. Eine individuelle Planung durch ein Fachstudio ist bei diesem Stil besonders empfehlenswert.",
      },
    ],
  },
  {
    slug: "klassisch",
    name: "Klassische Küche",
    tagline: "Zeitlos schön, funktional durchdacht",
    heroDescription:
      "Die klassische Küche verbindet bewährtes Design mit moderner Funktionalität. Rahmenfronten, dezente Griffe und warme Farbtöne schaffen eine zeitlose Atmosphäre.",
    gradient: "from-stone-700 to-stone-900",
    characteristics: [
      "Rahmenfronten mit dezenten Profilen",
      "Klassische Bügelgriffe oder Knöpfe",
      "Warme, gedeckte Farbtöne",
      "Kranzleisten und Sockelblenden",
      "Glasvitrinen für Geschirr",
      "Symmetrische Anordnung",
    ],
    materials: ["Echtholz oder Holzdekor-Fronten", "Granit- oder Quarz-Arbeitsplatten", "Keramik-Spülbecken", "Messing- oder Chrom-Beschläge"],
    priceRange: "8.000 – 30.000 €",
    seoTitle: "Klassische Küche – Zeitloses Design & Planung",
    seoDescription:
      "Klassische Küchen: Rahmenfronten, warme Materialien und durchdachte Funktionalität. Preise, Tipps und Inspiration für Ihre zeitlose Küche.",
    sections: [
      {
        title: "Was macht eine klassische Küche aus?",
        content:
          "Klassische Küchen stehen für zeitlose Eleganz und bewährte Designs. Rahmenfronten mit dezenten Profilen, warme Farben wie Creme, Vanille oder Salbeigrün und hochwertige Griffe aus Messing oder Edelstahl sind typische Erkennungsmerkmale. Anders als bei der Landhausküche ist der Stil weniger rustikal und mehr auf schlichte Eleganz ausgerichtet.",
      },
      {
        title: "Materialien und Qualität",
        content:
          "Bei klassischen Küchen wird oft Echtholz oder hochwertiger Holzdekor für die Fronten verwendet. Arbeitsplatten aus Granit oder Quarz-Komposit sind beliebt, da sie robust und pflegeleicht sind. Kranzleisten, Pilaster und Glasvitrinen geben der Küche ihren charakteristischen Look.",
      },
      {
        title: "Planung und Kosten",
        content:
          "Eine klassische Küche ist oft etwas günstiger als eine moderne, da auf aufwendige Push-to-Open-Systeme verzichtet wird. Rechnen Sie mit 8.000 bis 30.000 € je nach Größe, Materialwahl und Geräteausstattung.",
      },
    ],
  },
  {
    slug: "landhaus",
    name: "Landhausküche",
    tagline: "Natürlich, warm, einladend",
    heroDescription:
      "Die Landhausküche schafft eine Atmosphäre wie im Urlaub. Natürliche Materialien, verspielte Details und warme Farben machen sie zum Herzen des Hauses.",
    gradient: "from-amber-700 to-amber-900",
    characteristics: [
      "Kassettenfronten mit markanten Profilen",
      "Offene Regale und Vitrinen",
      "Natürliche Materialien wie Massivholz",
      "Dekorative Knauf- und Muschelgriffe",
      "Spülstein aus Keramik",
      "Warme Farben: Creme, Salbei, Pastellblau",
    ],
    materials: ["Massivholz-Fronten (Eiche, Kiefer)", "Naturstein oder Holz-Arbeitsplatten", "Keramik-Spülstein", "Schmiedeeisen-Details"],
    priceRange: "10.000 – 35.000 €",
    seoTitle: "Landhausküche – Gemütlich planen & einrichten",
    seoDescription:
      "Landhausküchen: Kassettenfronten, Naturmaterialien und ländlicher Charme. Stile, Preise und Planungstipps für Ihre Landhausküche.",
    sections: [
      {
        title: "Der Charme der Landhausküche",
        content:
          "Landhausküchen versprühen eine warme, einladende Atmosphäre. Ihr Markenzeichen sind Kassettenfronten mit ausgeprägten Profilen, offene Regale für Geschirr und Gewürze und natürliche Materialien wie Massivholz und Naturstein. Dekorative Elemente wie Kränze, Porzellan und frische Kräuter gehören dazu.",
      },
      {
        title: "Moderne Landhausküche",
        content:
          "Der moderne Landhausstil kombiniert traditionelle Elemente mit zeitgemäßer Technik. Induktionsherde, integrierte Dunstabzüge und Soft-Close-Auszüge finden selbstverständlich ihren Platz. Die Farbpalette hat sich um elegante Töne wie Salbeigrün, Taubenblau und Anthrazit erweitert.",
      },
      {
        title: "Kosten und Planung",
        content:
          "Eine Landhausküche kostet zwischen 10.000 und 35.000 €. Massivholzfronten und ein Keramik-Spülstein treiben den Preis nach oben. Wichtig ist die Wahl eines Studios, das Erfahrung mit dem Landhausstil hat – denn die vielen Details erfordern handwerkliches Können.",
      },
    ],
  },
  {
    slug: "industrial",
    name: "Industrieküche",
    tagline: "Rau, urban, charakterstark",
    heroDescription:
      "Die Industrial-Küche bringt den Charme einer Loft-Wohnung in Ihr Zuhause. Offene Strukturen, raue Materialien und eine Mischung aus Funktion und Ästhetik.",
    gradient: "from-stone-600 to-stone-800",
    characteristics: [
      "Offene Metallregale und Rohrleitungen",
      "Beton- oder Naturstein-Oberflächen",
      "Dunkle Farbpalette: Schwarz, Anthrazit, Rostbraun",
      "Holz-Metall-Kombinationen",
      "Sichtbare Geräte und Utensilien",
      "Großformatige Fliesen oder Betonboden",
    ],
    materials: ["Beton oder Beton-Optik", "Edelstahl-Elemente", "Recyceltes Holz", "Sichtbare Metalloberflächen"],
    priceRange: "12.000 – 40.000 €",
    seoTitle: "Industrial-Küche – Loft-Charme für Ihr Zuhause",
    seoDescription:
      "Industrial-Küchen: Beton, Metall und rohes Holz. Erfahren Sie alles über den Loft-Stil, Materialien, Kosten und Planung.",
    sections: [
      {
        title: "Was ist eine Industrial-Küche?",
        content:
          "Der Industrial-Stil stammt aus umgebauten Fabrikhallen und Loft-Wohnungen. In der Küche bedeutet das: sichtbare Installationen, offene Metallregale, Beton-Arbeitsplatten und eine bewusst raue Ästhetik. Dieser Stil lebt von Kontrasten – rohes Metall trifft auf warmes Holz, matte Oberflächen auf glänzenden Edelstahl.",
      },
      {
        title: "Materialien und Umsetzung",
        content:
          "Echte Betonarbeitsplatten sind schwer und teuer, aber es gibt hervorragende Beton-Optik-Alternativen aus Keramik oder Mineralwerkstoff. Offene Stahlregale lassen sich als Custom-Lösung anfertigen. Recyceltes Holz für Fronten oder Regale gibt der Küche Wärme und Charakter.",
      },
      {
        title: "Kosten und Planung",
        content:
          "Eine Industrial-Küche liegt preislich bei 12.000 bis 40.000 € – je nachdem, wie authentisch die Materialien sein sollen. Custom-Metalllösungen und echte Beton-Elemente sind die größten Kostentreiber. Ein Studio mit Erfahrung im Bereich Individualküchen ist hier besonders wichtig.",
      },
    ],
  },
  {
    slug: "skandinavisch",
    name: "Skandinavische Küche",
    tagline: "Hell, funktional, hygge",
    heroDescription:
      "Die skandinavische Küche verbindet Helligkeit, natürliche Materialien und durchdachte Funktionalität. Wenige, aber ausgewählte Elemente schaffen eine Atmosphäre der Gelassenheit.",
    gradient: "from-sky-200 to-sky-400",
    characteristics: [
      "Helle, weiße Grundfarben",
      "Natürliches Holz (Eiche, Birke, Esche)",
      "Grifflose oder minimalistische Griffe",
      "Offene Regale für ausgewählte Objekte",
      "Viel Tageslicht und Pflanzen",
      "Funktionale, aufgeräumte Ordnung",
    ],
    materials: ["Helle Holzfronten (Eiche, Birke)", "Stein-Komposit-Arbeitsplatten", "Keramik-Waschbecken", "Leinenvorhänge und Textilien"],
    priceRange: "8.000 – 25.000 €",
    seoTitle: "Skandinavische Küche – Nordischer Stil & Planung",
    seoDescription:
      "Skandinavische Küchen: Helles Holz, klare Formen und funktionaler Minimalismus. Materialien, Preise und Planungstipps.",
    sections: [
      {
        title: "Nordische Küchenphilosophie",
        content:
          "Skandinavisches Design folgt dem Prinzip, dass schöne Dinge auch funktional sein sollten. In der Küche bedeutet das: helle Farben für mehr Licht, natürliches Holz für Wärme, und durchdachte Stauraumlösungen für Ordnung. Wenige, aber ausgewählte Dekoelemente – eine Grünpflanze, ein schöner Keramik-Becher – geben dem Raum Persönlichkeit.",
      },
      {
        title: "Materialien und Farben",
        content:
          "Weiß ist die Grundfarbe, ergänzt durch helle Holztöne (Eiche, Birke, Esche). Arbeitsplatten aus hellem Stein-Komposit oder geöltem Holz sind typisch. Schwarze Akzente durch Armaturen oder Lampen setzen Kontraste. Textilien wie Leinenstoffe und handgemachte Keramik sorgen für die berühmte 'Hygge'-Atmosphäre.",
      },
      {
        title: "Kosten und Planung",
        content:
          "Skandinavische Küchen sind oft überraschend erschwinglich: 8.000 bis 25.000 € sind realistisch. Der Schlüssel liegt nicht in teuren Materialien, sondern in einer durchdachten Planung und hoher Verarbeitungsqualität.",
      },
    ],
  },
  {
    slug: "design",
    name: "Designerküche",
    tagline: "Individuell, premium, avantgardistisch",
    heroDescription:
      "Die Designerküche ist ein Einzelstück. Entworfen von renommierten Designern oder nach individuellen Vorstellungen, verbindet sie außergewöhnliche Materialien mit höchster Handwerkskunst.",
    gradient: "from-violet-800 to-violet-950",
    characteristics: [
      "Individuelle Entwürfe und Sondermaße",
      "Außergewöhnliche Materialien (Marmor, Bronze, Vulkangestein)",
      "Designer-Armaturen und -Geräte",
      "Beleuchtungskonzepte mit LED-Integration",
      "Kunstvolle Details und Verarbeitungen",
      "Marken wie Bulthaup, Poggenpohl, SieMatic",
    ],
    materials: ["Marmor oder Naturstein", "Bronze- oder Messing-Elemente", "Echtholz-Furniere", "Glas und Spiegel"],
    priceRange: "25.000 – 100.000+ €",
    seoTitle: "Designerküche – Premium-Planung & exklusive Materialien",
    seoDescription:
      "Designerküchen: Individuelle Entwürfe, Premium-Materialien und höchste Handwerkskunst. Marken, Kosten und Planungsberatung.",
    sections: [
      {
        title: "Was macht eine Designerküche besonders?",
        content:
          "Eine Designerküche ist mehr als eine Küche – sie ist ein Einrichtungsobjekt. Ob von einem renommierten Designer wie Bulthaup oder als individuelle Maßanfertigung: Jedes Detail ist durchdacht, jedes Material sorgsam ausgewählt. Die Planung umfasst nicht nur die Küche selbst, sondern auch Beleuchtung, Raumintegration und Materialharmonie.",
      },
      {
        title: "Premium-Materialien",
        content:
          "Bei Designerküchen kommen Materialien zum Einsatz, die man in Standardküchen nicht findet: Marmor aus Carrara, Bronze-beschichtete Fronten, Vulkangestein-Arbeitsplatten oder handgeschliffene Echtholz-Furniere. Jedes Material wird nach strengen Qualitätskriterien ausgewählt und verarbeitet.",
      },
      {
        title: "Investment und Planung",
        content:
          "Eine Designerküche beginnt bei etwa 25.000 € und kann je nach Ausstattung und Materialwahl weit über 100.000 € kosten. Die Planungsphase dauert typischerweise 3 bis 6 Monate, in denen gemeinsam mit dem Designer jedes Detail festgelegt wird. Ein spezialisiertes Küchenstudio ist für diesen Anspruch unerlässlich.",
      },
    ],
  },
];
