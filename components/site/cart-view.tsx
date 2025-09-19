"use client";

import Image from "next/image";
import Link from "next/link";

import { useCart } from "@/hooks/use-cart";
import type { CartSnapshot } from "@/lib/cart/types";
import { Button } from "@/components/ui/button";
import { QuantityInput } from "@/components/site/quantity-input";
import { Price } from "@/components/site/price";

interface CartViewProps {
  initialCart: CartSnapshot | null;
}

const emptyTotals = { subtotal: 0, shipping: 0, tax: 0, total: 0 };

/**
 * 购物车页面的交互视图，支持数量调整、删除以及金额小计展示。
 */
export function CartView({ initialCart }: CartViewProps) {
  const { cart, loading, error, updateQuantity, removeItem } = useCart(initialCart ?? undefined);

  const items = cart?.items ?? [];
  const totals = cart?.totals ?? emptyTotals;

  const handleQuantityChange = (id: string, next: number) => {
    void updateQuantity({ itemId: id, quantity: next });
  };

  const handleRemove = (id: string) => {
    void removeItem({ itemId: id });
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,_1fr)_340px]">
      <section className="space-y-4">
        {error ? (
          <div className="rounded-3xl border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
            {error}
          </div>
        ) : null}
        {items.length === 0 && !loading ? (
          <div className="rounded-3xl border border-dashed border-border/70 p-10 text-center text-sm text-muted-foreground">
            购物车为空，前往
            <Link prefetch href="/products" className="ml-1 underline">
              商品列表
            </Link>
            探索新装备。
          </div>
        ) : null}
        {items.map((item) => (
          <article
            key={item.id}
            className="flex flex-col gap-4 rounded-3xl border border-border/70 bg-white p-5 shadow-sm md:flex-row md:items-center"
          >
            <div className="relative h-32 w-full overflow-hidden rounded-2xl md:h-24 md:w-40">
              <Image
                src={item.image}
                alt={item.name}
                fill
                className="object-cover"
                loading="lazy"
                sizes="(min-width: 1024px) 10vw, 33vw"
              />
            </div>
            <div className="flex flex-1 flex-col gap-3">
              <div>
                <Link prefetch href={`/products/${item.slug}`} className="text-base font-semibold text-foreground">
                  {item.name}
                </Link>
                {item.variantLabel ? (
                  <p className="text-xs text-muted-foreground">{item.variantLabel}</p>
                ) : null}
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <QuantityInput value={item.quantity} onChange={(value) => handleQuantityChange(item.id, value)} />
                <button
                  type="button"
                  onClick={() => handleRemove(item.id)}
                  className="text-xs text-muted-foreground underline"
                  disabled={loading}
                >
                  移除
                </button>
              </div>
            </div>
            <Price
              amount={item.unitPrice * item.quantity}
              compareAtAmount={item.compareAtPrice ? item.compareAtPrice * item.quantity : undefined}
            />
          </article>
        ))}
      </section>
      <aside className="space-y-4 rounded-3xl border border-border/70 bg-muted/30 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-foreground">订单汇总</h2>
        <dl className="space-y-3 text-sm text-muted-foreground">
          <div className="flex items-center justify-between">
            <dt>商品小计</dt>
            <dd>¥{totals.subtotal.toFixed(2)}</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt>运费</dt>
            <dd>¥{totals.shipping.toFixed(2)}</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt>预计税费</dt>
            <dd>¥{totals.tax.toFixed(2)}</dd>
          </div>
        </dl>
        <div className="flex items-center justify-between text-base font-semibold text-foreground">
          <span>订单总额</span>
          <span>¥{totals.total.toFixed(2)}</span>
        </div>
        <Button className="h-12 w-full text-base font-semibold" disabled={items.length === 0 || loading} asChild>
          <Link prefetch href="/checkout">前往结算</Link>
        </Button>
        <p className="text-xs text-muted-foreground">
          结算过程中可选择支付宝或微信支付，订单完成后将发送邮件确认。
        </p>
      </aside>
    </div>
  );
}
