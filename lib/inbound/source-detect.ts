/**
 * Best-effort source detection from email headers. Used as a hint to the
 * NAS text-extract LLM; not authoritative (the LLM decides for itself).
 */

export type DetectedSource = 'booking.com' | 'agoda' | 'expedia' | 'hotels.com' | null;

interface Signals {
  from?: string | null;
  subject?: string | null;
}

const RULES: Array<{ source: Exclude<DetectedSource, null>; from?: RegExp; subject?: RegExp }> = [
  { source: 'booking.com', from: /@(?:[a-z0-9.-]+\.)?booking\.com$/i, subject: /booking\.com|confirmation|הזמנה/i },
  { source: 'agoda',       from: /@(?:[a-z0-9.-]+\.)?agoda\.com$/i },
  { source: 'expedia',     from: /@(?:[a-z0-9.-]+\.)?expedia\.[a-z.]+$/i },
  { source: 'hotels.com',  from: /@(?:[a-z0-9.-]+\.)?hotels\.com$/i },
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
