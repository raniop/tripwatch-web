/**
 * Currency conversion helper. Uses open.er-api.com (free, no key) and caches
 * for 24 hours so we don't hammer the API on every page render.
 *
 * Returns null on any failure — callers should fall back to displaying the
 * raw price without a comparison.
 */

interface ErApiResponse {
  result?: string;
  rates?: Record<string, number>;
}

export async function convertToILS(amount: number, currency: string | null | undefined): Promise<number | null> {
  if (!currency) return null;
  const cur = currency.toUpperCase();
  if (cur === 'ILS') return amount;
  try {
    const r = await fetch(`https://open.er-api.com/v6/latest/${cur}`, {
      signal: AbortSignal.timeout(6000),
      next: { revalidate: 86400 }, // cache per (currency,day)
    });
    if (!r.ok) return null;
    const j = (await r.json()) as ErApiResponse;
    if (j.result !== 'success' || !j.rates?.ILS) return null;
    return amount * Number(j.rates.ILS);
  } catch {
    return null;
  }
}
