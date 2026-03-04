import mongoose from "mongoose";

const cartSchema = new mongoose.Schema(
  {
    products: {
      type: [
        {
          product: { type: mongoose.Schema.Types.ObjectId, ref: "products", required: true },
          quantity: { type: Number, required: true, default: 1 }
        }
      ],
      default: []
    }
  },
  { timestamps: true }
);

export const CartModel = mongoose.model("carts", cartSchema);