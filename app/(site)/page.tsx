import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkle, Trophy } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/site/product-card";
import { SectionHeading } from "@/components/site/section-heading";
import { Button } from "@/components/ui/button";

const heroHighlights = [
  "全渠道库存同步",
  "RBAC 后台可视化",
  "支付宝 / 微信双通道",
];

const brandHighlights = [
  {
    title: "碳纤维复合工艺",
    description: "自研碳纤支撑结构，兼顾轻量与抗扭力。",
    icon: Sparkle,
  },
  {
    title: "UL 轻量化策略",
    description: "以模块化理念拆分装备，降低长途运动负担。",
    icon: Trophy,
  },
];

const communityImages = [
  "https://images.unsplash.com/photo-1523419409543-0c1df022bdd1?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=1200&q=80",
];

async function getHomeData() {
  const [categories, products, articles] = await Promise.all([
    prisma.category.findMany({
      orderBy: { sort: "asc" },
      take: 4,
    }),
    prisma.product.findMany({
      where: { status: "PUBLISHED" },
      include: { category: true },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    prisma.article.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      take: 3,
    }),
  ]);

  return {
    categories,
    products: products.map((product) => ({
      id: product.id,
      name: product.name,
      subtitle: product.subtitle,
      slug: product.slug,
      coverImage: product.coverImage,
      price: Number(product.price),
      compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : null,
      categoryName: product.category?.name ?? null,
    })),
    articles,
  };
}

export default async function HomePage() {
  const { categories, products, articles } = await getHomeData();

  return (
    <div className="space-y-20 pb-24">
      <section className="relative overflow-hidden bg-gradient-to-br from-background via-background to-primary/10">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(41,132,255,0.12),_transparent_55%)]" />
        <div className="mx-auto flex max-w-6xl flex-col gap-16 px-4 py-24 lg:flex-row lg:items-center">
          <div className="flex-1 space-y-8">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/50 bg-primary/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.4em] text-primary">
              新季装备首发
            </span>
            <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl">
              启动下一次长距离冒险的核心装备集
            </h1>
            <p className="max-w-2xl text-base text-muted-foreground md:text-lg">
              Xingyi Sports 聚焦越野跑、登山与高海拔探险场景，通过一体化后台与支付抽象迅速上线全渠道商店。前台以粘性导航、丰富 Mega Menu 与响应式网格承载品牌调性。
            </p>
            <ul className="flex flex-wrap gap-3 text-sm text-muted-foreground">
              {heroHighlights.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-2 rounded-full border border-border/80 bg-white/60 px-3 py-1 shadow-sm"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  {item}
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg">
                <Link prefetch href="/products">浏览全部商品</Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link prefetch href="/about">了解品牌方法论</Link>
              </Button>
            </div>
          </div>
          <div className="relative flex flex-1 justify-end">
            <div className="relative h-[420px] w-full max-w-lg overflow-hidden rounded-[40px] border border-white/40 shadow-2xl">
              <Image
                src="https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=1400&q=80"
                alt="户外运动员冲刺"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl space-y-10 px-4">
        <SectionHeading
          eyebrow="热门分类"
          title="根据赛段挑选装备"
          description="分类层级可在后台自由维护，支持树形结构与排序，前台自动适配展示。"
        />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/products?category=${category.slug}`}
              prefetch
              className="group flex flex-col gap-3 rounded-3xl border border-border/60 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <span className="text-xs uppercase tracking-[0.35em] text-muted-foreground">Category</span>
              <p className="text-xl font-semibold text-foreground">{category.name}</p>
              <p className="text-sm text-muted-foreground">树形分类由后台维护，可灵活调整层级与排序。</p>
              <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
                立即探索
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl space-y-10 px-4">
        <SectionHeading
          eyebrow="精选商品"
          title="用数据驱动的推荐提升转化"
          description="通过 Prisma + Next.js Server Actions 快速组合主推 SKU，支持多种排序与搜索。"
        />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="bg-muted/40">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-20 lg:grid-cols-[1.2fr_1fr]">
          <SectionHeading
            eyebrow="品牌技术"
            title="从材料到交付，每一步都为高强度运动设计"
            description="将核心卖点拆解成模块组件，既可在首页呈现，也可在 CMS 中复用。"
          />
          <div className="grid gap-6">
            {brandHighlights.map((item) => (
              <div
                key={item.title}
                className="flex items-start gap-4 rounded-3xl border border-border/60 bg-white p-6 shadow-sm"
              >
                <item.icon className="h-10 w-10 rounded-2xl bg-primary/10 p-2 text-primary" />
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl space-y-10 px-4">
        <SectionHeading
          eyebrow="社区瞬间"
          title="来自核心用户的真实场景"
          description="通过社媒组件展示 UGC，强化品牌可信度，可在后台替换内容源。"
        />
        <div className="grid gap-6 md:grid-cols-3">
          {communityImages.map((image, index) => (
            <div key={image} className="flex flex-col overflow-hidden rounded-3xl border border-border/60 bg-white">
              <div className="relative h-56 w-full">
                <Image
                  src={image}
                  alt={`社区分享 ${index + 1}`}
                  fill
                  className="object-cover"
                  loading="lazy"
                  sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 100vw"
                />
              </div>
              <div className="space-y-3 p-6 text-sm text-muted-foreground">
                <p>「完成首个 100KM 越野赛，整套装备全程稳定贴合。」</p>
                <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">@xingyi.runner</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4">
        <div className="relative overflow-hidden rounded-[40px] bg-gradient-to-r from-primary to-primary/60 px-8 py-14 text-white shadow-xl">
          <div className="space-y-6">
            <h2 className="text-3xl font-semibold tracking-tight">准备好拓展下一条线路了吗？</h2>
            <p className="max-w-xl text-sm text-white/80">
              我们提供产品培训、库存同步、支付对接与客服支持，一站式帮助你上线体育器材独立站。
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90">
                <Link prefetch href="/contact">预约顾问</Link>
              </Button>
              <Button variant="outline" size="lg" asChild className="border-white text-white hover:bg-white/10">
                <Link prefetch href="/articles">阅读技术洞察</Link>
              </Button>
            </div>
          </div>
          <div className="mt-10 grid gap-2 text-xs uppercase tracking-[0.3em] text-white/60 lg:absolute lg:bottom-8 lg:right-8 lg:mt-0">
            {articles.length > 0 ? (
              articles.map((article) => (
                <Link
                  key={article.id}
                  href={`/articles/${article.slug}`}
                  prefetch
                  className="transition hover:text-white"
                >
                  {article.title}
                </Link>
              ))
            ) : (
              <span className="text-white/50">敬请期待更多洞察</span>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
