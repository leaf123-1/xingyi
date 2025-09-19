# 部署与本地运行指南

> 本文档覆盖 Windows 11 开发环境初始化、常见问题排查、生产部署建议以及支付渠道与 Webhook 联调注意事项，确保项目能够在本地与云端稳定运行。

## 🖥️ Windows 11 本地开发流程

以下步骤假设使用 **PowerShell**，如遇权限限制请参考后文“常见问题”。若已安装 [Windows Terminal](https://learn.microsoft.com/windows/terminal/)，建议以普通用户身份运行，只有在安装全局依赖或修改执行策略时才临时提升为管理员。

```powershell
# 0. （可选）查看当前执行策略，如为 Restricted 需参考后文调整
Get-ExecutionPolicy

# 1. 安装 Node.js（推荐 20.x LTS）
#    - 图形界面：访问 https://nodejs.org/en 下载 LTS 安装包
#    - 命令行：winget install OpenJS.NodeJS.LTS

# 2. 安装 pnpm（建议使用 Corepack，需管理员 PowerShell）
corepack enable pnpm
# 若系统未启用 Corepack，可退而求其次：npm install -g pnpm

# 3. 验证版本，确认 Node ≥ 20、pnpm ≥ 8
node -v
pnpm -v

# 4. 克隆代码仓库并进入目录
cd $Env:USERPROFILE
git clone https://github.com/your-org/xingyi.git
cd .\xingyi

# 5. 复制环境变量模板
Copy-Item .env.example .env.local

# 6. 安装依赖（首次运行时间较长，耐心等待 pnpm 完成）
pnpm install

# 7. 同步数据库结构（默认连接 .env.local 中的 DATABASE_URL）
pnpm db:push

# 8. 写入示例数据，便于前后台页面快速浏览
pnpm db:seed

# 9. 启动开发服务器，访问 http://localhost:3000
pnpm dev
```

> ⚠️ 如需使用 SQLite，请在 `.env.local` 中将 `DATABASE_URL` 改为 `file:./dev.db`，并删除或注释原有的 PostgreSQL 链接。

### ✅ Windows 11 本地测试清单

> 以下命令需在 **管理员 PowerShell** 中执行，确保具备安装全局工具的权限。

```powershell
# 1. 安装 Node.js LTS
winget install OpenJS.NodeJS.LTS

# 2. 启用 Corepack 并安装 pnpm
npm i -g corepack
corepack enable
corepack prepare pnpm@latest --activate

# 3. 克隆项目并准备环境
git clone https://github.com/your-org/xingyi.git
cd .\xingyi
Copy-Item .env.example .env.local
# 如需 SQLite 可将 DATABASE_URL 调整为 file:./dev.db

# 4. 安装依赖与启动完整链路
pnpm install
pnpm db:push
pnpm db:seed
pnpm dev

# 常见问题
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned   # 解除执行策略限制
netstat -ano | findstr :3000                          # 检查 3000 端口占用情况

# Webhook 本地联调
npm i -D ngrok
npx ngrok http 3000
# 将转发出来的 URL 配置到支付宝/微信的回调地址中
```

## ⚙️ Windows 11 常见问题排查

| 问题 | 说明与解决办法 |
| ---- | --------------- |
| 执行策略限制 | 第一次运行脚本可能提示 *"running scripts is disabled"*，可执行：<br>`Get-ExecutionPolicy` 查看当前策略；如返回 `Restricted`，使用 `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` 允许运行本地脚本。完成后可用 `Set-ExecutionPolicy -Scope CurrentUser Restricted` 还原。 |
| 端口占用 | 若 3000 端口被占用，可运行 `Get-NetTCPConnection -LocalPort 3000` 查看占用进程，或配合 `Stop-Process -Id <PID>` 释放端口。也可在 `.env.local` 中设置 `PORT=3001` 并重新启动 `pnpm dev`。 |
| node-gyp 构建失败 | 某些依赖可能需要 C++ 构建工具，安装命令：`npm install --global --production windows-build-tools`（需管理员权限，Node 18 及以上可改用 `npm install --global windows-build-tools`），或手动安装 Visual Studio Build Tools 并勾选“Desktop development with C++”。 |
| 文件权限问题 | 如出现无法写入 `node_modules/.pnpm`，请使用管理员 PowerShell，或将仓库路径移动到当前用户目录下避免权限继承。 |

## ☁️ 生产部署建议

### 前端与 API 托管
- **Vercel**：推荐使用 Next.js 官方平台，直接导入 Git 仓库即可。需在 Vercel 项目设置中配置环境变量（见下节），并确保选择 `pnpm` 作为安装器。
- **自建 Docker**：生产镜像可使用多阶段构建，先 `pnpm install --frozen-lockfile` 后 `pnpm build`，最终容器仅保留 `.next`, `public`, `node_modules` 等运行时必要文件。记得暴露 `PORT` 并在反向代理层启用 HTTPS。

### 数据库
- **Neon / Railway PostgreSQL**：创建生产数据库后，将连接字符串写入 `DATABASE_URL`。如使用连接池，请同时配置 `DATABASE_POOL_URL` 并在 Prisma 配置中启用。

### 环境变量清单
生产环境至少需要配置以下变量（若未使用某些功能，可暂留为空）。建议先在 `.env.production` 中准备完整清单，再导入平台的环境变量面板，以避免遗漏：

- `DATABASE_URL`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `NEXT_PUBLIC_SITE_URL`
- `EMAIL_FROM`
- `STORAGE_DRIVER` 及对应的 `S3_*` 字段（使用对象存储时必填）
- `PAYMENT_PROVIDER`
- `ALIPAY_*`、`WECHAT_*`（根据所选支付渠道填写）

### 部署步骤概览
1. 设置环境变量（Vercel 项目设置或 Docker 容器运行参数）。
2. 执行数据库迁移：`pnpm db:push` 或 `pnpm prisma migrate deploy`（如已有正式迁移文件）。
3. 运行 `pnpm db:seed` 可选地写入演示数据（生产环境建议保留最小数据或跳过）。
4. 构建并启动应用：`pnpm build && pnpm start`（Vercel 会自动处理该流程）。

## 💳 支付宝 / 微信支付上线 Checklist

| 项目 | 说明 |
| ---- | ---- |
| 商户号与应用 ID | 向支付渠道申请生产商户号及 APP ID，更新 `.env` 中 `ALIPAY_APP_ID`、`WECHAT_APP_ID` 等字段。 |
| 密钥与证书 | 生成私钥、公钥或平台证书，安全存放于服务器上。建议使用 Docker Secret 或云平台的 Secret Manager，并在 `.env` 中填入密钥内容或文件路径。 |
| 回调 URL | 确保公网可访问 `/api/payments/{provider}/webhook`，并在支付平台控制台中配置对应地址，与 `.env` 中的 `ALIPAY_NOTIFY_URL`、`WECHAT_NOTIFY_URL` 保持一致。 |
| 签名算法 | 确认线上与本地代码使用相同的签名算法（RSA2、HMAC-SHA256 等），测试时需验证签名校验通过。 |
| 沙箱测试 | 利用官方沙箱环境验证下单、回调全链路，确认订单状态从 `PENDING` 转为 `PAID`。 |
| 证书文件存放 | 若渠道要求证书文件，建议放置在 `config/certs/` 或系统安全目录，并通过环境变量传入路径，避免直接写入仓库。 |

## 🌐 Webhook 本地联调指南

1. 安装隧道工具（任选其一）：
   - [ngrok](https://ngrok.com/)：`ngrok http 3000`
   - [localtunnel](https://github.com/localtunnel/localtunnel)：`npx localtunnel --port 3000`
2. 将生成的公网地址填写到 `.env.local` 中的 `ALIPAY_NOTIFY_URL` / `WECHAT_NOTIFY_URL`，并在支付平台的沙箱配置中同步修改。
3. 启动本地服务：`pnpm dev`。
4. 发起测试支付，观察隧道工具的请求日志与 Next.js 终端输出，确认 `/api/payments/*/webhook` 收到回调并将订单状态更新为 `PAID`。
5. 调试完成后记得关闭隧道服务，避免暴露本地端口。

---
如需进一步的部署脚本或 CI/CD 集成，可在此文档基础上继续扩展并纳入组织内部流程。
