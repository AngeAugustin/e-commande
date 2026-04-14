import { model, models, Schema } from "mongoose";

const productSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    image: { type: String, required: true },
    category: { type: String, required: true, trim: true },
    available: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const Product = models.Product || model("Product", productSchema);
