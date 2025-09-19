import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/site/section-heading";

export const metadata: Metadata = {
  title: "支付成功",
  description: "订单已完成支付，可在后台或账户中心查看详情。",
};

export default function CheckoutSuccessPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-24 text-center">
      <SectionHeading
        eyebrow="支付成功"
        title="感谢完成本次结算"
        description="系统已同步订单状态为已支付，稍后会发送电子邮件确认与物流更新。"
        align="center"
      />
      <div className="space-y-6 text-sm text-muted-foreground">
        <p>
          若需修改配送信息或发票抬头，请在 30 分钟内联系在线客服或拨打服务专线，我们会在后台订单管理模块第一时间处理。
        </p>
        <p>如需继续选购，可跳转至商品目录或查看最新文章。</p>
      </div>
      <div className="flex flex-wrap justify-center gap-4">
        <Button asChild size="lg">
          <Link prefetch href="/products">继续购物</Link>
        </Button>
        <Button variant="outline" size="lg" asChild>
          <Link prefetch href="/admin/orders">查看后台订单</Link>
        </Button>
      </div>
    </div>
  );
}
