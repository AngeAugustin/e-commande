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
      className="relative rounded-full border border-zinc-200 px-3 py-1.5 text-sm font-medium hover:border-zinc-400"
    >
      Panier
      {count > 0 ? (
        <span className="ml-2 rounded-full bg-black px-2 py-0.5 text-xs text-white">
          {count}
        </span>
      ) : null}
    </Link>
  );
}
