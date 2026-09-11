"use client";

import Link from "next/link";

import { useCartStore } from "@/store/cart-store";

export function CartIndicator() {
  const count = useCartStore((state) =>
    state.items.reduce((acc, item) => acc + item.quantity, 0),
  );

  return (
    <Link
      href="/panier"
      className="relative ml-1 rounded-full border border-border bg-surface px-3.5 py-1.5 text-sm font-semibold text-palm transition hover:border-palm/30 hover:bg-palm/5"
    >
      Panier
      {count > 0 ? (
        <span className="ml-2 rounded-full bg-chili px-2 py-0.5 text-xs text-white">
          {count}
        </span>
      ) : null}
    </Link>
  );
}
