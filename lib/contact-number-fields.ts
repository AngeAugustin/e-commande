import type { ContactNumberKind, MomoNetwork } from "@/types";

export type ContactNumberWritableFields = {
  kind: ContactNumberKind;
  number: string;
  network?: MomoNetwork;
};

const MAX_NUMBER = 32;
const MOMO_NETWORKS: MomoNetwork[] = ["MTN", "Moov"];

function isMomoNetwork(value: string): value is MomoNetwork {
  return MOMO_NETWORKS.includes(value as MomoNetwork);
}

export function pickContactNumberFields(
  body: Record<string, unknown>,
): { ok: true; data: ContactNumberWritableFields } | { ok: false; message: string } {
  const kind = String(body.kind ?? "").trim() as ContactNumberKind;
  const number = String(body.number ?? "").trim();
  const networkRaw = String(body.network ?? "").trim();

  if (kind !== "momo" && kind !== "whatsapp") {
    return { ok: false, message: "Type de numero invalide" };
  }
  if (!number || number.length > MAX_NUMBER) {
    return { ok: false, message: "Numero invalide" };
  }
  if (!/\d/.test(number)) {
    return { ok: false, message: "Le numero doit contenir des chiffres" };
  }

  if (kind === "momo") {
    if (!isMomoNetwork(networkRaw)) {
      return { ok: false, message: "Reseau MoMo invalide (MTN ou Moov)" };
    }
    return { ok: true, data: { kind, number, network: networkRaw } };
  }

  return { ok: true, data: { kind, number } };
}
