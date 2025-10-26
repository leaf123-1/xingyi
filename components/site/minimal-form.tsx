import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface MinimalFormProps {
  title: string;
  description?: ReactNode;
  children: ReactNode;
  className?: string;
}

/**
 * 极简表单容器：保持与品牌风格一致的留白、分隔与阴影。
 */
export function MinimalForm({ title, description, children, className }: MinimalFormProps) {
  return (
    <section
      className={cn(
        "rounded-3xl border border-border/80 bg-white p-8 shadow-md",
        "space-y-6",
        className
      )}
    >
      <header className="space-y-2">
        <h2 className="text-2xl font-semibold text-foreground">{title}</h2>
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
      </header>
      {children}
    </section>
  );
}
