import { notFound } from "next/navigation";

import { CopyOrderCodeButton } from "@/components/commande/copy-order-code-button";
import { MomoPaymentInstructions } from "@/components/commande/momo-payment-instructions";
import { OrderReceiptPreview } from "@/components/commande/order-receipt-preview";
import { Card } from "@/components/ui/card";
import {
  COMMANDE_TRACKING_LABELS,
  COMMANDE_TRACKING_STEP_IDS,
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

  return (
    <section className="mx-auto max-w-2xl space-y-4">
      <Card className="space-y-3">
        <p className="text-sm text-ink-muted">Code commande</p>
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <h1 className="text-2xl font-extrabold text-palm">{order.orderCode}</h1>
            {paid ? (
              <span
                className="inline-flex shrink-0 items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-800"
                aria-label="Commande deja payee"
              >
                Payé
              </span>
            ) : (
              <span
                className="inline-flex shrink-0 items-center rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-900"
                aria-label="En attente de depot MoMo"
              >
                Attente paiement
              </span>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <CopyOrderCodeButton code={order.orderCode} />
          </div>
        </div>

        {!paid ? <MomoPaymentInstructions orderCode={order.orderCode} total={order.total} /> : null}

        <div className="space-y-2">
          <p className="text-sm font-semibold text-palm">Suivi de la commande</p>
          <ol className="grid grid-cols-2 gap-2">
            {COMMANDE_TRACKING_STEP_IDS.map((stepId, index) => {
              const isPast = currentStepIndex >= 0 && index < currentStepIndex;
              const isCurrent = currentStepIndex >= 0 && index === currentStepIndex;
              const isAwaitingPayment = !paid && stepId === "paye";

              const done =
                "border-palm bg-palm/10 text-palm" as const;
              const current =
                "border-chili bg-chili/10 text-chili" as const;
              const muted = "border-border bg-surface text-ink-muted" as const;

              let statusClass: string;
              let textClass: string;
              if (isAwaitingPayment) {
                statusClass = current;
                textClass = "text-chili";
              } else if (currentStatus === "pret" && isCurrent && stepId === "pret") {
                statusClass = done;
                textClass = "text-palm";
              } else if (isPast) {
                statusClass = done;
                textClass = "text-palm";
              } else if (isCurrent) {
                statusClass = current;
                textClass = "text-chili";
              } else {
                statusClass = muted;
                textClass = "text-ink-muted";
              }

              return (
                <li key={stepId} className="flex flex-col items-center gap-1.5 text-center">
                  <span
                    className={`inline-flex h-9 w-9 items-center justify-center rounded-full border ${statusClass}`}
                  >
                    {stepId === "paye" || stepId === "pret" ? (
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 24 24"
                        className="h-4.5 w-4.5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="12" cy="12" r="8" />
                        <path d="m8.8 12.3 2.2 2.3 4.2-4.6" />
                      </svg>
                    ) : null}
                  </span>
                  <span className={`text-xs font-semibold sm:text-sm ${textClass}`}>
                    {COMMANDE_TRACKING_LABELS[stepId]}
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
          {order.deliveryType === "livraison" && order.customerInfo.address ? (
            <p className="text-ink-muted">Adresse: {order.customerInfo.address}</p>
          ) : null}
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
