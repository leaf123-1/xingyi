import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSiteUrl } from "@/lib/seo/url";
import { buildProductJsonLd } from "@/lib/seo/jsonld";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { ProductDetail } from "@/components/site/product-detail";
import { ProductCard } from "@/components/site/product-card";
import { SectionHeading } from "@/components/site/section-heading";

interface ProductPageProps {
  params: { slug: string };
}

async function getProduct(slug: string) {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
      variants: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!product || product.status !== "PUBLISHED") {
    return null;
  }

  return product;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const product = await getProduct(params.slug);

  if (!product) {
    return {
      title: "商品未找到",
    };
  }

  const price = Number(product.price);

  return {
    title: product.name,
    description: product.subtitle ?? product.description.slice(0, 80),
    openGraph: {
      title: product.name,
      description: product.subtitle ?? product.description.slice(0, 120),
      images: [product.coverImage, ...product.gallery].slice(0, 4).map((url) => ({ url })),
      type: "product",
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description: product.subtitle ?? product.description.slice(0, 120),
    },
    other: {
      price: price.toString(),
    },
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const product = await getProduct(params.slug);

  if (!product) {
    notFound();
  }

  const related = await prisma.product.findMany({
    where: {
      status: "PUBLISHED",
      categoryId: product.categoryId,
      NOT: { id: product.id },
    },
    include: { category: true },
    take: 4,
  });

  const detailData = {
    id: product.id,
    name: product.name,
    subtitle: product.subtitle,
    description: product.description,
    specs: (product.specs as Record<string, string | number | null>) ?? {},
    basePrice: Number(product.price),
    compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : null,
    variants: product.variants.map((variant) => ({
      id: variant.id,
      sku: variant.sku,
      attrs: (variant.attrs as Record<string, string>) ?? {},
      stock: variant.stock,
      priceDelta: Number(variant.priceDelta),
    })),
  };

  const crumbs = [
    { label: "首页", href: "/" },
    { label: "全部商品", href: "/products" },
    product.category ? { label: product.category.name, href: `/products?category=${product.category.slug}` } : null,
    { label: product.name },
  ].filter(Boolean) as { label: string; href?: string }[];

  const siteUrl = getSiteUrl();
  const structuredData = buildProductJsonLd(
    {
      name: product.name,
      slug: product.slug,
      description: product.subtitle ?? product.description,
      coverImage: product.coverImage,
      gallery: product.gallery,
      basePrice: Number(product.price),
      variants: product.variants.map((variant) => ({
        sku: variant.sku,
        priceDelta: Number(variant.priceDelta),
        stock: variant.stock,
      })),
    },
    siteUrl
  );

  return (
    <div className="mx-auto max-w-6xl space-y-12 px-4 py-16">
      <script
        type="application/ld+json"
        // 注入 JSON-LD 结构化数据，方便搜索引擎理解商品信息。
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <Breadcrumbs items={crumbs} />
      <div className="grid gap-10 lg:grid-cols-[minmax(0,_1.1fr)_minmax(0,_0.9fr)]">
        <div className="space-y-4">
          <div className="relative overflow-hidden rounded-[32px] border border-border/60">
            <Image
              src={product.coverImage}
              alt={product.name}
              width={960}
              height={720}
              className="h-[520px] w-full object-cover"
              priority
              sizes="(min-width: 1024px) 50vw, 100vw"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {product.gallery.map((image) => (
              <div key={image} className="relative h-36 w-full overflow-hidden rounded-2xl border border-border/40">
                <Image
                  src={image}
                  alt={`${product.name} 图集`}
                  fill
                  className="object-cover"
                  loading="lazy"
                  sizes="(min-width: 1024px) 15vw, (min-width: 768px) 25vw, 33vw"
                />
              </div>
            ))}
          </div>
        </div>
        <ProductDetail product={detailData} />
      </div>

      <section className="space-y-6">
        <SectionHeading
          eyebrow="相关推荐"
          title="与当前装备搭配的单品"
          description="基于相同分类与热销度推荐，提升加购率。"
        />
        {related.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {related.map((item) => (
              <ProductCard
                key={item.id}
                product={{
                  id: item.id,
                  name: item.name,
                  subtitle: item.subtitle,
                  slug: item.slug,
                  coverImage: item.coverImage,
                  price: Number(item.price),
                  compareAtPrice: item.compareAtPrice ? Number(item.compareAtPrice) : null,
                  categoryName: item.category?.name ?? null,
                }}
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">暂无相关推荐，敬请期待更多单品。</p>
        )}
      </section>
    </div>
  );
}
