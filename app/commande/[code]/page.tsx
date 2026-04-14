import { notFound } from "next/navigation";
import Link from "next/link";

import { CopyOrderCodeButton } from "@/components/commande/copy-order-code-button";
import { Card } from "@/components/ui/card";
import { ORDER_STATUS_LABELS, ORDER_STATUSES } from "@/lib/constants";
import { connectToDatabase } from "@/lib/mongodb";
import { formatPrice } from "@/lib/utils";
import { Order } from "@/models/Order";
import type { OrderStatus } from "@/types";

type CommandePageProps = {
  params: Promise<{ code: string }>;
};

export const dynamic = "force-dynamic";

export default async function CommandePage({ params }: CommandePageProps) {
  const { code } = await params;
  await connectToDatabase();
  const order = await Order.findOne({ orderCode: code }).lean();

  if (!order) {
    notFound();
  }

  const currentStepIndex = ORDER_STATUSES.indexOf(order.status as OrderStatus);

  return (
    <section className="mx-auto max-w-2xl space-y-4">
      <Card className="space-y-3">
        <p className="text-sm text-zinc-500">Code commande</p>
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-2xl font-black">{order.orderCode}</h1>
          <div className="flex items-center gap-2">
            <Link
              href={`/api/orders/code/${order.orderCode}/receipt`}
              target="_blank"
              title="Telecharger le recu"
              aria-label="Telecharger le recu"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-700 transition hover:border-zinc-400 hover:text-black"
            >
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
                <path d="M12 3v11" />
                <path d="m8 10 4 4 4-4" />
                <path d="M4 17.5v1.2A2.3 2.3 0 0 0 6.3 21h11.4a2.3 2.3 0 0 0 2.3-2.3v-1.2" />
              </svg>
            </Link>
            <CopyOrderCodeButton code={order.orderCode} />
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-semibold text-zinc-700">Suivi de la commande</p>
          <ol className="grid grid-cols-4 gap-2">
            {ORDER_STATUSES.map((status, index) => {
              const isPast = index < currentStepIndex;
              const isCurrent = index === currentStepIndex;
              const statusClass = isPast
                ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                : isCurrent
                  ? "border-orange-500 bg-orange-50 text-orange-700"
                  : "border-zinc-300 bg-white text-zinc-500";
              const textClass = isPast
                ? "text-emerald-700"
                : isCurrent
                  ? "text-orange-700"
                  : "text-zinc-500";

              return (
                <li key={status} className="flex flex-col items-center gap-1.5 text-center">
                  <span
                    className={`inline-flex h-9 w-9 items-center justify-center rounded-full border ${statusClass}`}
                  >
                    {status === "en_attente" ? (
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
                        <path d="M12 8v4l3 2" />
                      </svg>
                    ) : null}
                    {status === "en_preparation" ? (
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
                        <path d="M4 14h16" />
                        <path d="M6 10.5h12V14a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4v-3.5Z" />
                        <path d="M12 4.8c1.4 1 2.2 2.2 2.2 3.6A2.2 2.2 0 0 1 12 10.6a2.2 2.2 0 0 1-2.2-2.2c0-1.4.8-2.6 2.2-3.6Z" />
                      </svg>
                    ) : null}
                    {status === "pret" ? (
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
                    {status === "livre" ? (
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
                        <circle cx="6.5" cy="17.5" r="1.7" />
                        <circle cx="17.5" cy="17.5" r="1.7" />
                        <path d="M2.8 17.5h2l3.2-4.3h4.4l2.1 4.3h1.3" />
                        <path d="M10 9.3h4l1.7 2.6" />
                        <circle cx="8.9" cy="7.1" r="1.3" />
                        <path d="M8.4 8.5 6.9 12" />
                        <path d="M15.8 13.2h3.8" />
                      </svg>
                    ) : null}
                  </span>
                  <span className={`text-xs font-semibold sm:text-sm ${textClass}`}>
                    {ORDER_STATUS_LABELS[status]}
                  </span>
                </li>
              );
            })}
          </ol>
        </div>
      </Card>

      <Card className="space-y-2">
        <h2 className="text-lg font-bold">Details</h2>
        <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm">
          <p className="font-semibold">Informations client</p>
          <p className="text-zinc-600">{order.customerInfo.name}</p>
          <p className="text-zinc-600">{order.customerInfo.phone}</p>
          {order.deliveryType === "livraison" && order.customerInfo.address ? (
            <p className="text-zinc-600">Adresse: {order.customerInfo.address}</p>
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
        <div className="mt-3 flex items-center justify-between border-t border-zinc-200 pt-3">
          <span className="font-semibold">Total</span>
          <span className="font-black">{formatPrice(order.total)}</span>
        </div>
      </Card>
    </section>
  );
}
