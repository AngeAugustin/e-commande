"use client";

import { useRef, useState } from "react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { ORDER_STATUS_LABELS } from "@/lib/constants";
import { exportElementToPdf } from "@/lib/receipt-pdf";
import { formatDateTime, formatPrice } from "@/lib/utils";
import type { DeliveryType, OrderStatus } from "@/types";

const BRAND_NAME = "Chez DOSSOU-YOVO";
const VENUE_LINE = "Cuisine locale";

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

export function OrderReceiptPreview({ order, showActions = true }: OrderReceiptPreviewProps) {
  const receiptRef = useRef<HTMLDivElement>(null);
  const [pdfLoading, setPdfLoading] = useState(false);

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
          <span className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-400">
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

      <div
        ref={receiptRef}
        id="order-receipt-print"
        className="mx-auto w-full max-w-[300px] rounded-sm border border-[#D4D0C8] bg-[#FFFCF7] px-4 py-5 shadow-[0_2px_12px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.9)]"
        style={{
          fontFamily: 'ui-monospace, "Cascadia Code", "Segoe UI Mono", Consolas, monospace',
        }}
      >
        <div className="text-center">
          <p className="text-[14px] font-extrabold leading-tight text-[#0D0D0D]">{BRAND_NAME}</p>
          <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#6B7280]">
            {VENUE_LINE}
          </p>
        </div>

        <div className="my-3 border-t border-dashed border-[#0D0D0D]/35" />

        <div className="space-y-1 text-[10px] text-[#374151]">
          <div className="flex justify-between gap-2">
            <span className="text-[#6B7280]">Date</span>
            <span className="text-right font-medium text-[#111]">
              {formatDateTime(order.createdAt)}
            </span>
          </div>
          <div className="flex justify-between gap-2">
            <span className="text-[#6B7280]">N° commande</span>
            <span className="font-semibold tracking-wide text-[#111]">{order.orderCode}</span>
          </div>
          <div className="flex justify-between gap-2">
            <span className="text-[#6B7280]">Client</span>
            <span className="max-w-[65%] text-right font-medium text-[#111]">
              {order.customerInfo.name}
            </span>
          </div>
          <div className="flex justify-between gap-2">
            <span className="text-[#6B7280]">Telephone</span>
            <span className="font-medium text-[#111]">{order.customerInfo.phone}</span>
          </div>
          <div className="flex justify-between gap-2">
            <span className="text-[#6B7280]">Type</span>
            <span className="font-medium text-[#111]">
              {order.deliveryType === "livraison" ? "Livraison" : "Retrait sur place"}
            </span>
          </div>
          {order.deliveryType === "livraison" && order.customerInfo.address ? (
            <div className="flex justify-between gap-2">
              <span className="text-[#6B7280]">Adresse</span>
              <span className="max-w-[65%] text-right font-medium text-[#111]">
                {order.customerInfo.address}
              </span>
            </div>
          ) : null}
          <div className="flex justify-between gap-2">
            <span className="text-[#6B7280]">Statut</span>
            <span className="font-medium text-[#111]">
              {ORDER_STATUS_LABELS[order.status] ?? order.status}
            </span>
          </div>
        </div>

        <div className="my-3 border-t border-dashed border-[#0D0D0D]/35" />

        <ul className="space-y-2.5">
          {order.items.map((item, idx) => (
            <li key={`${item.name}-${idx}`} className="text-[11px] leading-snug">
              <p className="font-semibold text-[#0D0D0D]">{item.name}</p>
              <div className="mt-0.5 flex justify-between gap-2 text-[10px] text-[#4B5563]">
                <span>
                  {item.quantity} × {formatPrice(item.price)}
                </span>
                <span className="shrink-0 font-medium tabular-nums text-[#111]">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </div>
            </li>
          ))}
        </ul>

        <div className="my-3 border-t border-dashed border-[#0D0D0D]/35" />

        <div className="space-y-1.5 text-[11px]">
          <div className="flex justify-between font-bold text-[#0D0D0D]">
            <span className="tracking-wide">TOTAL</span>
            <span className="tabular-nums text-[13px]">{formatPrice(order.total)}</span>
          </div>
          <div className="flex justify-between text-[10px] text-[#4B5563]">
            <span>Paiement</span>
            <span className="font-medium text-[#111]">Depot MoMo</span>
          </div>
        </div>

        <p className="mt-5 border-t border-dashed border-[#0D0D0D]/35 pt-3 text-center text-[9px] leading-relaxed text-[#6B7280]">
          Merci pour votre commande
        </p>
      </div>
    </div>
  );
}
