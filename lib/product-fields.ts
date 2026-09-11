export type ProductWritableFields = {
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  available: boolean;
};

export function pickProductFields(
  body: Record<string, unknown>,
): { ok: true; data: ProductWritableFields } | { ok: false; message: string } {
  const name = String(body.name ?? "").trim();
  const description = String(body.description ?? "").trim();
  const image = String(body.image ?? "").trim();
  const category = String(body.category ?? "").trim();
  const price = Number(body.price);
  const available = body.available === undefined ? true : Boolean(body.available);

  if (!name || !description || !image || !category) {
    return { ok: false, message: "Champs produit incomplets" };
  }
  if (!Number.isFinite(price) || price < 0) {
    return { ok: false, message: "Prix invalide" };
  }

  return {
    ok: true,
    data: { name, description, price, image, category, available },
  };
}
