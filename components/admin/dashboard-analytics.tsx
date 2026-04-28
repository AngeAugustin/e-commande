"use client";

import {
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";

const CHART_GREEN = "#22c55e";
const CHART_INDIGO = "#6366f1";
const CHART_ORANGE = "#f97316";
const CHART_GRID = "#f4f4f5";
const CHART_AXIS = "#a1a1aa";

type DashboardAnalyticsProps = {
  metrics: {
    totalSales: number;
    totalOrders: number;
    inProgressOrders: number;
    activeProducts: number;
  };
  salesEvolution: Array<{
    month: string;
    total: number;
    livraison: number;
    retrait: number;
  }>;
  statusDistribution: Array<{ name: string; value: number }>;
  recentOrders: Array<{
    orderCode: string;
    customerName: string;
    deliveryType: string;
    statusLabel: string;
    total: number;
  }>;
};

const COLORS = ["#111111", "#3f3f46", "#71717a", "#a1a1aa", "#d4d4d8"];

function formatAxisEuro(value: number) {
  if (!Number.isFinite(value) || value === 0) return "0";
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1).replace(".", ",")} M`;
  }
  if (value >= 10_000) {
    return `${Math.round(value / 1000)} k`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1).replace(".", ",")} k`;
  }
  return String(Math.round(value));
}

export function DashboardAnalytics({
  metrics,
  salesEvolution,
  statusDistribution,
  recentOrders,
}: DashboardAnalyticsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
      <Card className="xl:col-span-3">
        <p className="text-sm text-zinc-500">Ventes totales</p>
        <p className="mt-1 text-2xl font-black">{formatPrice(metrics.totalSales)}</p>
      </Card>
      <Card className="xl:col-span-3">
        <p className="text-sm text-zinc-500">Total commandes</p>
        <p className="mt-1 text-2xl font-black">{metrics.totalOrders}</p>
      </Card>
      <Card className="xl:col-span-3">
        <p className="text-sm text-zinc-500">Commandes en cours</p>
        <p className="mt-1 text-2xl font-black">{metrics.inProgressOrders}</p>
      </Card>
      <Card className="xl:col-span-3">
        <p className="text-sm text-zinc-500">Produits actifs</p>
        <p className="mt-1 text-2xl font-black">{metrics.activeProducts}</p>
      </Card>

      <Card className="xl:col-span-8 border-zinc-200/90 bg-white p-5 sm:p-6">
        <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-lg font-black tracking-tight text-zinc-900">
              Evolution des ventes
            </h2>
            <p className="text-xs text-zinc-500">
              Chiffre d affaires sur 12 mois : total, livraison et retrait.
            </p>
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-[11px] font-medium text-zinc-500">
            <span className="inline-flex items-center gap-2">
              <span
                className="h-0.5 w-9 shrink-0 rounded-full"
                style={{ backgroundColor: CHART_GREEN }}
              />
              Total
            </span>
            <span className="inline-flex items-center gap-2">
              <span
                className="h-0.5 w-9 shrink-0 rounded-full"
                style={{ backgroundColor: CHART_INDIGO }}
              />
              Livraison
            </span>
            <span className="inline-flex items-center gap-2">
              <span
                className="h-0.5 w-9 shrink-0 rounded-full"
                style={{ backgroundColor: CHART_ORANGE }}
              />
              Retrait sur place
            </span>
          </div>
        </div>
        <div className="h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={salesEvolution}
              margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
            >
              <CartesianGrid
                stroke={CHART_GRID}
                strokeDasharray="0"
                vertical={false}
                horizontal
              />
              <XAxis
                dataKey="month"
                tick={{ fill: CHART_AXIS, fontSize: 11, fontWeight: 500 }}
                tickLine={false}
                axisLine={{ stroke: CHART_GRID, strokeWidth: 1 }}
                dy={6}
                interval={0}
              />
              <YAxis
                tick={{ fill: CHART_AXIS, fontSize: 11, fontWeight: 500 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={formatAxisEuro}
                width={36}
                dx={-2}
                domain={[0, "auto"]}
              />
              <Tooltip
                contentStyle={{
                  border: "1px solid #e4e4e7",
                  borderRadius: "12px",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
                  fontSize: "12px",
                }}
                formatter={(value, name) => {
                  if (typeof value !== "number") return [value, name];
                  const label =
                    name === "total"
                      ? "Total"
                      : name === "livraison"
                        ? "Livraison"
                        : "Retrait sur place";
                  return [formatPrice(value), label];
                }}
                labelStyle={{ color: "#71717a", fontWeight: 600, marginBottom: 4 }}
              />
              <Line
                type="monotone"
                dataKey="total"
                name="total"
                stroke={CHART_GREEN}
                strokeWidth={2.25}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0, fill: CHART_GREEN }}
              />
              <Line
                type="monotone"
                dataKey="livraison"
                name="livraison"
                stroke={CHART_INDIGO}
                strokeWidth={2.25}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0, fill: CHART_INDIGO }}
              />
              <Line
                type="monotone"
                dataKey="retrait"
                name="retrait"
                stroke={CHART_ORANGE}
                strokeWidth={2.25}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0, fill: CHART_ORANGE }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="xl:col-span-4">
        <div className="mb-3">
          <h2 className="text-lg font-black">Repartition des statuts</h2>
          <p className="text-xs text-zinc-500">Vision immediate de la production.</p>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusDistribution}
                dataKey="value"
                nameKey="name"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={3}
              >
                {statusDistribution.map((entry, index) => (
                  <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="xl:col-span-12 overflow-hidden p-0">
        <div className="border-b border-zinc-100 px-4 py-3">
          <h2 className="text-lg font-black">Commandes recentes</h2>
          <p className="text-xs text-zinc-500">
            Controle rapide des dernieres transactions.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-zinc-50 text-left text-zinc-600">
              <tr>
                <th className="px-4 py-3 font-semibold">Code</th>
                <th className="px-4 py-3 font-semibold">Client</th>
                <th className="px-4 py-3 font-semibold">Type</th>
                <th className="px-4 py-3 font-semibold">Statut</th>
                <th className="px-4 py-3 font-semibold">Montant</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order.orderCode} className="border-t border-zinc-100">
                  <td className="px-4 py-3 font-semibold">{order.orderCode}</td>
                  <td className="px-4 py-3">{order.customerName}</td>
                  <td className="px-4 py-3 capitalize">{order.deliveryType}</td>
                  <td className="px-4 py-3">{order.statusLabel}</td>
                  <td className="px-4 py-3">{formatPrice(order.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
