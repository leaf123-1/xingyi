"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Slider } from "@/components/site/slider";
import { cn } from "@/lib/utils";

interface CategoryOption {
  slug: string;
  name: string;
}

interface ProductsFiltersProps {
  categories: CategoryOption[];
  priceRange: {
    min: number;
    max: number;
  };
  initialKeyword?: string;
  initialCategory?: string;
  initialSort?: string;
  initialPrice?: [number, number];
  className?: string;
}

/**
 * 商品列表的过滤器面板，负责处理关键词 debounce、URL 同步与筛选交互。
 */
export function ProductsFilters({
  categories,
  priceRange,
  initialKeyword = "",
  initialCategory,
  initialSort = "newest",
  initialPrice,
  className,
}: ProductsFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [keyword, setKeyword] = useState(initialKeyword);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory ?? "");
  const [sort, setSort] = useState(initialSort);
  const [price, setPrice] = useState<[number, number]>(
    initialPrice ?? [priceRange.min, priceRange.max]
  );
  const [isPending, startTransition] = useTransition();

  const priceMax = useMemo(() => Math.max(priceRange.max, priceRange.min + 100), [priceRange]);

  const syncToUrl = (nextState: Partial<{ keyword: string; category: string; sort: string; price: [number, number]; page?: number }>) => {
    const params = new URLSearchParams(searchParams?.toString() ?? "");
    if (nextState.keyword !== undefined) {
      if (nextState.keyword) {
        params.set("q", nextState.keyword);
      } else {
        params.delete("q");
      }
    }
    if (nextState.category !== undefined) {
      if (nextState.category) {
        params.set("category", nextState.category);
      } else {
        params.delete("category");
      }
    }
    if (nextState.sort !== undefined) {
      params.set("sort", nextState.sort || "newest");
    }
    if (nextState.price !== undefined) {
      const [min, max] = nextState.price;
      params.set("min", String(Math.round(min)));
      params.set("max", String(Math.round(max)));
    }
    if (nextState.page !== undefined) {
      if (nextState.page > 1) {
        params.set("page", String(nextState.page));
      } else {
        params.delete("page");
      }
    } else {
      params.delete("page");
    }
    const queryString = params.toString();
    startTransition(() => {
      router.replace(queryString ? `${pathname}?${queryString}` : pathname);
    });
  };

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      syncToUrl({ keyword });
    }, 300);
    return () => window.clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyword]);

  useEffect(() => {
    setKeyword(initialKeyword);
  }, [initialKeyword]);

  useEffect(() => {
    setSelectedCategory(initialCategory ?? "");
  }, [initialCategory]);

  useEffect(() => {
    setSort(initialSort);
  }, [initialSort]);

  useEffect(() => {
    setPrice(initialPrice ?? [priceRange.min, priceRange.max]);
  }, [initialPrice, priceRange.max, priceRange.min]);

  return (
    <div
      className={cn(
        "space-y-6 rounded-3xl border border-border/70 bg-muted/40 p-6 shadow-sm",
        className
      )}
    >
      <div className="space-y-2">
        <label htmlFor="keyword" className="text-sm font-medium text-foreground">
          搜索关键字
        </label>
        <input
          id="keyword"
          type="search"
          value={keyword}
          placeholder="输入商品名称、特性或 SKU"
          onChange={(event) => setKeyword(event.target.value)}
          className="w-full rounded-full border border-input bg-background px-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        {isPending ? <p className="text-xs text-muted-foreground">筛选更新中...</p> : null}
      </div>

      <div className="space-y-3">
        <p className="text-sm font-medium text-foreground">分类</p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              setSelectedCategory("");
              syncToUrl({ category: "" });
            }}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition",
              !selectedCategory
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border/80 bg-white hover:border-foreground/40"
            )}
          >
            全部
          </button>
          {categories.map((category) => (
            <button
              key={category.slug}
              type="button"
              onClick={() => {
                const next = selectedCategory === category.slug ? "" : category.slug;
                setSelectedCategory(next);
                syncToUrl({ category: next });
              }}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition",
                selectedCategory === category.slug
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border/80 bg-white hover:border-foreground/40"
              )}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm font-medium text-foreground">
          <p>价格区间</p>
          <span className="text-xs text-muted-foreground">
            ¥{Math.round(price[0])} - ¥{Math.round(price[1])}
          </span>
        </div>
        <Slider
          min={priceRange.min}
          max={priceMax}
          step={50}
          value={price}
          onValueChange={(value) => setPrice(value as [number, number])}
          onValueCommit={(value) => syncToUrl({ price: value as [number, number] })}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="sort" className="text-sm font-medium text-foreground">
          排序
        </label>
        <select
          id="sort"
          value={sort}
          onChange={(event) => {
            const nextSort = event.target.value;
            setSort(nextSort);
            syncToUrl({ sort: nextSort });
          }}
          className="w-full rounded-full border border-input bg-background px-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="newest">最新发布</option>
          <option value="price-asc">价格从低到高</option>
          <option value="price-desc">价格从高到低</option>
          <option value="popular">热度推荐</option>
        </select>
      </div>
    </div>
  );
}
