import type { OrderDto } from "@/types";

function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 4) return "****";
  return `****${digits.slice(-4)}`;
}

function maskAddress(address: string): string {
  const trimmed = address.trim();
  if (!trimmed) return "";
  return "Adresse masquee";
}

/**
 * Champs exposés au suivi public JSON.
 * PII partielle : téléphone (4 derniers chiffres) et adresse masquée.
 * La page serveur /commande/[code] conserve le détail pour le porteur du lien.
 */
export function toPublicOrder(order: Record<string, unknown>): OrderDto {
  const customer = (order.customerInfo ?? {}) as Record<string, unknown>;
  const phone = String(customer.phone ?? "");
  const address = String(customer.address ?? "");

  return {
    _id: String(order._id ?? ""),
    items: Array.isArray(order.items) ? (order.items as OrderDto["items"]) : [],
    total: Number(order.total) || 0,
    status: order.status as OrderDto["status"],
    deliveryType: order.deliveryType as OrderDto["deliveryType"],
    customerInfo: {
      name: String(customer.name ?? ""),
      phone: maskPhone(phone),
      address: address ? maskAddress(address) : "",
    },
    orderCode: String(order.orderCode ?? ""),
    paymentStatus: order.paymentStatus as OrderDto["paymentStatus"],
    paidAt: order.paidAt ? String(order.paidAt) : undefined,
    createdAt: String(order.createdAt ?? ""),
  };
}
