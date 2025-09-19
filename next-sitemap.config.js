/**
 * next-sitemap 配置：统一站点地址、生成 robots.txt 并限制后台索引。
 */
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.xingyi-sports.com";

/** @type {import('next-sitemap').IConfig} */
const config = {
  siteUrl,
  generateRobotsTxt: true,
  sitemapSize: 5000,
  changefreq: "daily",
  priority: 0.7,
  transform: async (cfg, path) => ({
    loc: path,
    changefreq: cfg.changefreq,
    priority: path === "/" ? 1 : cfg.priority,
    lastmod: new Date().toISOString(),
  }),
  robotsTxtOptions: {
    additionalSitemaps: [`${siteUrl}/sitemap.xml`],
    policies: [
      { userAgent: "*", allow: "/" },
      { userAgent: "GPTBot", disallow: ["/admin"] },
    ],
  },
};

module.exports = config;
