import type { OrderStatus } from "@/types";

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  en_attente: "Attente depot MoMo",
  paye: "Payé",
  pret: "Pret",
};

export const ORDER_STATUSES: OrderStatus[] = ["en_attente", "paye", "pret"];

export const DELIVERY_TYPES = [
  { value: "livraison", label: "Livraison" },
  { value: "retrait", label: "Retrait sur place" },
] as const;
