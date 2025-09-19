/**
 * 站点地址集中管理，方便在多处复用并允许通过环境变量覆盖默认域名。
 */
export function getSiteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.xingyi-sports.com";
}
