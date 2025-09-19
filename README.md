# Xingyi 体育器材独立站

面向户外与专业运动场景的独立电商站点，参考 Zpacks 的信息密度与交互节奏实现多端一致的购物体验，集成后台运营、支付抽象与内容管理能力，开箱即用。

## ✨ 功能一览

- **前台购物体验**：首页主视觉 + 分类卡片、商品列表多维筛选、详情页变体/库存、购物车与结算流、下单结果页。
- **内容展示**：文章/页面模块，内置 JSON-LD、站点地图与 robots 配置，提升 SEO 表现。
- **极简表单**：复用 `MinimalForm` 实现联络表单，支持 zod 校验与可访问性反馈。
- **认证与 RBAC**：NextAuth Credentials 登录，提供 `ADMIN/EDITOR/CUSTOMER` 角色守卫与中间件保护 `/admin/**`。
- **后台管理中心**：基于 shadcn/ui 的仪表盘，覆盖商品、分类、库存、订单、支付、内容、留言、用户角色等 CRUD。
- **支付抽象层**：统一的 `PaymentProvider` 接口，默认模拟接入支付宝与微信支付，保留 Stripe 扩展点。
- **数据库建模与种子数据**：Prisma Schema 覆盖商品、变体、订单、内容、表单等实体，`pnpm db:seed` 生成演示数据。
- **自动化测试**：Vitest 单元测试、Playwright 端到端脚本（覆盖买单路径与后台 CRUD 冒烟）。

## 🧱 技术栈

- **前端框架**：Next.js 15 App Router + React 18 + TypeScript
- **样式系统**：Tailwind CSS、shadcn/ui 组件库、Radix UI 交互基础
- **状态与表单**：React Server Actions、react-hook-form、zod、TanStack Query（按需加载）
- **数据层**：Prisma ORM + PostgreSQL（本地可 SQLite）
- **认证**：NextAuth（Credentials Provider + Email 预留）
- **支付抽象**：支付宝 / 微信 / Stripe Provider 占位实现
- **测试与质量**：Vitest、Testing Library、Playwright、ESLint、TypeScript

## 📁 目录说明

```
app/                    # App Router 路由（前台 + 后台 + API）
components/             # UI 组件、表单模块、布局与后台组件
config/nav.ts           # 页眉导航文案与菜单配置，仅需修改此文件即可调整菜单
hooks/                  # 自定义 Hook（含 useCart 等）
lib/                    # 认证、支付、上传、SEO、数据库等通用工具
prisma/                 # Prisma schema 与 seed 脚本
public/                 # 静态资源与本地上传目录（初始化为空，可自行创建）
tests/e2e/              # Playwright 端到端测试
vitest.config.ts        # 单元测试配置
```

## ⚡ Windows 11 快速开始（三步上手）

1. **安装运行时（管理员 PowerShell）**
   ```powershell
   winget install OpenJS.NodeJS.LTS
   npm i -g corepack && corepack enable && corepack prepare pnpm@latest --activate
   ```
2. **克隆仓库并配置环境变量**
   ```powershell
   git clone https://github.com/your-org/xingyi.git
   cd .\xingyi
   Copy-Item .env.example .env.local
   # 可将 DATABASE_URL 改为 file:./dev.db 以启用 SQLite
   ```
3. **安装依赖并启动**
   ```powershell
   pnpm install
   pnpm db:push
   pnpm db:seed
   pnpm dev
   ```

> 若遇执行策略限制，可运行 `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`，完成后可改回 `Restricted`。

## 🔑 环境变量说明

