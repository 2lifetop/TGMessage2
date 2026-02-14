# TGMessage Bot - Cloudflare Worker 版本

基于 Cloudflare Worker 的 Telegram 消息推送机器人，支持多种消息格式。

## ✨ 新特性

- **多消息格式支持**：文本、Markdown、HTML、图片、文档、视频、音频、语音、位置、联系人、投票、贴纸
- **TypeScript 编写**：类型安全，更好的开发体验
- **AES-GCM 加密**：更安全的 chat_id 加密
- **Cloudflare KV**：可选的用户数据存储
- **CORS 支持**：可直接从前端调用 API
- **丰富文档**：内置 API 文档页面

## 🚀 快速开始

### 1. 创建 Telegram Bot

1. 在 Telegram 中搜索 [@BotFather](https://t.me/BotFather)
2. 发送 `/newbot` 创建新机器人
3. 按照提示设置名称和用户名
4. 保存获取的 **Bot Token**（格式：`123456789:ABCdefGHIjklMNOpqrsTUVwxyz`）

---

## 📦 部署方案

提供三种部署方式，选择适合你的方案：

| 方案 | 难度 | 适用场景 | 自动化程度 |
|------|------|----------|-----------|
| **方案 A: Cloudflare 网页控制台** | ⭐ 最简单 | 快速体验、不常更新 | 手动 |
| **方案 B: Wrangler CLI** | ⭐⭐ 中等 | 开发调试、频繁更新 | 半自动 |
| **方案 C: GitHub Actions** | ⭐⭐⭐ 复杂 | 生产环境、团队协作 | 全自动 |

---

## 📘 方案 A: Cloudflare 网页控制台部署（推荐新手）

不需要安装任何工具，直接在浏览器中完成部署。

### 步骤 1: 登录 Cloudflare Dashboard

1. 访问 [dash.cloudflare.com](https://dash.cloudflare.com)
2. 登录你的 Cloudflare 账号（没有就注册一个）
3. 在左侧菜单找到 **"Workers & Pages"**

### 步骤 2: 创建 Worker

1. 点击 **"Create application"** 或 **"创建服务"**
2. 选择 **"Create Worker"**
3. 输入 Worker 名称，例如：`tgmessage-bot`
4. 点击 **"Deploy"** 或 **"部署"**

### 步骤 3: 编辑代码

1. 部署成功后，点击 **"Edit code"** 或 **"编辑代码"**
2. 删除默认代码，复制 `src/index.ts` 的全部内容粘贴进去
3. 同样需要创建 `src/handlers/api.ts`、`src/handlers/webhook.ts`、`src/handlers/setup.ts`、`src/types/index.ts`、`src/utils/crypto.ts`、`src/utils/telegram.ts` 并粘贴对应代码
4. 点击 **"Save and Deploy"**

**或者使用简化版单文件部署：**

如果上面的多文件方式太复杂，可以使用简化版单文件：

<details>
<summary>点击展开简化版单文件代码（适合直接粘贴到控制台）</summary>

由于单文件版本较长，建议：
1. 先使用方案 B (Wrangler CLI) 本地开发
2. 运行 `npm run build` 生成 `dist/index.js`
3. 将生成的单文件内容粘贴到 Cloudflare 控制台

</details>

### 步骤 4: 配置环境变量

1. 在 Worker 页面点击 **"Settings"** → **"Variables"**
2. 添加以下环境变量：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `BOT_TOKEN` | `123456789:ABC...` | 从 BotFather 获取的 Token |
| `SECRET_KEY` | `your-secret-key` | 用于加密的密钥，至少16位随机字符串 |

3. 点击 **"Save"**

### 步骤 5: 设置自定义域名（可选）

1. 在 Worker 页面点击 **"Triggers"** → **"Custom Domains"**
2. 点击 **"Add Custom Domain"**
3. 输入你的域名，例如：`tgmessage.yourdomain.com`
4. 按照提示完成 DNS 配置

### 步骤 6: 设置 Telegram Webhook

1. 打开浏览器，访问：
   ```
   https://你的-worker-地址/setup?key=你的SECRET_KEY&url=https://你的-worker-地址/webhook
   ```
   例如：
   ```
   https://tgmessage-bot.yourname.workers.dev/setup?key=mysecret123&url=https://tgmessage-bot.yourname.workers.dev/webhook
   ```

2. 看到 `{"code":200,"message":"Webhook 设置成功"}` 即表示成功

### 步骤 7: 开始使用

1. 在 Telegram 中向你的 Bot 发送 `/start`
2. 发送 `/token` 获取 API Token
3. 测试发送消息：
   ```
   https://你的-worker-地址/api?token=获取的TOKEN&message=你好
   ```

---

## 📗 方案 B: Wrangler CLI 部署（推荐开发使用）

适合需要频繁更新代码的开发者。

### 步骤 1: 安装依赖

```bash
# 克隆代码
git clone https://github.com/2lifetop/TGMessage2.git
cd TGMessage2
git checkout cloudflare-worker

# 安装依赖
npm install
```

### 步骤 2: 安装 Wrangler CLI

```bash
npm install -g wrangler
```

### 步骤 3: 登录 Cloudflare

```bash
wrangler login
```

会弹出浏览器窗口，登录你的 Cloudflare 账号并授权。

### 步骤 4: 配置项目

编辑 `wrangler.toml`：

```toml
name = "tgmessage-bot"  # 修改为你的 Worker 名称
main = "dist/index.js"
compatibility_date = "2024-02-08"

[vars]
BOT_TOKEN = "123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
SECRET_KEY = "your-secret-key-min-16-chars"
```

### 步骤 5: 本地开发测试

```bash
npm run dev
```

本地服务器启动后（通常在 http://localhost:8787），可以测试 API。

### 步骤 6: 部署到生产

```bash
npm run deploy
```

部署成功后会显示 Worker 的 URL。

### 步骤 7: 设置 Webhook

```bash
curl "https://你的-worker-地址/setup?key=你的SECRET_KEY&url=https://你的-worker-地址/webhook"
```

---

## 📙 方案 C: GitHub Actions 自动部署（推荐生产环境）

适合团队协作，代码推送到 GitHub 后自动部署。

### 步骤 1: Fork 仓库

1. 访问 https://github.com/2lifetop/TGMessage2
2. 点击右上角的 **"Fork"** 按钮
3. 选择你的 GitHub 账号进行 Fork

### 步骤 2: 添加 Secrets

在你的 Fork 仓库中：

1. 点击 **"Settings"** → **"Secrets and variables"** → **"Actions"**
2. 点击 **"New repository secret"**
3. 添加以下 secrets：

| Secret 名称 | 值 | 说明 |
|-------------|-----|------|
| `CF_API_TOKEN` | 从 Cloudflare 获取 | 见下方获取方法 |
| `CF_ACCOUNT_ID` | 你的 Cloudflare Account ID | 见下方获取方法 |
| `BOT_TOKEN` | `123456789:ABC...` | Telegram Bot Token |
| `SECRET_KEY` | `your-secret-key` | 加密密钥 |

**获取 CF_API_TOKEN：**

1. 访问 [dash.cloudflare.com/profile/api-tokens](https://dash.cloudflare.com/profile/api-tokens)
2. 点击 **"Create Token"**
3. 使用模板 **"Edit Cloudflare Workers"**
4. 选择你的账号，点击 **"Continue"**
5. 点击 **"Create Token"**
6. 复制生成的 Token

**获取 CF_ACCOUNT_ID：**

1. 访问 [dash.cloudflare.com](https://dash.cloudflare.com)
2. 在右侧边栏底部可以看到 **"Account ID"**
3. 复制该 ID

### 步骤 3: 创建工作流文件

在你的仓库中创建 `.github/workflows/deploy.yml`：

```yaml
name: Deploy to Cloudflare Workers

on:
  push:
    branches:
      - cloudflare-worker

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Deploy to Cloudflare Workers
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CF_API_TOKEN }}
          accountId: ${{ secrets.CF_ACCOUNT_ID }}
          secrets: |
            BOT_TOKEN
            SECRET_KEY
        env:
          BOT_TOKEN: ${{ secrets.BOT_TOKEN }}
          SECRET_KEY: ${{ secrets.SECRET_KEY }}
```

### 步骤 4: 推送代码触发部署

```bash
git add .
git commit -m "Setup GitHub Actions deployment"
git push origin cloudflare-worker
```

GitHub Actions 会自动运行，将代码部署到 Cloudflare Workers。

### 步骤 5: 查看部署状态

1. 在 GitHub 仓库点击 **"Actions"** 标签
2. 可以看到部署进度和日志
3. 绿色对勾表示部署成功

---

## 📊 部署方案对比

| 特性 | 网页控制台 | Wrangler CLI | GitHub Actions |
|------|-----------|--------------|----------------|
| 部署速度 | ⭐⭐⭐ 快 | ⭐⭐ 中等 | ⭐⭐⭐ 自动 |
| 代码管理 | ❌ 无版本控制 | ✅ Git | ✅ Git |
| 本地测试 | ❌ 不支持 | ✅ 支持 | ✅ 支持 |
| 团队协作 | ❌ 困难 | ⭐⭐ 中等 | ⭐⭐⭐ 优秀 |
| 回滚能力 | ❌ 手动 | ⭐⭐ Git 回滚 | ⭐⭐⭐ 自动回滚 |
| 适合人群 | 新手 | 开发者 | 团队/生产 |

**推荐选择：**
- 第一次体验 → **方案 A**
- 个人使用/频繁开发 → **方案 B**
- 团队协作/生产环境 → **方案 C**

## 📡 API 使用

### 获取 Token

1. 在 Telegram 中向你的 Bot 发送 `/start`
2. 发送 `/token` 获取加密的 API Token

### 发送消息

#### 文本消息

```bash
# GET 请求
curl "https://your-domain/api?token=YOUR_TOKEN&message=Hello%20World"

# POST 请求 (JSON)
curl -X POST "https://your-domain/api" \
  -H "Content-Type: application/json" \
  -d '{
    "token": "YOUR_TOKEN",
    "type": "text",
    "message": "Hello World"
  }'
```

#### Markdown 格式

```bash
curl -X POST "https://your-domain/api" \
  -H "Content-Type: application/json" \
  -d '{
    "token": "YOUR_TOKEN",
    "type": "markdown",
    "message": "*粗体* _斜体_ `代码`"
  }'
```

#### 发送图片

```bash
curl -X POST "https://your-domain/api" \
  -H "Content-Type: application/json" \
  -d '{
    "token": "YOUR_TOKEN",
    "type": "photo",
    "photo": "https://example.com/image.jpg",
    "caption": "图片描述"
  }'
```

#### 发送文档

```bash
curl -X POST "https://your-domain/api" \
  -H "Content-Type: application/json" \
  -d '{
    "token": "YOUR_TOKEN",
    "type": "document",
    "document": "https://example.com/file.pdf",
    "caption": "文件说明",
    "file_name": "document.pdf"
  }'
```

#### 发送视频

```bash
curl -X POST "https://your-domain/api" \
  -H "Content-Type: application/json" \
  -d '{
    "token": "YOUR_TOKEN",
    "type": "video",
    "video": "https://example.com/video.mp4",
    "caption": "视频描述"
  }'
```

#### 发送音频

```bash
curl -X POST "https://your-domain/api" \
  -H "Content-Type: application/json" \
  -d '{
    "token": "YOUR_TOKEN",
    "type": "audio",
    "audio": "https://example.com/music.mp3",
    "caption": "音乐描述",
    "title": "歌曲名",
    "performer": "艺术家"
  }'
```

#### 发送语音

```bash
curl -X POST "https://your-domain/api" \
  -H "Content-Type: application/json" \
  -d '{
    "token": "YOUR_TOKEN",
    "type": "voice",
    "voice": "https://example.com/voice.ogg"
  }'
```

#### 发送位置

```bash
curl -X POST "https://your-domain/api" \
  -H "Content-Type: application/json" \
  -d '{
    "token": "YOUR_TOKEN",
    "type": "location",
    "latitude": 39.9042,
    "longitude": 116.4074
  }'
```

#### 发送联系人

```bash
curl -X POST "https://your-domain/api" \
  -H "Content-Type: application/json" \
  -d '{
    "token": "YOUR_TOKEN",
    "type": "contact",
    "phone_number": "+8613800138000",
    "first_name": "张三",
    "last_name": "李四"
  }'
```

#### 创建投票

```bash
curl -X POST "https://your-domain/api" \
  -H "Content-Type: application/json" \
  -d '{
    "token": "YOUR_TOKEN",
    "type": "poll",
    "question": "你最喜欢什么编程语言？",
    "options": "JavaScript,TypeScript,Python,Go,Rust",
    "is_anonymous": true,
    "allows_multiple_answers": false
  }'
```

#### 发送贴纸

```bash
curl -X POST "https://your-domain/api" \
  -H "Content-Type: application/json" \
  -d '{
    "token": "YOUR_TOKEN",
    "type": "sticker",
    "sticker": "CAACAgIAAxkBAA..."
  }'
```

### 通用参数

所有消息类型都支持以下可选参数：

| 参数 | 类型 | 说明 |
|------|------|------|
| `disable_notification` | boolean | 静默发送（不触发通知） |
| `protect_content` | boolean | 保护内容（防止转发） |
| `reply_to_message_id` | number | 回复某条消息的 ID |
| `parse_mode` | string | 解析模式：MarkdownV2、HTML、Markdown |
| `reply_markup` | object | 内联键盘或回复键盘（JSON 格式） |

## 🤖 Bot 命令

在 Telegram 中可使用以下命令：

| 命令 | 说明 |
|------|------|
| `/start` | 开始使用，显示欢迎信息 |
| `/token` | 获取 API Token |
| `/usage` | 显示使用示例 |
| `/help` | 显示帮助文档 |
| `/info` | 查看用户信息 |

## 🔧 设置 Webhook

部署后需要设置 Telegram Webhook：

```bash
curl "https://your-domain/setup?key=YOUR_SECRET_KEY&url=https://your-domain/webhook"
```

其他管理端点：

```bash
# 查看 Webhook 信息
curl "https://your-domain/webhook-info?key=YOUR_SECRET_KEY"

# 删除 Webhook
curl "https://your-domain/delete-webhook?key=YOUR_SECRET_KEY"
```

## 📁 项目结构

```
.
├── src/
│   ├── types/              # TypeScript 类型定义
│   │   └── index.ts        # 所有类型、接口、枚举
│   ├── handlers/           # 请求处理器
│   │   ├── api.ts          # API 消息发送处理
│   │   ├── webhook.ts      # Telegram Webhook 处理
│   │   └── setup.ts        # Webhook 设置管理
│   ├── utils/              # 工具函数
│   │   ├── crypto.ts       # AES-GCM 加密解密
│   │   └── telegram.ts     # Telegram Bot API 客户端
│   └── index.ts            # Worker 入口、路由分发
├── package.json            # 项目依赖和脚本
├── tsconfig.json           # TypeScript 配置
├── wrangler.toml           # Cloudflare Worker 配置
├── README-CF.md            # 本文档
└── .github/workflows/      # GitHub Actions 工作流（可选）
    └── deploy.yml          # 自动部署配置
```

## 🔐 安全说明

- **SECRET_KEY**: 用于加密 chat_id，请使用强密码并妥善保管
- **BOT_TOKEN**: 不要泄露你的 Bot Token
- **Webhook Secret**: 可以设置 secret_token 增加 Webhook 安全性

## 📝 与 Vercel 版本的区别

| 特性 | Vercel 版本 | Cloudflare Worker 版本 |
|------|-------------|----------------------|
| 运行环境 | PHP | TypeScript/JavaScript |
| 加密方式 | Base64 | AES-GCM |
| 消息格式 | 仅文本 | 10+ 种格式 |
| 数据存储 | 无 | Cloudflare KV（可选） |
| 全球节点 | Vercel Edge | Cloudflare Edge |
| 免费额度 | 100GB/月 | 100,000 请求/天 |

## 🛠️ 本地开发

### 环境要求

- Node.js 18+
- npm 9+

### 开发流程

```bash
# 1. 克隆并切换分支
git clone https://github.com/2lifetop/TGMessage2.git
cd TGMessage2
git checkout cloudflare-worker

# 2. 安装依赖
npm install

# 3. 配置环境变量
# 复制 wrangler.toml 中的 [vars] 部分，填入你的配置

# 4. 启动开发服务器
npm run dev
```

开发服务器启动后（默认 http://localhost:8787），可以：

1. **测试首页：** 浏览器访问 http://localhost:8787
2. **测试 API：**
   ```bash
   curl "http://localhost:8787/api?token=test&message=hello"
   ```
3. **查看日志：** 控制台会显示请求和响应日志

### 可用命令

```bash
npm run dev          # 本地开发（热重载）
npm run build        # 构建生产版本
npm run deploy       # 部署到 Cloudflare
npm run typecheck    # TypeScript 类型检查
npm run lint         # 代码检查（如果有配置 ESLint）
npm test             # 运行测试（如果有配置）
```

### 添加新功能

以添加 "发送骰子" 功能为例：

1. **在 `src/types/index.ts` 添加类型：**
   ```typescript
   export interface DiceMessage extends BaseMessage {
     type: MessageType.DICE;
     emoji?: '🎲' | '🎯' | '🎳' | '🏀' | '⚽' | '🎰';
   }
   ```

2. **在 `src/utils/telegram.ts` 添加发送逻辑：**
   ```typescript
   case MessageType.DICE: {
     const msg = message as DiceMessage;
     return this.request('sendDice', {
       ...commonParams,
       emoji: msg.emoji || '🎲',
     });
   }
   ```

3. **在 `src/handlers/api.ts` 添加参数解析：**
   ```typescript
   case MessageType.DICE:
     return {
       type,
       ...baseParams,
       emoji: params.emoji as '🎲' | '🎯' | undefined,
     };
   ```

4. **更新文档**

### 调试技巧

使用 `console.log` 输出调试信息：

```typescript
console.log('Request received:', JSON.stringify(data));
```

在 Cloudflare Dashboard → Workers → 你的 Worker → Logs 中查看实时日志。

## 🐛 故障排查

### 常见问题

#### 1. 部署后访问显示 "Not Found" 或 404

**原因：** Worker 没有正确部署或路由配置错误

**解决：**
- 检查 Worker 是否成功部署（Cloudflare Dashboard → Workers & Pages）
- 确认访问的 URL 是否正确
- 检查代码中是否有语法错误

#### 2. 设置 Webhook 返回 401 "无效的密钥"

**原因：** `key` 参数与 `SECRET_KEY` 环境变量不匹配

**解决：**
- 确认 URL 中的 `key` 参数值与设置的 `SECRET_KEY` 完全一致
- 检查环境变量是否已保存（Settings → Variables）
- 修改环境变量后需要重新部署

#### 3. 发送消息返回 "无效的 token"

**原因：** Token 解密失败

**解决：**
- 确认使用的是 `/token` 命令返回的最新 Token
- 检查 `SECRET_KEY` 是否变更（变更后旧 Token 会失效）
- 重新发送 `/token` 获取新 Token

#### 4. Bot 不回复消息

**原因：** Webhook 未设置或设置错误

**解决：**
- 访问 `/webhook-info?key=YOUR_SECRET_KEY` 检查 Webhook 状态
- 确认 Webhook URL 指向正确的 Worker 地址
- 重新设置 Webhook：`/setup?key=XXX&url=https://your-domain/webhook`

#### 5. Wrangler 登录失败

**原因：** 网络问题或浏览器未弹出

**解决：**
```bash
# 尝试使用 --browser=false 手动复制链接
wrangler login --browser=false

# 或使用 API Token 方式
wrangler config
```

#### 6. GitHub Actions 部署失败

**原因：** Secrets 配置错误或权限不足

**解决：**
- 检查 `CF_API_TOKEN` 和 `CF_ACCOUNT_ID` 是否正确
- 确认 API Token 有 "Cloudflare Workers:Edit" 权限
- 查看 Actions 日志获取详细错误信息

### 调试技巧

1. **查看 Worker 日志：**
   - Cloudflare Dashboard → Workers & Pages → 你的 Worker → Logs
   - 可以看到实时请求日志和 console.log 输出

2. **本地调试：**
   ```bash
   npm run dev
   # 使用 --remote 测试生产环境数据
   npm run dev -- --remote
   ```

3. **测试 Webhook：**
   ```bash
   curl -X POST https://your-domain/webhook \
     -H "Content-Type: application/json" \
     -d '{"update_id":1,"message":{"message_id":1,"from":{"id":123,"is_bot":false,"first_name":"Test"},"chat":{"id":123,"type":"private"},"date":1234567890,"text":"/start"}}'
   ```

## 📄 许可证

MIT License
