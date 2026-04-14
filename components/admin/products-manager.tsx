"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatPrice } from "@/lib/utils";
import type { ProductDto } from "@/types";

const initialForm = {
  name: "",
  description: "",
  price: 0,
  image: "",
  category: "",
  available: true,
};

const categoryOptions = [
  "Entrees",
  "Plats principaux",
  "Grillades",
  "Poissons",
  "Boissons",
  "Desserts",
];
const OTHER_CATEGORY_VALUE = "__autres__";

export function ProductsManager({
  initialProducts,
}: {
  initialProducts: ProductDto[];
}) {
  const [products, setProducts] = useState<ProductDto[]>(initialProducts);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ProductDto | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function loadProducts() {
    const res = await fetch("/api/products");
    const data = await res.json();
    setProducts(data);
  }

  async function submitForm(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const method = editingId ? "PUT" : "POST";
    const url = editingId ? `/api/products/${editingId}` : "/api/products";
    setSaving(true);

    let imageUrl = form.image;
    if (selectedImageFile) {
      const imageForm = new FormData();
      imageForm.append("file", selectedImageFile);
      const uploadRes = await fetch("/api/upload-image", {
        method: "POST",
        body: imageForm,
      });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) {
        toast.error(uploadData.message || "Upload image impossible");
        setSaving(false);
        return;
      }
      imageUrl = uploadData.url;
    }

    if (!imageUrl) {
      toast.error("Veuillez ajouter une image");
      setSaving(false);
      return;
    }

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        image: imageUrl,
      }),
    });

    if (!res.ok) {
      toast.error("Operation impossible");
      setSaving(false);
      return;
    }

    toast.success(editingId ? "Produit modifie" : "Produit ajoute");
    setForm(initialForm);
    setEditingId(null);
    setSelectedCategory("");
    setCustomCategory("");
    setSelectedImageFile(null);
    setImagePreviewUrl("");
    setOpenModal(false);
    setSaving(false);
    loadProducts();
  }

  async function confirmDeleteProduct() {
    if (!deleteTarget) return;
    setDeleting(true);
    const res = await fetch(`/api/products/${deleteTarget._id}`, {
      method: "DELETE",
    });
    setDeleting(false);

    if (!res.ok) {
      toast.error("Suppression impossible");
      return;
    }

    toast.success("Produit supprime");
    setDeleteTarget(null);
    loadProducts();
  }

  const stats = useMemo(() => {
    const actifs = products.filter((product) => product.available).length;
    const categories = new Set(products.map((product) => product.category)).size;
    const prixMoyen = products.length
      ? Math.round(products.reduce((acc, product) => acc + product.price, 0) / products.length)
      : 0;
    return [
      { label: "Total produits", value: products.length.toString() },
      { label: "Produits disponibles", value: actifs.toString() },
      { label: "Categories", value: categories.toString() },
      { label: "Prix moyen", value: formatPrice(prixMoyen) },
    ];
  }, [products]);

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-black">Gestion du menu</h1>
          <p className="text-sm text-zinc-500">
            Gere les plats, les prix et la disponibilite de votre restaurant.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingId(null);
            setForm(initialForm);
            setSelectedCategory("");
            setCustomCategory("");
            setSelectedImageFile(null);
            setImagePreviewUrl("");
            setOpenModal(true);
          }}
        >
          Nouveau produit
        </Button>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <p className="text-sm text-zinc-500">{stat.label}</p>
            <p className="mt-1 text-2xl font-black">{stat.value}</p>
          </Card>
        ))}
      </div>

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-zinc-50 text-left text-zinc-600">
              <tr>
                <th className="px-4 py-3 font-semibold">Produit</th>
                <th className="px-4 py-3 font-semibold">Categorie</th>
                <th className="px-4 py-3 font-semibold">Prix</th>
                <th className="px-4 py-3 font-semibold">Disponibilite</th>
                <th className="px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product._id} className="border-t border-zinc-100">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Image
                        src={product.image}
                        alt={product.name}
                        width={40}
                        height={40}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-semibold">{product.name}</p>
                        <p className="text-xs text-zinc-500">{product.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">{product.category}</td>
                  <td className="px-4 py-3">{formatPrice(product.price)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        product.available
                          ? "rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-700"
                          : "rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-700"
                      }
                    >
                      {product.available ? "Disponible" : "Indisponible"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        className="text-zinc-700 transition hover:text-black"
                        title="Editer le produit"
                        aria-label="Editer le produit"
                        onClick={() => {
                          const isKnownCategory = categoryOptions.includes(product.category);
                          setEditingId(product._id);
                          setForm({
                            name: product.name,
                            description: product.description,
                            price: product.price,
                            image: product.image,
                            category: product.category,
                            available: product.available,
                          });
                          setSelectedCategory(
                            isKnownCategory ? product.category : OTHER_CATEGORY_VALUE,
                          );
                          setCustomCategory(isKnownCategory ? "" : product.category);
                          setSelectedImageFile(null);
                          setImagePreviewUrl(product.image);
                          setOpenModal(true);
                        }}
                      >
                        <svg
                          viewBox="0 0 24 24"
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M4 20h4l10-10-4-4L4 16v4Z" />
                          <path d="m12 6 4 4" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        className="text-red-600 transition hover:text-red-700"
                        title="Supprimer le produit"
                        aria-label="Supprimer le produit"
                        onClick={() => setDeleteTarget(product)}
                      >
                        <svg
                          viewBox="0 0 24 24"
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M4 7h16" />
                          <path d="M10 11v6" />
                          <path d="M14 11v6" />
                          <path d="M6 7v11a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7" />
                          <path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {openModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4">
          <Card className="w-full max-w-2xl">
            <h2 className="text-xl font-black">
              {editingId ? "Modifier le produit" : "Ajouter un produit"}
            </h2>
            <p className="mb-4 text-sm text-zinc-500">
              Renseignez les informations du plat pour le menu client.
            </p>

            <form className="grid gap-3 sm:grid-cols-2" onSubmit={submitForm}>
              <Input
                required
                placeholder="Nom du plat"
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              />
              <select
                required
                value={selectedCategory}
                onChange={(e) => {
                  const value = e.target.value;
                  setSelectedCategory(value);
                  if (value === OTHER_CATEGORY_VALUE) {
                    setForm((prev) => ({ ...prev, category: customCategory }));
                    return;
                  }
                  setForm((prev) => ({ ...prev, category: value }));
                }}
                className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm outline-none transition focus:border-zinc-900"
              >
                <option value="" disabled>
                  Selectionner une categorie
                </option>
                {categoryOptions.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
                <option value={OTHER_CATEGORY_VALUE}>Autres</option>
              </select>
              {selectedCategory === OTHER_CATEGORY_VALUE ? (
                <Input
                  required
                  placeholder="Saisir une categorie personnalisee"
                  value={customCategory}
                  onChange={(e) => {
                    const value = e.target.value;
                    setCustomCategory(value);
                    setForm((prev) => ({ ...prev, category: value }));
                  }}
                />
              ) : null}
              <Input
                required
                type="number"
                placeholder="Prix"
                value={form.price || ""}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, price: Number(e.target.value) }))
                }
              />
              <Input
                required
                className="sm:col-span-2"
                placeholder="Description"
                value={form.description}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, description: e.target.value }))
                }
              />
              <div className="space-y-2 sm:col-span-2">
                <label className="text-sm font-medium text-zinc-700">
                  Photo du produit
                </label>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setSelectedImageFile(file);
                    if (file) {
                      const preview = URL.createObjectURL(file);
                      setImagePreviewUrl(preview);
                    } else {
                      setImagePreviewUrl(form.image);
                    }
                  }}
                />
                <p className="text-xs text-zinc-500">Formats: JPG, PNG, WEBP (max 5MB)</p>
              </div>
              <div className="flex items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 p-2 sm:col-span-2">
                {imagePreviewUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={imagePreviewUrl}
                    alt="Apercu du produit"
                    className="h-24 w-24 rounded-lg object-cover"
                  />
                ) : (
                  <p className="text-xs text-zinc-500">Apercu image</p>
                )}
              </div>
              <div className="flex gap-2 sm:col-span-2 sm:justify-end">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setOpenModal(false);
                    setEditingId(null);
                    setForm(initialForm);
                    setSelectedCategory("");
                    setCustomCategory("");
                    setSelectedImageFile(null);
                    setImagePreviewUrl("");
                  }}
                >
                  Annuler
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? "Enregistrement..." : editingId ? "Mettre a jour" : "Ajouter"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      ) : null}

      {deleteTarget ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <Card className="w-full max-w-md">
            <h3 className="text-xl font-black">Confirmer la suppression</h3>
            <p className="mt-2 text-sm text-zinc-600">
              Voulez-vous vraiment supprimer le produit{" "}
              <span className="font-semibold text-black">{deleteTarget.name}</span> ?
              Cette action est irreversible.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <Button
                variant="secondary"
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
              >
                Annuler
              </Button>
              <Button variant="danger" onClick={confirmDeleteProduct} disabled={deleting}>
                {deleting ? "Suppression..." : "Confirmer"}
              </Button>
            </div>
          </Card>
        </div>
      ) : null}
    </section>
  );
}
