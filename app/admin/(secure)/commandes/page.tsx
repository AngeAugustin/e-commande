import Link from "next/link";

import { OrderDeleteButton } from "@/components/admin/order-delete-button";
import { OrderReceiptButton } from "@/components/admin/order-receipt-button";
import { OrderStatusBadge } from "@/components/admin/order-status-badge";
import { OrderStatusSelect } from "@/components/admin/order-status-select";
import { TablePagination } from "@/components/admin/table-pagination";
import { Card } from "@/components/ui/card";
import {
  aggregateTotalVentes,
  countDeliveredOrders,
  countInProgressOrders,
} from "@/lib/admin-order-stats";
import { getAdminFromCookie } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { canDeleteOrders, isStaffRole } from "@/lib/roles";
import { formatPrice } from "@/lib/utils";
import { Order } from "@/models/Order";
import { User } from "@/models/User";
import type { DeliveryType, OrderStatus } from "@/types";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 10;

type AdminCommandesPageProps = {
  searchParams: Promise<{ page?: string }>;
};

export default async function AdminCommandesPage({ searchParams }: AdminCommandesPageProps) {
  const { page: pageRaw } = await searchParams;
  const parsed = Number.parseInt(pageRaw ?? "1", 10);
  const requestedPage =
    Number.isFinite(parsed) && parsed > 0 ? Math.min(Math.floor(parsed), 10_000) : 1;

  await connectToDatabase();

  const token = await getAdminFromCookie();
  const me = token?.userId
    ? await User.findById(token.userId).select("role").lean()
    : null;
  const showDelete = Boolean(me && isStaffRole(me.role) && canDeleteOrders(me.role));

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
          <h1 className="text-3xl font-bold text-palm">Commandes</h1>
          <p className="text-sm text-ink-muted">
            Suivez toutes les commandes et mettez a jour les statuts en temps reel.
          </p>
        </div>
        <Link
          href="/admin/commandes"
          className="inline-flex items-center justify-center rounded-xl bg-chili px-4 py-2 text-sm font-semibold text-white transition hover:bg-chili-hover"
        >
          Actualiser
        </Link>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <p className="text-sm text-ink-muted">Total commandes</p>
          <p className="mt-1 text-2xl font-bold text-palm">{totalCount}</p>
        </Card>
        <Card>
          <p className="text-sm text-ink-muted">Ventes cumulees</p>
          <p className="mt-1 text-2xl font-bold text-palm">{formatPrice(totalVentes)}</p>
        </Card>
        <Card>
          <p className="text-sm text-ink-muted">Commandes en cours</p>
          <p className="mt-1 text-2xl font-bold text-palm">{enCours}</p>
        </Card>
        <Card>
          <p className="text-sm text-ink-muted">Commandes pretes</p>
          <p className="mt-1 text-2xl font-bold text-palm">{terminees}</p>
        </Card>
      </div>

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-surface-muted text-left text-ink-muted">
              <tr>
                <th className="px-4 py-3 font-semibold">Code</th>
                <th className="px-4 py-3 font-semibold">Client</th>
                <th className="px-4 py-3 font-semibold">Type</th>
                <th className="px-4 py-3 font-semibold">Adresse</th>
                <th className="px-4 py-3 font-semibold">Total</th>
                <th className="px-4 py-3 font-semibold">Statut</th>
                <th className="px-4 py-3 font-semibold">Action</th>
                <th className="px-4 py-3 font-semibold">Fiche</th>
                <th className="px-4 py-3 font-semibold">Ticket</th>
                {showDelete ? <th className="px-4 py-3 font-semibold">Suppr.</th> : null}
              </tr>
            </thead>
            <tbody>
              {ordersPage.map((order) => (
                <tr key={String(order._id)} className="border-t border-border/60">
                  <td className="px-4 py-3 font-semibold">
                    <Link
                      href={`/admin/commandes/${String(order._id)}`}
                      className="text-palm underline-offset-2 transition hover:text-chili hover:underline"
                    >
                      {order.orderCode}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <p>{order.customerInfo.name}</p>
                    <p className="text-xs text-ink-muted">{order.customerInfo.phone}</p>
                  </td>
                  <td className="px-4 py-3 capitalize">{order.deliveryType}</td>
                  <td className="px-4 py-3 text-xs text-ink-muted">
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
                      href={`/admin/commandes/${String(order._id)}`}
                      className="inline-flex items-center gap-1 rounded-lg border border-border bg-surface-muted px-2.5 py-1.5 text-xs font-semibold text-palm transition hover:border-palm/30 hover:bg-palm/5"
                    >
                      Detail
                      <svg
                        viewBox="0 0 24 24"
                        className="h-3.5 w-3.5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden
                      >
                        <path d="m9 18 6-6-6-6" />
                      </svg>
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <OrderReceiptButton
                      order={{
                        orderCode: order.orderCode,
                        createdAt: new Date(order.createdAt).toISOString(),
                        total: order.total,
                        status: order.status as OrderStatus,
                        deliveryType: order.deliveryType as DeliveryType,
                        paymentStatus: order.paymentStatus as string | undefined,
                        customerInfo: {
                          name: order.customerInfo.name,
                          phone: order.customerInfo.phone,
                          address: order.customerInfo.address,
                        },
                        items: order.items.map(
                          (item: { name: string; quantity: number; price: number }) => ({
                            name: item.name,
                            quantity: item.quantity,
                            price: item.price,
                          }),
                        ),
                      }}
                    />
                  </td>
                  {showDelete ? (
                    <td className="px-4 py-3">
                      <OrderDeleteButton
                        orderId={String(order._id)}
                        orderCode={order.orderCode}
                      />
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalCount > 0 ? (
          <TablePagination
            page={safePage}
            totalPages={totalPages}
            totalItems={totalCount}
            itemLabel="commandes"
            hrefForPage={(p) => `/admin/commandes?page=${p}`}
          />
        ) : null}
      </Card>
    </section>
  );
}
