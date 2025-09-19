import { prisma } from "@/lib/prisma";
import { OrderStatus, PublishStatus } from "@prisma/client";

const currency = new Intl.NumberFormat("zh-CN", { style: "currency", currency: "CNY" });

export default async function AdminDashboardPage() {
  const [revenueSum, pendingOrders, publishedProducts, contactMessages, latestOrders] = await Promise.all([
    prisma.order.aggregate({
      where: { status: { in: [OrderStatus.PAID, OrderStatus.FULFILLED] } },
      _sum: { totalAmount: true },
    }),
    prisma.order.count({ where: { status: OrderStatus.PENDING } }),
    prisma.product.count({ where: { status: "PUBLISHED" } }),
    prisma.contactMessage.count({ where: { status: "NEW" } }),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        user: true,
        payments: true,
        items: {
          include: { product: true },
        },
      },
    }),
  ]);
  const totalRevenue = Number(revenueSum._sum.totalAmount ?? 0);
  const publishedArticles = await prisma.article.count({ where: { status: PublishStatus.PUBLISHED } });

  return (
    <section className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">运营概览</h1>
        <p className="text-sm text-muted-foreground">
          实时掌握销售、内容发布与客户沟通状态，可根据业务需求扩展自定义卡片。
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard title="累计回款" value={currency.format(totalRevenue)} description="已支付与已发货订单总额" />
        <StatCard title="待处理订单" value={pendingOrders.toString()} description="等待支付或履约的订单" />
        <StatCard title="上架商品" value={publishedProducts.toString()} description="当前已发布商品数量" />
        <StatCard title="新留言" value={contactMessages.toString()} description="待跟进的客户留言" />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border bg-background p-6">
          <h2 className="text-lg font-semibold">最近订单</h2>
          <p className="text-xs text-muted-foreground">最近 5 笔订单概览，包含金额与状态。</p>
          <div className="mt-4 space-y-3 text-sm">
            {latestOrders.map((order) => (
              <div key={order.id} className="rounded-lg border bg-muted/40 p-3">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-medium">订单号：{order.orderNumber}</p>
                    <p className="text-xs text-muted-foreground">
                      {order.user?.name ?? order.user?.email ?? "匿名客户"} · {order.items.length} 件商品
                    </p>
                  </div>
                  <span className="text-sm font-semibold">{currency.format(Number(order.totalAmount))}</span>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span className="rounded-full bg-background px-2 py-0.5">状态：{order.status}</span>
                  {order.payments.map((payment) => (
                    <span key={payment.id} className="rounded-full bg-background px-2 py-0.5">
                      {payment.provider} · {payment.status}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border bg-background p-6">
          <h2 className="text-lg font-semibold">内容健康度</h2>
          <p className="text-xs text-muted-foreground">文章与页面的发布进度，便于内容团队协同。</p>
          <div className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between rounded-lg border bg-muted/40 p-3">
              <div>
                <p className="font-medium">已发布文章</p>
                <p className="text-xs text-muted-foreground">面向 SEO 与品牌故事的内容数量</p>
              </div>
              <span className="text-lg font-semibold">{publishedArticles}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border bg-muted/40 p-3">
              <div>
                <p className="font-medium">待发布页面</p>
                <p className="text-xs text-muted-foreground">草稿与审核中的页面，建议及时跟进</p>
              </div>
              <AwaitingPages />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function StatCard({ title, value, description }: { title: string; value: string; description: string }) {
  return (
    <div className="rounded-2xl border bg-background p-5 shadow-sm">
      <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{title}</div>
      <div className="mt-3 text-2xl font-semibold">{value}</div>
      <p className="mt-2 text-xs text-muted-foreground">{description}</p>
    </div>
  );
}

async function AwaitingPages() {
  const [draftPages, reviewPages] = await Promise.all([
    prisma.page.count({ where: { status: PublishStatus.DRAFT } }),
    prisma.page.count({ where: { status: PublishStatus.REVIEW } }),
  ]);
  return (
    <div className="text-right text-sm font-semibold">
      <div>草稿 {draftPages}</div>
      <div className="text-xs text-muted-foreground">待审核 {reviewPages}</div>
    </div>
  );
}
