"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";

type DashboardAnalyticsProps = {
  metrics: {
    totalSales: number;
    totalOrders: number;
    inProgressOrders: number;
    activeProducts: number;
  };
  dailySales: Array<{ day: string; ventes: number; commandes: number }>;
  statusDistribution: Array<{ name: string; value: number }>;
  deliveryDistribution: Array<{ name: string; value: number }>;
  topProducts: Array<{ name: string; quantity: number }>;
  recentOrders: Array<{
    orderCode: string;
    customerName: string;
    deliveryType: string;
    statusLabel: string;
    total: number;
  }>;
};

const COLORS = ["#111111", "#3f3f46", "#71717a", "#a1a1aa", "#d4d4d8"];

export function DashboardAnalytics({
  metrics,
  dailySales,
  statusDistribution,
  deliveryDistribution,
  topProducts,
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

      <Card className="xl:col-span-8">
        <div className="mb-3">
          <h2 className="text-lg font-black">Evolution des ventes (14 jours)</h2>
          <p className="text-xs text-zinc-500">
            Suivi journalier du chiffre d affaires et du volume de commandes.
          </p>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dailySales}>
              <defs>
                <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#111111" stopOpacity={0.45} />
                  <stop offset="95%" stopColor="#111111" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(value: number, name: string) =>
                  name === "ventes" ? formatPrice(value) : value
                }
              />
              <Area
                type="monotone"
                dataKey="ventes"
                stroke="#111111"
                fillOpacity={1}
                fill="url(#salesGradient)"
                strokeWidth={2}
              />
            </AreaChart>
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

      <Card className="xl:col-span-6">
        <div className="mb-3">
          <h2 className="text-lg font-black">Top plats</h2>
          <p className="text-xs text-zinc-500">Les produits les plus demandes.</p>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topProducts}>
              <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-20} height={55} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="quantity" fill="#111111" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="xl:col-span-6">
        <div className="mb-3">
          <h2 className="text-lg font-black">Livraison vs retrait</h2>
          <p className="text-xs text-zinc-500">Analyse des preferences clients.</p>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={deliveryDistribution}
                dataKey="value"
                nameKey="name"
                innerRadius={45}
                outerRadius={85}
              >
                {deliveryDistribution.map((entry, index) => (
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
