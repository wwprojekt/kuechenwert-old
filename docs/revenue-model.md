# KüchenWert Revenue Model

Konfiguration in `src/config/revenue.ts`.

## Umsatzquellen

### 1. Pay-per-Lead (PPL)

Händler zahlen für die Freischaltung qualifizierter Leads.

| Tier | Preis | Kriterien |
|------|-------|-----------|
| Standard | 35 € | Basis-Daten (PLZ, Form, Budget) |
| Qualifiziert | 55 € | Score ≥ 30, telefonisch bestätigt |
| Premium | 85 € | Score ≥ 50, bestehendes Angebot oder Upload |
| Hot | 120 € | Score ≥ 70, Upload + kurzer Zeithorizont + hohes Budget |

Max. 3 Händler pro Lead.

### 2. CPA (Cost-per-Acquisition)

Provision auf den Brutto-Auftragswert bei erfolgreichem Abschluss.

| Auftragswert | Provision |
|-------------|-----------|
| Bis 10.100 € | 2,0 % |
| 10.101 – 15.799 € | 2,5 % |
| 15.800 – 16.999 € | 3,5 % |
| Ab 17.000 € | 4,0 % |

### 3. Subscriptions (Händler)

| Plan | Monatlich | Features |
|------|-----------|----------|
| Basis | 0 € | Profil, Standard-Feed |
| Professional | 149 € | Premium-Feed, Featured Badge, Matching-Priorität |
| Enterprise | 399 € | API/Webhooks, dedizierter Account Manager, CRM-Integration |

### 4. Musterküchen-Börse

- Listing: kostenlos
- Highlight-Paket: 29 €
- Erfolgsprovision: 2 % (optional)

### 5. Abbruchgebühr (BC)

299 € zzgl. MwSt. bei grundlosem Abbruch während laufender Auktion.
Vertraglich/juristisch separat absichern.
