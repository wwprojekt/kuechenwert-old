export const COMPANY = {
  name: process.env.COMPANY_NAME ?? "KüchenWert GmbH",
  address: process.env.COMPANY_ADDRESS ?? "Musterstraße 1",
  postal_code: process.env.COMPANY_POSTAL_CODE ?? "10115",
  city: process.env.COMPANY_CITY ?? "Berlin",
  vat_id: process.env.COMPANY_VAT_ID ?? "DE000000000",
  register: process.env.COMPANY_REGISTER ?? "",
  director: process.env.COMPANY_DIRECTOR ?? "",
  bank_iban: process.env.COMPANY_BANK_IBAN ?? "",
  bank_bic: process.env.COMPANY_BANK_BIC ?? "",
  bank_name: process.env.COMPANY_BANK_NAME ?? "",
} as const;

export const PAYMENT_TERMS_DAYS = 14;
export const PENALTY_AMOUNT_EUR = 299;

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
