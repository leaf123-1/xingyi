import { cookies } from "next/headers";
import { Prisma, OrderStatus } from "@prisma/client";

import { getCurrentUser } from "@/lib/auth";
import type { AppSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type {
  AddItemInput,
  CartSnapshot,
  CartTotals,
  RemoveItemInput,
  UpdateItemInput,
} from "@/lib/cart/types";

const CART_COOKIE_NAME = "cartId";
const CART_COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 天

const cartInclude = {
  items: {
    include: {
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
          coverImage: true,
          price: true,
          compareAtPrice: true,
        },
      },
      variant: true,
    },
    orderBy: { createdAt: "asc" as const },
  },
} satisfies Prisma.CartInclude;

export type CartWithRelations = Prisma.CartGetPayload<{ include: typeof cartInclude }>;

type PrismaClientOrTransaction = Prisma.TransactionClient | typeof prisma;

interface CartContext {
  cart: CartWithRelations;
  user: AppSessionUser | null;
}

const cartCookieOptions = {
  name: CART_COOKIE_NAME,
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: CART_COOKIE_MAX_AGE,
};

function decimal(value: Prisma.Decimal | number) {
  return new Prisma.Decimal(value);
}

function toNumber(value: Prisma.Decimal | number) {
  return decimal(value).toNumber();
}

function extractVariantLabel(attrs: Prisma.JsonValue | null | undefined) {
  if (!attrs || typeof attrs !== "object" || Array.isArray(attrs)) {
    return null;
  }
  return Object.values(attrs)
    .map((value) => String(value))
    .join(" / ");
}

function computeTotals(cart: CartWithRelations): CartTotals {
  let subtotal = new Prisma.Decimal(0);
  cart.items.forEach((item) => {
    const unit = decimal(item.unitPrice);
    subtotal = subtotal.add(unit.mul(item.quantity));
  });
  const shipping = subtotal.greaterThan(0) ? new Prisma.Decimal(29) : new Prisma.Decimal(0);
  const tax = subtotal.mul(0.06).toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP);
  const total = subtotal.add(shipping).add(tax);
  return {
    subtotal: subtotal.toNumber(),
    shipping: shipping.toNumber(),
    tax: tax.toNumber(),
    total: total.toNumber(),
  };
}

export function serializeCart(cart: CartWithRelations): CartSnapshot {
  const totals = computeTotals(cart);
  return {
    id: cart.id,
    currency: cart.currency,
    totalQuantity: cart.items.reduce((sum, item) => sum + item.quantity, 0),
    totals,
    items: cart.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      variantId: item.variantId,
      name: item.product.name,
      slug: item.product.slug,
      image: item.product.coverImage,
      unitPrice: toNumber(item.unitPrice),
      compareAtPrice: item.product.compareAtPrice
        ? toNumber(item.product.compareAtPrice)
        : null,
      quantity: item.quantity,
      variantLabel: extractVariantLabel(item.variant?.attrs ?? null) ?? item.variant?.sku ?? null,
    })),
  };
}

async function loadCartById(
  cartId: string,
  client: PrismaClientOrTransaction = prisma
): Promise<CartWithRelations> {
  const cart = await client.cart.findUnique({ where: { id: cartId }, include: cartInclude });
  if (!cart) {
    throw new Error("购物车不存在");
  }
  return cart;
}

async function ensureAnonymousCart(cookieCartId: string | undefined) {
  if (cookieCartId) {
    const existing = await prisma.cart.findUnique({ where: { id: cookieCartId }, include: cartInclude });
    if (existing) {
      return existing;
    }
  }
  const created = await prisma.cart.create({ data: { currency: "CNY" } });
  return loadCartById(created.id);
}

async function mergeCarts(targetId: string, sourceId: string) {
  if (targetId === sourceId) {
    return loadCartById(targetId);
  }

  return prisma.$transaction(async (tx) => {
    const source = await tx.cart.findUnique({ where: { id: sourceId }, include: { items: true } });
    if (!source) {
      return loadCartById(targetId, tx);
    }

    for (const item of source.items) {
      const existing = await tx.cartItem.findFirst({
        where: {
          cartId: targetId,
          productId: item.productId,
          variantId: item.variantId ?? undefined,
        },
      });

      if (existing) {
        await tx.cartItem.update({
          where: { id: existing.id },
          data: {
            quantity: existing.quantity + item.quantity,
            unitPrice: item.unitPrice,
          },
        });
      } else {
        await tx.cartItem.create({
          data: {
            cartId: targetId,
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          },
        });
      }
    }

    await tx.cart.delete({ where: { id: sourceId } });
    return loadCartById(targetId, tx);
  });
}

async function ensureUserCart(userId: string, cookieCartId: string | undefined) {
  let userCart = await prisma.cart.findFirst({
    where: { userId },
    include: cartInclude,
    orderBy: { createdAt: "desc" },
  });

  if (!userCart) {
    const created = await prisma.cart.create({ data: { userId, currency: "CNY" } });
    userCart = await loadCartById(created.id);
  }

  if (cookieCartId && cookieCartId !== userCart.id) {
    userCart = await mergeCarts(userCart.id, cookieCartId);
  }

  return userCart;
}

