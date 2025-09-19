import type { Metadata } from "next";
import { ReactNode } from "react";
import "./globals.css";
import { ThemeProvider } from "@/components/site/theme-provider";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { PageFocusHandler } from "@/components/site/page-focus-handler";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.xingyi-sports.com"),
  title: {
    default: "Xingyi Sports",
    template: "%s | Xingyi Sports",
  },
  description: "面向超长距离与高海拔冒险的高端体育器材平台，提供背负、营地、训练全品类解决方案。",
  keywords: [
    "户外装备",
    "越野跑",
    "登山",
    "轻量化",
    "体育器材",
  ],
  openGraph: {
    title: "Xingyi Sports",
    description:
      "面向超长距离与高海拔冒险的高端体育器材平台，提供背负、营地、训练全品类解决方案。",
    url: "https://www.xingyi-sports.com",
    siteName: "Xingyi Sports",
    locale: "zh_CN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Xingyi Sports",
    description:
      "面向超长距离与高海拔冒险的高端体育器材平台，提供背负、营地、训练全品类解决方案。",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="flex min-h-screen flex-col bg-background font-sans antialiased">
        {/* 全局主题提供，便于前后台共享深浅色与系统主题 */}
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <PageFocusHandler />
          <SiteHeader />
          <main id="main-content" tabIndex={-1} className="flex-1 bg-white text-slate-900">
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
