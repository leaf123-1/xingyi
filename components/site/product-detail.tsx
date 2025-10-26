"use client";

import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import { Price } from "@/components/site/price";
import { QuantityInput } from "@/components/site/quantity-input";
import { StickyCTA } from "@/components/site/sticky-cta";

interface VariantAttrMap {
  [key: string]: string;
}

export interface ProductVariantData {
  id: string;
  sku: string;
  attrs: VariantAttrMap;
  stock: number;
  priceDelta: number;
}

interface ProductDetailProps {
  product: {
    id: string;
    name: string;
    subtitle?: string | null;
    description: string;
    specs: Record<string, string | number | null>;
    basePrice: number;
    compareAtPrice?: number | null;
    variants: ProductVariantData[];
  };
}

/**
 * 商品详情页核心交互：变体选择、数量控制与 CTA。
 */
export function ProductDetail({ product }: ProductDetailProps) {
  const attributeOptions = useMemo(() => {
    const map = new Map<string, Set<string>>();
    product.variants.forEach((variant) => {
      Object.entries(variant.attrs).forEach(([key, value]) => {
        if (!map.has(key)) {
          map.set(key, new Set());
        }
        map.get(key)?.add(value);
      });
    });
    return Array.from(map.entries()).map(([key, value]) => ({
      key,
      values: Array.from(value),
    }));
  }, [product.variants]);

  const defaultSelection = useMemo(() => {
    const initial: VariantAttrMap = {};
    attributeOptions.forEach((option) => {
      initial[option.key] = option.values[0];
    });
    return initial;
  }, [attributeOptions]);

  const [selectedAttrs, setSelectedAttrs] = useState<VariantAttrMap>(defaultSelection);
  const [quantity, setQuantity] = useState(1);
  const [status, setStatus] = useState<string | null>(null);
  const { addItem, loading: cartLoading } = useCart();

  useEffect(() => {
    setSelectedAttrs(defaultSelection);
  }, [defaultSelection]);

  const activeVariant = useMemo(() => {
    if (product.variants.length === 0) return undefined;
    return (
      product.variants.find((variant) =>
        Object.entries(selectedAttrs).every(([key, value]) => variant.attrs[key] === value)
      ) ?? product.variants[0]
    );
  }, [product.variants, selectedAttrs]);

  const finalPrice = useMemo(() => {
    const delta = activeVariant?.priceDelta ?? 0;
    return product.basePrice + delta;
  }, [activeVariant, product.basePrice]);

  const canPurchase = (activeVariant?.stock ?? 1) > 0;

  const handleAttrSelect = (key: string, value: string) => {
    setSelectedAttrs((prev) => ({ ...prev, [key]: value }));
  };

  const actionLabel = canPurchase ? "加入购物车" : "暂时缺货";

  const handleAddToCart = async () => {
    if (!canPurchase) return;
    setStatus(null);
    try {
      await addItem({
        productId: product.id,
        variantId: activeVariant?.id,
        quantity,
      });
      setStatus("已加入购物车");
    } catch (error) {
      const message = error instanceof Error ? error.message : "加入购物车失败";
      setStatus(message);
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">{product.name}</h1>
        {product.subtitle ? <p className="text-sm text-muted-foreground">{product.subtitle}</p> : null}
      </div>

      {attributeOptions.length > 0 ? (
        <div className="space-y-4">
          {attributeOptions.map((option) => (
            <div key={option.key} className="space-y-2">
              <p className="text-sm font-medium text-foreground">选择 {option.key}</p>
              <div className="flex flex-wrap gap-2">
                {option.values.map((value) => {
                  const isActive = selectedAttrs[option.key] === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => handleAttrSelect(option.key, value)}
                      className={`rounded-full border px-4 py-2 text-sm transition ${
                        isActive
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border/70 bg-white hover:border-foreground/40"
                      }`}
                    >
                      {value}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">本款商品为单一规格，直接加入购物车即可。</p>
      )}

      <div className="space-y-6 rounded-3xl border border-border/60 bg-white p-6 shadow-sm">
        <Price amount={finalPrice} compareAtAmount={product.compareAtPrice ?? undefined} className="text-2xl" />
        {activeVariant ? (
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            SKU: {activeVariant.sku} · 库存 {activeVariant.stock}
          </p>
        ) : null}
        <QuantityInput value={quantity} onChange={setQuantity} />
        <Button
          type="button"
          onClick={handleAddToCart}
          disabled={!canPurchase || cartLoading}
          className="h-12 w-full text-base font-semibold"
        >
          {actionLabel}
        </Button>
        {status ? <p className="text-xs text-muted-foreground">{status}</p> : null}
        <p className="text-xs text-muted-foreground">
          支持支付宝 / 微信支付，结算时可在 15 分钟内完成支付。
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">规格参数</h2>
        {Object.keys(product.specs).length > 0 ? (
          <dl className="grid gap-3 sm:grid-cols-2">
            {Object.entries(product.specs).map(([key, value]) => (
              <div key={key} className="rounded-2xl border border-border/60 bg-muted/30 p-4">
                <dt className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{key}</dt>
                <dd className="text-sm font-medium text-foreground">{String(value)}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <p className="text-sm text-muted-foreground">规格信息将在上线前补充。</p>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">产品介绍</h2>
        <p className="text-sm leading-6 text-muted-foreground whitespace-pre-line">{product.description}</p>
      </section>

      <StickyCTA>
        <div className="flex flex-1 items-center justify-between">
          <Price amount={finalPrice} compareAtAmount={product.compareAtPrice ?? undefined} />
          <Button
            type="button"
            onClick={handleAddToCart}
            disabled={!canPurchase || cartLoading}
            className="h-12 flex-1 text-base font-semibold"
          >
            {actionLabel}
          </Button>
        </div>
      </StickyCTA>
    </div>
  );
}
