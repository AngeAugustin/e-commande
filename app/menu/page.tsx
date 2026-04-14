import { ProductCard } from "@/components/menu/product-card";
import { Badge } from "@/components/ui/badge";
import { connectToDatabase } from "@/lib/mongodb";
import { Product } from "@/models/Product";
import type { ProductDto } from "@/types";

export const dynamic = "force-dynamic";

export default async function MenuPage() {
  await connectToDatabase();
  const products = (await Product.find({ available: true }).sort({ createdAt: -1 }).lean()) as
    | ProductDto[]
    | [];

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black">Notre menu</h1>
          <p className="text-sm text-zinc-600">Choisissez vos plats en un clic.</p>
        </div>
        <Badge>{products.length} plats</Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <ProductCard
            key={String(product._id)}
            product={{ ...product, _id: String(product._id) }}
          />
        ))}
      </div>

      {products.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-6 text-center text-sm text-zinc-600">
          Aucun plat disponible pour le moment.
        </div>
      ) : null}
    </section>
  );
}
