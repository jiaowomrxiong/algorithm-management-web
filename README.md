# 算法管理系统

一个基于 Next.js、Supabase 和 Stripe 构建的算法管理和订阅平台。

## 功能特性

- 用户认证和权限管理
- 算法创建、编辑和展示
- 算法执行和历史记录查询
- 基于 Stripe 的订阅计划管理
- 响应式 UI 设计

## 技术栈

- **前端框架**: Next.js 15.x
- **UI 库**: React 19.x
- **数据库和认证**: Supabase
- **支付集成**: Stripe
- **样式**: Tailwind CSS
- **类型系统**: TypeScript

## 本地开发

### 前提条件

- Node.js 18.x 或更高
- npm 9.x 或更高
- Supabase 账户
- Stripe 账户(用于支付功能)

### 安装步骤

1. 克隆仓库

```bash
git clone https://github.com/yourusername/algorithm-management-web.git
cd algorithm-management-web
```

2. 安装依赖

```bash
npm install
```

3. 复制环境变量文件

```bash
cp .env.example .env.local
```

4. 在`.env.local`中填入您的 Supabase 和 Stripe 凭据

5. 启动开发服务器

```bash
npm run dev
```

应用将在 [http://localhost:3000](http://localhost:3000) 运行。

## Vercel 部署

本项目已配置为在 Vercel 上自动部署。

### 部署步骤

1. 使用 GitHub 账户登录[Vercel](https://vercel.com)
2. 点击"New Project"并选择从 GitHub 导入
3. 选择本项目的仓库
4. 配置项目:
   - 在"Environment Variables"部分添加所有在`.env.example`中列出的环境变量
   - 保持默认的构建和输出设置
5. 点击"Deploy"开始部署

### 持续部署

当有新的代码推送到 GitHub 仓库的主分支时，Vercel 将自动部署更新。

## 环境变量

部署前需要配置以下环境变量:

- `NEXT_PUBLIC_SUPABASE_URL`: Supabase 项目 URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase 匿名密钥
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase 服务角色密钥(仅用于后端 API)
- `STRIPE_SECRET_KEY`: Stripe API 密钥
- `STRIPE_WEBHOOK_SECRET`: Stripe Webhook 密钥
- `STRIPE_PRICE_BASIC`: 基础订阅价格 ID
- `STRIPE_PRICE_STANDARD`: 标准订阅价格 ID
- `STRIPE_PRICE_PREMIUM`: 高级订阅价格 ID

## License

[MIT](LICENSE)
