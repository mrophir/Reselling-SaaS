/**
 * lib/tiers.ts — single source of truth for all tier / feature / cap logic.
 *
 * Safe to import in both server and client components.
 * Do NOT read process.env here — use lib/tiers.server.ts for Stripe price IDs.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export type TierKey = "starter" | "pro";

export type FeatureFlag =
  | "pipeline"
  | "leak_alert"
  | "bin_lookup"
  | "basic_profit"
  | "monthly_archives"
  | "aging_flags"
  | "tax_export"
  | "multi_platform"
  | "bulk_actions"
  | "advanced_reporting"
  | "csv_import";

export interface TierConfig {
  readonly key: TierKey;
  readonly name: string;
  readonly pricePence: number;
  readonly priceDisplay: string;
  readonly stripePriceEnvKey: string;
  readonly itemCap: number;
  readonly features: ReadonlyArray<FeatureFlag>;
  readonly tagline: string;
}

// ─── Config ───────────────────────────────────────────────────────────────────

export const TIERS: Readonly<Record<TierKey, TierConfig>> = {
  starter: {
    key: "starter",
    name: "Free",
    pricePence: 0,
    priceDisplay: "Free",
    stripePriceEnvKey: "",
    itemCap: 50,
    features: ["pipeline", "leak_alert", "bin_lookup", "basic_profit"],
    tagline: "Try it out. No card needed.",
  },

  pro: {
    key: "pro",
    name: "Pro",
    pricePence: 1999,
    priceDisplay: "£19.99/mo",
    stripePriceEnvKey: "STRIPE_PRICE_PRO",
    itemCap: Infinity,
    features: [
      "pipeline",
      "leak_alert",
      "bin_lookup",
      "basic_profit",
      "monthly_archives",
      "aging_flags",
      "tax_export",
      "multi_platform",
      "bulk_actions",
      "advanced_reporting",
      "csv_import",
    ],
    tagline: "Everything, unlimited stock, cancel anytime.",
  },
} as const;

export const TIER_ORDER: TierKey[] = ["starter", "pro"];

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getTier(key: TierKey): TierConfig {
  return TIERS[key];
}

export function hasFeature(tierKey: TierKey, feature: FeatureFlag): boolean {
  return (TIERS[tierKey].features as FeatureFlag[]).includes(feature);
}

export function getItemCap(tierKey: TierKey): number {
  return TIERS[tierKey].itemCap;
}

export function canAddItem(tierKey: TierKey, currentItemCount: number): boolean {
  const cap = getItemCap(tierKey);
  return cap === Infinity || currentItemCount < cap;
}

export function formatItemCap(tierKey: TierKey): string {
  const cap = TIERS[tierKey].itemCap;
  return cap === Infinity ? "Unlimited" : cap.toLocaleString();
}

export function upgradeFeatures(from: TierKey, to: TierKey): FeatureFlag[] {
  const have = new Set(TIERS[from].features);
  return TIERS[to].features.filter((f) => !have.has(f));
}
