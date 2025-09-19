import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Price } from "@/components/site/price";
import { cn } from "@/lib/utils";

export interface ProductCardData {
  id: string;
  name: string;
  subtitle?: string | null;
  slug: string;
  coverImage: string;
  price: number;
  compareAtPrice?: number | null;
  categoryName?: string | null;
}

interface ProductCardProps {
  product: ProductCardData;
  className?: string;
}

/**
 * 商品卡片统一样式，保证留白、阴影与交互反馈与设计规范保持一致。
 */
export function ProductCard({ product, className }: ProductCardProps) {
  return (
    <article
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-3xl border border-border/80 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg",
        className
      )}
    >
      <Link prefetch href={`/products/${product.slug}`} className="relative block h-64 w-full overflow-hidden">
        <Image
          src={product.coverImage}
          alt={product.name}
          fill
          className="object-cover transition duration-500 group-hover:scale-105"
          sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
          loading="lazy"
        />
      </Link>
      <div className="flex flex-1 flex-col gap-4 p-6">
        <div className="space-y-2">
          {product.categoryName ? (
            <span className="text-xs uppercase tracking-[0.25em] text-muted-foreground">{product.categoryName}</span>
          ) : null}
          <h3 className="text-lg font-semibold text-foreground">{product.name}</h3>
          {product.subtitle ? (
            <p className="text-sm text-muted-foreground">{product.subtitle}</p>
          ) : null}
        </div>
        <div className="mt-auto flex items-center justify-between">
          <Price amount={product.price} compareAtAmount={product.compareAtPrice ?? undefined} />
          <Link
            href={`/products/${product.slug}`}
            prefetch
            className="inline-flex h-10 items-center gap-1 rounded-full bg-primary/10 px-4 text-sm font-medium text-primary transition hover:bg-primary hover:text-primary-foreground"
          >
            查看详情
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}
