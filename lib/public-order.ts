import type { OrderDto } from "@/types";

/** Champs exposés au suivi public (sans métadonnées internes). */
export function toPublicOrder(order: Record<string, unknown>): OrderDto {
  const customer = (order.customerInfo ?? {}) as Record<string, unknown>;
  return {
    _id: String(order._id ?? ""),
    items: Array.isArray(order.items) ? (order.items as OrderDto["items"]) : [],
    total: Number(order.total) || 0,
    status: order.status as OrderDto["status"],
    deliveryType: order.deliveryType as OrderDto["deliveryType"],
    customerInfo: {
      name: String(customer.name ?? ""),
      phone: String(customer.phone ?? ""),
      address: String(customer.address ?? ""),
    },
    orderCode: String(order.orderCode ?? ""),
    paymentStatus: order.paymentStatus as OrderDto["paymentStatus"],
    paidAt: order.paidAt ? String(order.paidAt) : undefined,
    createdAt: String(order.createdAt ?? ""),
  };
}
