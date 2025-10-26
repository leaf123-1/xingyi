"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";

interface PriceProps {
  /** 商品当前售价，单位为最小货币单位（人民币元） */
  amount: number;
  /** 参考价或划线价，未提供则不展示 */
  compareAtAmount?: number | null;
  /** 货币代码，默认人民币 CNY */
  currency?: string;
  className?: string;
}

/**
 * 统一的价格展示组件，保持千分位与货币符号格式一致。
 * 在产品卡片、详情页、购物车等场景重复复用，避免散落的格式化逻辑。
 */
export function Price({ amount, compareAtAmount, currency = "CNY", className }: PriceProps) {
  const formatter = useMemo(
    () =>
      new Intl.NumberFormat("zh-CN", {
        style: "currency",
        currency,
        minimumFractionDigits: 0,
      }),
    [currency]
  );

  return (
    <div className={cn("flex items-baseline gap-2", className)}>
      <span className="text-base font-semibold text-foreground md:text-lg">
        {formatter.format(amount)}
      </span>
      {compareAtAmount ? (
        <span className="text-sm text-muted-foreground line-through">
          {formatter.format(compareAtAmount)}
        </span>
      ) : null}
    </div>
  );
}
