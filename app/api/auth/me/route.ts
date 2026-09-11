import { NextResponse } from "next/server";

import { getAdminFromCookie } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";

export async function GET() {
  const admin = await getAdminFromCookie();
  if (!admin?.userId) {
    return NextResponse.json({ authenticated: false });
  }

  try {
    await connectToDatabase();
    const user = await User.findById(admin.userId).select("_id role").lean();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ authenticated: false });
    }
    return NextResponse.json({ authenticated: true });
  } catch {
    return NextResponse.json({ authenticated: false });
  }
}
