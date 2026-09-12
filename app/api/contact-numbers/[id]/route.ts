import { NextResponse } from "next/server";

import { ensureAdminApi } from "@/lib/api-guard";
import { pickContactNumberFields } from "@/lib/contact-number-fields";
import { connectToDatabase } from "@/lib/mongodb";
import { ContactNumber } from "@/models/ContactNumber";

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function PUT(request: Request, { params }: RouteParams) {
  const unauthorized = await ensureAdminApi();
  if (unauthorized) {
    return unauthorized;
  }

  try {
    const { id } = await params;
    const body = (await request.json()) as Record<string, unknown>;
    const picked = pickContactNumberFields(body);
    if (!picked.ok) {
      return NextResponse.json({ message: picked.message }, { status: 400 });
    }

    await connectToDatabase();
    const existing = await ContactNumber.findById(id);
    if (!existing) {
      return NextResponse.json({ message: "Numero introuvable" }, { status: 404 });
    }

    if (picked.data.kind === "momo") {
      const updated = await ContactNumber.findByIdAndUpdate(
        id,
        {
          $set: {
            kind: "momo",
            number: picked.data.number,
            network: picked.data.network,
          },
        },
        { new: true, runValidators: true },
      );
      return NextResponse.json(updated);
    }

    const updated = await ContactNumber.findByIdAndUpdate(
      id,
      {
        $set: { kind: "whatsapp", number: picked.data.number },
        $unset: { network: 1 },
      },
      { new: true, runValidators: true },
    );
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json(
      { message: "Mise a jour du numero impossible" },
      { status: 500 },
    );
  }
}

export async function DELETE(_: Request, { params }: RouteParams) {
  const unauthorized = await ensureAdminApi();
  if (unauthorized) {
    return unauthorized;
  }

  try {
    const { id } = await params;
    await connectToDatabase();
    const deleted = await ContactNumber.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ message: "Numero introuvable" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { message: "Suppression du numero impossible" },
      { status: 500 },
    );
  }
}
