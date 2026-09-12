export type DeliveryType = "livraison" | "retrait";

export type OrderStatus = "en_attente" | "paye" | "pret";

export type OrderPaymentStatus = "pending" | "paid" | "failed";

/** Accès back-office. super_admin : tout ; admin : tout sauf suppression de commandes. */
export type StaffRole = "super_admin" | "admin";

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

export interface ProductDto {
  _id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  available: boolean;
  createdAt?: string;
}

export type ContactNumberKind = "momo" | "whatsapp";

export type MomoNetwork = "MTN" | "Moov";

export interface ContactNumberDto {
  _id: string;
  kind: ContactNumberKind;
  number: string;
  network?: MomoNetwork;
  createdAt?: string;
}

export interface MomoPaymentInfo {
  network: MomoNetwork;
  number: string;
}

export interface OrderDto {
  _id: string;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  deliveryType: DeliveryType;
  customerInfo: {
    name: string;
    phone: string;
    address?: string;
  };
  orderCode: string;
  momoPayment?: MomoPaymentInfo;
  paymentStatus?: OrderPaymentStatus;
  paidAt?: string;
  createdAt: string;
}
