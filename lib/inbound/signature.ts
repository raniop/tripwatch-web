/**
 * Verify a Svix-style signed webhook (the format Resend Inbound uses).
 *
 * Headers:
 *   svix-id, svix-timestamp, svix-signature ("v1,<base64> v1,<base64> ...")
 *
 * Steps:
 *   1. Reconstruct the signed payload: `{id}.{timestamp}.{raw-body}`
 *   2. HMAC-SHA256 with the webhook secret (base64-decoded from "whsec_..." prefix)
 *   3. Compare in constant time against any of the v1 signatures
 *   4. Reject if timestamp is more than 5 minutes off (replay window)
 *
 * Implemented with node:crypto only so we don't pull in the svix package.
 */

import { createHmac, timingSafeEqual } from 'node:crypto';

const TOLERANCE_SECONDS = 5 * 60;

interface VerifyArgs {
  rawBody: string;
  headers: Headers;
  secret: string;
  now?: number; // override for tests
}

export function verifySvixSignature(args: VerifyArgs): { ok: true } | { ok: false; reason: string } {
  const id = args.headers.get('svix-id') || args.headers.get('webhook-id');
  const timestamp = args.headers.get('svix-timestamp') || args.headers.get('webhook-timestamp');
  const signatureHeader = args.headers.get('svix-signature') || args.headers.get('webhook-signature');

  if (!id || !timestamp || !signatureHeader) {
    return { ok: false, reason: 'missing svix headers' };
  }

  const ts = Number(timestamp);
  if (!Number.isFinite(ts)) return { ok: false, reason: 'bad timestamp' };
  const nowSec = Math.floor((args.now ?? Date.now()) / 1000);
  if (Math.abs(nowSec - ts) > TOLERANCE_SECONDS) {
    return { ok: false, reason: 'stale timestamp' };
  }

  // Strip "whsec_" prefix if present; the rest is base64.
  const cleanSecret = args.secret.startsWith('whsec_') ? args.secret.slice(6) : args.secret;
  let secretBytes: Buffer;
  try {
    secretBytes = Buffer.from(cleanSecret, 'base64');
  } catch {
    return { ok: false, reason: 'bad secret' };
  }

  const signedPayload = `${id}.${timestamp}.${args.rawBody}`;
  const expected = createHmac('sha256', secretBytes).update(signedPayload).digest('base64');
  const expectedBuf = Buffer.from(expected, 'base64');

  // signatureHeader contains one or more space-separated `v1,<base64>` pairs.
  for (const part of signatureHeader.split(' ')) {
    const [version, sig] = part.split(',');
    if (version !== 'v1' || !sig) continue;
    const sigBuf = Buffer.from(sig, 'base64');
    if (sigBuf.length === expectedBuf.length && timingSafeEqual(sigBuf, expectedBuf)) {
      return { ok: true };
    }
  }

  return { ok: false, reason: 'no matching signature' };
}
