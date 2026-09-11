export type ProductWritableFields = {
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  available: boolean;
};

const MAX_NAME = 120;
const MAX_DESCRIPTION = 2000;
const MAX_CATEGORY = 80;
const MAX_IMAGE = 500;

/** Images autorisées : uploads locaux ou Unsplash (aligné CSP / next/image). */
export function isAllowedProductImage(image: string): boolean {
  if (/^\/uploads\/[a-zA-Z0-9._-]+$/.test(image)) return true;
  if (/^https:\/\/images\.unsplash\.com\/[^\s]+$/i.test(image)) return true;
  return false;
}

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
  if (
    name.length > MAX_NAME ||
    description.length > MAX_DESCRIPTION ||
    category.length > MAX_CATEGORY ||
    image.length > MAX_IMAGE
  ) {
    return { ok: false, message: "Champs produit trop longs" };
  }
  if (!Number.isFinite(price) || price < 0) {
    return { ok: false, message: "Prix invalide" };
  }
  if (!isAllowedProductImage(image)) {
    return {
      ok: false,
      message: "URL image invalide (uploads locaux ou Unsplash uniquement)",
    };
  }

  return {
    ok: true,
    data: { name, description, price, image, category, available },
  };
}
