import { CheckoutForm } from "@/components/checkout/checkout-form";
import { getMomoNetworkOptions } from "@/lib/contact";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const momoOptions = await getMomoNetworkOptions();
  return <CheckoutForm momoOptions={momoOptions} />;
}
