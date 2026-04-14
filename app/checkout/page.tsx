"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatPrice } from "@/lib/utils";
import { getCartTotal, useCartStore } from "@/store/cart-store";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, deliveryType, setDeliveryType, clearCart } = useCartStore((state) => state);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const total = useMemo(() => getCartTotal(items), [items]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!items.length) {
      toast.error("Panier vide");
      return;
    }
    if (deliveryType === "livraison" && !address.trim()) {
      toast.error("Veuillez saisir votre adresse de livraison");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items,
        total,
        deliveryType,
        customerInfo: { name, phone, address: address.trim() },
      }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      toast.error(data.message || "Commande impossible");
      return;
    }

    clearCart();
    toast.success("Commande confirmee");
    router.push(`/commande/${data.orderCode}`);
  }

  return (
    <section className="grid gap-6 lg:grid-cols-2">
      <Card className="space-y-4">
        <h1 className="text-2xl font-black">Paiement</h1>
        <p className="text-sm text-zinc-600">
          Paiement simule pour MVP. Vos informations restent locales.
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
