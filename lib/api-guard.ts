import { NextResponse } from "next/server";

import { getAdminFromCookie } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";

export async function ensureAdminApi() {
  const admin = await getAdminFromCookie();
  if (!admin?.userId) {
    return NextResponse.json({ message: "Non autorise" }, { status: 401 });
  }

  try {
    await connectToDatabase();
    const user = await User.findById(admin.userId).select("_id role").lean();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ message: "Non autorise" }, { status: 401 });
    }
  } catch {
    return NextResponse.json({ message: "Non autorise" }, { status: 401 });
  }

  return null;
}
