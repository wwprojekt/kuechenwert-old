// KüchenWert revenue model configuration
// PPL (Pay-per-Lead), CPA (Cost-per-Acquisition), Subscriptions, Musterküchen

export const LEAD_PRICING = {
  tiers: {
    standard: { label: "Standard", priceEur: 35 },
    qualified: { label: "Qualifiziert", priceEur: 55 },
    premium: { label: "Premium (Angebot liegt vor)", priceEur: 85 },
    hot: { label: "Hot (Upload + kurzer Zeithorizont)", priceEur: 120 },
  },
  maxDealersPerLead: 3,
} as const;

export const CPA_TIERS = [
  { minEur: 0, maxEur: 10_100, rate: 0.02 },
  { minEur: 10_101, maxEur: 15_799, rate: 0.025 },
  { minEur: 15_800, maxEur: 16_999, rate: 0.035 },
  { minEur: 17_000, maxEur: Infinity, rate: 0.04 },
] as const;

export const SUBSCRIPTION_PLANS = {
  basic: {
    id: "basic",
    label: "Basis",
    monthlyEur: 0,
    features: ["Händlerprofil", "Lead-Feed (Standard)"],
  },
  professional: {
    id: "professional",
    label: "Professional",
    monthlyEur: 149,
    features: [
      "Alles aus Basis",
      "Premium Lead-Feed",
      "Featured Badge",
      "Priorität im Matching",
    ],
  },
  enterprise: {
    id: "enterprise",
    label: "Enterprise",
    monthlyEur: 399,
    features: [
      "Alles aus Professional",
      "API/Webhook Zugang",
      "Dedizierter Account Manager",
      "Custom CRM Integration",
    ],
  },
} as const;

export const MUSTERKUECHEN_FEES = {
  listingFeeEur: 0,
  highlightFeeEur: 29,
  successFeeRate: 0.02,
} as const;

export const CANCELLATION_FEE_EUR = 299;

export function getCpaRate(orderValueEur: number): number {
  const tier = CPA_TIERS.find(
    (t) => orderValueEur >= t.minEur && orderValueEur <= t.maxEur,
  );
  return tier?.rate ?? CPA_TIERS[CPA_TIERS.length - 1].rate;
}

export function calculateCpa(orderValueEur: number): number {
  return Math.round(orderValueEur * getCpaRate(orderValueEur) * 100) / 100;
}
