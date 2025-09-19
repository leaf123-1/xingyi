import { prisma } from "@/lib/prisma";
import { PaymentsTable } from "@/components/admin/payments-table";

export default async function AdminPaymentsPage() {
  const payments = await prisma.payment.findMany({
    take: 50,
    orderBy: { createdAt: "desc" },
    include: {
      order: { select: { orderNumber: true } },
    },
  });

  const formatted = payments.map((payment) => ({
    id: payment.id,
    provider: payment.provider,
    status: payment.status,
    amount: payment.amount.toString(),
    orderNumber: payment.order?.orderNumber ?? "-",
    createdAt: new Date(payment.createdAt).toLocaleString(),
  }));

  return <PaymentsTable payments={formatted} />;
}
