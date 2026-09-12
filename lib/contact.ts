import { connectToDatabase } from "@/lib/mongodb";
import { ContactNumber } from "@/models/ContactNumber";
import { formatPrice } from "@/lib/utils";
import type { ContactNumberDto, MomoNetwork } from "@/types";

export type MomoContact = {
  number: string;
  network: MomoNetwork;
};

function envWhatsAppDigits() {
  return (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "2290197339551").replace(/\D/g, "");
}

function toDto(doc: {
  _id: unknown;
  kind: string;
  number: string;
  network?: string;
  createdAt?: Date;
}): ContactNumberDto {
  return {
    _id: String(doc._id),
    kind: doc.kind as ContactNumberDto["kind"],
    number: doc.number,
    network: doc.network as MomoNetwork | undefined,
    createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : undefined,
  };
}

export async function listContactNumbers(): Promise<ContactNumberDto[]> {
  try {
    await connectToDatabase();
    const rows = await ContactNumber.find().sort({ kind: 1, createdAt: -1 }).lean();
    return rows.map((row) => toDto(row));
  } catch {
    return [];
  }
}

/** Tous les numéros MoMo du référentiel (sans repli env). */
export async function getMomoContacts(): Promise<MomoContact[]> {
  const rows = await listContactNumbers();
  return rows
    .filter((row) => row.kind === "momo" && row.network)
    .map((row) => ({ number: row.number, network: row.network as MomoNetwork }));
}

/**
 * Une option par réseau (numéro le plus récent), pour le choix client.
 */
export async function getMomoNetworkOptions(): Promise<MomoContact[]> {
  const contacts = await getMomoContacts();
  const byNetwork = new Map<MomoNetwork, MomoContact>();
  for (const contact of contacts) {
    if (!byNetwork.has(contact.network)) {
      byNetwork.set(contact.network, contact);
    }
  }
  return [...byNetwork.values()];
}

export async function resolveMomoPayment(
  networkRaw?: unknown,
): Promise<{ ok: true; data: MomoContact } | { ok: false; message: string }> {
  const options = await getMomoNetworkOptions();
  if (options.length === 0) {
    return {
      ok: false,
      message: "Aucun numero MoMo configure. Contactez le restaurant.",
    };
  }

  if (options.length === 1) {
    return { ok: true, data: options[0] };
  }

  const network = String(networkRaw ?? "").trim() as MomoNetwork;
  const selected = options.find((option) => option.network === network);
  if (!selected) {
    return {
      ok: false,
      message: "Choisissez un reseau de paiement (MTN ou Moov)",
    };
  }

  return { ok: true, data: selected };
}

/** Premier numéro WhatsApp (chiffres seuls), avec repli env. */
export async function getWhatsAppNumber() {
  const rows = await listContactNumbers();
  const first = rows.find((row) => row.kind === "whatsapp");
  if (first) return first.number.replace(/\D/g, "");
  return envWhatsAppDigits();
}

export async function getWhatsAppHref(prefillMessage?: string) {
  const phone = await getWhatsAppNumber();
  if (!prefillMessage) {
    return `https://wa.me/${phone}`;
  }
  return `https://wa.me/${phone}?text=${encodeURIComponent(prefillMessage)}`;
}

export type OrderWhatsAppDetails = {
  orderCode: string;
  totalLabel: string;
  customerName: string;
  customerPhone: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  momoNetwork?: string;
  momoNumber?: string;
};

export function buildOrderWhatsAppMessage(details: OrderWhatsAppDetails) {
  const lines = details.items.map(
    (item) => `- ${item.name} x${item.quantity} (${formatPrice(item.price * item.quantity)})`,
  );

  const momoLine =
    details.momoNetwork && details.momoNumber
      ? `Paiement MoMo : ${details.momoNetwork} ${details.momoNumber}`
      : null;

  return [
    `Bonjour, voici la capture du paiement pour la commande ${details.orderCode}.`,
    "",
    `Client : ${details.customerName}`,
    `Telephone : ${details.customerPhone}`,
    "",
    "Details de la commande :",
    ...lines,
    "",
    `Total : ${details.totalLabel}`,
    ...(momoLine ? [momoLine] : []),
  ].join("\n");
}

export function buildWhatsAppHref(phoneDigits: string, prefillMessage?: string) {
  const phone = phoneDigits.replace(/\D/g, "");
  if (!prefillMessage) {
    return `https://wa.me/${phone}`;
  }
  return `https://wa.me/${phone}?text=${encodeURIComponent(prefillMessage)}`;
}

