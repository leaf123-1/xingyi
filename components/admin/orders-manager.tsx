"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { OrderStatus } from "@prisma/client";

interface OrderItem {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  totalAmount: string;
  user?: { name?: string | null; email?: string | null } | null;
  createdAt: string;
  payments: { id: string; provider: string; status: string }[];
  items: { id: string; productName: string; quantity: number }[];
}

interface OrdersManagerProps {
  orders: OrderItem[];
}

export function OrdersManager({ orders }: OrdersManagerProps) {
  const router = useRouter();
  const [updating, setUpdating] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function updateStatus(id: string, status: OrderStatus) {
    setUpdating(id);
    setError(null);
    try {
      const response = await fetch(`/api/admin/orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) {
        throw new Error(await response.text());
      }
      router.refresh();
    } catch (err) {
      console.error(err);
      setError("更新订单状态失败");
    } finally {
      setUpdating(null);
    }
  }

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">订单管理</h1>
        <p className="text-sm text-muted-foreground">查看订单明细并调整履约状态。</p>
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="rounded-2xl border bg-background p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold">订单号：{order.orderNumber}</p>
                <p className="text-xs text-muted-foreground">
                  客户：{order.user?.name ?? order.user?.email ?? "匿名"} · 下单时间：{new Date(order.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold">¥{order.totalAmount}</p>
                <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                  状态：
                  <select
                    className="rounded-md border border-input bg-transparent px-2 py-1 text-xs"
                    value={order.status}
                    onChange={(event) => updateStatus(order.id, event.target.value as OrderStatus)}
                    disabled={updating === order.id}
                  >
                    {Object.values(OrderStatus).map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="mt-3 grid gap-2 md:grid-cols-2">
              <div className="space-y-2 text-sm">
                <p className="text-xs font-semibold uppercase text-muted-foreground">商品明细</p>
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between rounded-lg border bg-muted/40 px-3 py-2 text-xs">
                    <span className="font-medium">{item.productName}</span>
                    <span>数量：{item.quantity}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-2 text-sm">
                <p className="text-xs font-semibold uppercase text-muted-foreground">支付记录</p>
                {order.payments.length === 0 ? (
                  <p className="text-xs text-muted-foreground">暂无支付记录</p>
                ) : (
                  order.payments.map((payment) => (
                    <div key={payment.id} className="rounded-lg border bg-muted/40 px-3 py-2 text-xs">
                      {payment.provider} · {payment.status}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        ))}
        {orders.length === 0 ? (
          <div className="rounded-2xl border bg-background p-6 text-center text-sm text-muted-foreground">
            暂无订单，可在前台下单后回到此处查看。
          </div>
        ) : null}
      </div>
    </section>
  );
}
