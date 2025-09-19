"use client";

import { Minus, Plus } from "lucide-react";
import { useCallback } from "react";
import { cn } from "@/lib/utils";

interface QuantityInputProps {
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
  className?: string;
}

/**
 * 购物车与详情页复用的数量输入，确保触控与键盘操作的无障碍体验。
 */
export function QuantityInput({ value, min = 1, max = 99, onChange, className }: QuantityInputProps) {
  const clampValue = useCallback(
    (next: number) => {
      const safeValue = Math.min(Math.max(next, min), max);
      onChange(safeValue);
    },
    [max, min, onChange]
  );

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border border-border/80 bg-white px-3 py-1 shadow-sm",
        className
      )}
    >
      <button
        type="button"
        className="rounded-full p-1 transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        onClick={() => clampValue(value - 1)}
        aria-label="减少数量"
      >
        <Minus className="h-4 w-4" />
      </button>
      <input
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(event) => clampValue(Number(event.target.value))}
        className="w-12 border-0 bg-transparent text-center text-sm font-medium text-foreground focus-visible:outline-none"
        aria-label="商品数量"
      />
      <button
        type="button"
        className="rounded-full p-1 transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        onClick={() => clampValue(value + 1)}
        aria-label="增加数量"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}
