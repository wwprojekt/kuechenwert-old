/**
 * Definitionen aller Catalog-Tabellen für das Admin-Backend (Stammdaten-Pflege).
 *
 * Eine zentrale Quelle der Wahrheit – die generische Catalog-Page und die
 * generische /api/admin/catalog/[table]-Route lesen daraus die Spalten,
 * Validierungs-Hinweise und allowed Values.
 *
 * NUR Tabellen, die hier gelistet sind, sind via Admin-API editierbar
 * (Whitelist gegen SQL-Injection in Tabellennamen).
 */

export type CatalogFieldType = "text" | "number" | "boolean" | "select" | "fk";

export interface CatalogField {
  key: string;
  label: string;
  type: CatalogFieldType;
  required?: boolean;
  /** für type === "select" */
  options?: { value: string; label: string }[];
  /** für type === "fk" – referenzierte Catalog-ID */
  fkCatalog?: string;
  /** Hint für Tabellen-Spalte */
  hint?: string;
  /** in der Tabellenansicht ausblenden */
  hiddenInList?: boolean;
}

export interface CatalogDefinition {
  /** Slug-ID für Routen, z. B. /admin/stammdaten/kitchen-brands */
  slug: string;
  /** Tabellen-Name in Postgres */
  table: string;
  label: string;
  description?: string;
  /** sortierte Liste der editierbaren Felder. id/created_at niemals hier. */
  fields: CatalogField[];
  /** Spalten für Default-ORDER BY */
  orderBy?: { column: string; ascending?: boolean }[];
}

const SEGMENT_OPTIONS = [
  { value: "budget", label: "Budget" },
  { value: "mittel", label: "Mittel" },
  { value: "premium", label: "Premium" },
  { value: "luxus", label: "Luxus" },
];

const FRONT_CATEGORY_OPTIONS = [
  { value: "kunststoff", label: "Kunststoff" },
  { value: "lack", label: "Lack" },
  { value: "echtholz", label: "Echtholz" },
  { value: "glas", label: "Glas" },
  { value: "metall", label: "Metall" },
  { value: "beton", label: "Beton" },
  { value: "sonstiges", label: "Sonstiges" },
];

