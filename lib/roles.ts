import type { StaffRole } from "@/types";

export const STAFF_ROLES = ["super_admin", "admin"] as const satisfies readonly StaffRole[];

export const ROLE_LABELS: Record<StaffRole, string> = {
  super_admin: "Super admin",
  admin: "Admin",
};

export function isStaffRole(role: unknown): role is StaffRole {
  return role === "super_admin" || role === "admin";
}

export function isSuperAdmin(role: unknown): boolean {
  return role === "super_admin";
}

export function canDeleteOrders(role: unknown): boolean {
  return isSuperAdmin(role);
}

export function canManageUsers(role: unknown): boolean {
  return isSuperAdmin(role);
}

export function parseStaffRole(value: unknown, fallback: StaffRole = "admin"): StaffRole {
  return isStaffRole(value) ? value : fallback;
}
