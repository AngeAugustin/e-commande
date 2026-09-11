import { ORDER_STATUS_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/types";

type OrderStatusBadgeProps = {
  status: OrderStatus;
  paymentStatus?: string | null;
};

function badgeClass(status: OrderStatus, paymentStatus?: string | null) {
  if (status === "en_attente" && paymentStatus === "pending") {
    return "border-chili/25 bg-chili/10 text-chili";
  }
  switch (status) {
    case "en_attente":
      return "border-border bg-surface-muted text-ink-muted";
    case "paye":
      return "border-palm/25 bg-palm/10 text-palm";
    case "pret":
      return "border-palm-soft/30 bg-palm-soft/15 text-palm-deep";
    default:
      return "border-border bg-surface-muted text-foreground";
  }
}

export function OrderStatusBadge({ status, paymentStatus }: OrderStatusBadgeProps) {
  const label = ORDER_STATUS_LABELS[status] ?? status;
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
