"use client";

import Image from "next/image";
import { motion } from "framer-motion";
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
    <motion.div initial={false} animate={{ opacity: 1, y: 0 }}>
      <Card className="h-full p-0">
        <div className="relative h-44 w-full overflow-hidden rounded-t-2xl">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover transition duration-500 hover:scale-105"
          />
        </div>
        <div className="space-y-3 p-4">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-base font-bold">{product.name}</h3>
            <span className="text-sm font-semibold">{formatPrice(product.price)}</span>
          </div>
          <p className="text-sm text-zinc-600">{product.description}</p>
          <Button
            className="w-full"
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
            Ajouter au panier
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}
