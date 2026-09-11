import { NextResponse } from "next/server";

import { getAdminFromCookie } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { canDeleteOrders, isStaffRole } from "@/lib/roles";
import { User } from "@/models/User";
import type { StaffRole } from "@/types";

export type StaffSession = {
  userId: string;
  role: StaffRole;
};

async function loadStaffSession(): Promise<StaffSession | null> {
  const token = await getAdminFromCookie();
  if (!token?.userId) return null;

  await connectToDatabase();
  const user = await User.findById(token.userId).select("_id role").lean();
  if (!user || !isStaffRole(user.role)) return null;

  return { userId: String(user._id), role: user.role };
}

/** Accès back-office : super_admin ou admin. */
export async function ensureAdminApi() {
  const session = await loadStaffSession();
  if (!session) {
    return NextResponse.json({ message: "Non autorise" }, { status: 401 });
  }
  return null;
}

/** Comme ensureAdminApi, mais renvoie aussi la session (role inclus). */
export async function requireStaffApi(): Promise<
  { ok: true; session: StaffSession } | { ok: false; response: NextResponse }
> {
  try {
    const session = await loadStaffSession();
    if (!session) {
      return {
        ok: false,
        response: NextResponse.json({ message: "Non autorise" }, { status: 401 }),
      };
    }
    return { ok: true, session };
  } catch {
    return {
      ok: false,
      response: NextResponse.json({ message: "Non autorise" }, { status: 401 }),
    };
  }
}

/** Réservé au super_admin (ex. suppression de commandes). */
export async function ensureSuperAdminApi() {
  const result = await requireStaffApi();
  if (!result.ok) return result.response;
  if (!canDeleteOrders(result.session.role)) {
    return NextResponse.json(
      { message: "Action reservee au super admin" },
      { status: 403 },
    );
  }
  return null;
}
