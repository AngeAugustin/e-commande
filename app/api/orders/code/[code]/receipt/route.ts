import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { NextResponse } from "next/server";

import { ORDER_STATUS_LABELS } from "@/lib/constants";
import { isOrderPaid } from "@/lib/order-payment";
import { connectToDatabase } from "@/lib/mongodb";
import { formatPrice } from "@/lib/utils";
import { Order } from "@/models/Order";
import type { OrderStatus } from "@/types";

export const runtime = "nodejs";

type RouteParams = {
  params: Promise<{ code: string }>;
};

function fitLabel(label: string, max = 18) {
  return label.length > max ? `${label.slice(0, max - 1)}.` : label;
}

function normalizePrintable(value: string) {
  return value
    .replace(/[\u202f\u00a0]/g, " ")
    .replace(/[^\x20-\x7EÀ-ÿ]/g, "");
}

function formatTicketAmount(amount: number) {
  return normalizePrintable(formatPrice(amount));
}

export async function GET(_: Request, { params }: RouteParams) {
  try {
    const { code } = await params;
    await connectToDatabase();
    const order = await Order.findOne({ orderCode: code }).lean();

    if (!order) {
      return NextResponse.json({ message: "Commande introuvable" }, { status: 404 });
    }

    if (!isOrderPaid(order.paymentStatus as string | undefined)) {
      return NextResponse.json({ message: "Commande non payee" }, { status: 403 });
    }

    const now = new Date();
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([226, 680]);
    const fontRegular = await pdfDoc.embedFont(StandardFonts.Courier);
    const fontBold = await pdfDoc.embedFont(StandardFonts.CourierBold);

    let y = 655;
    const x = 12;
    const color = rgb(0.1, 0.1, 0.1);

    const drawLine = (text: string, size = 8, bold = false) => {
      const safeText = normalizePrintable(text);
      page.drawText(safeText, {
        x,
        y,
        size,
        font: bold ? fontBold : fontRegular,
        color,
      });
      y -= size + 4;
    };

    const drawCentered = (text: string, size = 10, bold = false) => {
      const font = bold ? fontBold : fontRegular;
      const width = font.widthOfTextAtSize(text, size);
      page.drawText(text, {
        x: (226 - width) / 2,
        y,
        size,
        font,
        color,
      });
      y -= size + 4;
    };

    drawCentered("Manger Sain (Chez DOSSOU-YOVO)", 12, true);
    drawCentered("Cuisine locale premium", 8, false);
    drawCentered("Ticket de caisse", 8, false);
    drawLine("==========================================", 8, false);
    drawLine(`Commande : ${order.orderCode}`, 8, false);
    drawLine(`Date     : ${new Date(order.createdAt).toLocaleString("fr-FR")}`, 8, false);
    drawLine(`Client   : ${order.customerInfo.name}`, 8, false);
    drawLine(`Tel      : ${order.customerInfo.phone}`, 8, false);
    if (order.deliveryType === "livraison" && order.customerInfo.address) {
      drawLine(`Adresse  : ${order.customerInfo.address}`, 8, false);
    }
    drawLine(
      `Type     : ${order.deliveryType === "livraison" ? "Livraison" : "Retrait sur place"}`,
      8,
      false,
    );
    drawLine(`Statut   : ${ORDER_STATUS_LABELS[order.status as OrderStatus]}`, 8, false);
    drawLine("------------------------------------------", 8, false);
    drawLine("ARTICLE               QTE   TOTAL", 8, true);
    drawLine("------------------------------------------", 8, false);

    order.items.forEach((item: { name: string; quantity: number; price: number }) => {
      const label = fitLabel(item.name, 20);
      const qty = String(item.quantity).padStart(3, " ");
      const total = formatTicketAmount(item.price * item.quantity).padStart(10, " ");
      drawLine(`${label.padEnd(20, " ")} ${qty} ${total}`, 8, false);
    });

    drawLine("------------------------------------------", 8, false);
    drawLine(`TOTAL A PAYER : ${formatTicketAmount(order.total)}`, 9, true);
    drawLine("==========================================", 8, false);
    drawCentered("Merci pour votre commande !", 8, false);
    drawCentered(`Genere le ${now.toLocaleString("fr-FR")}`, 7, false);

    const pdfBytes = await pdfDoc.save();
    const pdfBuffer = Buffer.from(pdfBytes);
    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="recu-${order.orderCode}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Receipt generation error (pdf-lib)", error);
    return NextResponse.json({ message: "Generation recu impossible" }, { status: 500 });
  }
}
