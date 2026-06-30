/**
 * lib/tiers.server.ts — server-only helpers that read process.env.
 * Only import in server components, server actions, and API routes.
 */

import type { TierKey } from "./tiers";
import { TIERS } from "./tiers";

export function getStripePriceId(tierKey: Exclude<TierKey, "starter">): string {
  const envKey = TIERS[tierKey].stripePriceEnvKey;
  const id = process.env[envKey];
  if (!id) {
    throw new Error(
      `Stripe price ID not configured. Set the environment variable: ${envKey}`
    );
  }
  return id;
}
