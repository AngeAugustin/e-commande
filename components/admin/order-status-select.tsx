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
          variant="ghost"
          className="border border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100"
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
          variant="ghost"
          className="border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
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
          <svg
            viewBox="0 0 24 24"
            className="mr-1 h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="8" />
            <path d="m8.8 12.3 2.2 2.3 4.2-4.6" />
          </svg>
          Marquer comme pret
        </Button>
        {confirmModal}
      </>
    );
  }

  return (
    <span className="inline-flex rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-700">
      Pret
    </span>
  );
}
