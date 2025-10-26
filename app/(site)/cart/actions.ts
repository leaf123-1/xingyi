"use server";

import { z } from "zod";

import {
  addItemToActiveCart,
  getActiveCart,
  mergeActiveCart,
  removeActiveCartItem,
  updateActiveCartItem,
} from "@/lib/cart/server";
import {
  addItemInputSchema,
  removeItemInputSchema,
  updateItemInputSchema,
} from "@/lib/cart/types";

export async function getCartAction() {
  return getActiveCart();
}

export async function addItemToCartAction(input: z.input<typeof addItemInputSchema>) {
  const payload = addItemInputSchema.parse(input);
  return addItemToActiveCart(payload);
}

export async function updateCartItemAction(input: z.input<typeof updateItemInputSchema>) {
  const payload = updateItemInputSchema.parse(input);
  return updateActiveCartItem(payload);
}

export async function removeCartItemAction(input: z.input<typeof removeItemInputSchema>) {
  const payload = removeItemInputSchema.parse(input);
  return removeActiveCartItem(payload);
}

export async function mergeCartAction() {
  return mergeActiveCart();
}