async function resolveCart(): Promise<CartContext> {
  const cookieStore = cookies();
  const cookieCartId = cookieStore.get(CART_COOKIE_NAME)?.value;
  const user = await getCurrentUser();

  const cart = user
    ? await ensureUserCart(user.id, cookieCartId)
    : await ensureAnonymousCart(cookieCartId);

  cookieStore.set({ ...cartCookieOptions, value: cart.id });

  return { cart, user };
}

async function resolveProductPricing(
  tx: Prisma.TransactionClient,
  productId: string,
  variantId?: string
) {
  const product = await tx.product.findUnique({
    where: { id: productId },
    include: { variants: true },
  });

  if (!product) {
    throw new Error("商品不存在");
  }

  const variant = variantId ? product.variants.find((item) => item.id === variantId) : null;

  if (variantId && !variant) {
    throw new Error("未找到指定变体");
  }

  const basePrice = decimal(product.price);
  const delta = variant ? decimal(variant.priceDelta) : new Prisma.Decimal(0);
  const unitPrice = basePrice.add(delta);

  return { product, variant: variant ?? null, unitPrice };
}

async function addItem(cartId: string, input: AddItemInput) {
  return prisma.$transaction(async (tx) => {
    const { variant, unitPrice } = await resolveProductPricing(tx, input.productId, input.variantId);

    const existing = await tx.cartItem.findFirst({
      where: {
        cartId,
        productId: input.productId,
        variantId: variant?.id ?? undefined,
      },
    });

    if (existing) {
      await tx.cartItem.update({
        where: { id: existing.id },
        data: {
          quantity: existing.quantity + input.quantity,
          unitPrice,
        },
      });
    } else {
      await tx.cartItem.create({
        data: {
          cartId,
          productId: input.productId,
          variantId: variant?.id,
          quantity: input.quantity,
          unitPrice,
        },
      });
    }

    return loadCartById(cartId, tx);
  });
}

async function updateItemQuantity(cartId: string, input: UpdateItemInput) {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.cartItem.findFirst({
      where: { id: input.itemId, cartId },
    });

    if (!existing) {
      throw new Error("购物车条目不存在");
    }

    await tx.cartItem.update({
      where: { id: existing.id },
      data: { quantity: input.quantity },
    });

    return loadCartById(cartId, tx);
  });
}

async function removeItem(cartId: string, input: RemoveItemInput) {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.cartItem.findFirst({
      where: { id: input.itemId, cartId },
    });

    if (existing) {
      await tx.cartItem.delete({ where: { id: existing.id } });
    }

    return loadCartById(cartId, tx);
  });
}

export async function getActiveCart(): Promise<CartSnapshot> {
  const { cart } = await resolveCart();
  return serializeCart(cart);
}

export async function addItemToActiveCart(input: AddItemInput): Promise<CartSnapshot> {
  const { cart } = await resolveCart();
  const updated = await addItem(cart.id, input);
  return serializeCart(updated);
}

export async function updateActiveCartItem(input: UpdateItemInput): Promise<CartSnapshot> {
  const { cart } = await resolveCart();
  const updated = await updateItemQuantity(cart.id, input);
  return serializeCart(updated);
}

export async function removeActiveCartItem(input: RemoveItemInput): Promise<CartSnapshot> {
  const { cart } = await resolveCart();
  const updated = await removeItem(cart.id, input);
  return serializeCart(updated);
}

export async function mergeActiveCart(): Promise<CartSnapshot> {
  const cookieStore = cookies();
  const cookieCartId = cookieStore.get(CART_COOKIE_NAME)?.value;
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("仅登录用户可触发购物车合并");
  }

  const cart = await ensureUserCart(user.id, cookieCartId);
  cookieStore.set({ ...cartCookieOptions, value: cart.id });
  return serializeCart(cart);
}

export async function createOrderFromCart(cartId: string, userId?: string | null) {
  return prisma.$transaction(async (tx) => {
    const cart = await tx.cart.findUnique({
      where: { id: cartId },
      include: { items: true },
    });

    if (!cart || cart.items.length === 0) {
      throw new Error("购物车为空");
    }

    let subtotal = new Prisma.Decimal(0);
    cart.items.forEach((item) => {
      subtotal = subtotal.add(decimal(item.unitPrice).mul(item.quantity));
    });

    const shipping = subtotal.greaterThan(0) ? new Prisma.Decimal(29) : new Prisma.Decimal(0);
    const tax = subtotal.mul(0.06).toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP);
    const total = subtotal.add(shipping).add(tax);

    const order = await tx.order.create({
      data: {
        orderNumber: `PO-${Date.now()}`,
        userId: userId ?? undefined,
        cartId: cart.id,
        status: OrderStatus.PENDING,
        currency: cart.currency,
        subtotalAmount: subtotal,
        shippingAmount: shipping,
        taxAmount: tax,
        totalAmount: total,
        items: {
          create: cart.items.map((item) => ({
            productId: item.productId,
            variantId: item.variantId ?? undefined,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: decimal(item.unitPrice).mul(item.quantity),
          })),
        },
      },
    });

    return order;
  });
}

export async function clearCartItems(cartId: string) {
  await prisma.cartItem.deleteMany({ where: { cartId } });
}
