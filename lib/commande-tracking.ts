import type { OrderStatus } from "@/types";

/** Étapes affichées sur la fiche commande client : paiement puis préparation → livraison */
export const COMMANDE_TRACKING_STEP_IDS = [
  "paye",
  "en_preparation",
  "pret",
  "livre",
] as const;

export type CommandeTrackingStepId = (typeof COMMANDE_TRACKING_STEP_IDS)[number];

export const COMMANDE_TRACKING_LABELS: Record<CommandeTrackingStepId, string> = {
  paye: "Payé",
  en_preparation: "En preparation",
  pret: "Pret",
  livre: "Livre",
};

/**
 * `paye` = commande payée, cuisine pas encore lancée. `en_attente` + payé (legacy) → même étape.
 */
export function getCommandeTrackingStepIndex(orderStatus: OrderStatus): number {
  switch (orderStatus) {
    case "paye":
    case "en_attente":
      return 0;
    case "en_preparation":
      return 1;
    case "pret":
      return 2;
    case "livre":
      return 3;
    default:
      return 0;
  }
}
