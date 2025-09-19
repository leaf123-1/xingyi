import type { Metadata } from "next";
import Link from "next/link";
import dynamic from "next/dynamic";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/site/product-card";
import { SectionHeading } from "@/components/site/section-heading";
import { Button } from "@/components/ui/button";

const PAGE_SIZE = 12;

const ProductsFilters = dynamic(
  () => import("@/components/site/products-filters").then((mod) => mod.ProductsFilters),
  {
    // 服务端仅输出占位骨架，减轻首页包体体积。
    loading: () => <FiltersFallback />,
    ssr: false,
  }
);

function FiltersFallback() {
  return (
    <div className="space-y-4 rounded-3xl border border-dashed border-border/60 p-6 text-sm text-muted-foreground">
      正在载入筛选条件...
    </div>
  );
}

export const metadata: Metadata = {
  title: "商品目录",
  description: "按分类、价格与热度筛选体育器材，找到契合赛段的装备组合。",
};

interface ProductsPageProps {
  searchParams: Record<string, string | string[] | undefined>;
}

function parseNumber(value: string | undefined, fallback: number) {
  if (!value) return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toProductCard(product: Awaited<ReturnType<typeof prisma.product.findMany>>[number]) {
  return {
    id: product.id,
    name: product.name,
    subtitle: product.subtitle,
    slug: product.slug,
    coverImage: product.coverImage,
    price: Number(product.price),
    compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : null,
    categoryName: product.category?.name ?? null,
  };
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const q = typeof searchParams.q === "string" ? searchParams.q : undefined;
  const category = typeof searchParams.category === "string" ? searchParams.category : undefined;
  const sort = typeof searchParams.sort === "string" ? searchParams.sort : "newest";
  const page = Math.max(parseNumber(typeof searchParams.page === "string" ? searchParams.page : undefined, 1), 1);

  const priceAggregation = await prisma.product.aggregate({
    _min: { price: true },
    _max: { price: true },
    where: { status: "PUBLISHED" },
  });

  const globalMin = Number(priceAggregation._min.price ?? 0);
  const globalMax = Number(priceAggregation._max.price ?? 5000);

  const minInput = parseNumber(typeof searchParams.min === "string" ? searchParams.min : undefined, globalMin);
  const maxInput = parseNumber(typeof searchParams.max === "string" ? searchParams.max : undefined, globalMax);
  const safeMinCandidate = Math.min(minInput, maxInput);
  const safeMaxCandidate = Math.max(minInput, maxInput);
  const normalizedMin = Math.max(globalMin, safeMinCandidate);
  const normalizedMax = Math.max(normalizedMin, Math.min(globalMax, safeMaxCandidate));

  const where: Parameters<typeof prisma.product.findMany>[0]["where"] = {
    status: "PUBLISHED",
  };

  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { subtitle: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
    ];
  }

  if (category) {
    where.category = { slug: category };
  }

  if (Number.isFinite(normalizedMin) || Number.isFinite(normalizedMax)) {
    where.price = {
      gte: normalizedMin,
      lte: normalizedMax,
    };
  }

  const orderBy =
    sort === "price-asc"
      ? { price: "asc" }
      : sort === "price-desc"
      ? { price: "desc" }
      : sort === "popular"
      ? { updatedAt: "desc" }
      : { createdAt: "desc" };

  const [products, total, categories] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { category: true },
      orderBy,
      take: PAGE_SIZE,
      skip: (page - 1) * PAGE_SIZE,
    }),
    prisma.product.count({ where }),
    prisma.category.findMany({ orderBy: { sort: "asc" } }),
  ]);

  const totalPages = Math.max(Math.ceil(total / PAGE_SIZE), 1);

  return (
    <div className="mx-auto max-w-6xl space-y-12 px-4 py-16">
      <SectionHeading
        eyebrow="产品目录"
        title="根据场景快速筛选装备"
        description="支持关键词、分类、价格与排序组合过滤，URL 同步便于分享或 SEO 收录。"
      />
      <div className="grid gap-10 lg:grid-cols-[280px_1fr]">
        <ProductsFilters
          categories={categories.map((item) => ({ slug: item.slug, name: item.name }))}
          priceRange={{ min: globalMin, max: globalMax }}
          initialKeyword={q}
          initialCategory={category}
          initialSort={sort}
          initialPrice={[normalizedMin, normalizedMax]}
        />
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">共 {total} 件商品</p>
            <Link prefetch href="/articles" className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
              阅读运营技巧
            </Link>
          </div>
          {products.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {products.map((product) => (
                <ProductCard key={product.id} product={toProductCard(product)} />
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-border/70 p-10 text-center text-sm text-muted-foreground">
              暂无符合条件的商品，请调整筛选条件。
            </div>
          )}
          <Pagination page={page} totalPages={totalPages} searchParams={searchParams} />
        </div>
      </div>
    </div>
  );
}

function Pagination({
  page,
  totalPages,
  searchParams,
}: {
  page: number;
  totalPages: number;
  searchParams: ProductsPageProps["searchParams"];
}) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <nav className="flex items-center justify-center gap-2" aria-label="分页">
      <PageLink label="上一页" page={Math.max(page - 1, 1)} disabled={page === 1} searchParams={searchParams} />
      {pages.map((pageNumber) => (
        <PageLink
          key={pageNumber}
          label={String(pageNumber)}
          page={pageNumber}
          active={pageNumber === page}
          searchParams={searchParams}
        />
      ))}
      <PageLink
        label="下一页"
        page={Math.min(page + 1, totalPages)}
        disabled={page === totalPages}
        searchParams={searchParams}
      />
    </nav>
  );
}

function PageLink({
  label,
  page,
  disabled,
  active,
  searchParams,
}: {
  label: string;
  page: number;
  disabled?: boolean;
  active?: boolean;
  searchParams: ProductsPageProps["searchParams"];
}) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (key === "page") continue;
    if (typeof value === "string") {
      params.set(key, value);
    }
  }
  params.set("page", String(page));
  const href = `?${params.toString()}`;

  if (disabled) {
    return (
      <span className="rounded-full border border-border/60 px-4 py-2 text-sm text-muted-foreground">{label}</span>
    );
  }

  return (
    <Button
      variant={active ? "default" : "outline"}
      asChild
      size="sm"
      className={active ? "bg-primary text-primary-foreground" : "border-border/60 text-foreground"}
    >
      <Link prefetch href={href} scroll>
        {label}
      </Link>
    </Button>
  );
}
