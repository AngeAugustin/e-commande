"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";
import type { OrderPaymentStatus } from "@/types";

type Props = { orderCode: string };

const POLL_MS = 1600;
const MAX_POLLS = 90;

export function PaiementRetourClient({ orderCode }: Props) {
  const router = useRouter();
  const clearCart = useCartStore((s) => s.clearCart);
  const [status, setStatus] = useState<OrderPaymentStatus | "unknown">("unknown");
  const cleared = useRef(false);

  useEffect(() => {
    let cancelled = false;
    let n = 0;

    async function tick() {
      await fetch(`/api/orders/code/${encodeURIComponent(orderCode)}/sync-payment`, {
        method: "POST",
        cache: "no-store",
      });

      const res = await fetch(`/api/orders/code/${encodeURIComponent(orderCode)}`, {
        cache: "no-store",
      });
      const data = (await res.json()) as { paymentStatus?: OrderPaymentStatus };
      if (cancelled) {
        return;
      }
      const ps = data.paymentStatus;
      if (ps === "paid") {
        setStatus("paid");
        if (!cleared.current) {
          cleared.current = true;
          clearCart();
        }
        window.setTimeout(() => {
          router.replace(`/commande/${orderCode}`);
        }, 0);
        return;
      }
      if (ps === "failed") {
        setStatus("failed");
        return;
      }
      n += 1;
      if (n >= MAX_POLLS) {
        setStatus(ps === "pending" ? "pending" : "unknown");
        return;
      }
      window.setTimeout(tick, POLL_MS);
    }

    void tick();

    return () => {
      cancelled = true;
    };
  }, [clearCart, orderCode, router]);

  if (status === "failed") {
    return (
      <Card className="space-y-4 p-6">
        <h1 className="text-xl font-black">Paiement non valide</h1>
        <p className="text-sm text-zinc-600">
          Le paiement n&apos;a pas ete accepte. Vous pouvez repasser commande depuis le panier.
        </p>
        <Link
          href="/checkout"
          className={cn(
            "inline-flex w-full items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition-colors sm:w-auto",
            "bg-black text-white hover:bg-zinc-800",
          )}
        >
          Retour au paiement
        </Link>
      </Card>
    );
  }

  if (status === "pending") {
    return (
      <Card className="space-y-4 p-6">
        <h1 className="text-xl font-black">Confirmation en attente</h1>
        <p className="text-sm text-zinc-600">
          Le paiement peut prendre quelques instants. Verifiez votre operateur Mobile Money ou
          reessayez plus tard. Vous pouvez aussi contacter le restaurant avec votre code commande.
        </p>
        <p className="font-mono text-sm font-semibold">{orderCode}</p>
        <Link
          href="/checkout"
          className={cn(
            "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition-colors",
            "border border-zinc-200 bg-white text-black hover:border-zinc-400",
          )}
        >
          Retour au site
        </Link>
      </Card>
    );
  }

  return (
    <Card className="space-y-3 p-6">
      <h1 className="text-xl font-black">Verification du paiement</h1>
      <p className="text-sm text-zinc-600">Patientez quelques secondes...</p>
    </Card>
  );
}
