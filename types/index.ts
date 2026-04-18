export type DeliveryType = "livraison" | "retrait";

export type OrderStatus =
  | "en_attente"
  | "paye"
  | "en_preparation"
  | "pret"
  | "livre";

export type OrderPaymentStatus = "pending" | "paid" | "failed";

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
  paymentStatus?: OrderPaymentStatus;
  fedapayTransactionId?: string;
  fedapayReference?: string;
  paidAt?: string;
  createdAt: string;
}
