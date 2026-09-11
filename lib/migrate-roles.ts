import { User } from "@/models/User";

let migrated = false;

/**
 * Les anciens comptes `role: "admin"` deviennent `super_admin`
 * tant qu'aucun super_admin n'existe encore (une fois par process).
 */
export async function migrateLegacyAdminRoles() {
  if (migrated) return;
  migrated = true;

  const superCount = await User.countDocuments({ role: "super_admin" });
  if (superCount > 0) return;

  // Bypass validation Mongoose (enum) pour la migration one-shot.
  await User.collection.updateMany({ role: "admin" }, { $set: { role: "super_admin" } });
}
