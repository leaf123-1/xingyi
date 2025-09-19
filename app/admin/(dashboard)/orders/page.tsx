import { prisma } from "@/lib/prisma";
import { OrdersManager } from "@/components/admin/orders-manager";

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    take: 30,
    orderBy: { createdAt: "desc" },
    include: {
      user: true,
      payments: true,
      items: { include: { product: true } },
    },
  });

  const formatted = orders.map((order) => ({
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    totalAmount: order.totalAmount.toString(),
    user: order.user ? { name: order.user.name, email: order.user.email } : null,
    createdAt: order.createdAt.toISOString(),
    payments: order.payments.map((payment) => ({
      id: payment.id,
      provider: payment.provider,
      status: payment.status,
    })),
    items: order.items.map((item) => ({
      id: item.id,
      productName: item.product.name,
      quantity: item.quantity,
    })),
  }));

  return <OrdersManager orders={formatted} />;
}
