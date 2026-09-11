"use client";

import { useMemo, useState } from "react";

import { ProductCard } from "@/components/menu/product-card";
import { Input } from "@/components/ui/input";
import type { ProductDto } from "@/types";

type MenuCatalogProps = {
  products: ProductDto[];
};

export function MenuCatalog({ products }: MenuCatalogProps) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter((product) => {
      const haystack = `${product.name} ${product.description} ${product.category ?? ""}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [products, query]);

  return (
    <section className="space-y-6">
      <div className="space-y-1.5">
        <h1 className="text-3xl font-extrabold text-palm sm:text-4xl">Notre menu</h1>
        <p className="max-w-md text-sm text-ink-muted">
          Choisissez vos plats — ajout instantané au panier.
        </p>
      </div>

      <div className="relative">
        <svg
          aria-hidden
          viewBox="0 0 24 24"
          className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-ink-muted"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        <Input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher un plat, une catégorie…"
          aria-label="Rechercher dans le menu"
          className="h-11 pl-10"
        />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>

      {products.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-surface p-8 text-center text-sm text-ink-muted">
          Aucun plat disponible pour le moment.
        </div>
      ) : null}

      {products.length > 0 && filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-surface p-8 text-center text-sm text-ink-muted">
          Aucun plat ne correspond à « {query.trim()} ».
        </div>
      ) : null}
    </section>
  );
}
