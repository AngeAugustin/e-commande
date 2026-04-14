import Link from "next/link";

import { OrderStatusSelect } from "@/components/admin/order-status-select";
import { Card } from "@/components/ui/card";
import { ORDER_STATUS_LABELS } from "@/lib/constants";
import { connectToDatabase } from "@/lib/mongodb";
import { formatPrice } from "@/lib/utils";
import { Order } from "@/models/Order";
import type { OrderStatus } from "@/types";

export const dynamic = "force-dynamic";

export default async function AdminCommandesPage() {
  await connectToDatabase();
  const orders = await Order.find().sort({ createdAt: -1 }).lean();
  const totalVentes = orders.reduce((acc, order) => acc + order.total, 0);
  const enCours = orders.filter(
    (order) => order.status === "en_attente" || order.status === "en_preparation",
  ).length;
  const terminees = orders.filter((order) => order.status === "livre").length;

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-black">Commandes</h1>
          <p className="text-sm text-zinc-500">
            Suivez toutes les commandes et mettez a jour les statuts en temps reel.
          </p>
        </div>
        <Link
          href="/admin/commandes"
          className="inline-flex items-center justify-center rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800"
        >
          Actualiser
        </Link>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <p className="text-sm text-zinc-500">Total commandes</p>
          <p className="mt-1 text-2xl font-black">{orders.length}</p>
        </Card>
        <Card>
          <p className="text-sm text-zinc-500">Ventes cumulees</p>
          <p className="mt-1 text-2xl font-black">{formatPrice(totalVentes)}</p>
        </Card>
        <Card>
          <p className="text-sm text-zinc-500">Commandes en cours</p>
          <p className="mt-1 text-2xl font-black">{enCours}</p>
        </Card>
        <Card>
          <p className="text-sm text-zinc-500">Commandes livrees</p>
          <p className="mt-1 text-2xl font-black">{terminees}</p>
        </Card>
      </div>

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-zinc-50 text-left text-zinc-600">
              <tr>
                <th className="px-4 py-3 font-semibold">Code</th>
                <th className="px-4 py-3 font-semibold">Client</th>
                <th className="px-4 py-3 font-semibold">Type</th>
                <th className="px-4 py-3 font-semibold">Adresse</th>
                <th className="px-4 py-3 font-semibold">Total</th>
                <th className="px-4 py-3 font-semibold">Statut</th>
                <th className="px-4 py-3 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={String(order._id)} className="border-t border-zinc-100">
                  <td className="px-4 py-3 font-semibold">{order.orderCode}</td>
                  <td className="px-4 py-3">
                    <p>{order.customerInfo.name}</p>
                    <p className="text-xs text-zinc-500">{order.customerInfo.phone}</p>
                  </td>
                  <td className="px-4 py-3 capitalize">{order.deliveryType}</td>
                  <td className="px-4 py-3 text-xs text-zinc-600">
                    {order.deliveryType === "livraison"
                      ? order.customerInfo.address || "Adresse non renseignee"
                      : "Retrait sur place"}
                  </td>
                  <td className="px-4 py-3">{formatPrice(order.total)}</td>
                  <td className="px-4 py-3">
                    {ORDER_STATUS_LABELS[order.status as OrderStatus]}
                  </td>
                  <td className="px-4 py-3">
                    <OrderStatusSelect
                      orderId={String(order._id)}
                      value={order.status as OrderStatus}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </section>
  );
}
