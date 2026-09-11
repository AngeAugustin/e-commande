import Link from "next/link";

import {
  buildOrderWhatsAppMessage,
  getMomoNumber,
  getWhatsAppHref,
} from "@/lib/contact";
import { formatPrice } from "@/lib/utils";

type MomoPaymentInstructionsProps = {
  orderCode: string;
  total: number;
};

export function MomoPaymentInstructions({ orderCode, total }: MomoPaymentInstructionsProps) {
  const totalLabel = formatPrice(total);
  const momoNumber = getMomoNumber();
  const whatsappHref = getWhatsAppHref(buildOrderWhatsAppMessage(orderCode, totalLabel));

  return (
    <div className="space-y-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4">
      <div>
        <p className="text-sm font-semibold text-amber-900">Paiement a effectuer</p>
        <p className="mt-1 text-2xl font-black text-amber-950">{totalLabel}</p>
      </div>

      <div className="rounded-xl border border-amber-200/80 bg-white/70 px-3 py-3 text-sm text-amber-950">
        <p>
          Pour valider votre commande de <strong>{totalLabel}</strong>, faites-nous le depot sur
          notre numero MoMo :
        </p>
        <p className="mt-2 text-lg font-black tracking-wide">{momoNumber}</p>
        <p className="mt-3 text-ink-muted">
          Ensuite, contactez-nous par WhatsApp pour nous envoyer la capture d&apos;écran du paiement
          et le numéro de la commande <strong>{orderCode}</strong>.
        </p>
      </div>

      <Link
        href={whatsappHref}
        target="_blank"
        rel="noreferrer"
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#1ebe57]"
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
          <path d="M20.52 3.48A11.88 11.88 0 0 0 12.04 0C5.47 0 .12 5.34.12 11.9c0 2.1.55 4.16 1.6 5.97L0 24l6.32-1.66a11.84 11.84 0 0 0 5.72 1.46h.01c6.57 0 11.92-5.35 11.92-11.9 0-3.18-1.24-6.16-3.45-8.42ZM12.05 21.8h-.01a9.86 9.86 0 0 1-5.03-1.38l-.36-.21-3.75.98 1-3.65-.23-.37a9.9 9.9 0 0 1-1.52-5.27c0-5.47 4.45-9.91 9.92-9.91 2.65 0 5.15 1.03 7.02 2.9a9.84 9.84 0 0 1 2.9 7 9.92 9.92 0 0 1-9.94 9.91Zm5.44-7.4c-.3-.15-1.78-.88-2.06-.98-.28-.1-.48-.15-.68.15-.2.3-.78.97-.96 1.16-.18.2-.35.22-.65.08-.3-.15-1.27-.47-2.42-1.5-.9-.8-1.5-1.78-1.68-2.08-.18-.3-.02-.46.13-.6.13-.13.3-.35.45-.53.15-.17.2-.3.3-.5.1-.2.05-.38-.02-.53-.08-.15-.68-1.64-.94-2.24-.25-.6-.5-.5-.68-.5h-.58c-.2 0-.53.07-.8.37-.28.3-1.06 1.03-1.06 2.5 0 1.48 1.08 2.9 1.23 3.1.15.2 2.12 3.23 5.14 4.54.72.31 1.28.5 1.72.63.72.23 1.38.2 1.9.12.58-.09 1.78-.73 2.03-1.43.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35Z" />
        </svg>
        Nous contacter par WhatsApp
      </Link>
    </div>
  );
}
