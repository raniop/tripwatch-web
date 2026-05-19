import { createHmac, timingSafeEqual } from 'node:crypto';

const SECRET =
  process.env.MERGE_SIGNING_SECRET ||
  process.env.CRON_SECRET ||
  'tripwatch-fallback-do-not-use-in-prod';

export interface MergePayload {
  keep_uid: string;
  merge_uid: string;
  keep_email: string;
  merge_email: string;
  exp: number;
}

export function signMergeToken(payload: MergePayload): string {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = createHmac('sha256', SECRET).update(body).digest('base64url');
  return `${body}.${sig}`;
}

export function verifyMergeToken(token: string): MergePayload | null {
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [body, sig] = parts;
  const expected = createHmac('sha256', SECRET).update(body).digest('base64url');
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as MergePayload;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}
