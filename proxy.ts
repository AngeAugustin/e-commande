import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { verifyAdminToken } from "@/lib/auth-token";

function buildCsp(nonce: string) {
  const isDev = process.env.NODE_ENV === "development";

  // Scripts: nonce + strict-dynamic (pas d'unsafe-inline).
  // unsafe-eval uniquement en dev (React reconstruire les stacks).
  // Styles: unsafe-inline nécessaire pour attributs style React / Framer Motion.
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https://images.unsplash.com",
    "font-src 'self' data:",
    "connect-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ]
    .join("; ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function applyCsp(request: NextRequest, response: NextResponse) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const csp = buildCsp(nonce);

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  const next = NextResponse.next({
    request: { headers: requestHeaders },
  });

  // Copy redirect / status from the original response when present
  const location = response.headers.get("location");
  if (location) {
    response.headers.set("Content-Security-Policy", csp);
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    response.headers.set(
      "Permissions-Policy",
      "camera=(), microphone=(), geolocation=()",
    );
    return response;
  }

  next.headers.set("Content-Security-Policy", csp);
  next.headers.set("X-Content-Type-Options", "nosniff");
  next.headers.set("X-Frame-Options", "DENY");
  next.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  next.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()",
  );
  return next;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    const token = request.cookies.get("ilosiwaju_admin_token")?.value;
    if (!token || !verifyAdminToken(token)) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/admin/login";
      loginUrl.search = "";
      return applyCsp(request, NextResponse.redirect(loginUrl));
    }
  }

  return applyCsp(request, NextResponse.next());
}

export const config = {
  matcher: [
    {
      source: "/((?!_next/static|_next/image|favicon.ico|uploads/).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
