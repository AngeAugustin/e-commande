import { ReferentielManager } from "@/components/admin/referentiel-manager";
import { connectToDatabase } from "@/lib/mongodb";
import { ContactNumber } from "@/models/ContactNumber";
import type { ContactNumberDto } from "@/types";

export const dynamic = "force-dynamic";

export default async function AdminReferentielPage() {
  await connectToDatabase();
  const numbers = (await ContactNumber.find()
    .sort({ kind: 1, createdAt: -1 })
    .lean()) as ContactNumberDto[];

  const serialized = numbers.map((item) => ({
    ...item,
    _id: String(item._id),
    createdAt: item.createdAt
      ? new Date(item.createdAt as unknown as string).toISOString()
      : undefined,
  }));

  return <ReferentielManager initialNumbers={serialized} />;
}
