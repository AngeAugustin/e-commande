import { randomUUID } from "crypto";

import { NextResponse } from "next/server";

import { ensureAdminApi } from "@/lib/api-guard";
import { uploadToBlob } from "@/lib/blob";
import { clientIpFromRequest, rateLimit } from "@/lib/rate-limit";

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

function contentTypeForExt(ext: "jpg" | "png" | "webp"): string {
  if (ext === "png") return "image/png";
  if (ext === "webp") return "image/webp";
  return "image/jpeg";
}

export async function POST(request: Request) {
  const unauthorized = await ensureAdminApi();
  if (unauthorized) {
    return unauthorized;
  }

  try {
    const ip = clientIpFromRequest(request);
    const limited = rateLimit(`upload:${ip}`, { limit: 30, windowMs: 60_000 });
    if (!limited.ok) {
      return NextResponse.json(
        { message: "Trop de requetes, reessayez plus tard" },
        { status: 429, headers: { "Retry-After": String(limited.retryAfterSec) } },
      );
    }

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

    const fileName = `${Date.now()}-${randomUUID().slice(0, 8)}.${ext}`;
    const url = await uploadToBlob(`products/${fileName}`, buffer, {
      contentType: contentTypeForExt(ext),
    });

    return NextResponse.json({ url }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Upload image impossible";
    const isConfig =
      /BLOB_READ_WRITE_TOKEN|token|Unauthorized|401/i.test(message) ||
      !process.env.BLOB_READ_WRITE_TOKEN;
    return NextResponse.json(
      {
        message: isConfig
          ? "Upload image impossible (BLOB_READ_WRITE_TOKEN manquant ou invalide)"
          : "Upload image impossible",
      },
      { status: 500 },
    );
  }
}
