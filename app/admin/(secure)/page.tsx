import Link from "next/link";

import { DashboardAnalytics } from "@/components/admin/dashboard-analytics";
import {
  aggregateMonthlySalesLast12,
  aggregateOrderMetrics,
  aggregateOrdersByStatus,
  countInProgressOrders,
} from "@/lib/admin-order-stats";
import { ORDER_STATUS_LABELS } from "@/lib/constants";
import { connectToDatabase } from "@/lib/mongodb";
import { Product } from "@/models/Product";
import type { OrderStatus } from "@/types";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  await connectToDatabase();

  const monthSlots = Array.from({ length: 12 }, (_, index) => {
    const d = new Date();
    d.setUTCHours(0, 0, 0, 0);
    d.setUTCDate(1);
    d.setUTCMonth(d.getUTCMonth() - (11 - index));
    const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
    const month = d.toLocaleDateString("fr-FR", { month: "short", timeZone: "UTC" });
    return { key, month };
  });

  const [products, metricsAgg, inProgressOrders, monthlyByMonth, statusAgg] =
    await Promise.all([
      Product.countDocuments(),
      aggregateOrderMetrics(),
      countInProgressOrders(),
      aggregateMonthlySalesLast12(),
      aggregateOrdersByStatus(),
    ]);

  const totalSales = metricsAgg[0]?.totalSales ?? 0;
  const totalOrders = metricsAgg[0]?.totalOrders ?? 0;

  const monthlyMap = new Map(
    monthlyByMonth.map((row) => [row._id, row] as const),
  );
  const salesEvolution = monthSlots.map(({ key, month }) => {
    const row = monthlyMap.get(key);
    return {
      month,
      total: row?.total ?? 0,
      livraison: row?.livraison ?? 0,
      retrait: row?.retrait ?? 0,
    };
  });

  const statusCounts = new Map<OrderStatus, number>([
    ["en_attente", 0],
    ["paye", 0],
    ["pret", 0],
  ]);
  for (const row of statusAgg) {
    if (row._id) {
      statusCounts.set(row._id, row.value);
    }
  }
  const statusDistribution = Array.from(statusCounts.entries()).map(([status, value]) => ({
    name: ORDER_STATUS_LABELS[status],
    value,
  }));

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-palm">Dashboard</h1>
          <p className="text-sm text-ink-muted">
            Vue rapide de l&apos;activite du restaurant.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Link
            href="/admin/guide"
            className="inline-flex items-center justify-center rounded-full border border-border bg-surface px-4 py-2 text-sm font-semibold text-palm transition hover:border-palm/30 hover:bg-palm/5"
          >
            Guide d&apos;utilisation
          </Link>
          <Link
            href="/api/stats/export"
            target="_blank"
            className="inline-flex items-center justify-center rounded-xl bg-chili px-4 py-2 text-sm font-semibold text-white transition hover:bg-chili-hover"
          >
            Exporter
          </Link>
        </div>
      </div>

      <DashboardAnalytics
        metrics={{
          totalSales,
          totalOrders,
          inProgressOrders,
          activeProducts: products,
        }}
        salesEvolution={salesEvolution}
        statusDistribution={statusDistribution}
      />
    </section>
  );
}
