/**
 * Typed fetch wrapper for the NAS scraper API. Used from server-side code only
 * (Server Components, Server Actions, route handlers). Never expose
 * NAS_API_KEY to the browser.
 */

const BASE = process.env.NAS_API_URL;
const KEY = process.env.NAS_API_KEY;

export interface NasGuests {
  adults: number;
  children: number;
  /**
   * Age per child. Length should equal `children`. Booking.com requires one
   * `age=X` query param per child or it silently returns the no-children
   * price. We default to 10 (mid 7–12 band) when unknown.
   */
  children_ages: number[];
  rooms: number;
}

export interface ExtractedBooking {
  source: string | null;
  hotel_name: string;
  check_in: string;
  check_out: string;
  guests: NasGuests;
  room_type: string | null;
  meal_plan: string | null;
  cancellation: string | null;
  /** ISO 8601 datetime of the free-cancellation deadline, or null if unknown / non-refundable. */
  cancellation_deadline: string | null;
  total_price: number | null;
  currency: string | null;
}

export interface HotelMeta {
  imageUrl: string | null;
  name: string | null;
  address: string | null;
}

export interface ScrapeMatchResult {
  amount: number;
  currency: string;
  match_score: number;
  matched_room: string | null;
  matched_meal: string | null;
  hotel_meta?: HotelMeta;
  all_rates_count?: number;
  candidates?: Array<{
    room: string;
    meal: string;
    amount: number;
    currency: string;
    score: number;
  }>;
}

class NasError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

async function call<T>(path: string, body?: object): Promise<T> {
  if (!BASE || !KEY) throw new NasError(500, 'NAS_API_URL / NAS_API_KEY not configured');
  const res = await fetch(`${BASE.replace(/\/$/, '')}${path}`, {
    method: body ? 'POST' : 'GET',
    headers: {
      Authorization: `Bearer ${KEY}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: 'no-store',
    // Give the NAS up to 60s — Playwright operations are slow.
    signal: AbortSignal.timeout(60_000),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new NasError(res.status, `NAS ${path} returned ${res.status}: ${text.slice(0, 300)}`);
  }
  return res.json() as Promise<T>;
}

export interface TextExtractInput {
  text: string | null;
  html: string | null;
  subject: string | null;
  from: string | null;
  source_hint: string | null;
}

export const nas = {
  health: () => call<{ ok: boolean; uptime: number; version: string }>('/health'),
  visionExtract: (image_url: string) => call<ExtractedBooking>('/vision/extract', { image_url }),
  textExtract: (input: TextExtractInput) =>
    call<ExtractedBooking | { not_a_booking: true }>('/text/extract', input),
  search: (params: {
    hotel_name: string;
    check_in: string;
    check_out: string;
    adults?: number;
    children?: number;
    children_ages?: number[];
    rooms?: number;
  }) => call<{ url: string }>('/search', params),
  resolveShare: (url: string) => call<{ url: string; resolved: boolean }>('/resolve-share', { url }),
  parseUrl: (url: string) => call<{
    source: string;
    country: string;
    slug: string;
    hotelName: string;
    checkIn: string;
    checkOut: string;
    guests: NasGuests;
    currency: string | null;
    canonicalUrl: string;
  }>('/parse-url', { url }),
  scrape: (params: {
    url: string;
    room_type?: string | null;
    meal_plan?: string | null;
    /** Critical for accurate matching — Booking shows multiple rate-rows per
     * room (one per occupancy) and we need to pick the one for the booking's
     * actual party size, not the cheapest variant. */
    guests?: { adults: number; children: number } | null;
  }) => call<ScrapeMatchResult>('/scrape', params),
  triggerDailyCheck: () => call<{ ok: true; started_at: string }>('/trigger-daily-check', {}),
};

export { NasError };
