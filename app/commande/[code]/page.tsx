import { notFound } from "next/navigation";

import { OrderTicket } from "@/components/commande/order-ticket";
import { getWhatsAppNumber } from "@/lib/contact";
import { isOrderPaid } from "@/lib/order-payment";
import { connectToDatabase } from "@/lib/mongodb";
import { Order } from "@/models/Order";
import type { MomoNetwork, OrderStatus } from "@/types";

type CommandePageProps = {
  params: Promise<{ code: string }>;
};

export const revalidate = 15;

export default async function CommandePage({ params }: CommandePageProps) {
  const { code } = await params;
  await connectToDatabase();
  const order = await Order.findOne({ orderCode: code }).lean();

  if (!order) {
    notFound();
  }

  const currentStatus = order.status as OrderStatus;
  const paymentStatus = order.paymentStatus as string | undefined;
  const paid = isOrderPaid(paymentStatus);
  const whatsappNumber = paid ? "" : await getWhatsAppNumber();
  const rawMomo = order.momoPayment as
    | { network?: string; number?: string }
    | null
    | undefined;
  const momoContact =
    rawMomo?.network && rawMomo?.number
      ? { network: rawMomo.network as MomoNetwork, number: rawMomo.number }
      : null;

  const items = order.items.map(
    (item: { name: string; quantity: number; price: number }) => ({
      name: item.name,
      quantity: item.quantity,
      price: item.price,
    }),
  );

  return (
    <section className="py-2 sm:py-4">
      <OrderTicket
        orderCode={order.orderCode}
        createdAt={order.createdAt}
        total={order.total}
        status={currentStatus}
        paymentStatus={paymentStatus}
        customerName={order.customerInfo.name}
        customerPhone={order.customerInfo.phone}
        items={items}
        paid={paid}
        momoContact={momoContact}
        whatsappNumber={whatsappNumber}
      />
    </section>
  );
}
