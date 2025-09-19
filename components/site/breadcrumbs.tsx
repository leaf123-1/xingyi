import Link from "next/link";

export interface CrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: CrumbItem[];
}

/**
 * 可复用的面包屑导航，支持键盘访问与语义化结构。
 */
export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav aria-label="面包屑导航" className="text-sm text-muted-foreground">
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-1">
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  prefetch
                  className="rounded-full px-2 py-1 transition hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="px-2 py-1 text-foreground">{item.label}</span>
              )}
              {!isLast ? <span className="text-muted-foreground">/</span> : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
