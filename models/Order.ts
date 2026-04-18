import { model, models, Schema } from "mongoose";

const orderItemSchema = new Schema(
  {
    productId: { type: String, required: true },
    name: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
    image: { type: String, required: true },
  },
  { _id: false },
);

const orderSchema = new Schema(
  {
    items: { type: [orderItemSchema], required: true },
    total: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["en_attente", "paye", "en_preparation", "pret", "livre"],
      default: "en_attente",
    },
    deliveryType: { type: String, enum: ["livraison", "retrait"], required: true },
    customerInfo: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      address: { type: String, default: "" },
    },
    orderCode: { type: String, required: true, unique: true },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
    },
    fedapayTransactionId: { type: String, default: "" },
    /** Référence métier FedaPay (ex. ref transaction), renseignée au paiement confirmé */
    fedapayReference: { type: String, default: "" },
    /** Date à laquelle le paiement a été confirmé (webhook ou sync après retour) */
    paidAt: { type: Date },
  },
  { timestamps: true },
);

export const Order = models.Order || model("Order", orderSchema);
