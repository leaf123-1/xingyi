import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useCart, __TESTING__ } from "@/hooks/use-cart";
import type { CartSnapshot } from "@/lib/cart/types";

function createResponse(data: unknown, ok = true) {
  return {
    ok,
    json: async () => data,
  } as Response;
}

const emptyCart: CartSnapshot = {
  id: "cart-empty",
  currency: "CNY",
  items: [],
  totalQuantity: 0,
  totals: { subtotal: 0, shipping: 0, tax: 0, total: 0 },
};

const cartWithItem: CartSnapshot = {
  id: "cart-filled",
  currency: "CNY",
  items: [
    {
      id: "item-1",
      productId: "product-1",
      variantId: null,
      name: "轻量徒步背包",
      slug: "pack",
      image: "https://example.com/pack.jpg",
      unitPrice: 1299,
      compareAtPrice: null,
      quantity: 1,
      variantLabel: null,
    },
  ],
  totalQuantity: 1,
  totals: { subtotal: 1299, shipping: 29, tax: 77.94, total: 1405.94 },
};

const updatedCart: CartSnapshot = {
  ...cartWithItem,
  items: cartWithItem.items.map((item) => ({ ...item, quantity: 2 })),
  totalQuantity: 2,
  totals: { subtotal: 2598, shipping: 29, tax: 155.88, total: 2782.88 },
};

beforeEach(() => {
  __TESTING__.reset();
  vi.restoreAllMocks();
});

describe("useCart hook", () => {
  it("adds item through API", async () => {
    const fetchMock = vi
      .spyOn(global, "fetch")
      .mockResolvedValueOnce(createResponse({ cart: emptyCart }))
      .mockResolvedValueOnce(createResponse({ cart: cartWithItem }));

    const { result } = renderHook(() => useCart());

    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.addItem({ productId: "product-1", quantity: 1 });
    });

    expect(fetchMock).toHaveBeenLastCalledWith(
      "/api/cart",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ action: "addItem", data: { productId: "product-1", quantity: 1 } }),
      })
    );
    expect(result.current.cart?.totalQuantity).toBe(1);
  });

  it("updates quantity for existing items", async () => {
    const fetchMock = vi
      .spyOn(global, "fetch")
      .mockResolvedValueOnce(createResponse({ cart: cartWithItem }))
      .mockResolvedValueOnce(createResponse({ cart: updatedCart }));

    const { result } = renderHook(() => useCart());

    await waitFor(() => expect(result.current.cart?.totalQuantity).toBe(1));

    await act(async () => {
      await result.current.updateQuantity({ itemId: "item-1", quantity: 2 });
    });

    expect(fetchMock).toHaveBeenLastCalledWith(
      "/api/cart",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ action: "updateQuantity", data: { itemId: "item-1", quantity: 2 } }),
      })
    );
    expect(result.current.cart?.items[0].quantity).toBe(2);
  });

  it("merges carts after login", async () => {
    const mergedCart: CartSnapshot = {
      ...updatedCart,
      totalQuantity: 3,
      items: [
        ...updatedCart.items,
        {
          id: "item-2",
          productId: "product-2",
          variantId: null,
          name: "速干衣",
          slug: "top",
          image: "https://example.com/top.jpg",
          unitPrice: 399,
          compareAtPrice: null,
          quantity: 1,
          variantLabel: null,
        },
      ],
      totals: { subtotal: 2997, shipping: 29, tax: 179.82, total: 3205.82 },
    };

    const fetchMock = vi
      .spyOn(global, "fetch")
      .mockResolvedValueOnce(createResponse({ cart: updatedCart }))
      .mockResolvedValueOnce(createResponse({ cart: mergedCart }));

    const { result } = renderHook(() => useCart());

    await waitFor(() => expect(result.current.cart?.totalQuantity).toBe(2));

    await act(async () => {
      await result.current.merge();
    });

    expect(fetchMock).toHaveBeenLastCalledWith(
      "/api/cart",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ action: "merge", data: {} }),
      })
    );
    expect(result.current.cart?.totalQuantity).toBe(3);
  });
});
