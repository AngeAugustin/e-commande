"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import type { OrderStatus } from "@/types";

type OrderStatusSelectProps = {
  orderId: string;
  value: OrderStatus;
};

export function OrderStatusSelect({ orderId, value }: OrderStatusSelectProps) {
  const router = useRouter();
  const [status, setStatus] = useState(value);
  const [loading, setLoading] = useState(false);

  async function updateStatus(nextStatus: OrderStatus) {
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
      return;
    }

    toast.success("Statut mis a jour");
    router.refresh();
  }

  if (status === "en_attente") {
    return (
      <Button
        variant="ghost"
        className="border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
        disabled={loading}
        onClick={() => updateStatus("en_preparation")}
      >
        {loading ? (
          "Mise a jour..."
        ) : (
          <>
            <svg
              viewBox="0 0 24 24"
              className="mr-1 h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 10h10" />
              <path d="M3 13h11" />
              <path d="M3 16h10" />
              <path d="M16 6v11a2 2 0 0 0 2 2h1" />
              <path d="M20 6v13" />
            </svg>
            Mettre en preparation
          </>
        )}
      </Button>
    );
  }

  if (status === "en_preparation") {
    return (
      <Button
        variant="ghost"
        className="border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
        disabled={loading}
        onClick={() => updateStatus("pret")}
      >
        {loading ? (
          "Mise a jour..."
        ) : (
          <>
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
          </>
        )}
      </Button>
    );
  }

  if (status === "pret") {
    return (
      <Button
        variant="ghost"
        className="border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
        disabled={loading}
        onClick={() => updateStatus("livre")}
      >
        {loading ? (
          "Mise a jour..."
        ) : (
          <>
            <svg
              viewBox="0 0 24 24"
              className="mr-1 h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3.5" y="7.5" width="12" height="8" rx="1.5" />
              <path d="M15.5 10h3l2 2v3.5h-5" />
              <circle cx="7.5" cy="17.5" r="1.5" />
              <circle cx="17.5" cy="17.5" r="1.5" />
            </svg>
            Marquer comme livre
          </>
        )}
      </Button>
    );
  }

  return (
    <span className="inline-flex rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-700">
      Livree
    </span>
  );
}
