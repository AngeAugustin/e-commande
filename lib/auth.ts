import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { cache } from "react";

import { signAdminToken, verifyAdminToken } from "@/lib/auth-token";

const AUTH_COOKIE = "ilosiwaju_admin_token";

export { signAdminToken, verifyAdminToken };

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function comparePassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export const getAdminFromCookie = cache(async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE)?.value;

  if (!token) {
    return null;
  }

  return verifyAdminToken(token);
});

export function getAuthCookieName() {
  return AUTH_COOKIE;
}

export function getAuthCookieOptions(maxAgeSeconds = 60 * 60 * 24 * 7) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    maxAge: maxAgeSeconds,
    path: "/",
  };
}
