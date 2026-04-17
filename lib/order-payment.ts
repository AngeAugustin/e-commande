import type { OrderPaymentStatus } from "@/types";

/** Commandes historiques sans champ paymentStatus sont considérées payées. */
export function isOrderPaid(paymentStatus: OrderPaymentStatus | string | null | undefined) {
  return paymentStatus == null || paymentStatus === "paid";
}

export function paidOrdersFilter() {
  return {
    $or: [
      { paymentStatus: { $exists: false } },
      { paymentStatus: null },
      { paymentStatus: "paid" },
    ],
  };
}
