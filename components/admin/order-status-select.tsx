"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { OrderStatus } from "@/types";

type OrderStatusSelectProps = {
  orderId: string;
  value: OrderStatus;
  /** Permet de ne pas proposer la suite tant que le paiement est en attente (statut `en_attente`). */
  paymentStatus?: string | null;
};

type PendingAction = {
  nextStatus: OrderStatus;
  title: string;
  message: string;
  confirmLabel: string;
};

export function OrderStatusSelect({ orderId, value, paymentStatus }: OrderStatusSelectProps) {
  const router = useRouter();
  const [status, setStatus] = useState(value);
  const [loading, setLoading] = useState(false);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);

  async function confirmUpdate() {
    if (!pendingAction) return;

    const { nextStatus } = pendingAction;
    setStatus(nextStatus);
    setLoading(true);

    const res = await fetch(`/api/orders/${orderId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus }),
    });

    setLoading(false);

    if (!res.ok) {
      toast.error("Mise a jour impossible");
      setStatus(value);
      setPendingAction(null);
      return;
    }

    toast.success("Statut mis a jour");
    setPendingAction(null);
    router.refresh();
  }

  const confirmModal = pendingAction ? (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-palm-deep/45 p-4">
      <Card className="w-full max-w-md">
        <h3 className="text-xl font-bold text-palm">{pendingAction.title}</h3>
        <p className="mt-2 text-sm text-ink-muted">{pendingAction.message}</p>
        <div className="mt-5 flex justify-end gap-2">
          <Button
            variant="secondary"
            onClick={() => setPendingAction(null)}
            disabled={loading}
          >
            Annuler
          </Button>
          <Button onClick={confirmUpdate} disabled={loading}>
            {loading ? "Mise a jour..." : pendingAction.confirmLabel}
          </Button>
        </div>
      </Card>
    </div>
  ) : null;

  if (status === "en_attente" && paymentStatus === "pending") {
    return (
      <>
        <Button
          disabled={loading}
          onClick={() =>
            setPendingAction({
              nextStatus: "paye",
              title: "Confirmer le depot MoMo",
              message:
                "Confirmez-vous avoir recu le depot Mobile Money pour cette commande ? Le statut passera a Paye.",
              confirmLabel: "Confirmer le paiement",
            })
          }
        >
          Confirmer le depot MoMo
        </Button>
        {confirmModal}
      </>
    );
  }

  if (status === "paye" || status === "en_attente") {
    return (
      <>
        <Button
          disabled={loading}
          onClick={() =>
            setPendingAction({
              nextStatus: "pret",
              title: "Marquer comme pret",
              message:
                "Confirmez-vous que la commande est prete ? Le statut passera a Pret.",
              confirmLabel: "Marquer comme pret",
            })
          }
        >
          Marquer comme pret
        </Button>
        {confirmModal}
      </>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-xl border border-palm/20 bg-palm/8 px-3 py-2.5 text-sm font-semibold text-palm">
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
        <path d="m8.8 12.3 2.2 2.3 4.2-4.6" />
      </svg>
      Commande prete
    </span>
  );
}
