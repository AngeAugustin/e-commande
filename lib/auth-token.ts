import jwt, { type JwtPayload } from "jsonwebtoken";

export interface AdminTokenPayload extends JwtPayload {
  userId: string;
  role: "admin";
}

export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET?.trim();
  if (!secret) {
    throw new Error("JWT_SECRET manquant : obligatoire dans tous les environnements");
  }
  return secret;
}

export function signAdminToken(userId: string) {
  return jwt.sign({ userId, role: "admin" }, getJwtSecret(), { expiresIn: "7d" });
}

export function verifyAdminToken(token: string): AdminTokenPayload | null {
  try {
    const payload = jwt.verify(token, getJwtSecret()) as JwtPayload;
    if (
      typeof payload.userId !== "string" ||
      !payload.userId ||
      payload.role !== "admin"
    ) {
      return null;
    }
    return payload as AdminTokenPayload;
  } catch {
    return null;
  }
}
