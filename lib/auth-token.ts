import jwt, { type JwtPayload } from "jsonwebtoken";

export interface AdminTokenPayload extends JwtPayload {
  userId: string;
  role: "admin";
}

export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET?.trim();
  if (secret) return secret;

  if (process.env.NODE_ENV === "production") {
    throw new Error("JWT_SECRET manquant : obligatoire en production");
  }

  return "dev_secret_to_change";
}

export function signAdminToken(userId: string) {
  return jwt.sign({ userId, role: "admin" }, getJwtSecret(), { expiresIn: "7d" });
}

export function verifyAdminToken(token: string): AdminTokenPayload | null {
  try {
    return jwt.verify(token, getJwtSecret()) as AdminTokenPayload;
  } catch {
    return null;
  }
}
