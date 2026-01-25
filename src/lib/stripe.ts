import Stripe from "stripe";

// Lazy initialization to avoid build-time errors
let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("Missing STRIPE_SECRET_KEY environment variable");
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-12-15.clover",
      typescript: true,
    });
  }
  return _stripe;
}

// Price IDs - you'll create these in Stripe Dashboard
// For now, we'll create them programmatically on first use
export const PLANS = {
  starter: {
    name: "Starter",
    monthlyPrice: 14900, // $149 in cents
    annualPrice: 149000, // $1,490 in cents (10 months)
    features: {
      maxClients: 5,
      maxCompetitors: 5,
      pdfBranding: "basic",
    },
  },
  growth: {
    name: "Growth",
    monthlyPrice: 39900, // $399 in cents
    annualPrice: 399000, // $3,990 in cents (10 months)
    features: {
      maxClients: 20,
      maxCompetitors: 8,
      pdfBranding: "full",
      priorityProcessing: true,
      snapshotHistory: true,
    },
  },
  pro: {
    name: "Pro",
    monthlyPrice: 79900, // $799 in cents
    annualPrice: 799000, // $7,990 in cents (10 months)
    features: {
      maxClients: 999,
      maxCompetitors: 999,
      pdfBranding: "full",
      priorityProcessing: true,
      snapshotHistory: true,
      fasterRuns: true,
    },
  },
} as const;

export type PlanId = keyof typeof PLANS;
export type BillingInterval = "monthly" | "annual";

