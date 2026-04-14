import { ProductsManager } from "@/components/admin/products-manager";
import { connectToDatabase } from "@/lib/mongodb";
import { Product } from "@/models/Product";
import type { ProductDto } from "@/types";

export const dynamic = "force-dynamic";

export default async function AdminProduitsPage() {
  await connectToDatabase();
  const products = (await Product.find().sort({ createdAt: -1 }).lean()) as ProductDto[];
  const serializedProducts = products.map((product) => ({
    ...product,
    _id: String(product._id),
  }));
  return (
    <ProductsManager initialProducts={serializedProducts} />
  );
}
