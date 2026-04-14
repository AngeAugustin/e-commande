import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { getAdminFromCookie } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
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
  const adminEmail = user?.email ?? "admin@ilosiwaju.com";
  const adminRole = user?.role ?? "admin";
  const adminFirstName = user?.firstName ?? "Admin";
  const adminLastName = user?.lastName ?? "";

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <AdminSidebar
        adminEmail={adminEmail}
        adminRole={adminRole}
        adminFirstName={adminFirstName}
        adminLastName={adminLastName}
      />
      <div className="flex-1 p-4 pb-[calc(6rem+env(safe-area-inset-bottom))] lg:p-8">
        {children}
      </div>
    </div>
  );
}
