"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { CartItem, DeliveryType } from "@/types";

type CartStore = {
  items: CartItem[];
  deliveryType: DeliveryType;
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  setDeliveryType: (deliveryType: DeliveryType) => void;
};

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      items: [],
      deliveryType: "livraison",
      addItem: (item) =>
        set((state) => {
          const existing = state.items.find((it) => it.productId === item.productId);

          if (existing) {
            return {
              items: state.items.map((it) =>
                it.productId === item.productId
                  ? { ...it, quantity: it.quantity + 1 }
                  : it,
              ),
            };
          }

          return {
            items: [...state.items, { ...item, quantity: 1 }],
          };
        }),
      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((item) => item.productId !== productId),
        })),
      updateQuantity: (productId, quantity) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((item) => item.productId !== productId)
              : state.items.map((item) =>
                  item.productId === productId ? { ...item, quantity } : item,
                ),
        })),
      clearCart: () => set({ items: [] }),
      setDeliveryType: (deliveryType) => set({ deliveryType }),
    }),
    {
      name: "ilosiwaju-cart",
      partialize: (state) => ({
        items: state.items,
        deliveryType: state.deliveryType,
      }),
    },
  ),
);

export const getCartTotal = (items: CartItem[]) =>
  items.reduce((acc, item) => acc + item.price * item.quantity, 0);
