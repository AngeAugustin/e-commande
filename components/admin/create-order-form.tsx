"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { MomoContact } from "@/lib/contact";
import {
  isValidCustomerName,
  isValidCustomerPhone,
  sanitizeCustomerName,
  sanitizeCustomerPhone,
} from "@/lib/customer-info";
import { getMomoNetworkLogo } from "@/lib/momo-networks";
import { formatPrice } from "@/lib/utils";
import type { MomoNetwork, ProductDto } from "@/types";

type LineQty = Record<string, number>;

export function CreateOrderForm({
  products,
  momoOptions,
}: {
  products: ProductDto[];
  momoOptions: MomoContact[];
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [qtyByProduct, setQtyByProduct] = useState<LineQty>({});
  const [momoNetwork, setMomoNetwork] = useState<MomoNetwork | "">(
    momoOptions.length === 1 ? momoOptions[0].network : "",
  );
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const availableProducts = useMemo(
    () => products.filter((p) => p.available),
    [products],
  );

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return availableProducts;
    return availableProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q),
    );
  }, [availableProducts, search]);

  const selectedLines = useMemo(() => {
    return availableProducts
      .filter((p) => (qtyByProduct[p._id] ?? 0) > 0)
      .map((p) => ({
        product: p,
        quantity: qtyByProduct[p._id] ?? 0,
      }));
  }, [availableProducts, qtyByProduct]);

  const total = useMemo(
    () =>
      selectedLines.reduce(
        (sum, line) => sum + line.product.price * line.quantity,
        0,
      ),
    [selectedLines],
  );

  const needsNetworkChoice = momoOptions.length > 1;
  const hasMomo = momoOptions.length > 0;

  function setQuantity(productId: string, quantity: number) {
    setQtyByProduct((prev) => {
      const next = { ...prev };
      if (quantity <= 0) {
        delete next[productId];
      } else {
        next[productId] = Math.min(99, quantity);
      }
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitError(null);

    if (selectedLines.length === 0) {
      const msg = "Ajoutez au moins un produit";
      setSubmitError(msg);
      toast.error(msg);
      return;
    }
    if (!name.trim() || !phone.trim()) {
      const msg = "Nom et telephone client obligatoires";
      setSubmitError(msg);
      toast.error(msg);
      return;
    }
    if (!isValidCustomerName(name)) {
      const msg = "Le nom ne doit contenir que des lettres";
      setSubmitError(msg);
      toast.error(msg);
      return;
    }
    if (!isValidCustomerPhone(phone)) {
      const msg = "Le telephone ne doit contenir que des chiffres";
      setSubmitError(msg);
      toast.error(msg);
      return;
    }
    if (!hasMomo) {
      const msg = "Aucun numero MoMo configure. Ajoutez-en dans le referentiel.";
      setSubmitError(msg);
      toast.error(msg);
      return;
    }
    if (needsNetworkChoice && !momoNetwork) {
      const msg = "Choisissez un reseau de paiement (MTN ou Moov)";
      setSubmitError(msg);
      toast.error(msg);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: selectedLines.map((line) => ({
            productId: line.product._id,
            quantity: line.quantity,
          })),
          deliveryType: "retrait",
          customerInfo: {
            name: name.trim(),
            phone: sanitizeCustomerPhone(phone),
            address: "",
          },
          ...(momoNetwork ? { momoNetwork } : {}),
        }),
      });

      let data: { message?: string; orderCode?: string; _id?: string } = {};
      const raw = await res.text();
      try {
        data = raw ? (JSON.parse(raw) as typeof data) : {};
      } catch {
        setSubmitError(raw.slice(0, 240) || "Reponse serveur invalide");
        toast.error("Reponse serveur invalide");
        return;
      }

      if (!res.ok) {
        const msg = data.message || "Commande impossible";
        setSubmitError(msg);
        toast.error(msg);
        return;
      }

      toast.success(
        data.orderCode
          ? `Commande ${data.orderCode} creee`
          : "Commande creee",
      );

      if (data._id) {
        router.push(`/admin/commandes/${data._id}`);
        router.refresh();
        return;
      }

      router.push("/admin/commandes");
      router.refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erreur reseau";
      setSubmitError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-5 lg:grid-cols-5">
      <div className="space-y-4 lg:col-span-3">
        <Card className="space-y-4">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-muted">
                Produits
              </h2>
              <p className="text-xs text-ink-muted">
                Selectionnez les articles disponibles pour cette commande.
              </p>
            </div>
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un produit..."
              className="sm:max-w-xs"
            />
          </div>

          {availableProducts.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border px-3 py-6 text-center text-sm text-ink-muted">
              Aucun produit disponible. Activez des articles dans le menu.
            </p>
          ) : filteredProducts.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border px-3 py-6 text-center text-sm text-ink-muted">
              Aucun produit ne correspond a votre recherche.
            </p>
          ) : (
            <ul className="divide-y divide-border/60 overflow-hidden rounded-xl border border-border">
              {filteredProducts.map((product) => {
                const qty = qtyByProduct[product._id] ?? 0;
                return (
                  <li
                    key={product._id}
                    className="flex items-center gap-3 bg-surface px-3 py-2.5"
                  >
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-surface-muted">
                      {product.image ? (
                        <Image
                          src={product.image}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-foreground">
                        {product.name}
                      </p>
                      <p className="text-xs text-ink-muted">
                        {product.category} · {formatPrice(product.price)}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5">
                      <button
                        type="button"
                        aria-label={`Retirer ${product.name}`}
                        disabled={qty === 0}
                        onClick={() => setQuantity(product._id, qty - 1)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border text-palm transition hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        −
                      </button>
                      <span className="w-7 text-center text-sm font-semibold tabular-nums">
                        {qty}
                      </span>
                      <button
                        type="button"
                        aria-label={`Ajouter ${product.name}`}
                        onClick={() => setQuantity(product._id, qty + 1)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border text-palm transition hover:bg-surface-muted"
                      >
                        +
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>

      <div className="space-y-4 lg:col-span-2">
        <Card className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-muted">
            Client
          </h2>
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-ink-muted">
                Nom complet
              </label>
              <Input
                required
                autoComplete="name"
                inputMode="text"
                value={name}
                onChange={(e) => setName(sanitizeCustomerName(e.target.value))}
                placeholder="Nom du client"
                maxLength={80}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-ink-muted">
                Numero de telephone
              </label>
              <Input
                required
                autoComplete="tel"
                inputMode="numeric"
                pattern="[0-9]*"
                value={phone}
                onChange={(e) => setPhone(sanitizeCustomerPhone(e.target.value))}
                placeholder="Ex. 0197339551"
                maxLength={15}
              />
            </div>
            <div className="rounded-xl border border-palm/20 bg-palm/5 px-3 py-2.5 text-sm text-palm">
              <span className="font-semibold">Mode :</span> Retrait au restaurant
            </div>
          </div>
        </Card>

        <Card className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-muted">
            Paiement MoMo
          </h2>
          {!hasMomo ? (
            <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
              Aucun numero MoMo configure. Ajoutez-en dans le referentiel avant de
              creer une commande.
            </p>
          ) : needsNetworkChoice ? (
            <div className="grid grid-cols-2 gap-2">
              {momoOptions.map((option) => {
                const selected = momoNetwork === option.network;
                return (
                  <button
                    key={option.network}
                    type="button"
                    onClick={() => setMomoNetwork(option.network)}
                    className={`inline-flex items-center gap-2 rounded-xl border px-3 py-3 text-left transition ${
                      selected
                        ? "border-palm bg-palm/8 ring-1 ring-palm/30"
                        : "border-border bg-surface hover:border-palm/30"
                    }`}
                  >
                    <Image
                      src={getMomoNetworkLogo(option.network)}
                      alt={option.network}
                      width={36}
                      height={36}
                      className="h-9 w-9 rounded-md object-contain"
                    />
                    <span className="text-sm font-semibold text-foreground">
                      {option.network}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center gap-3 rounded-xl border border-border bg-surface-muted/60 px-3 py-3">
              <Image
                src={getMomoNetworkLogo(momoOptions[0].network)}
                alt={momoOptions[0].network}
                width={40}
                height={40}
                className="h-10 w-10 rounded-lg object-contain"
              />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                  {momoOptions[0].network}
                </p>
                <p className="font-semibold text-foreground">
                  {momoOptions[0].number}
                </p>
              </div>
            </div>
          )}
        </Card>

        <Card className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-muted">
            Recapitulatif
          </h2>
          {selectedLines.length === 0 ? (
            <p className="text-sm text-ink-muted">Aucun article selectionne.</p>
          ) : (
            <ul className="space-y-2">
              {selectedLines.map((line) => (
                <li
                  key={line.product._id}
                  className="flex items-center justify-between gap-2 text-sm"
                >
                  <span className="min-w-0 truncate">
                    {line.product.name} × {line.quantity}
                  </span>
                  <span className="shrink-0 tabular-nums font-medium">
                    {formatPrice(line.product.price * line.quantity)}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <div className="flex items-center justify-between border-t border-border pt-3">
            <span className="font-semibold text-ink-muted">Total</span>
            <span className="font-[family-name:var(--font-display)] text-xl font-bold tabular-nums text-palm">
              {formatPrice(total)}
            </span>
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={loading || !hasMomo || availableProducts.length === 0}
          >
            {loading ? "Creation..." : "Creer la commande"}
          </Button>
          {submitError ? (
            <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800">
              {submitError}
            </p>
          ) : null}
        </Card>
      </div>
    </form>
  );
}
