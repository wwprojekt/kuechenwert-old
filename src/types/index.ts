export type UserRole = "consumer" | "dealer" | "admin";

export type LeadStatus =
  | "new"
  | "qualified"
  | "disqualified"
  | "matched"
  | "in_auction"
  | "sold"
  | "contacted"
  | "appointment_set"
  | "offer_sent"
  | "closed_won"
  | "closed_lost"
  | "disputed";

export type AuctionStatus = "draft" | "active" | "completed" | "cancelled";

export type DealerPlan = "basic" | "professional" | "enterprise";

export interface Lead {
  id: string;
  created_at: string;
  status: LeadStatus;
  score: number;
  tier: string;
  postal_code: string;
  kitchen_form: string | null;
  kitchen_style: string | null;
  purchase_reason: string | null;
  special_wishes: string[];
  timeframe_months: number | null;
  budget_midpoint: number | null;
  has_existing_offer: boolean;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  consent_call: boolean;
  consent_marketing: boolean;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  funnel_answers: Record<string, unknown>;
}

export interface Dealer {
  id: string;
  user_id: string;
  company_name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  gallery_urls: string[];
  address: string;
  postal_code: string;
  city: string;
  phone: string | null;
  email: string;
  website: string | null;
  opening_hours: Record<string, string> | null;
  brands: string[];
  service_radius_km: number;
  plan: DealerPlan;
  /**
   * Kontostand-Restfeld (nur informativ, z. B. für Admin-Gutschriften).
   * Seit Migration 007 wird das Wallet beim Lead-Kauf NICHT mehr belastet,
   * alle Käufe laufen über Rechnung + SEPA-Überweisung (14 Tage Ziel).
   */
  wallet_balance_cents: number;
  is_verified: boolean;
  is_active: boolean;
}

export interface Bid {
  id: string;
  auction_id: string;
  dealer_id: string;
  price_eur: number;
  delivery_weeks: number;
  notes: string | null;
  created_at: string;
}

export interface Review {
  id: string;
  dealer_id: string;
  lead_id: string;
  rating: number;
  text: string | null;
  photos: string[];
  reply: string | null;
  is_verified: boolean;
  moderation_status: "pending" | "approved" | "rejected";
  created_at: string;
}

export interface ConsentRecord {
  id: string;
  user_id: string | null;
  lead_id: string | null;
  purpose: string;
  granted: boolean;
  text_version: string;
  ip_address: string | null;
  created_at: string;
}

export interface MusterkuecheListItem {
  id: string;
  dealer_id: string;
  title: string;
  description: string;
  original_price_eur: number;
  sale_price_eur: number;
  images: string[];
  condition: string;
  is_available: boolean;
  is_highlighted: boolean;
  created_at: string;
}
