import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  /** 小标题或标签文案，可为空 */
  eyebrow?: string;
  /** 主标题内容 */
  title: string;
  /** 补充描述文案 */
  description?: ReactNode;
  className?: string;
  align?: "left" | "center";
}

/** 统一的版心区段标题组件，保证页面节奏与留白统一。 */
export function SectionHeading({ eyebrow, title, description, className, align = "left" }: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3", // 基础垂直排布
        align === "center" ? "text-center items-center" : "text-left",
        className
      )}
    >
      {eyebrow ? (
        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-primary/80">{eyebrow}</span>
      ) : null}
      <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">{title}</h2>
      {description ? <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">{description}</p> : null}
    </div>
  );
}
