import type { OrderPaymentStatus } from "@/types";

/** Seul un paiement explicitement confirmé est considéré payé. */
export function isOrderPaid(paymentStatus: OrderPaymentStatus | string | null | undefined) {
  return paymentStatus === "paid";
}

export function paidOrdersFilter() {
  return { paymentStatus: "paid" };
}
