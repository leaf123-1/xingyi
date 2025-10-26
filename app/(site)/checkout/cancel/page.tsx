import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/site/section-heading";

export const metadata: Metadata = {
  title: "支付取消",
  description: "支付流程已取消，可重新发起结算或调整购物车。",
};

export default function CheckoutCancelPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-24 text-center">
      <SectionHeading
        eyebrow="支付取消"
        title="订单暂未完成"
        description="我们已保留购物车内容，可随时再次发起支付。若遇到问题，请联系顾问协助排查。"
        align="center"
      />
      <div className="space-y-6 text-sm text-muted-foreground">
        <p>常见原因包括支付验证超时、风控校验失败或回调未完成。后台的订单状态仍为待支付。</p>
        <p>可返回购物车确认商品，或直接重新进入结算流程。</p>
      </div>
      <div className="flex flex-wrap justify-center gap-4">
        <Button asChild size="lg">
          <Link prefetch href="/cart">返回购物车</Link>
        </Button>
        <Button variant="outline" size="lg" asChild>
          <Link prefetch href="/checkout">重新结算</Link>
        </Button>
      </div>
    </div>
  );
}
