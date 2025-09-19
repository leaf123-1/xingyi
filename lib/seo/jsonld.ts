interface ProductJsonLdInput {
  name: string;
  slug: string;
  description: string;
  coverImage: string;
  gallery: string[];
  basePrice: number;
  variants: Array<{
    sku?: string | null;
    priceDelta: number;
    stock?: number | null;
  }>;
  currency?: string;
}

interface ArticleJsonLdInput {
  title: string;
  slug: string;
  excerpt?: string | null;
  coverImage?: string | null;
  publishedAt?: Date | null;
  updatedAt?: Date | null;
}

/**
 * 生成 Product 类型的结构化数据，帮助搜索引擎理解价格与库存状态。
 */
export function buildProductJsonLd(input: ProductJsonLdInput, siteUrl: string) {
  const currency = input.currency ?? "CNY";
  const priceCandidates = input.variants.length
    ? input.variants.map((variant) => input.basePrice + variant.priceDelta)
    : [input.basePrice];
  const lowPrice = Math.min(...priceCandidates);
  const highPrice = Math.max(...priceCandidates);
  const available = input.variants.length
    ? input.variants.some((variant) => (variant.stock ?? 0) > 0)
    : true;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: input.name,
    description: input.description,
    image: [input.coverImage, ...input.gallery].filter(Boolean),
    sku: input.variants[0]?.sku ?? undefined,
    brand: {
      "@type": "Brand",
      name: "Xingyi Sports",
    },
    offers: {
      "@type": input.variants.length > 1 ? "AggregateOffer" : "Offer",
      priceCurrency: currency,
      price: Number.isFinite(lowPrice) ? lowPrice.toFixed(2) : undefined,
      lowPrice: Number.isFinite(lowPrice) ? lowPrice.toFixed(2) : undefined,
      highPrice: Number.isFinite(highPrice) ? highPrice.toFixed(2) : undefined,
      offerCount: input.variants.length || 1,
      availability: available ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: `${siteUrl}/products/${input.slug}`,
    },
  } as const;
}

/**
 * 生成文章类型的结构化数据，涵盖发布时间、摘要与封面。
 */
export function buildArticleJsonLd(input: ArticleJsonLdInput, siteUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: input.title,
    description: input.excerpt ?? undefined,
    image: input.coverImage ? [input.coverImage] : undefined,
    datePublished: input.publishedAt?.toISOString(),
    dateModified: (input.updatedAt ?? input.publishedAt)?.toISOString(),
    mainEntityOfPage: `${siteUrl}/articles/${input.slug}`,
    author: {
      "@type": "Organization",
      name: "Xingyi Sports",
    },
    publisher: {
      "@type": "Organization",
      name: "Xingyi Sports",
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/logo.svg`,
      },
    },
  } as const;
}
