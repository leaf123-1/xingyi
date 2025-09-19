"use client";

import { useEffect, useMemo, useSyncExternalStore } from "react";

import type { CartSnapshot } from "@/lib/cart/types";

interface CartActions {
  refresh: () => Promise<CartSnapshot | null>;
  addItem: (input: { productId: string; variantId?: string; quantity: number }) => Promise<CartSnapshot>;
  updateQuantity: (input: { itemId: string; quantity: number }) => Promise<CartSnapshot>;
  removeItem: (input: { itemId: string }) => Promise<CartSnapshot>;
  merge: () => Promise<CartSnapshot>;
}

const ENDPOINT = "/api/cart";
interface CartStoreState {
  cart: CartSnapshot | null;
  loading: boolean;
  error: string | null;
  initialized: boolean;
}

const cartStore: { state: CartStoreState; listeners: Set<() => void> } = {
  state: {
    cart: null,
    loading: false,
    error: null,
    initialized: false,
  },
  listeners: new Set(),
};

function emit() {
  cartStore.listeners.forEach((listener) => listener());
}

function setState(partial: Partial<CartStoreState>) {
  cartStore.state = { ...cartStore.state, ...partial };
  emit();
}

async function request<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const response = await fetch(input, init);
  const data = await response.json().catch(() => null);
  if (!response.ok || !data) {
    const message = data?.error ?? "购物车接口请求失败";
    throw new Error(message);
  }
  return data as T;
}

async function fetchCart(): Promise<CartSnapshot> {
  const data = await request<{ cart: CartSnapshot }>(ENDPOINT, { method: "GET" });
  return data.cart;
}

async function mutateCart(body: unknown): Promise<CartSnapshot> {
  const data = await request<{ cart: CartSnapshot }>(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return data.cart;
}

const actions: CartActions = {
  async refresh() {
    try {
      setState({ loading: true, error: null });
      const cart = await fetchCart();
      setState({ cart, loading: false, initialized: true });
      return cart;
    } catch (error) {
      const message = error instanceof Error ? error.message : "购物车刷新失败";
      setState({ error: message, loading: false, initialized: true });
      return null;
    }
  },
  async addItem(input) {
    setState({ loading: true, error: null });
    try {
      const cart = await mutateCart({ action: "addItem", data: input });
      setState({ cart, loading: false, initialized: true });
      return cart;
    } catch (error) {
      const message = error instanceof Error ? error.message : "添加到购物车失败";
      setState({ error: message, loading: false, initialized: true });
      throw error;
    }
  },
  async updateQuantity(input) {
    setState({ loading: true, error: null });
    try {
      const cart = await mutateCart({ action: "updateQuantity", data: input });
      setState({ cart, loading: false, initialized: true });
      return cart;
    } catch (error) {
      const message = error instanceof Error ? error.message : "更新购物车失败";
      setState({ error: message, loading: false, initialized: true });
      throw error;
    }
  },
  async removeItem(input) {
    setState({ loading: true, error: null });
    try {
      const cart = await mutateCart({ action: "removeItem", data: input });
      setState({ cart, loading: false, initialized: true });
      return cart;
    } catch (error) {
      const message = error instanceof Error ? error.message : "移除购物车条目失败";
      setState({ error: message, loading: false, initialized: true });
      throw error;
    }
  },
  async merge() {
    setState({ loading: true, error: null });
    try {
      const cart = await mutateCart({ action: "merge", data: {} });
      setState({ cart, loading: false, initialized: true });
      return cart;
    } catch (error) {
      const message = error instanceof Error ? error.message : "合并购物车失败";
      setState({ error: message, loading: false, initialized: true });
      throw error;
    }
  },
};

function subscribe(listener: () => void) {
  cartStore.listeners.add(listener);
  return () => {
    cartStore.listeners.delete(listener);
  };
}

function getSnapshot() {
  return cartStore.state;
}

export function useCart(initialCart?: CartSnapshot | null) {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  useEffect(() => {
    if (initialCart && !cartStore.state.initialized) {
      setState({ cart: initialCart, initialized: true, loading: false, error: null });
    }
  }, [initialCart]);

  useEffect(() => {
    if (!cartStore.state.initialized) {
      void actions.refresh();
    }
  }, []);

  const boundActions = useMemo(
    () => ({
      refresh: actions.refresh,
      addItem: actions.addItem,
      updateQuantity: actions.updateQuantity,
      removeItem: actions.removeItem,
      merge: actions.merge,
    }),
    []
  );

  return { ...snapshot, ...boundActions };
}

export const __TESTING__ = {
  reset() {
    cartStore.state = {
      cart: null,
      error: null,
      loading: false,
      initialized: false,
    };
    emit();
  },
};