| 变量 | 说明 | 默认值 / 示例 |
| ---- | ---- | ------------- |
| `DATABASE_URL` | 数据库连接字符串，开发可改为 `file:./dev.db` 使用 SQLite。 | `postgresql://user:password@localhost:5432/xingyi` |
| `NEXTAUTH_URL` | NextAuth 回调基础地址，开发模式保持 `http://localhost:3000`。 | `http://localhost:3000` |
| `NEXTAUTH_SECRET` | 会话加密密钥，生产必须替换。 | `please-change-me` |
| `NEXT_PUBLIC_SITE_URL` | 站点对外访问地址，用于 sitemap、OpenGraph 等。 | `http://localhost:3000` |
| `EMAIL_FROM` | 登录邮件等通知的发件人地址。 | `no-reply@xingyi.local` |
| `STORAGE_DRIVER` | 媒资存储驱动：`local` 或 `s3`。 | `local` |
| `UPLOAD_LOCAL_DIR` | 当 `STORAGE_DRIVER=local` 时的上传目录。 | `public/uploads` |
| `S3_BUCKET` | 对象存储桶名称（启用 S3 时必填）。 | 空 |
| `S3_REGION` | 对象存储区域。 | 空 |
| `S3_ENDPOINT` | 自定义对象存储 API 入口，可用于兼容 MinIO/OSS。 | 空 |
| `S3_ACCESS_KEY_ID` | 对象存储访问密钥 ID。 | 空 |
| `S3_SECRET_ACCESS_KEY` | 对象存储访问密钥。 | 空 |
| `S3_PUBLIC_URL` | 对象存储公共访问前缀，可写 CDN 域名。 | 空 |
| `PAYMENT_PROVIDER` | 支付 Provider，支持 `alipay` / `wechat` / `stripe`。 | `alipay` |
| `ALIPAY_APP_ID` | 支付宝 AppId（沙箱/生产）。 | 空 |
| `ALIPAY_PRIVATE_KEY` | 支付宝商户私钥。 | 空 |
| `ALIPAY_WEBHOOK_SECRET` | 支付宝回调验签密钥。 | 空 |
| `ALIPAY_NOTIFY_URL` | 支付宝回调地址。 | `http://localhost:3000/api/payments/alipay/webhook` |
| `ALIPAY_RETURN_URL` | 支付完成后跳转地址。 | `http://localhost:3000/checkout/complete` |
| `WECHAT_APP_ID` | 微信支付 AppId。 | 空 |
| `WECHAT_MCH_ID` | 微信商户号。 | 空 |
| `WECHAT_API_KEY` | 微信 API 密钥。 | 空 |
| `WECHAT_NOTIFY_URL` | 微信回调地址。 | `http://localhost:3000/api/payments/wechat/webhook` |
| `WECHAT_RETURN_URL` | 微信支付完成后跳转地址。 | `http://localhost:3000/checkout/complete` |

## ❓ FAQ

### Prisma 迁移冲突怎么办？
- 首次开发建议使用 `pnpm db:push` 同步 schema，避免生成多余迁移。
- 若多人协作造成迁移冲突，可先备份数据，执行 `pnpm prisma migrate resolve --applied <migration>` 或删除冲突的迁移文件后重新生成。
- CI/生产务必使用 `pnpm prisma migrate deploy`，确保只有经过审阅的迁移被执行。

### 图片访问出现 403？
- 检查对象存储的 `S3_PUBLIC_URL` 是否配置正确，若使用本地存储请确认 `public/uploads` 拥有读取权限。
- 在反向代理（如 Nginx、Vercel）上确认未屏蔽 `/uploads/*` 静态路径。

### Webhook 返回 401 如何排查？
- 确认 `.env` 中的 `ALIPAY_WEBHOOK_SECRET` / `WECHAT_API_KEY` 与测试平台保持一致。
- 使用 ngrok 等工具转发请求时，需将生成的公网地址同步至支付平台的回调配置。
- Next.js API Route 默认使用 `POST`，请确保第三方请求方法与 Content-Type 正确。

### 支付沙箱如何启用？
- 支付宝/微信官方均提供沙箱环境，可使用沙箱 AppId/商户号填写 `.env.local`。
- 运行 `pnpm dev` 后通过沙箱钱包扫描测试，Webhook 回调能在控制台看到验签结果。
- 若未来切换 Stripe，只需在 `.env` 中设置 `PAYMENT_PROVIDER=stripe` 并实现对应 Provider。

### Windows 11 证书或代理问题？
- 企业代理可能拦截 TLS，建议将 `npm`、`pnpm` 配置代理白名单：`npm config set proxy http://proxy:port`。
- 如安装包签名校验失败，可在“证书管理器”中导入企业根证书，或改用离线安装包。
- 通过公司代理运行 ngrok 需申请端口放行，必要时可使用内网穿透替代方案（如 frp）。

---

更多部署与联调细节请参考 [DEPLOY.md](./DEPLOY.md)。
