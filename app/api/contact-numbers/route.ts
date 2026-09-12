import { NextResponse } from "next/server";

import { ensureAdminApi } from "@/lib/api-guard";
import { pickContactNumberFields } from "@/lib/contact-number-fields";
import { connectToDatabase } from "@/lib/mongodb";
import { ContactNumber } from "@/models/ContactNumber";

export async function GET() {
  const unauthorized = await ensureAdminApi();
  if (unauthorized) {
    return unauthorized;
  }

  try {
    await connectToDatabase();
    const numbers = await ContactNumber.find().sort({ kind: 1, createdAt: -1 });
    return NextResponse.json(numbers);
  } catch {
    return NextResponse.json(
      { message: "Erreur lors du chargement des numeros" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const unauthorized = await ensureAdminApi();
  if (unauthorized) {
    return unauthorized;
  }

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const picked = pickContactNumberFields(body);
    if (!picked.ok) {
      return NextResponse.json({ message: picked.message }, { status: 400 });
    }

    await connectToDatabase();
    const created = await ContactNumber.create(picked.data);
    return NextResponse.json(created, { status: 201 });
  } catch {
    return NextResponse.json(
      { message: "Creation du numero impossible" },
      { status: 500 },
    );
  }
}
