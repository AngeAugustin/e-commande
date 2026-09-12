"use client";

import { useRef, useState } from "react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { getCommandeStatusBadge } from "@/lib/commande-tracking";
import { exportElementToPdf } from "@/lib/receipt-pdf";
import { formatDateTime, formatPrice } from "@/lib/utils";
import type { DeliveryType, OrderStatus } from "@/types";

export type OrderReceiptData = {
  orderCode: string;
  createdAt: string | Date;
  total: number;
  status: OrderStatus;
  deliveryType: DeliveryType;
  paymentStatus?: string | null;
  customerInfo: {
    name: string;
    phone: string;
    address?: string;
  };
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
};

type OrderReceiptPreviewProps = {
  order: OrderReceiptData;
  /** Affiche les boutons Imprimer / PDF au-dessus du ticket. */
  showActions?: boolean;
};

function TicketPerforation({ side }: { side: "top" | "bottom" }) {
  return (
    <div
      aria-hidden
      className={`ticket-perf ${side === "top" ? "ticket-perf--top" : "ticket-perf--bottom"}`}
    />
  );
}

export function OrderReceiptPreview({ order, showActions = true }: OrderReceiptPreviewProps) {
  const receiptRef = useRef<HTMLDivElement>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const statusBadge = getCommandeStatusBadge(order.status, order.paymentStatus);
  const serviceLabel =
    order.deliveryType === "livraison"
      ? order.customerInfo.address || "Livraison"
      : "Retrait sur place";

  async function handleDownloadPdf() {
    const el = receiptRef.current;
    if (!el) {
      toast.error("Apercu du ticket introuvable");
      return;
    }
    setPdfLoading(true);
    try {
      await exportElementToPdf(el, `recu-${order.orderCode}`);
      toast.success("Ticket telecharge");
    } catch {
      toast.error("Impossible de generer le PDF");
    } finally {
      setPdfLoading(false);
    }
  }

  return (
    <div className="w-full">
      {showActions ? (
        <div className="mb-4 flex items-center justify-between gap-3">
          <span className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
            Apercu ticket
          </span>
          <div className="flex shrink-0 items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              className="h-12 w-12 rounded-xl p-0"
              onClick={() => window.print()}
              title="Imprimer le ticket"
              aria-label="Imprimer le ticket"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 9V3h12v6" />
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                <path d="M6 14h12v7H6z" />
              </svg>
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="h-12 w-12 rounded-xl p-0"
              onClick={handleDownloadPdf}
              disabled={pdfLoading}
              title="Telecharger le ticket (PDF)"
              aria-label="Telecharger le ticket en PDF"
            >
              {pdfLoading ? (
                <span className="text-xs">...</span>
              ) : (
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="h-6 w-6"
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
              )}
            </Button>
          </div>
        </div>
      ) : null}

      <div className="rounded-xl bg-background p-2 sm:p-3">
        <div ref={receiptRef} id="order-receipt-print" className="mx-auto w-full max-w-md">
          <TicketPerforation side="top" />

          <article className="relative overflow-hidden bg-[#FFFDF8] text-[#13241c] shadow-[0_18px_40px_rgba(6,40,32,0.14)]">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-[0.35] mix-blend-multiply"
              style={{
                backgroundImage:
                  "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.35'/%3E%3C/svg%3E\")",
              }}
            />

            <div className="relative px-5 pb-6 pt-5 sm:px-7">
              <header className="text-center">
                <p className="font-[family-name:var(--font-display)] text-[1.35rem] font-extrabold tracking-tight text-palm sm:text-2xl">
                  Chez DOSSOU-YOVO
                </p>
                <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.28em] text-palm/55">
                  Carte de commande
                </p>
              </header>

              <div className="my-4 border-t border-dashed border-palm/25" />

              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-palm/50">
                    N° commande
                  </p>
                  <p className="mt-1 whitespace-nowrap font-[family-name:var(--font-display)] text-[0.95rem] font-extrabold tracking-tight text-palm sm:text-lg">
                    {order.orderCode}
                  </p>
                </div>
                <span
                  className={`mt-1 shrink-0 select-none rounded-sm border-2 px-2 py-1 text-[10px] font-black uppercase tracking-[0.12em] sm:text-[11px] ${
                    statusBadge.tone === "ready"
                      ? "border-palm text-palm"
                      : statusBadge.tone === "paid"
                        ? "border-palm-soft text-palm-soft"
                        : "border-chili text-chili"
                  }`}
                >
                  {statusBadge.label}
                </span>
              </div>

              <div className="my-4 border-t border-dashed border-palm/25" />

              <dl className="grid gap-2 text-sm">
                <div className="flex justify-between gap-3">
                  <dt className="text-palm/55">Date</dt>
                  <dd className="text-right font-medium tabular-nums">
                    {formatDateTime(order.createdAt)}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-palm/55">Client</dt>
                  <dd className="max-w-[65%] text-right font-semibold">
                    {order.customerInfo.name}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-palm/55">Telephone</dt>
                  <dd className="font-medium tabular-nums">{order.customerInfo.phone}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-palm/55">Service</dt>
                  <dd className="max-w-[65%] text-right font-medium">{serviceLabel}</dd>
                </div>
              </dl>

              <div className="my-4 border-t border-dashed border-palm/25" />

              <div className="mb-2 flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.16em] text-palm/50">
                <span>Articles</span>
                <span>Montant</span>
              </div>

              <ul className="space-y-3">
                {order.items.map((item, index) => (
                  <li key={`${item.name}-${index}`} className="text-sm">
                    <div className="flex items-baseline gap-2">
                      <span className="min-w-0 font-semibold leading-snug">{item.name}</span>
                      <span
                        aria-hidden
                        className="mb-1 flex-1 border-b border-dotted border-palm/30"
                      />
                      <span className="shrink-0 font-semibold tabular-nums">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-palm/55">
                      {item.quantity} × {formatPrice(item.price)}
                    </p>
                  </li>
                ))}
              </ul>

              <div className="mt-4 border-t-2 border-double border-palm/30 pt-3">
                <div className="flex items-end justify-between gap-3">
                  <span className="font-[family-name:var(--font-display)] text-lg font-bold text-palm">
                    Total
                  </span>
                  <span className="font-[family-name:var(--font-display)] text-2xl font-extrabold tabular-nums text-palm">
                    {formatPrice(order.total)}
                  </span>
                </div>
                <p className="mt-1 text-xs text-palm/55">Paiement par depot Mobile Money</p>
              </div>

              <p className="mt-6 text-center font-[family-name:var(--font-display)] text-sm italic text-palm/60">
                Merci — a bientot au comptoir
              </p>
            </div>
          </article>

          <TicketPerforation side="bottom" />
        </div>
      </div>
    </div>
  );
}
