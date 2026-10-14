# AGENTS.md

Hinweise fuer KI-Agenten in diesem Repository.

## Lokale Ordnerstruktur (Entwicklungsrechner, Stand 14.10.2026)

Jedes Repository liegt genau einmal unter `C:\Users\Philip Müller\Projects\<repo>`; der Ordnername ist der GitHub-Repo-Name (`wwprojekt/<repo>`). Einträge wie `Documents\caravanwert` oder `Documents\motorwert` sind nur Junctions (Verknüpfungen) auf `Projects\…` und werden später entfernt. Immer den `Projects`-Pfad verwenden.

| Ordner in `Projects` | Was drin ist |
|---|---|
| `lumeet` | Lirono: verifizierte Live-, Social- und Dating-Plattform (18+). Flutter-App, Supabase-Backend, Web, Ops-Konsole |
| `caravanwert` | CaravanWert: Verkaufsplattform für Wohnmobile und Wohnwagen |
| `motorwert` | MotorWert.de: PKW-Auktionsplattform (Schwesterprojekt von CaravanWert) |
| `bikewert` | BikeWert: Motorrad-Plattform (Schwesterprojekt) |
| `landtechnikwert` | LandtechnikWert: P2B-Auktionsplattform für gebrauchte Landtechnik |
| `kuechenwert` | KüchenWert: Küchenplanung mit KI, Preisschätzung und Studio-Angebote (Lead-Generation) |
| `kuechenwert-old` | KüchenWert, Vorgängergeneration: Lead-Generation und Rückwärts-Auktion (eigenes Repo, eingefroren) |
| `WohnWert` | WohnWert24: kostenlose Immobilienbewertung und Makler-Leads |
| `WohnWert-Test` | WohnWert-Testprojekt (eigenes Repo, eingefroren) |
| `medilero-final` | Medilero: Plattform für Medizintechnik, Praxissoftware und Praxisberatung (Leads, Anbieter-Matching, CMS) |
| `dental-service-platform` | ERP und Serviceplattform der Deppe-Dental-Gruppe |
| `code-charm` | Lovable-generierter Prototyp (Vite/React) |
| `_tools` | Pflegeskripte: `worktrees-aufraeumen.ps1`, `repo-nach-projects.ps1`, `konsolidierung-nachholen.ps1` |

Parallele Arbeit findet nur in Git-Worktrees unter `<repo>\.worktrees\<aufgabe>` statt, nie als Nachbarordner in `Projects`. Der Hauptordner des Repos bleibt auf `main`. Nach dem Merge wird der Worktree entfernt (`Projects\_tools\worktrees-aufraeumen.ps1`, Modus `Liste` zeigt den Stand).

Weitere Orte: `C:\dev\*` sind Junctions mit kurzen Pfaden für Flutter/Android-Builds, keine Kopien. `C:\Archiv\2026-10-14-projekt-konsolidierung\` enthält alte Kopien und archivierte Worktrees samt Manifest; dort wird nicht gearbeitet und nichts gelöscht. Unversionierte Secrets (`.env`, Firebase-Configs, Keys, `.agents`-Zustand) liegen im jeweiligen Repo-Ordner und bleiben dort.
