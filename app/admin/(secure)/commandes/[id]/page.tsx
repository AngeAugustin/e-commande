import Image from "next/image";
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
import { getMomoNetworkLogo } from "@/lib/momo-networks";
import { isOrderPaid } from "@/lib/order-payment";
import { canDeleteOrders, isStaffRole } from "@/lib/roles";
import { formatPrice } from "@/lib/utils";
import { Order } from "@/models/Order";
import { User } from "@/models/User";
import type { DeliveryType, MomoNetwork, OrderStatus } from "@/types";

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

  const rawMomo = order.momoPayment as
    | { network?: string; number?: string }
    | null
    | undefined;
  const momoPayment =
    rawMomo?.network && rawMomo?.number
      ? { network: rawMomo.network as MomoNetwork, number: rawMomo.number }
      : null;

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

  const phoneHref = `tel:${order.customerInfo.phone.replace(/\s/g, "")}`;

  return (
    <section className="mx-auto max-w-5xl space-y-5">
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

      {/* Identite commande */}
      <Card className="space-y-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <OrderStatusBadge
                status={status}
                paymentStatus={order.paymentStatus as string}
              />
              <span className="rounded-full bg-surface-muted px-2.5 py-0.5 text-xs font-semibold text-ink-muted">
                {deliveryLabel}
              </span>
            </div>
            <h1 className="break-all font-[family-name:var(--font-display)] text-2xl font-bold tracking-tight text-palm sm:break-normal sm:whitespace-nowrap sm:text-3xl">
              {order.orderCode}
            </h1>
            <p className="text-sm text-ink-muted">
              Creee le {formatDateTime(order.createdAt)}
              {order.paidAt ? ` · Payee le ${formatDateTime(order.paidAt)}` : ""}
            </p>
          </div>
          <div className="shrink-0 rounded-2xl bg-palm/5 px-4 py-3 sm:text-right">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
              Total
            </p>
            <p className="mt-0.5 font-[family-name:var(--font-display)] text-2xl font-bold tabular-nums text-palm">
              {formatPrice(order.total)}
            </p>
          </div>
        </div>

        <OrderProgressTrack status={status} />
      </Card>

      {/* Actions prioritaires */}
      <Card className="space-y-3">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-semibold text-palm">Actions</h2>
            <p className="text-xs text-ink-muted">
              {paid
                ? status === "pret"
                  ? "Commande terminee — le client peut venir recuperer."
                  : "Paiement confirme — preparez puis marquez comme pret."
                : "Verifiez le depot MoMo avant de confirmer le paiement."}
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          <OrderStatusSelect
            orderId={String(order._id)}
            value={status}
            paymentStatus={order.paymentStatus as string | undefined}
          />
          <OrderReceiptButton order={receiptOrder} labeled />
          {showDelete ? (
            <OrderDeleteButton
              orderId={String(order._id)}
              orderCode={order.orderCode}
              redirectTo="/admin/commandes"
              labeled
            />
          ) : null}
        </div>
      </Card>

      {/* Client + paiement */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-muted">
            Client
          </h2>
          <dl className="space-y-3">
            <div>
              <dt className="text-xs text-ink-muted">Nom</dt>
              <dd className="mt-0.5 text-base font-semibold text-foreground">
                {order.customerInfo.name}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-ink-muted">Telephone</dt>
              <dd className="mt-0.5">
                <a
                  href={phoneHref}
                  className="inline-flex items-center gap-2 text-base font-semibold text-chili transition hover:text-chili-hover"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    aria-hidden
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6.6 4.8c.4-.4 1-.5 1.5-.3l2.2.9c.5.2.8.7.7 1.2l-.4 2.1a1 1 0 0 0 .3.9l1.7 1.7a1 1 0 0 0 .9.3l2.1-.4c.5-.1 1 .2 1.2.7l.9 2.2c.2.5.1 1.1-.3 1.5l-1.1 1.1c-.5.5-1.2.7-1.9.5-2.1-.6-4.3-2.1-6.2-4S5.4 10.2 4.8 8.1c-.2-.7 0-1.4.5-1.9l1.3-1.4Z"
                    />
                  </svg>
                  {order.customerInfo.phone}
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-xs text-ink-muted">Mode</dt>
              <dd className="mt-0.5 text-sm font-medium text-foreground">
                {deliveryType === "livraison"
                  ? order.customerInfo.address || "Adresse non renseignee"
                  : "Retrait au restaurant"}
              </dd>
            </div>
          </dl>
        </Card>

        <Card className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-muted">
            Paiement MoMo
          </h2>
          {momoPayment ? (
            <div className="flex items-center gap-3 rounded-xl border border-border bg-surface-muted/60 px-3 py-3">
              <Image
                src={getMomoNetworkLogo(momoPayment.network)}
                alt={momoPayment.network}
                width={44}
                height={44}
                className="h-11 w-11 shrink-0 rounded-lg object-contain"
              />
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                  {momoPayment.network}
                </p>
                <p className="text-lg font-bold tracking-wide text-foreground">
                  {momoPayment.number}
                </p>
              </div>
            </div>
          ) : (
            <p className="rounded-xl border border-dashed border-border px-3 py-3 text-sm text-ink-muted">
              Aucun numero MoMo associe a cette commande.
            </p>
          )}
          <div
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
              paid
                ? "bg-palm/10 text-palm"
                : "bg-chili/10 text-chili"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${paid ? "bg-palm" : "bg-chili"}`}
              aria-hidden
            />
            {paid ? "Depot confirme" : "Depot en attente"}
          </div>
        </Card>
      </div>

      {/* Articles */}
      <Card className="overflow-hidden p-0">
        <div className="flex items-center justify-between border-b border-border/70 px-4 py-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-muted">
            Articles
          </h2>
          <span className="text-xs font-medium text-ink-muted">
            {items.reduce((acc, item) => acc + item.quantity, 0)} produit
            {items.reduce((acc, item) => acc + item.quantity, 0) > 1 ? "s" : ""}
          </span>
        </div>
        <ul className="divide-y divide-border/60">
          {items.map((item, index) => (
            <li
              key={`${item.productId}-${index}`}
              className="flex items-center gap-3 px-4 py-3"
            >
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-surface-muted">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-foreground">{item.name}</p>
                <p className="text-xs text-ink-muted">
                  {item.quantity} × {formatPrice(item.price)}
                </p>
              </div>
              <p className="shrink-0 text-sm font-semibold tabular-nums text-palm">
                {formatPrice(item.price * item.quantity)}
              </p>
            </li>
          ))}
        </ul>
        <div className="flex items-center justify-between border-t border-border bg-surface-muted/60 px-4 py-3.5">
          <span className="text-sm font-semibold text-ink-muted">Total commande</span>
          <span className="font-[family-name:var(--font-display)] text-xl font-bold tabular-nums text-palm">
            {formatPrice(order.total)}
          </span>
        </div>
      </Card>
    </section>
  );
}
