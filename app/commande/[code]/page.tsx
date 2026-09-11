import { notFound } from "next/navigation";

import { CopyOrderCodeButton } from "@/components/commande/copy-order-code-button";
import { MomoPaymentInstructions } from "@/components/commande/momo-payment-instructions";
import { OrderReceiptPreview } from "@/components/commande/order-receipt-preview";
import { Card } from "@/components/ui/card";
import {
  COMMANDE_TRACKING_LABELS,
  COMMANDE_TRACKING_STEP_IDS,
  getCommandeStatusBadge,
  getCommandeTrackingStepIndex,
} from "@/lib/commande-tracking";
import { isOrderPaid } from "@/lib/order-payment";
import { connectToDatabase } from "@/lib/mongodb";
import { formatPrice } from "@/lib/utils";
import { Order } from "@/models/Order";
import type { DeliveryType, OrderStatus } from "@/types";

type CommandePageProps = {
  params: Promise<{ code: string }>;
};

export const revalidate = 15;

export default async function CommandePage({ params }: CommandePageProps) {
  const { code } = await params;
  await connectToDatabase();
  const order = await Order.findOne({ orderCode: code }).lean();

  if (!order) {
    notFound();
  }

  const currentStatus = order.status as OrderStatus;
  const paymentStatus = order.paymentStatus as string | undefined;
  const paid = isOrderPaid(paymentStatus);
  const currentStepIndex = getCommandeTrackingStepIndex(currentStatus, paymentStatus);
  const statusBadge = getCommandeStatusBadge(currentStatus, paymentStatus);
  const isReady = currentStatus === "pret";

  const receiptOrder = {
    orderCode: order.orderCode,
    createdAt: new Date(order.createdAt).toISOString(),
    total: order.total,
    status: currentStatus,
    deliveryType: order.deliveryType as DeliveryType,
    paymentStatus,
    customerInfo: {
      name: order.customerInfo.name,
      phone: order.customerInfo.phone,
      address: order.customerInfo.address,
    },
    items: order.items.map((item: { name: string; quantity: number; price: number }) => ({
      name: item.name,
      quantity: item.quantity,
      price: item.price,
    })),
  };

  const badgeClass =
    statusBadge.tone === "ready"
      ? "border-palm/30 bg-palm text-white"
      : statusBadge.tone === "paid"
        ? "border-emerald-200 bg-emerald-50 text-emerald-800"
        : "border-amber-200 bg-amber-50 text-amber-900";

  return (
    <section className="mx-auto max-w-2xl space-y-4">
      <Card className="space-y-3">
        <p className="text-sm text-ink-muted">Code commande</p>
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <h1 className="text-2xl font-extrabold text-palm">{order.orderCode}</h1>
            <span
              className={`inline-flex shrink-0 items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${badgeClass}`}
              aria-label={statusBadge.label}
            >
              {statusBadge.label}
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <CopyOrderCodeButton code={order.orderCode} />
          </div>
        </div>

        {!paid ? <MomoPaymentInstructions orderCode={order.orderCode} total={order.total} /> : null}

        {isReady ? (
          <div className="rounded-xl border border-palm/25 bg-palm/8 px-4 py-3 text-sm text-palm">
            <p className="font-bold">Votre commande est prete</p>
            <p className="mt-1 text-palm/80">
              Passez la recuperer au restaurant. Presentez le code{" "}
              <span className="font-semibold">{order.orderCode}</span>.
            </p>
          </div>
        ) : null}

        <div className="space-y-3">
          <p className="text-sm font-semibold text-palm">Suivi de la commande</p>
          <ol className="relative grid grid-cols-2 gap-3">
            <div
              aria-hidden
              className={`pointer-events-none absolute left-[25%] right-[25%] top-5 h-0.5 ${
                currentStepIndex >= 1 ? "bg-palm" : paid ? "bg-chili/40" : "bg-border"
              }`}
            />
            {COMMANDE_TRACKING_STEP_IDS.map((stepId, index) => {
              const isPast = currentStepIndex >= 0 && index < currentStepIndex;
              const isCurrent = currentStepIndex >= 0 && index === currentStepIndex;
              const isAwaitingPayment = !paid && stepId === "paye";
              const isReadyStep = isReady && stepId === "pret";

              let ringClass: string;
              let textClass: string;
              if (isAwaitingPayment) {
                ringClass = "border-chili bg-chili/10 text-chili ring-4 ring-chili/15";
                textClass = "text-chili";
              } else if (isReadyStep) {
                ringClass = "border-palm bg-palm text-white shadow-[0_0_0_4px_rgba(10,61,46,0.15)]";
                textClass = "text-palm";
              } else if (isPast) {
                ringClass = "border-palm bg-palm/15 text-palm";
                textClass = "text-palm";
              } else if (isCurrent) {
                ringClass = "border-chili bg-chili/10 text-chili ring-4 ring-chili/15";
                textClass = "text-chili";
              } else {
                ringClass = "border-border bg-surface text-ink-muted";
                textClass = "text-ink-muted";
              }

              return (
                <li key={stepId} className="relative z-[1] flex flex-col items-center gap-2 text-center">
                  <span
                    className={`inline-flex h-10 w-10 items-center justify-center rounded-full border-2 transition ${ringClass}`}
                  >
                    {isPast || isReadyStep || (isCurrent && stepId === "paye" && paid) ? (
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 24 24"
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="m8.8 12.3 2.2 2.3 4.2-4.6" />
                      </svg>
                    ) : isAwaitingPayment || isCurrent ? (
                      <span className="h-2.5 w-2.5 rounded-full bg-current" />
                    ) : (
                      <span className="h-2 w-2 rounded-full bg-current/40" />
                    )}
                  </span>
                  <span className={`text-xs font-semibold sm:text-sm ${textClass}`}>
                    {COMMANDE_TRACKING_LABELS[stepId]}
                  </span>
                  <span className="text-[10px] font-medium uppercase tracking-wide text-ink-muted">
                    {isAwaitingPayment
                      ? "En cours"
                      : isReadyStep
                        ? "Termine"
                        : isPast
                          ? "Fait"
                          : isCurrent
                            ? "En cours"
                            : "A venir"}
                  </span>
                </li>
              );
            })}
          </ol>
        </div>
      </Card>

      <Card className="space-y-2">
        <h2 className="text-lg font-bold text-palm">Détails</h2>
        <div className="rounded-xl border border-border bg-surface-muted px-3 py-2 text-sm">
          <p className="font-semibold">Informations client</p>
          <p className="text-ink-muted">{order.customerInfo.name}</p>
          <p className="text-ink-muted">{order.customerInfo.phone}</p>
          <p className="text-ink-muted">Retrait sur place</p>
        </div>
        {order.items.map((item: { name: string; quantity: number; price: number }) => (
          <div key={item.name} className="flex items-center justify-between text-sm">
            <span>
              {item.name} x {item.quantity}
            </span>
            <span>{formatPrice(item.quantity * item.price)}</span>
          </div>
        ))}
        <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
          <span className="font-semibold">Total</span>
          <span className="font-extrabold text-palm">{formatPrice(order.total)}</span>
        </div>
      </Card>

      {paid ? (
        <Card>
          <OrderReceiptPreview order={receiptOrder} />
        </Card>
      ) : null}
    </section>
  );
}
