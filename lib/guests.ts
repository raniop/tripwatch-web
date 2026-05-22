/**
 * Helpers for the `guests` JSONB blob on bookings.
 *
 * Why this file exists: Booking.com requires one `age=X` query param per child
 * or it silently returns the no-children price. We track `children_ages: int[]`
 * inside the guests JSONB; this module is the single place that knows how to
 * pad / truncate that array so it always equals `children` in length.
 */
import type { NasGuests } from '@/lib/nas-client';

/** Mid-point of Booking's 7–12 child band — the safest "unknown" default. */
export const DEFAULT_CHILD_AGE = 10;

export interface GuestsShape {
  adults: number;
  children: number;
  rooms: number;
  children_ages?: number[];
}

/**
 * Normalize an ages array against the children count: clamp to [0, 17],
 * truncate to length === children, pad with DEFAULT_CHILD_AGE. Always
 * returns a fresh array of length === children.
 */
export function normalizeChildrenAges(guests: Partial<NasGuests> | Partial<GuestsShape> | null | undefined): number[] {
  const children = Math.max(0, Math.floor(guests?.children ?? 0));
  const raw = Array.isArray(guests?.children_ages) ? guests!.children_ages! : [];
  const clean = raw
    .map((a) => Math.round(Number(a)))
    .filter((n) => Number.isFinite(n) && n >= 0 && n <= 17)
    .slice(0, children);
  while (clean.length < children) clean.push(DEFAULT_CHILD_AGE);
  return clean;
}
