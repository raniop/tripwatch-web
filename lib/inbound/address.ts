/**
 * Two inbound address modes:
 *
 *   1. Global address — `trip@tripwatch.net` (recommended). User identified by
 *      the `from:` header against auth.users.email and linked identity emails.
 *      Friendly + memorable; requires forwarding from a registered email.
 *
 *   2. Per-user fallback — `book.{token}@{INBOUND_EMAIL_DOMAIN}`. Token is a
 *      16-char Crockford-base32 secret (~80 bits of entropy). Works from any
 *      email account — useful when the booking confirmation lives on a
 *      mailbox not linked to the TripWatch account.
 *
 * Both routes go through the same webhook; the receiver decides which mode
 * applies based on the recipient address.
 */

import { randomBytes } from 'node:crypto';

const DOMAIN = process.env.INBOUND_EMAIL_DOMAIN || 'inbound.tripwatch.net';
const GLOBAL_ADDRESS = (process.env.INBOUND_GLOBAL_ADDRESS || 'trip@tripwatch.net').toLowerCase();

const ALPHABET = '0123456789abcdefghjkmnpqrstvwxyz'; // Crockford: no I, L, O, U

export function getGlobalAddress(): string {
  return GLOBAL_ADDRESS;
}

/**
 * Does any address in the list match the global inbound address? Tolerates
 * "Display Name <addr>" and `+tag` sub-addressing on the local part.
 */
export function matchesGlobalAddress(addresses: string[]): boolean {
  const [globalLocal, globalDomain] = GLOBAL_ADDRESS.split('@');
  const pattern = new RegExp(
    `\\b${escapeRe(globalLocal)}(?:\\+[^@\\s]*)?@${escapeRe(globalDomain)}\\b`,
    'i',
  );
  return addresses.some((a) => a && pattern.test(a));
}

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Extract just the email address out of a header value like:
 *   "Display Name <user@example.com>"  →  "user@example.com"
 *   "user@example.com"                 →  "user@example.com"
 *   "  <user@example.com>  "           →  "user@example.com"
 */
export function extractPureEmail(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const angle = raw.match(/<([^>]+)>/);
  const candidate = (angle ? angle[1] : raw).trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(candidate) ? candidate.toLowerCase() : null;
}

export function generateInboundToken(): string {
  const bytes = randomBytes(10);
  let out = '';
  for (let i = 0; i < bytes.length; i++) {
    out += ALPHABET[bytes[i] & 0x1f];
    out += ALPHABET[(bytes[i] >> 5) & 0x07 | ((bytes[(i + 1) % bytes.length] & 0x03) << 3)];
  }
  return out.slice(0, 16);
}

export function formatInboundAddress(token: string): string {
  return `book.${token}@${DOMAIN}`;
}

export function inboundDomain(): string {
  return DOMAIN;
}

/**
 * Extract the token from any address in the To/Cc/Bcc list of a forwarded
 * email. Returns null if no recipient matches our pattern.
 *
 * Accepts:
 *   book.abc123@inbound.tripwatch.net
 *   "Some Name" <book.abc123@inbound.tripwatch.net>
 *   book.abc123+tag@inbound.tripwatch.net   (sub-addressing — ignored)
 */
export function extractTokenFromAddresses(addresses: string[]): string | null {
  const domain = DOMAIN.toLowerCase().replace(/\./g, '\\.');
  const pattern = new RegExp(`book\\.([0-9a-z]{8,32})(?:\\+[^@\\s]*)?@${domain}`, 'i');
  for (const raw of addresses) {
    if (!raw) continue;
    const match = raw.toLowerCase().match(pattern);
    if (match) return match[1];
  }
  return null;
}
