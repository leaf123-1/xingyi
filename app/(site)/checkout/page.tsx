import type { Metadata } from "next";
import CheckoutForm from "@/components/site/checkout-form";
import { SectionHeading } from "@/components/site/section-heading";

export const metadata: Metadata = {
  title: "结算",
  description: "确认配送信息并选择支付宝或微信支付，快速完成订单。",
};

export default function CheckoutPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-16">
      <SectionHeading
        eyebrow="安全结算"
        title="选择支付方式并确认配送"
        description="结算流程会自动拉起支付宝或微信支付页面，成功后回调订单状态同步为已支付。"
      />
      <CheckoutForm />
    </div>
  );
}
