import { createOrderWithFedaPayCheckout } from "@/lib/create-order-with-fedapay";

export const runtime = "nodejs";

export async function POST(request: Request) {
  return createOrderWithFedaPayCheckout(request);
}
