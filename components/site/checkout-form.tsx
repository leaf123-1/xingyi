"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCart } from "@/hooks/use-cart";

const checkoutSchema = z.object({
  fullName: z.string().min(2, "请输入姓名"),
  email: z.string().email("请输入有效邮箱"),
  phone: z.string().min(6, "请输入联系方式"),
  address: z.string().min(5, "请输入详细地址"),
  paymentMethod: z.enum(["alipay", "wechat"]),
});

type CheckoutValues = z.infer<typeof checkoutSchema>;

const paymentOptions: { value: CheckoutValues["paymentMethod"]; label: string; description: string }[] = [
  {
    value: "alipay",
    label: "支付宝",
    description: "支付宝网页支付，支持花呗分期",
  },
  {
    value: "wechat",
    label: "微信支付",
    description: "微信内置支付，适配移动端",
  },
];

export default function CheckoutForm() {
  const [status, setStatus] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const { cart, refresh } = useCart();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<CheckoutValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      paymentMethod: "alipay",
    },
  });

  const paymentMethod = watch("paymentMethod");

  const onSubmit = async (values: CheckoutValues) => {
    setStatus(null);
    setQrCode(null);

    let cartId = cart?.id;
    if (!cartId) {
      const nextCart = await refresh();
      cartId = nextCart?.id;
    }

    if (!cartId) {
      setStatus("购物车为空，请先添加商品。");
      return;
    }
    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        cartId,
        provider: values.paymentMethod,
        returnUrl:
          typeof window === "undefined"
            ? undefined
            : `${window.location.origin}/checkout/complete`,
      }),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok || !data) {
      setStatus(data?.error ?? "提交失败，请稍后再试。");
      return;
    }

    if (data.checkout?.flow === "redirect") {
      setStatus("即将跳转至第三方支付页……");
      if (typeof window !== "undefined") {
        window.location.href = data.checkout.url;
      }
      return;
    }

    if (data.checkout?.flow === "qr") {
      setStatus("请使用微信扫描二维码完成支付。");
      setQrCode(data.checkout.qrCode);
      return;
    }

    setStatus("已创建支付会话，请检查返回数据。");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <FormField label="收货人" error={errors.fullName?.message}>
          <Input placeholder="姓名" {...register("fullName")} />
        </FormField>
        <FormField label="联系邮箱" error={errors.email?.message}>
          <Input placeholder="example@domain.com" {...register("email")} />
        </FormField>
        <FormField label="联系电话" error={errors.phone?.message}>
          <Input placeholder="手机号" {...register("phone")} />
        </FormField>
        <FormField label="配送地址" error={errors.address?.message} className="md:col-span-2">
          <Input placeholder="省市区 + 详细街道门牌" {...register("address")} />
        </FormField>
      </div>
      <div className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          支付渠道
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          {paymentOptions.map((option) => (
            <label
              key={option.value}
              className={cn(
                "flex cursor-pointer flex-col gap-2 rounded-2xl border p-4 transition",
                paymentMethod === option.value ? "border-primary bg-primary/5" : "hover:border-primary/40"
              )}
            >
              <div className="flex items-center justify-between">
                <div className="text-base font-semibold">{option.label}</div>
                <input
                  type="radio"
                  value={option.value}
                  className="h-4 w-4"
                  {...register("paymentMethod")}
                />
              </div>
              <p className="text-xs text-muted-foreground">{option.description}</p>
            </label>
          ))}
        </div>
      </div>
      <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "正在创建订单..." : "确认订单并支付"}
      </Button>
      {status && <p className="text-sm text-muted-foreground">{status}</p>}
      {qrCode && (
        <div className="rounded-2xl border border-dashed p-4 text-center text-sm text-muted-foreground">
          <p className="font-semibold">模拟二维码数据：</p>
          <code className="break-all text-xs">{qrCode}</code>
        </div>
      )}
    </form>
  );
}

interface FormFieldProps {
  label: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}

function FormField({ label, error, children, className }: FormFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <label className="text-sm font-medium text-foreground">{label}</label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
