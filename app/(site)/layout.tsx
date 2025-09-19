import { ReactNode } from "react";

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* 页面主体由根布局注入的站点头部与主题提供器承载，这里聚焦内容区域与页脚 */}
      <main className="flex-1">{children}</main>
      <footer className="border-t bg-muted/30">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} Xingyi Sports. 全部权利保留。</p>
          <div className="flex gap-4">
            <a href="/about">品牌故事</a>
            <a href="/articles">知识库</a>
            <a href="/contact">联络我们</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
