"use client";

import { useState } from "react";

import {
  OrderReceiptPreview,
  type OrderReceiptData,
} from "@/components/commande/order-receipt-preview";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { isOrderPaid } from "@/lib/order-payment";

type OrderReceiptButtonProps = {
  order: OrderReceiptData;
};

export function OrderReceiptButton({ order }: OrderReceiptButtonProps) {
  const [open, setOpen] = useState(false);
  const paid = isOrderPaid(order.paymentStatus);

  if (!paid) {
    return (
      <span
        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/60 text-mist"
        title="Recu disponible apres confirmation du paiement"
        aria-label="Recu indisponible"
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
      </span>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        title="Voir le recu"
        aria-label={`Voir le recu de la commande ${order.orderCode}`}
        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface text-foreground transition hover:border-palm/40 hover:text-palm"
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
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-palm-deep/45 p-4">
          <Card className="max-h-[90vh] w-full max-w-md overflow-y-auto">
            <div className="mb-3 flex items-center justify-between gap-2">
              <h3 className="text-lg font-bold text-palm">Recu</h3>
              <Button variant="secondary" onClick={() => setOpen(false)}>
                Fermer
              </Button>
            </div>
            <OrderReceiptPreview order={order} />
          </Card>
        </div>
      ) : null}
    </>
  );
}
