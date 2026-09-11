"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type OrderDeleteButtonProps = {
  orderId: string;
  orderCode: string;
  /** Redirection apres suppression (ex. retour liste depuis la fiche). */
  redirectTo?: string;
};

export function OrderDeleteButton({
  orderId,
  orderCode,
  redirectTo,
}: OrderDeleteButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function confirmDelete() {
    setDeleting(true);
    const res = await fetch(`/api/orders/${orderId}`, { method: "DELETE" });
    const data = (await res.json().catch(() => ({}))) as { message?: string };
    setDeleting(false);

    if (!res.ok) {
      toast.error(data.message || "Suppression impossible");
      return;
    }

    toast.success("Commande supprimee");
    setOpen(false);
    if (redirectTo) {
      router.push(redirectTo);
      router.refresh();
      return;
    }
    router.refresh();
  }

  return (
    <>
      <button
        type="button"
        className="text-red-600 transition hover:text-red-700"
        title="Supprimer la commande"
        aria-label={`Supprimer la commande ${orderCode}`}
        onClick={() => setOpen(true)}
      >
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 7h16" />
          <path d="M10 11v6" />
          <path d="M14 11v6" />
          <path d="M6 7v11a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7" />
          <path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
        </svg>
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-palm-deep/45 p-4">
          <Card className="w-full max-w-md">
            <h3 className="text-xl font-bold text-palm">Supprimer la commande</h3>
            <p className="mt-2 text-sm text-ink-muted">
              Confirmer la suppression de{" "}
              <span className="font-semibold text-palm">{orderCode}</span> ? Cette action
              est irreversible.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setOpen(false)} disabled={deleting}>
                Annuler
              </Button>
              <Button variant="danger" onClick={confirmDelete} disabled={deleting}>
                {deleting ? "Suppression..." : "Supprimer"}
              </Button>
            </div>
          </Card>
        </div>
      ) : null}
    </>
  );
}
