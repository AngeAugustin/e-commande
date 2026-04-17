import type { OrderStatus } from "@/types";
import { Order } from "@/models/Order";

export type MetricsAggRow = { totalSales: number; totalOrders: number };
export type DailyAggRow = { _id: string; ventes: number; commandes: number };
export type StatusAggRow = { _id: OrderStatus; value: number };
export type DeliveryAggRow = { _id: string; value: number };
export type TopProductAggRow = { _id: string; quantity: number };
export type VentesAggRow = { ventes: number };

export type MonthlySalesAggRow = {
  _id: string;
  livraison: number;
  retrait: number;
  total: number;
};

export function aggregateMonthlySalesLast12(): Promise<Array<MonthlySalesAggRow>> {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 11, 1, 0, 0, 0, 0));

  return Order.aggregate([
    { $match: { createdAt: { $gte: start } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
        livraison: {
          $sum: {
            $cond: [{ $eq: ["$deliveryType", "livraison"] }, "$total", 0],
          },
        },
        retrait: {
          $sum: {
            $cond: [{ $eq: ["$deliveryType", "retrait"] }, "$total", 0],
          },
        },
        total: { $sum: "$total" },
      },
    },
    { $sort: { _id: 1 } },
  ]) as Promise<Array<MonthlySalesAggRow>>;
}

export function aggregateOrderMetrics(): Promise<Array<MetricsAggRow>> {
  return Order.aggregate([
    { $group: { _id: null, totalSales: { $sum: "$total" }, totalOrders: { $sum: 1 } } },
  ]) as Promise<Array<MetricsAggRow>>;
}

export function aggregateDailyOrders(
  chartRangeStart: Date,
  chartRangeEnd: Date,
): Promise<Array<DailyAggRow>> {
  return Order.aggregate([
    {
      $match: {
        createdAt: { $gte: chartRangeStart, $lte: chartRangeEnd },
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        ventes: { $sum: "$total" },
        commandes: { $sum: 1 },
      },
    },
  ]) as Promise<Array<DailyAggRow>>;
}

export function aggregateOrdersByStatus(): Promise<Array<StatusAggRow>> {
  return Order.aggregate([
    { $group: { _id: "$status", value: { $sum: 1 } } },
  ]) as Promise<Array<StatusAggRow>>;
}

export function aggregateOrdersByDelivery(): Promise<Array<DeliveryAggRow>> {
  return Order.aggregate([
    { $group: { _id: "$deliveryType", value: { $sum: 1 } } },
  ]) as Promise<Array<DeliveryAggRow>>;
}

export function aggregateTopProducts(limit = 6): Promise<Array<TopProductAggRow>> {
  return Order.aggregate([
    { $unwind: "$items" },
    { $group: { _id: "$items.name", quantity: { $sum: "$items.quantity" } } },
    { $sort: { quantity: -1 } },
    { $limit: limit },
  ]) as Promise<Array<TopProductAggRow>>;
}

export function aggregateTotalVentes(): Promise<Array<VentesAggRow>> {
  return Order.aggregate([
    { $group: { _id: null, ventes: { $sum: "$total" } } },
  ]) as Promise<Array<VentesAggRow>>;
}

export function countInProgressOrders() {
  const inList = "$" + "in";
  return Order.countDocuments({
    status: { [inList]: ["en_attente", "en_preparation"] },
  });
}

export function countDeliveredOrders() {
  return Order.countDocuments({ status: "livre" });
}
