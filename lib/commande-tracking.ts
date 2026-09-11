import { isOrderPaid } from "@/lib/order-payment";
import type { OrderPaymentStatus, OrderStatus } from "@/types";

/** Étapes affichées sur la fiche commande client : paiement puis prêt */
export const COMMANDE_TRACKING_STEP_IDS = ["paye", "pret"] as const;

export type CommandeTrackingStepId = (typeof COMMANDE_TRACKING_STEP_IDS)[number];

export const COMMANDE_TRACKING_LABELS: Record<CommandeTrackingStepId, string> = {
  paye: "Paiement confirme",
  pret: "Pret a recuperer",
};

/**
 * Index de l’étape courante. Retourne -1 tant que le dépôt MoMo n’est pas confirmé.
 */
export function getCommandeTrackingStepIndex(
  orderStatus: OrderStatus,
  paymentStatus?: OrderPaymentStatus | string | null,
): number {
  if (!isOrderPaid(paymentStatus)) {
    return -1;
  }

  switch (orderStatus) {
    case "paye":
    case "en_attente":
      return 0;
    case "pret":
      return 1;
    default:
      return 0;
  }
}

/** Badge affiché à côté du code commande (suivi client). */
export function getCommandeStatusBadge(
  orderStatus: OrderStatus,
  paymentStatus?: OrderPaymentStatus | string | null,
): { label: string; tone: "pending" | "paid" | "ready" } {
  if (orderStatus === "pret") {
    return { label: "Pret a recuperer", tone: "ready" };
  }
  if (isOrderPaid(paymentStatus) || orderStatus === "paye") {
    return { label: "Payé", tone: "paid" };
  }
  return { label: "Attente paiement", tone: "pending" };
}
