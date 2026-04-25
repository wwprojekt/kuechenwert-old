-- ============================================================
-- 008_remove_catalog_unknown_entries.sql
--
-- Entfernt die "Weiß ich nicht / Sonstige"-Karteileichen aus den
-- Funnel-B-Stammdaten, damit sie im Funnel nicht mehr auswählbar
-- sind. Frontend-Config (src/config/funnel-b-stammdaten.ts) wurde
-- synchron angepasst.
--
--   catalog_handle_types      : 'unbekannt' (Weiß ich nicht)
--   catalog_worktop_materials : 'duennschichtkeramik', 'sonstige'
--
-- Es existieren keine FK-Referenzen aus Leads/Auktionen auf diese
-- Katalog-Tabellen (Slugs werden in Freitextfeldern gespeichert).
-- Zu catalog_worktop_designs besteht eine ON DELETE CASCADE-FK,
-- aber für die gelöschten Materialien existieren keine Designs.
-- ============================================================

delete from public.catalog_handle_types
  where slug = 'unbekannt';

delete from public.catalog_worktop_materials
  where slug in ('duennschichtkeramik', 'sonstige');
