import Link from "next/link";

import { OrderStatusBadge } from "@/components/admin/order-status-badge";
import { OrderStatusSelect } from "@/components/admin/order-status-select";
import { Card } from "@/components/ui/card";
import {
  aggregateTotalVentes,
  countDeliveredOrders,
  countInProgressOrders,
} from "@/lib/admin-order-stats";
import { connectToDatabase } from "@/lib/mongodb";
import { formatPrice } from "@/lib/utils";
import { Order } from "@/models/Order";
import type { OrderStatus } from "@/types";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 25;

type AdminCommandesPageProps = {
  searchParams: Promise<{ page?: string }>;
};

export default async function AdminCommandesPage({ searchParams }: AdminCommandesPageProps) {
  const { page: pageRaw } = await searchParams;
  const parsed = Number.parseInt(pageRaw ?? "1", 10);
  const requestedPage =
    Number.isFinite(parsed) && parsed > 0 ? Math.min(Math.floor(parsed), 10_000) : 1;

  await connectToDatabase();

  const [totalCount, totalsAgg, enCours, terminees] = await Promise.all([
    Order.countDocuments(),
    aggregateTotalVentes(),
    countInProgressOrders(),
    countDeliveredOrders(),
  ]);

  const totalVentes = totalsAgg[0]?.ventes ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const safePage = Math.min(requestedPage, totalPages);

  const ordersPage = await Order.find()
    .sort({ createdAt: -1 })
    .skip((safePage - 1) * PAGE_SIZE)
    .limit(PAGE_SIZE)
    .lean();

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
          <p className="mt-1 text-2xl font-black">{totalCount}</p>
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
                <th className="px-4 py-3 font-semibold">Ticket</th>
              </tr>
            </thead>
            <tbody>
              {ordersPage.map((order) => (
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
                    <OrderStatusBadge
                      status={order.status as OrderStatus}
                      paymentStatus={order.paymentStatus as string | undefined}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <OrderStatusSelect
                      orderId={String(order._id)}
                      value={order.status as OrderStatus}
                      paymentStatus={order.paymentStatus as string | undefined}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/api/orders/code/${order.orderCode}/receipt`}
                      target="_blank"
                      title="Telecharger le recu"
                      aria-label={`Telecharger le recu de la commande ${order.orderCode}`}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-700 transition hover:border-zinc-400 hover:text-black"
                    >
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 24 24"
                        className="h-4.5 w-4.5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M12 3v11" />
                        <path d="m8 10 4 4 4-4" />
                        <path d="M4 17.5v1.2A2.3 2.3 0 0 0 6.3 21h11.4a2.3 2.3 0 0 0 2.3-2.3v-1.2" />
                      </svg>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalPages > 1 ? (
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-zinc-100 px-4 py-3 text-sm text-zinc-600">
            <p>
              Page {safePage} sur {totalPages} ({totalCount} commandes)
            </p>
            <div className="flex gap-2">
              {safePage > 1 ? (
                <Link
                  href={`/admin/commandes?page=${safePage - 1}`}
                  className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 font-semibold text-black transition hover:border-zinc-400"
                >
                  Precedente
                </Link>
              ) : (
                <span className="rounded-lg border border-transparent px-3 py-1.5 text-zinc-400">
                  Precedente
                </span>
              )}
              {safePage < totalPages ? (
                <Link
                  href={`/admin/commandes?page=${safePage + 1}`}
                  className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 font-semibold text-black transition hover:border-zinc-400"
                >
                  Suivante
                </Link>
              ) : (
                <span className="rounded-lg border border-transparent px-3 py-1.5 text-zinc-400">
                  Suivante
                </span>
              )}
            </div>
          </div>
        ) : null}
      </Card>
    </section>
  );
}
