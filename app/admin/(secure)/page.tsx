import Link from "next/link";

import { DashboardAnalytics } from "@/components/admin/dashboard-analytics";
import { ORDER_STATUS_LABELS } from "@/lib/constants";
import { connectToDatabase } from "@/lib/mongodb";
import { Order } from "@/models/Order";
import { Product } from "@/models/Product";
import type { OrderStatus } from "@/types";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  await connectToDatabase();
  const [allOrders, recentOrders, products] = await Promise.all([
    Order.find().sort({ createdAt: -1 }).lean(),
    Order.find().sort({ createdAt: -1 }).limit(10).lean(),
    Product.countDocuments(),
  ]);

  const totalSales = allOrders.reduce((acc, order) => acc + order.total, 0);
  const inProgressOrders = allOrders.filter(
    (order) => order.status === "en_attente" || order.status === "en_preparation",
  ).length;
  const totalOrders = allOrders.length;

  const dayLabels = Array.from({ length: 14 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (13 - index));
    const label = date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
    });
    return { key: date.toISOString().slice(0, 10), label };
  });

  const dailyMap = new Map<string, { ventes: number; commandes: number }>();
  dayLabels.forEach((day) => dailyMap.set(day.key, { ventes: 0, commandes: 0 }));

  allOrders.forEach((order) => {
    const key = new Date(order.createdAt).toISOString().slice(0, 10);
    if (!dailyMap.has(key)) return;
    const current = dailyMap.get(key)!;
    current.ventes += order.total;
    current.commandes += 1;
    dailyMap.set(key, current);
  });

  const dailySales = dayLabels.map((day) => ({
    day: day.label,
    ventes: dailyMap.get(day.key)?.ventes || 0,
    commandes: dailyMap.get(day.key)?.commandes || 0,
  }));

  const statusCounts = new Map<OrderStatus, number>([
    ["en_attente", 0],
    ["en_preparation", 0],
    ["pret", 0],
    ["livre", 0],
  ]);
  allOrders.forEach((order) => {
    const status = order.status as OrderStatus;
    statusCounts.set(status, (statusCounts.get(status) || 0) + 1);
  });
  const statusDistribution = Array.from(statusCounts.entries()).map(([status, value]) => ({
    name: ORDER_STATUS_LABELS[status],
    value,
  }));

  const deliveryMap = new Map<string, number>([
    ["livraison", 0],
    ["retrait", 0],
  ]);
  allOrders.forEach((order) => {
    deliveryMap.set(order.deliveryType, (deliveryMap.get(order.deliveryType) || 0) + 1);
  });
  const deliveryDistribution = Array.from(deliveryMap.entries()).map(([name, value]) => ({
    name: name === "livraison" ? "Livraison" : "Retrait",
    value,
  }));

  const productsMap = new Map<string, number>();
  allOrders.forEach((order) => {
    order.items.forEach((item: { name: string; quantity: number }) => {
      productsMap.set(item.name, (productsMap.get(item.name) || 0) + item.quantity);
    });
  });
  const topProducts = Array.from(productsMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, quantity]) => ({ name, quantity }));

  const recentOrdersRows = recentOrders.map((order) => ({
    orderCode: order.orderCode,
    customerName: order.customerInfo.name,
    deliveryType: order.deliveryType,
    statusLabel: ORDER_STATUS_LABELS[order.status as OrderStatus],
    total: order.total,
  }));

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-black">Dashboard</h1>
          <p className="text-sm text-zinc-500">
            Vue rapide de l activite du restaurant et des commandes recentes.
          </p>
        </div>
        <Link
          href="/api/stats/export"
          target="_blank"
          className="inline-flex items-center justify-center rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800"
        >
          Exporter
        </Link>
      </div>

      <DashboardAnalytics
        metrics={{
          totalSales,
          totalOrders,
          inProgressOrders,
          activeProducts: products,
        }}
        dailySales={dailySales}
        statusDistribution={statusDistribution}
        deliveryDistribution={deliveryDistribution}
        topProducts={topProducts}
        recentOrders={recentOrdersRows}
      />
    </section>
  );
}
