import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { getAdminFromCookie } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { isStaffRole } from "@/lib/roles";
import { User } from "@/models/User";

export default async function SecureAdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const admin = await getAdminFromCookie();
  if (!admin) {
    redirect("/admin/login");
  }

  await connectToDatabase();
  const user = await User.findById(admin.userId).lean();
  if (!user || !isStaffRole(user.role)) {
    redirect("/admin/login");
  }

  const adminEmail = user.email;
  const adminRole = user.role;
  const adminFirstName = user.firstName ?? "Admin";
  const adminLastName = user.lastName ?? "";

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-background lg:flex-row">
      <AdminSidebar
        adminEmail={adminEmail}
        adminRole={adminRole}
        adminFirstName={adminFirstName}
        adminLastName={adminLastName}
      />
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 pb-[calc(6rem+env(safe-area-inset-bottom))] lg:p-8">
        {children}
      </div>
    </div>
  );
}
