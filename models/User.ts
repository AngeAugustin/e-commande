import { model, models, Schema } from "mongoose";

const userSchema = new Schema(
  {
    firstName: { type: String, trim: true, default: "" },
    lastName: { type: String, trim: true, default: "" },
    email: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["admin"], default: "admin" },
  },
  { timestamps: true },
);

export const User = models.User || model("User", userSchema);
