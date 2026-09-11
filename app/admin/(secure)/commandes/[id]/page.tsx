import Link from "next/link";
import { notFound } from "next/navigation";
import { Types } from "mongoose";

import { OrderDeleteButton } from "@/components/admin/order-delete-button";
import { OrderProgressTrack } from "@/components/admin/order-progress-track";
import { OrderReceiptButton } from "@/components/admin/order-receipt-button";
import { OrderStatusBadge } from "@/components/admin/order-status-badge";
import { OrderStatusSelect } from "@/components/admin/order-status-select";
import { Card } from "@/components/ui/card";
import { getAdminFromCookie } from "@/lib/auth";
import { DELIVERY_TYPES } from "@/lib/constants";
import { connectToDatabase } from "@/lib/mongodb";
import { isOrderPaid } from "@/lib/order-payment";
import { canDeleteOrders, isStaffRole } from "@/lib/roles";
import { formatPrice } from "@/lib/utils";
import { Order } from "@/models/Order";
import { User } from "@/models/User";
import type { DeliveryType, OrderStatus } from "@/types";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

function formatDateTime(value: Date | string | undefined) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default async function AdminOrderDetailPage({ params }: PageProps) {
  const { id } = await params;
  if (!Types.ObjectId.isValid(id)) notFound();

  await connectToDatabase();

  const [order, token] = await Promise.all([
    Order.findById(id).lean(),
    getAdminFromCookie(),
  ]);

  if (!order) notFound();

  const me = token?.userId
    ? await User.findById(token.userId).select("role").lean()
    : null;
  const showDelete = Boolean(me && isStaffRole(me.role) && canDeleteOrders(me.role));

  const status = order.status as OrderStatus;
  const deliveryType = order.deliveryType as DeliveryType;
  const deliveryLabel =
    DELIVERY_TYPES.find((d) => d.value === deliveryType)?.label ?? deliveryType;
  const paid = isOrderPaid(order.paymentStatus as string | undefined);
  const items = order.items as Array<{
    productId: string;
    name: string;
    quantity: number;
    price: number;
    image: string;
  }>;

  const receiptOrder = {
    orderCode: order.orderCode,
    createdAt: new Date(order.createdAt).toISOString(),
    total: order.total,
    status,
    deliveryType,
    paymentStatus: order.paymentStatus as string | undefined,
    customerInfo: {
      name: order.customerInfo.name,
      phone: order.customerInfo.phone,
      address: order.customerInfo.address,
    },
    items: items.map((item) => ({
      name: item.name,
      quantity: item.quantity,
      price: item.price,
    })),
  };

  return (
    <section className="-mx-4 -my-4 min-h-[calc(100%+2rem)] space-y-5 bg-white px-3 py-4 pb-[calc(6rem+env(safe-area-inset-bottom))] lg:-mx-8 lg:-my-8 lg:min-h-[calc(100%+4rem)] lg:px-4 lg:py-5 lg:pb-8">
      <Link
        href="/admin/commandes"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-muted transition hover:text-palm"
      >
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="m15 18-6-6 6-6" />
        </svg>
        Retour aux commandes
      </Link>

      {/* En-tete simple */}
      <header className="space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-palm">
              {order.orderCode}
            </h1>
            <p className="mt-1 text-sm text-ink-muted">
              {formatDateTime(order.createdAt)}
              {order.paidAt ? ` · Payee le ${formatDateTime(order.paidAt)}` : ""}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">Total</p>
            <p className="font-[family-name:var(--font-display)] text-2xl font-bold tabular-nums text-palm">
              {formatPrice(order.total)}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <OrderStatusBadge status={status} paymentStatus={order.paymentStatus as string} />
          <span className="text-sm text-ink-muted">{deliveryLabel}</span>
          <span className="text-mist">·</span>
          <span className="text-sm text-ink-muted">
            MoMo {paid ? "confirme" : "en attente"}
          </span>
        </div>

        <OrderProgressTrack status={status} />
      </header>

      {/* Actions */}
      <Card className="flex flex-wrap items-center gap-3">
        <OrderStatusSelect
          orderId={String(order._id)}
          value={status}
          paymentStatus={order.paymentStatus as string | undefined}
        />
        <OrderReceiptButton order={receiptOrder} />
        {showDelete ? (
          <OrderDeleteButton
            orderId={String(order._id)}
            orderCode={order.orderCode}
            redirectTo="/admin/commandes"
          />
        ) : null}
      </Card>

      {/* Client */}
      <Card className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-muted">Client</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <p className="text-xs text-ink-muted">Nom</p>
            <p className="font-semibold text-foreground">{order.customerInfo.name}</p>
          </div>
          <div>
            <p className="text-xs text-ink-muted">Telephone</p>
            <a
              href={`tel:${order.customerInfo.phone.replace(/\s/g, "")}`}
              className="font-semibold text-chili hover:text-chili-hover"
            >
              {order.customerInfo.phone}
            </a>
          </div>
          <div className="sm:col-span-2">
            <p className="text-xs text-ink-muted">Retrait</p>
            <p className="font-medium text-foreground">
              {deliveryType === "livraison"
                ? order.customerInfo.address || "Adresse non renseignee"
                : "A recuperer au restaurant"}
            </p>
          </div>
        </div>
      </Card>

      {/* Plats */}
      <Card className="overflow-hidden p-0">
        <div className="border-b border-border/70 px-4 py-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-muted">
            Articles
          </h2>
        </div>
        <ul className="divide-y divide-border/60">
          {items.map((item, index) => (
            <li
              key={`${item.productId}-${index}`}
              className="flex items-baseline justify-between gap-4 px-4 py-3 text-sm"
            >
              <p className="min-w-0">
                <span className="font-semibold text-palm">{item.quantity}×</span>{" "}
                <span className="text-foreground">{item.name}</span>
              </p>
              <p className="shrink-0 tabular-nums text-ink-muted">
                {formatPrice(item.price * item.quantity)}
              </p>
            </li>
          ))}
        </ul>
        <div className="flex items-center justify-between border-t border-border bg-surface-muted/50 px-4 py-3">
          <span className="text-sm font-medium text-ink-muted">Total</span>
          <span className="font-bold tabular-nums text-palm">{formatPrice(order.total)}</span>
        </div>
      </Card>
    </section>
  );
}
