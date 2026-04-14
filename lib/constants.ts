import type { OrderStatus } from "@/types";

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  en_attente: "En attente",
  en_preparation: "En preparation",
  pret: "Pret",
  livre: "Livre",
};

export const ORDER_STATUSES: OrderStatus[] = [
  "en_attente",
  "en_preparation",
  "pret",
  "livre",
];

export const DELIVERY_TYPES = [
  { value: "livraison", label: "Livraison" },
  { value: "retrait", label: "Retrait" },
] as const;
