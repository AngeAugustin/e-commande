import PDFDocument from "pdfkit";
import { NextResponse } from "next/server";

import { ensureAdminApi } from "@/lib/api-guard";
import { ORDER_STATUS_LABELS } from "@/lib/constants";
import { paidOrdersFilter } from "@/lib/order-payment";
import { connectToDatabase } from "@/lib/mongodb";
import { formatPrice } from "@/lib/utils";
import { Order } from "@/models/Order";
import { Product } from "@/models/Product";
import type { OrderStatus } from "@/types";

export const runtime = "nodejs";

function toPdfBuffer(doc: PDFKit.PDFDocument): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Uint8Array[] = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
    doc.end();
  });
}

export async function GET() {
  const unauthorized = await ensureAdminApi();
  if (unauthorized) {
    return unauthorized;
  }

  try {
    await connectToDatabase();

    const [orders, productsCount] = await Promise.all([
      Order.find(paidOrdersFilter()).sort({ createdAt: -1 }).limit(20).lean(),
      Product.countDocuments(),
    ]);

    const totalOrders = orders.length;
    const totalSales = orders.reduce((acc, order) => acc + order.total, 0);
    const inProgressCount = orders.filter(
      (order) =>
        order.status === "paye" ||
        order.status === "en_attente" ||
        order.status === "en_preparation",
    ).length;

    const doc = new PDFDocument({ margin: 40, size: "A4" });
    const now = new Date();
    doc.info.Title = "Manger Sain (Chez DOSSOU-YOVO) - Rapport Dashboard";
    doc.info.Author = "Manger Sain (Chez DOSSOU-YOVO)";

    doc.fontSize(20).text("Manger Sain (Chez DOSSOU-YOVO) - Rapport Dashboard", {
      align: "left",
    });
    doc.moveDown(0.3);
    doc.fontSize(10).fillColor("#555").text(`Date export: ${now.toLocaleString("fr-FR")}`);
    doc.moveDown(1);

    doc.fillColor("#000").fontSize(12).text("Indicateurs cles");
    doc.moveDown(0.4);
    doc.fontSize(11).text(`- Total commandes recentes: ${totalOrders}`);
    doc.text(`- Ventes recentes: ${formatPrice(totalSales)}`);
    doc.text(`- Commandes en cours: ${inProgressCount}`);
    doc.text(`- Produits actifs: ${productsCount}`);

    doc.moveDown(1.2);
    doc.fontSize(12).text("Commandes recentes");
    doc.moveDown(0.4);

    if (!orders.length) {
      doc.fontSize(10).fillColor("#666").text("Aucune commande disponible.");
    } else {
      orders.forEach((order, index) => {
        const yBefore = doc.y;
        doc
          .fontSize(10)
          .fillColor("#000")
          .text(
            `${index + 1}. ${order.orderCode} | ${order.customerInfo.name} | ${order.deliveryType} | ${
              ORDER_STATUS_LABELS[order.status as OrderStatus]
            } | ${formatPrice(order.total)}`,
            { width: 520 },
          );

        if (doc.y - yBefore < 14) {
          doc.moveDown(0.2);
        }
      });
    }

    const pdfBuffer = await toPdfBuffer(doc);
    const filename = `dashboard-report-${now.toISOString().slice(0, 10)}.pdf`;

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch {
    return NextResponse.json({ message: "Export PDF impossible" }, { status: 500 });
  }
}
