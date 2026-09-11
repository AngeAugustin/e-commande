import { redirect } from "next/navigation";

import { UsersManager } from "@/components/admin/users-manager";
import { getAdminFromCookie } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { canManageUsers, isStaffRole } from "@/lib/roles";
import { User } from "@/models/User";
import type { StaffRole } from "@/types";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const admin = await getAdminFromCookie();
  await connectToDatabase();

  const me = admin?.userId
    ? await User.findById(admin.userId).select("role").lean()
    : null;

  if (!me || !isStaffRole(me.role) || !canManageUsers(me.role)) {
    redirect("/admin");
  }

  const currentUserRole: StaffRole = me.role;
  const users = await User.find().sort({ createdAt: -1 }).select("-password").lean();

  const serializedUsers = users.map((user) => ({
    _id: String(user._id),
    firstName: user.firstName || "",
    lastName: user.lastName || "",
    email: user.email,
    role: user.role,
    createdAt: user.createdAt ? new Date(user.createdAt).toISOString() : undefined,
  }));

  return (
    <UsersManager
      initialUsers={serializedUsers}
      currentUserId={admin?.userId || ""}
      currentUserRole={currentUserRole}
    />
  );
}
