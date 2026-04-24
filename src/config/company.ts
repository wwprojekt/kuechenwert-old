/**
 * Zentrale Firmendaten für Rechnungen, Impressum, Datenschutz und AGB.
 *
 * Alle Felder können über Environment-Variablen überschrieben werden, ansonsten
 * gelten die unten hinterlegten WohnWert-GmbH-Stammdaten.
 *
 * TODO: Sobald die Umsatzsteuer-ID zugeteilt ist und die Bankverbindung
 *       feststeht, hier oder via ENV eintragen.
 */
export const COMPANY = {
  legal_name: process.env.COMPANY_NAME ?? "WohnWert GmbH",
  brand_name: process.env.COMPANY_BRAND ?? "KüchenWert",

  // Anschrift
  address: process.env.COMPANY_ADDRESS ?? "Hannoversche Str. 106",
  postal_code: process.env.COMPANY_POSTAL_CODE ?? "30627",
  city: process.env.COMPANY_CITY ?? "Hannover",
  country: process.env.COMPANY_COUNTRY ?? "Deutschland",

  // Handelsregister
  register_court: process.env.COMPANY_REGISTER_COURT ?? "Amtsgericht Hannover",
  register_no: process.env.COMPANY_REGISTER_NO ?? "HRB 230114",

  // Vertretung
  director: process.env.COMPANY_DIRECTOR ?? "Mona Kareem-Ameen",
  editor_responsible: process.env.COMPANY_EDITOR ?? "Mona Kareem-Ameen",

  // Kontakt
  phone: process.env.COMPANY_PHONE ?? "0511 5153247",
  email: process.env.COMPANY_EMAIL ?? "info@küchenwert.de",
  email_ascii: process.env.COMPANY_EMAIL_ASCII ?? "info@kuechenwert.de",

  // Steuer
  vat_id: process.env.COMPANY_VAT_ID ?? "Beantragt",

  // Bankverbindung der WohnWert GmbH
  bank_account_holder:
    process.env.COMPANY_BANK_HOLDER ?? "WohnWert GmbH",
  bank_iban:
    process.env.COMPANY_BANK_IBAN ?? "DE75 2519 3331 1192 0580 00",
  bank_bic: process.env.COMPANY_BANK_BIC ?? "GENODEF1PAT",
  bank_name: process.env.COMPANY_BANK_NAME ?? "Volksbank eG",
} as const;

export function fullAddress(): string {
  return `${COMPANY.legal_name}, ${COMPANY.address}, ${COMPANY.postal_code} ${COMPANY.city}, ${COMPANY.country}`;
}

export const PAYMENT_TERMS_DAYS = 14;
export const PENALTY_AMOUNT_EUR = 299;
export const VAT_RATE_PERCENT = 19;

export const DUNNING_LEVELS = [
  // Stufe 1: freundliche Zahlungserinnerung (gebührenfrei)
  { level: 1, days_after_due: 7, fee_cents: 0, label: "Zahlungserinnerung" },
  // Stufe 2: 1. Mahnung
  { level: 2, days_after_due: 14, fee_cents: 500, label: "1. Mahnung" },
  // Stufe 3: 2. Mahnung
  { level: 3, days_after_due: 28, fee_cents: 1500, label: "2. Mahnung" },
  // Stufe 4: 3. Mahnung mit Inkasso-Androhung
  { level: 4, days_after_due: 42, fee_cents: 3000, label: "3. Mahnung – Inkasso-Androhung" },
  // Stufe 5: Account-Sperre + Inkasso-Übergabe
  { level: 5, days_after_due: 56, fee_cents: 0, label: "Inkasso-Übergabe + Sperre" },
] as const;

export type DunningLevel = (typeof DUNNING_LEVELS)[number]["level"];
