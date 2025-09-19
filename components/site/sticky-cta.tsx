import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StickyCTAProps {
  children: ReactNode;
  className?: string;
}

/**
 * 移动端底部吸附 CTA 容器，配合详情页加入购物车等操作。
 */
export function StickyCTA({ children, className }: StickyCTAProps) {
  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-white/95 px-4 py-3 shadow-[0_-8px_24px_-12px_rgba(0,0,0,0.2)] backdrop-blur",
        "lg:hidden",
        className
      )}
    >
      <div className="mx-auto flex w-full max-w-3xl items-center gap-3">{children}</div>
    </div>
  );
}
