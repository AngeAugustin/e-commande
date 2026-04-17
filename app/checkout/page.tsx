"use client";

import { useMemo, useState } from "react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatPrice } from "@/lib/utils";
import { getCartTotal, useCartStore } from "@/store/cart-store";

export default function CheckoutPage() {
  const { items, deliveryType, setDeliveryType } = useCartStore((state) => state);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const total = useMemo(() => getCartTotal(items), [items]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitError(null);
    if (!items.length) {
      toast.error("Panier vide");
      return;
    }
    if (deliveryType === "livraison" && !address.trim()) {
      toast.error("Veuillez saisir votre adresse de livraison");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/orders/init-payment", {
        method: "POST",
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          total,
          deliveryType,
          customerInfo: { name, phone, address: address.trim() },
        }),
      });

      let data: { message?: string; paymentUrl?: string; orderCode?: string } = {};
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

      const paymentUrl = typeof data.paymentUrl === "string" ? data.paymentUrl : "";
      if (!paymentUrl) {
        const msg =
          "Lien de paiement indisponible (reponse sans paymentUrl). Ouvrez l'onglet Reseau (F12) sur init-payment pour voir le JSON.";
        setSubmitError(msg);
        toast.error(msg);
        return;
      }

      toast.success("Redirection vers FedaPay");
      window.location.assign(paymentUrl);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erreur reseau";
      setSubmitError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="grid gap-6 lg:grid-cols-2">
      <Card className="space-y-4">
        <h1 className="text-2xl font-black">Paiement</h1>
        <p className="text-sm text-zinc-600">
          Paiement securise via FedaPay (Mobile Money ou carte). Apres validation, vous serez
          redirige vers la page de paiement puis vers le suivi de commande une fois le paiement
          accepte.
        </p>

        <form className="space-y-3" onSubmit={handleSubmit}>
          <Input
            required
            placeholder="Nom complet"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            required
            placeholder="Telephone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant={deliveryType === "livraison" ? "primary" : "secondary"}
              onClick={() => setDeliveryType("livraison")}
            >
              Livraison
            </Button>
            <Button
              type="button"
              variant={deliveryType === "retrait" ? "primary" : "secondary"}
              onClick={() => {
                setDeliveryType("retrait");
                setAddress("");
              }}
            >
              Retrait
            </Button>
          </div>
          {deliveryType === "livraison" ? (
            <Input
              required
              placeholder="Adresse de livraison"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          ) : null}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Validation..." : "Valider la commande"}
          </Button>
          {submitError ? (
            <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800">
              {submitError}
            </p>
          ) : null}
        </form>
      </Card>

      <Card className="space-y-3">
        <h2 className="text-lg font-bold">Recapitulatif</h2>
        {items.map((item) => (
          <div key={item.productId} className="flex items-center justify-between text-sm">
            <span>
              {item.name} x {item.quantity}
            </span>
            <span>{formatPrice(item.price * item.quantity)}</span>
          </div>
        ))}
        <div className="mt-3 flex items-center justify-between border-t border-zinc-200 pt-3">
          <span className="font-semibold">Total</span>
          <span className="text-lg font-black">{formatPrice(total)}</span>
        </div>
      </Card>
    </section>
  );
}
