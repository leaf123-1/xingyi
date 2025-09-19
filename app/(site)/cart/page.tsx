import type { Metadata } from "next";

import { getCartAction } from "./actions";
import { CartView } from "@/components/site/cart-view";
import { SectionHeading } from "@/components/site/section-heading";

export const metadata: Metadata = {
  title: "购物车",
  description: "查看已选商品并确认配送、税费与结算方式。",
};

export default async function CartPage() {
  const cart = await getCartAction();

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-16">
      <SectionHeading
        eyebrow="购物车"
        title="确认即将结算的商品"
        description="支持匿名购物车，登录后会自动合并历史条目。"
      />
      <CartView initialCart={cart} />
    </div>
  );
}
