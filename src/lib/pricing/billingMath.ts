/**
 * Annual total in whole USD → average monthly, rounded to the nearest cent.
 * Avoids Math.round(annual/12) which breaks for tiers like $3,990/yr ($332.50/mo).
 */
export function monthlyEquivalentFromAnnualUsd(annualUsd: number): number {
  return Math.round((annualUsd * 100) / 12) / 100;
}

/** Display for plan cards: integers stay clean; fractional shows up to 2 decimals. */
export function formatMonthlyPriceDisplay(usd: number): string {
  return usd.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}
