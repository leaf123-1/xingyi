interface PaymentRecord {
  id: string;
  provider: string;
  status: string;
  amount: string;
  orderNumber: string;
  createdAt: string;
}

export function PaymentsTable({ payments }: { payments: PaymentRecord[] }) {
  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">支付记录</h1>
        <p className="text-sm text-muted-foreground">查看支付渠道回调结果与对应订单。</p>
      </div>
      <div className="overflow-hidden rounded-2xl border bg-background">
        <table className="min-w-full divide-y divide-border text-sm">
          <thead className="bg-muted/60">
            <tr>
              <th className="px-4 py-3 text-left font-medium">支付单号</th>
              <th className="px-4 py-3 text-left font-medium">渠道</th>
              <th className="px-4 py-3 text-left font-medium">状态</th>
              <th className="px-4 py-3 text-left font-medium">金额</th>
              <th className="px-4 py-3 text-left font-medium">订单号</th>
              <th className="px-4 py-3 text-left font-medium">时间</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {payments.map((payment) => (
              <tr key={payment.id} className="hover:bg-muted/40">
                <td className="px-4 py-3 font-medium">{payment.id}</td>
                <td className="px-4 py-3 text-xs uppercase text-muted-foreground">{payment.provider}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium">{payment.status}</span>
                </td>
                <td className="px-4 py-3">¥{payment.amount}</td>
                <td className="px-4 py-3">{payment.orderNumber}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{payment.createdAt}</td>
              </tr>
            ))}
            {payments.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-sm text-muted-foreground">
                  暂无支付记录。
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}
