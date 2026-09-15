import Link from "next/link";

import { CreateOrderForm } from "@/components/admin/create-order-form";
import { getMomoNetworkOptions } from "@/lib/contact";
import { connectToDatabase } from "@/lib/mongodb";
import { Product } from "@/models/Product";
import type { ProductDto } from "@/types";

export const dynamic = "force-dynamic";

export default async function AdminNouvelleCommandePage() {
  await connectToDatabase();

  const [products, momoOptions] = await Promise.all([
    Product.find().sort({ category: 1, name: 1 }).lean(),
    getMomoNetworkOptions(),
  ]);

  const serializedProducts: ProductDto[] = products.map((product) => ({
    _id: String(product._id),
    name: product.name,
    description: product.description,
    price: product.price,
    image: product.image,
    category: product.category,
    available: product.available,
  }));

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link
            href="/admin/commandes"
            className="mb-2 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-muted transition hover:text-palm"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
            Retour aux commandes
          </Link>
          <h1 className="text-3xl font-bold text-palm">Nouvelle commande</h1>
          <p className="text-sm text-ink-muted">
            Creez une commande pour un client (telephone ou sur place).
          </p>
        </div>
      </div>

      <CreateOrderForm products={serializedProducts} momoOptions={momoOptions} />
    </section>
  );
}
