/** Numéro WhatsApp (indicatif pays inclus, sans + ni espaces). */
export function getWhatsAppNumber() {
  return (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "2290197339551").replace(/\D/g, "");
}

/** Numéro Mobile Money affiché aux clients. */
export function getMomoNumber() {
  return process.env.NEXT_PUBLIC_MOMO_NUMBER ?? "01 97 33 95 51";
}

export function getWhatsAppHref(prefillMessage?: string) {
  const phone = getWhatsAppNumber();
  if (!prefillMessage) {
    return `https://wa.me/${phone}`;
  }
  return `https://wa.me/${phone}?text=${encodeURIComponent(prefillMessage)}`;
}

export function buildOrderWhatsAppMessage(orderCode: string, totalLabel: string) {
  return `Bonjour, voici la capture du paiement pour la commande ${orderCode} (montant ${totalLabel}).`;
}
