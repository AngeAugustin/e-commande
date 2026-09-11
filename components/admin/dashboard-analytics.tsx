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

const CHART_GREEN = "#0a3d2e";
const CHART_INDIGO = "#1a6b52";
const CHART_ORANGE = "#e0451a";
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
};

const COLORS = ["#0a3d2e", "#e0451a", "#d4a017", "#1a6b52", "#c5ddd3"];

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
}: DashboardAnalyticsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
      <Card className="xl:col-span-3">
        <p className="text-sm text-ink-muted">Ventes totales</p>
        <p className="mt-1 text-2xl font-bold text-palm">{formatPrice(metrics.totalSales)}</p>
      </Card>
      <Card className="xl:col-span-3">
        <p className="text-sm text-ink-muted">Total commandes</p>
        <p className="mt-1 text-2xl font-bold text-palm">{metrics.totalOrders}</p>
      </Card>
      <Card className="xl:col-span-3">
        <p className="text-sm text-ink-muted">Commandes en cours</p>
        <p className="mt-1 text-2xl font-bold text-palm">{metrics.inProgressOrders}</p>
      </Card>
      <Card className="xl:col-span-3">
        <p className="text-sm text-ink-muted">Produits actifs</p>
        <p className="mt-1 text-2xl font-bold text-palm">{metrics.activeProducts}</p>
      </Card>

      <Card className="xl:col-span-8 border-border bg-surface p-5 sm:p-6">
        <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-palm tracking-tight text-palm">
              Evolution des ventes
            </h2>
            <p className="text-xs text-ink-muted">
              Chiffre d affaires sur 12 mois : total, livraison et retrait.
            </p>
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-[11px] font-medium text-ink-muted">
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
          <h2 className="text-lg font-bold text-palm">Repartition des statuts</h2>
          <p className="text-xs text-ink-muted">Vision immediate de la production.</p>
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
                  <Cell
                    key={`status-${entry.name}-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
