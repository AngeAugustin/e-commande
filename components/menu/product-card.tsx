"use client";

import Image from "next/image";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";
import type { ProductDto } from "@/types";

type ProductCardProps = {
  product: ProductDto;
};

export function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);

  return (
    <Card className="group h-full overflow-hidden p-0 transition-shadow hover:shadow-[0_12px_32px_rgba(10,61,46,0.1)]">
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1280px) 33vw, 25vw"
          className="object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-palm-deep/55 to-transparent" />
        <span className="absolute right-2 bottom-2 rounded-md bg-surface/95 px-2 py-0.5 text-xs font-bold text-palm shadow-sm backdrop-blur-sm">
          {formatPrice(product.price)}
        </span>
      </div>
      <div className="space-y-2 p-3">
        <h3 className="line-clamp-1 text-sm font-bold text-foreground">{product.name}</h3>
        <p className="line-clamp-2 text-xs leading-relaxed text-ink-muted">{product.description}</p>
        <Button
          className="h-9 w-full text-xs"
          onClick={() => {
            addItem({
              productId: product._id,
              name: product.name,
              price: product.price,
              image: product.image,
            });
            toast.success(`${product.name} ajoute au panier`);
          }}
        >
          Ajouter
        </Button>
      </div>
    </Card>
  );
}
