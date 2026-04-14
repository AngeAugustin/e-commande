import bcrypt from "bcryptjs";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_to_change";
const AUTH_COOKIE = "ilosiwaju_admin_token";

interface AdminTokenPayload extends JwtPayload {
  userId: string;
  role: "admin";
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function signAdminToken(userId: string) {
  return jwt.sign({ userId, role: "admin" }, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyAdminToken(token: string): AdminTokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AdminTokenPayload;
  } catch {
    return null;
  }
}

export async function getAdminFromCookie() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE)?.value;

  if (!token) {
    return null;
  }

  return verifyAdminToken(token);
}

export function getAuthCookieName() {
  return AUTH_COOKIE;
}
