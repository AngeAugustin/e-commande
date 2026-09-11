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
  const { items, clearCart } = useCartStore((state) => state);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
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

    setLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          total,
          deliveryType: "retrait",
          customerInfo: { name, phone, address: "" },
        }),
      });

      let data: { message?: string; orderCode?: string } = {};
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

      const orderCode = typeof data.orderCode === "string" ? data.orderCode : "";
      if (!orderCode) {
        const msg = "Code de commande indisponible. Reessayez.";
        setSubmitError(msg);
        toast.error(msg);
        return;
      }

      clearCart();
      toast.success("Commande enregistree");
      router.push(`/commande/${orderCode}`);
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
        <h1 className="text-2xl font-extrabold text-palm">Valider la commande</h1>
        <p className="text-sm text-ink-muted">
          Retrait sur place uniquement. Après validation, vous recevrez le code et les
          instructions pour payer par dépôt Mobile Money, puis confirmer par WhatsApp.
        </p>

        <div className="rounded-xl border border-palm/20 bg-palm/5 px-3 py-2.5 text-sm text-palm">
          <span className="font-semibold">Mode :</span> Retrait au restaurant
        </div>

        <form className="space-y-3" onSubmit={handleSubmit}>
          <Input
            required
            placeholder="Nom complet"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            required
            placeholder="Votre numero de telephone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
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
        <h2 className="text-lg font-bold text-palm">Récapitulatif</h2>
        {items.map((item) => (
          <div key={item.productId} className="flex items-center justify-between text-sm">
            <span>
              {item.name} x {item.quantity}
            </span>
            <span>{formatPrice(item.price * item.quantity)}</span>
          </div>
        ))}
        <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
          <span className="font-semibold">Total</span>
          <span className="text-lg font-extrabold text-palm">{formatPrice(total)}</span>
        </div>
      </Card>
    </section>
  );
}
