import { MenuCatalog } from "@/components/menu/menu-catalog";
import { connectToDatabase } from "@/lib/mongodb";
import { Product } from "@/models/Product";
import type { ProductDto } from "@/types";

export const revalidate = 60;

export default async function MenuPage() {
  await connectToDatabase();
  const products = (await Product.find({ available: true }).sort({ createdAt: -1 }).lean()) as
    | ProductDto[]
    | [];

  const serialized = products.map((product) => ({
    ...product,
    _id: String(product._id),
  }));

  return <MenuCatalog products={serialized} />;
}
