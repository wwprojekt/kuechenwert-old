// Lead scoring: rule-based, produces a numeric score + tier assignment

import { LEAD_PRICING } from "./revenue";

export interface ScoringInput {
  hasExistingOffer: boolean;
  hasUpload: boolean;
  timeframeMonths: number | null;
  budgetEur: number | null;
  kitchenForm: string | null;
  kitchenStyle: string | null;
  reasonForPurchase: string | null;
  postalCode: string | null;
  phoneProvided: boolean;
}

interface ScoringRule {
  label: string;
  points: number;
  test: (input: ScoringInput) => boolean;
}

const RULES: ScoringRule[] = [
  { label: "Bestehendes Angebot vorhanden", points: 30, test: (i) => i.hasExistingOffer },
  { label: "Dokument hochgeladen", points: 20, test: (i) => i.hasUpload },
  { label: "Zeitrahmen ≤ 3 Monate", points: 20, test: (i) => (i.timeframeMonths ?? 99) <= 3 },
  { label: "Zeitrahmen 4–6 Monate", points: 10, test: (i) => (i.timeframeMonths ?? 99) > 3 && (i.timeframeMonths ?? 99) <= 6 },
  { label: "Budget ≥ 10.000 €", points: 15, test: (i) => (i.budgetEur ?? 0) >= 10_000 },
  { label: "Budget ≥ 20.000 €", points: 10, test: (i) => (i.budgetEur ?? 0) >= 20_000 },
  { label: "Küchenform angegeben", points: 5, test: (i) => !!i.kitchenForm },
  { label: "Stil angegeben", points: 5, test: (i) => !!i.kitchenStyle },
  { label: "Telefonnummer angegeben", points: 10, test: (i) => i.phoneProvided },
  { label: "PLZ angegeben", points: 5, test: (i) => !!i.postalCode },
];

export type LeadTier = keyof typeof LEAD_PRICING.tiers;

export interface ScoringResult {
  score: number;
  tier: LeadTier;
  matchedRules: string[];
  suggestedPriceEur: number;
}

export function scoreLead(input: ScoringInput): ScoringResult {
  let score = 0;
  const matchedRules: string[] = [];

  for (const rule of RULES) {
    if (rule.test(input)) {
      score += rule.points;
      matchedRules.push(rule.label);
    }
  }

  let tier: LeadTier;
  if (score >= 70) tier = "hot";
  else if (score >= 50) tier = "premium";
  else if (score >= 30) tier = "qualified";
  else tier = "standard";

  return {
    score,
    tier,
    matchedRules,
    suggestedPriceEur: LEAD_PRICING.tiers[tier].priceEur,
  };
}
