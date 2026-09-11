import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

import { NextResponse } from "next/server";

import { ensureAdminApi } from "@/lib/api-guard";

export const runtime = "nodejs";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_SIZE = 5 * 1024 * 1024;

function detectImageExt(buffer: Buffer): "jpg" | "png" | "webp" | null {
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return "jpg";
  }
  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return "png";
  }
  if (
    buffer.length >= 12 &&
    buffer.toString("ascii", 0, 4) === "RIFF" &&
    buffer.toString("ascii", 8, 12) === "WEBP"
  ) {
    return "webp";
  }
  return null;
}

export async function POST(request: Request) {
  const unauthorized = await ensureAdminApi();
  if (unauthorized) {
    return unauthorized;
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ message: "Fichier manquant" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { message: "Format non supporte (JPG, PNG, WEBP uniquement)" },
        { status: 400 },
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { message: "Fichier trop volumineux (max 5MB)" },
        { status: 400 },
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const ext = detectImageExt(buffer);
    if (!ext) {
      return NextResponse.json(
        { message: "Contenu fichier invalide (signature image requise)" },
        { status: 400 },
      );
    }

    const declaredExt =
      file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
    if (ext !== declaredExt) {
      return NextResponse.json(
        { message: "Type declare incoherent avec le fichier" },
        { status: 400 },
      );
    }

    const fileName = `${Date.now()}-${randomUUID()}.${ext}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });
    await writeFile(path.join(uploadDir, fileName), buffer);

    return NextResponse.json({ url: `/uploads/${fileName}` }, { status: 201 });
  } catch {
    return NextResponse.json({ message: "Upload image impossible" }, { status: 500 });
  }
}
