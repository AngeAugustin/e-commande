"use client";

import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";
import { getCartTotal, useCartStore } from "@/store/cart-store";

export default function PanierPage() {
  const { items, updateQuantity, removeItem } = useCartStore((state) => state);
  const total = getCartTotal(items);

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-palm sm:text-4xl">Votre panier</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Ajustez les quantités puis passez au paiement.
        </p>
      </div>

      <div className="space-y-3">
        {items.length === 0 ? (
          <Card className="border-dashed">
            <p className="text-sm text-ink-muted">Votre panier est vide.</p>
            <Link
              href="/menu"
              className="mt-3 inline-block text-sm font-semibold text-chili hover:underline"
            >
              Voir le menu
            </Link>
          </Card>
        ) : null}

        {items.map((item) => (
          <Card
            key={item.productId}
            className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-border bg-surface-muted">
                <Image src={item.image} alt={item.name} fill className="object-cover" />
              </div>
              <div>
                <p className="font-semibold">{item.name}</p>
                <p className="text-sm text-ink-muted">{formatPrice(item.price)}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                onClick={() => updateQuantity(item.productId, item.quantity - 1)}
              >
                -
              </Button>
              <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
              <Button
                variant="secondary"
                onClick={() => updateQuantity(item.productId, item.quantity + 1)}
              >
                +
              </Button>
              <Button variant="ghost" onClick={() => removeItem(item.productId)}>
                Supprimer
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <Card className="space-y-4 border-palm/15 bg-gradient-to-br from-surface to-surface-muted">
        <div className="flex items-center justify-between">
          <p className="text-sm text-ink-muted">Total</p>
          <p className="text-xl font-extrabold text-palm">{formatPrice(total)}</p>
        </div>
        <Link href="/checkout">
          <Button className="w-full" disabled={!items.length}>
            Continuer vers paiement
          </Button>
        </Link>
      </Card>
    </section>
  );
}
