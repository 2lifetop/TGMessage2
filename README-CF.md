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
4. 保存获取的 **Bot Token**

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

复制 `wrangler.toml` 并修改：

```toml
[vars]
BOT_TOKEN = "your-bot-token-from-botfather"
SECRET_KEY = "your-secret-key-for-encryption"
```

### 4. 本地开发

```bash
npm run dev
```

### 5. 部署

```bash
npm run deploy
```

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
│   ├── types/          # TypeScript 类型定义
│   │   └── index.ts
│   ├── handlers/       # 请求处理器
│   │   ├── api.ts      # API 消息发送
│   │   ├── webhook.ts  # Telegram Webhook
│   │   └── setup.ts    # Webhook 设置
│   ├── utils/          # 工具函数
│   │   ├── crypto.ts   # 加密工具
│   │   └── telegram.ts # Telegram API 客户端
│   └── index.ts        # 主入口
├── package.json
├── tsconfig.json
├── wrangler.toml       # Cloudflare Worker 配置
└── README-CF.md        # 本文档
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

## 🛠️ 开发

```bash
# 安装依赖
npm install

# 本地开发（带热重载）
npm run dev

# 类型检查
npm run typecheck

# 构建
npm run build

# 部署到生产环境
npm run deploy
```

## 📄 许可证

MIT License