export const CATALOGS: CatalogDefinition[] = [
  {
    slug: "kitchen-brands",
    table: "catalog_kitchen_brands",
    label: "Küchenhersteller",
    description: "Marken, die Kunden in Funnel B als Hersteller auswählen können.",
    fields: [
      { key: "name", label: "Name", type: "text", required: true },
      { key: "slug", label: "Slug", type: "text", required: true, hint: "URL-tauglich, eindeutig" },
      { key: "segment", label: "Segment", type: "select", options: SEGMENT_OPTIONS },
      { key: "country", label: "Land", type: "text", hint: "ISO-Code, z. B. DE" },
      { key: "is_active", label: "Aktiv", type: "boolean" },
      { key: "sort_order", label: "Sortierung", type: "number" },
    ],
    orderBy: [
      { column: "sort_order", ascending: true },
      { column: "name", ascending: true },
    ],
  },
  {
    slug: "front-materials",
    table: "catalog_front_materials",
    label: "Front-Materialien",
    description: "Materialien für Küchenfronten (Kunststoff, Lack, Echtholz …).",
    fields: [
      { key: "name", label: "Name", type: "text", required: true },
      { key: "category", label: "Kategorie", type: "select", required: true, options: FRONT_CATEGORY_OPTIONS },
      { key: "description", label: "Beschreibung", type: "text" },
      { key: "is_active", label: "Aktiv", type: "boolean" },
      { key: "sort_order", label: "Sortierung", type: "number" },
    ],
    orderBy: [
      { column: "category", ascending: true },
      { column: "sort_order", ascending: true },
      { column: "name", ascending: true },
    ],
  },
  {
    slug: "handle-types",
    table: "catalog_handle_types",
    label: "Grifftypen",
    fields: [
      { key: "name", label: "Name", type: "text", required: true },
      { key: "slug", label: "Slug", type: "text", required: true },
      { key: "description", label: "Beschreibung", type: "text" },
      { key: "is_active", label: "Aktiv", type: "boolean" },
      { key: "sort_order", label: "Sortierung", type: "number" },
    ],
    orderBy: [{ column: "sort_order", ascending: true }],
  },
  {
    slug: "worktop-materials",
    table: "catalog_worktop_materials",
    label: "Arbeitsplatten-Materialien",
    fields: [
      { key: "name", label: "Name", type: "text", required: true },
      { key: "slug", label: "Slug", type: "text", required: true },
      { key: "description", label: "Beschreibung", type: "text" },
      { key: "is_active", label: "Aktiv", type: "boolean" },
      { key: "sort_order", label: "Sortierung", type: "number" },
    ],
    orderBy: [{ column: "sort_order", ascending: true }],
  },
  {
    slug: "worktop-designs",
    table: "catalog_worktop_designs",
    label: "Arbeitsplatten-Designs",
    description: "Konkrete Bezeichnungen pro Material (z. B. „Calacatta Roma“).",
    fields: [
      { key: "material_id", label: "Material", type: "fk", required: true, fkCatalog: "worktop-materials" },
      { key: "name", label: "Name", type: "text", required: true },
      { key: "manufacturer", label: "Hersteller", type: "text" },
      { key: "is_active", label: "Aktiv", type: "boolean" },
      { key: "sort_order", label: "Sortierung", type: "number" },
    ],
    orderBy: [
      { column: "material_id", ascending: true },
      { column: "name", ascending: true },
    ],
  },
  {
    slug: "appliance-categories",
    table: "catalog_appliance_categories",
    label: "Geräte-Kategorien",
    fields: [
      { key: "name", label: "Name", type: "text", required: true },
      { key: "slug", label: "Slug", type: "text", required: true },
      { key: "is_active", label: "Aktiv", type: "boolean" },
      { key: "sort_order", label: "Sortierung", type: "number" },
    ],
    orderBy: [{ column: "sort_order", ascending: true }],
  },
  {
    slug: "appliance-brands",
    table: "catalog_appliance_brands",
    label: "Geräte-Marken",
    fields: [
      { key: "name", label: "Name", type: "text", required: true },
      { key: "slug", label: "Slug", type: "text", required: true },
      { key: "segment", label: "Segment", type: "select", options: SEGMENT_OPTIONS },
      { key: "is_active", label: "Aktiv", type: "boolean" },
      { key: "sort_order", label: "Sortierung", type: "number" },
    ],
    orderBy: [{ column: "sort_order", ascending: true }, { column: "name", ascending: true }],
  },
  {
    slug: "sink-brands",
    table: "catalog_sink_brands",
    label: "Spülen-Marken",
    fields: [
      { key: "name", label: "Name", type: "text", required: true },
      { key: "slug", label: "Slug", type: "text", required: true },
      { key: "is_active", label: "Aktiv", type: "boolean" },
      { key: "sort_order", label: "Sortierung", type: "number" },
    ],
    orderBy: [{ column: "sort_order", ascending: true }, { column: "name", ascending: true }],
  },
  {
    slug: "sink-materials",
    table: "catalog_sink_materials",
    label: "Spülen-Materialien",
    fields: [
      { key: "name", label: "Name", type: "text", required: true },
      { key: "slug", label: "Slug", type: "text", required: true },
      { key: "is_active", label: "Aktiv", type: "boolean" },
      { key: "sort_order", label: "Sortierung", type: "number" },
    ],
    orderBy: [{ column: "sort_order", ascending: true }],
  },
];

export function getCatalogBySlug(slug: string): CatalogDefinition | null {
  return CATALOGS.find((c) => c.slug === slug) ?? null;
}

export function getCatalogByTable(table: string): CatalogDefinition | null {
  return CATALOGS.find((c) => c.table === table) ?? null;
}
