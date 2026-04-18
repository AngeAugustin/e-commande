import { ORDER_STATUS_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/types";

type OrderStatusBadgeProps = {
  status: OrderStatus;
  paymentStatus?: string | null;
};

function badgeClass(status: OrderStatus, paymentStatus?: string | null) {
  if (status === "en_attente" && paymentStatus === "pending") {
    return "border-orange-200 bg-orange-50 text-orange-800";
  }
  switch (status) {
    case "en_attente":
      return "border-zinc-200 bg-zinc-100 text-zinc-800";
    case "paye":
      return "border-emerald-200 bg-emerald-50 text-emerald-800";
    case "en_preparation":
      return "border-blue-200 bg-blue-50 text-blue-800";
    case "pret":
      return "border-amber-200 bg-amber-50 text-amber-800";
    case "livre":
      return "border-green-200 bg-green-50 text-green-800";
    default:
      return "border-zinc-200 bg-zinc-50 text-zinc-700";
  }
}

export function OrderStatusBadge({ status, paymentStatus }: OrderStatusBadgeProps) {
  const label = ORDER_STATUS_LABELS[status];
  return (
    <span
      className={cn(
        "inline-flex max-w-full rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        badgeClass(status, paymentStatus),
      )}
    >
      {label}
    </span>
  );
}
