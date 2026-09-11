type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

/**
 * Rate limit in-memory (par instance). Suffisant pour freiner brute-force
 * sur un seul process Node ; en multi-instance, préférer Redis / WAF.
 */
export function rateLimit(
  key: string,
  { limit, windowMs }: { limit: number; windowMs: number },
): { ok: true } | { ok: false; retryAfterSec: number } {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true };
  }

  if (existing.count >= limit) {
    return {
      ok: false,
      retryAfterSec: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
    };
  }

  existing.count += 1;
  return { ok: true };
}

/**
 * IP client pour rate-limit.
 * Ne fait pas confiance à X-Forwarded-For / X-Real-Ip sauf derrière
 * une plateforme connue (Vercel, Cloudflare) ou TRUST_PROXY=1.
 * Sinon → clé partagée "unknown" (évite le contournement par IP forgée).
 */
export function clientIpFromRequest(request: Request): string {
  const vercel = request.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim();
  if (vercel) return vercel;

  const cf = request.headers.get("cf-connecting-ip")?.trim();
  if (cf) return cf;

  const trustProxy =
    process.env.VERCEL === "1" ||
    process.env.TRUST_PROXY === "1" ||
    process.env.TRUST_PROXY === "true";

  if (trustProxy) {
    const forwarded = request.headers.get("x-forwarded-for");
    if (forwarded) {
      const first = forwarded.split(",")[0]?.trim();
      if (first) return first;
    }
    const realIp = request.headers.get("x-real-ip")?.trim();
    if (realIp) return realIp;
  }

  return "unknown";
}
