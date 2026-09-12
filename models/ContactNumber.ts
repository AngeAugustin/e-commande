import { model, models, Schema } from "mongoose";

const contactNumberSchema = new Schema(
  {
    kind: {
      type: String,
      enum: ["momo", "whatsapp"],
      required: true,
      index: true,
    },
    number: { type: String, required: true, trim: true },
    /** Requis uniquement pour les numéros MoMo. */
    network: {
      type: String,
      enum: ["MTN", "Moov"],
      required: function (this: { kind?: string }) {
        return this.kind === "momo";
      },
    },
  },
  { timestamps: true },
);

export const ContactNumber =
  models.ContactNumber || model("ContactNumber", contactNumberSchema);
