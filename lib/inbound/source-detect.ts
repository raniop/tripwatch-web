/**
 * Best-effort source detection from email headers. Used as a hint to the
 * NAS text-extract LLM; not authoritative (the LLM decides for itself).
 *
 * Open type: any string is accepted. We list well-known sources for
 * documentation, but text-extract may return anything (e.g. a hotel chain's
 * direct booking confirmation). The UI shows the source verbatim.
 */

export type DetectedSource = string | null;

interface Signals {
  from?: string | null;
  subject?: string | null;
}

const RULES: Array<{ source: string; from?: RegExp; subject?: RegExp }> = [
  { source: 'booking.com', from: /@(?:[a-z0-9.-]+\.)?booking\.com$/i, subject: /booking\.com|confirmation|הזמנה/i },
  { source: 'agoda',       from: /@(?:[a-z0-9.-]+\.)?agoda\.com$/i },
  { source: 'expedia',     from: /@(?:[a-z0-9.-]+\.)?expedia\.[a-z.]+$/i },
  { source: 'hotels.com',  from: /@(?:[a-z0-9.-]+\.)?hotels\.com$/i },
  // Leading Hotels of the World — luxury aggregator, exclusive rates +
  // Leaders Club loyalty points. Price-tracked via Booking as a reference;
  // LHW perks (upgrades, breakfast, points) aren't visible to our scraper.
  { source: 'lhw',         from: /@(?:[a-z0-9.-]+\.)?lhw\.com$/i, subject: /leading hotels|leaders club|\blhw\b/i },
  { source: 'marriott',    from: /@(?:[a-z0-9.-]+\.)?(?:marriott|ritzcarlton|stregis|edition-hotels|westin|sheraton|w-hotels)\.com$/i },
  { source: 'hilton',      from: /@(?:[a-z0-9.-]+\.)?hilton\.com$/i },
  { source: 'hyatt',       from: /@(?:[a-z0-9.-]+\.)?hyatt\.com$/i },
  { source: 'four-seasons', from: /@(?:[a-z0-9.-]+\.)?fourseasons\.com$/i },
  { source: 'kayak',       from: /@(?:[a-z0-9.-]+\.)?kayak\.com$/i },
  { source: 'trivago',     from: /@(?:[a-z0-9.-]+\.)?trivago\.[a-z.]+$/i },
];

export function detectSource({ from, subject }: Signals): DetectedSource {
  const cleanFrom = (from || '').toLowerCase();
  const cleanSubject = (subject || '').toLowerCase();
  for (const rule of RULES) {
    if (rule.from && rule.from.test(cleanFrom)) return rule.source;
  }
  // Subject-only fallback (forwarded emails often lose the original From)
  for (const rule of RULES) {
    if (rule.subject && rule.subject.test(cleanSubject)) return rule.source;
  }
  return null;
}
