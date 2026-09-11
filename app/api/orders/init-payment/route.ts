import { NextResponse } from "next/server";

import { createOrder } from "@/lib/create-order";
import { clientIpFromRequest, rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

/** Conservé pour compatibilité : crée la commande sans paiement en ligne. */
export async function POST(request: Request) {
  const ip = clientIpFromRequest(request);
  const limited = rateLimit(`orders:${ip}`, { limit: 15, windowMs: 60 * 1000 });
  if (!limited.ok) {
    return NextResponse.json(
      { message: "Trop de commandes. Reessayez dans un instant." },
      {
        status: 429,
        headers: { "Retry-After": String(limited.retryAfterSec) },
      },
    );
  }
  return createOrder(request);
}
