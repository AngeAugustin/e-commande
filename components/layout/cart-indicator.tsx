"use client";

import Link from "next/link";

import { useCartStore } from "@/store/cart-store";

export function CartIndicator({
  tone = "light",
}: {
  tone?: "light" | "dark";
}) {
  const count = useCartStore((state) =>
    state.items.reduce((acc, item) => acc + item.quantity, 0),
  );

  return (
    <Link
      href="/panier"
      className={`relative ml-1 rounded-full px-3.5 py-1.5 text-sm font-semibold transition ${
        tone === "dark"
          ? "border border-white/25 bg-white/10 text-white hover:bg-white/18"
          : "border border-border bg-surface text-palm hover:border-palm/30 hover:bg-palm/5"
      }`}
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
