import type { Env, TelegramUpdate } from '../types';
import { cryptoUtils } from '../utils/crypto';
import { TelegramClient } from '../utils/telegram';

/**
 * 处理 Telegram Webhook 请求
 */
export async function handleWebhookRequest(
  request: Request,
  env: Env
): Promise<Response> {
  try {
    const update: TelegramUpdate = await request.json();
    const telegram = new TelegramClient(env.BOT_TOKEN);

    // 处理消息
    if (update.message) {
      const { message } = update;
      const chatId = message.chat.id.toString();
      const text = message.text || '';

      // 处理命令
      if (text.startsWith('/')) {
        const command = text.split(' ')[0].toLowerCase();

        switch (command) {
          case '/start':
            await handleStart(telegram, chatId);
            break;

          case '/token':
            await handleToken(telegram, chatId, env);
            break;

          case '/usage':
            await handleUsage(telegram, chatId);
            break;

          case '/help':
            await handleHelp(telegram, chatId);
            break;

          case '/info':
            await handleInfo(telegram, chatId, message.from);
            break;

          default:
            await telegram.sendMessage({
              type: 'text',
              chat_id: chatId,
              message: `未知命令: ${command}\n使用 /help 查看可用命令`,
            });
        }
      }
    }

    // 处理回调查询
    if (update.callback_query) {
      await handleCallbackQuery(telegram, update.callback_query);
    }

    return new Response(JSON.stringify({ code: 200, message: 'success' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(JSON.stringify({ code: 500, message: 'Internal error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

/**
 * 处理 /start 命令
 */
async function handleStart(telegram: TelegramClient, chatId: string): Promise<void> {
  const welcomeText = `👋 *欢迎使用 TGMessage Bot！*

这是一个简单易用的消息推送机器人，支持多种消息格式：

📱 *文本消息* - 纯文本或 Markdown 格式
🖼 *图片* - 发送图片（支持 URL）
📄 *文档* - 发送文件
🎬 *视频* - 发送视频
🎵 *音频* - 发送音乐
🎤 *语音* - 发送语音消息
📍 *位置* - 发送地理位置
👤 *联系人* - 发送联系人信息
📊 *投票* - 创建投票
🎭 *贴纸* - 发送贴纸

*第一次使用？*
发送 /token 获取您的专属 API Token

*需要帮助？*
发送 /help 查看详细使用说明`;

  await telegram.sendMessage({
    type: 'markdown',
    chat_id: chatId,
    message: welcomeText,
  });
}

/**
 * 处理 /token 命令
 */
async function handleToken(telegram: TelegramClient, chatId: string, env: Env): Promise<void> {
  try {
    const token = await cryptoUtils.encrypt(chatId, env.SECRET_KEY);

    const message = `🔑 *您的 API Token*

\`${token}\`

*如何使用？*
1\. 复制上面的 Token
2\. 通过 HTTP 请求发送消息：

\`GET\` \`https://your-domain/api?token=YOUR_TOKEN&message=你好世界\`

或使用 POST：
\`POST\` \`https://your-domain/api\`
\`Content-Type: application/json\`

\`\`\`json
{
  "token": "YOUR_TOKEN",
  "type": "text",
  "message": "你好世界"
}
\`\`\`

⚠️ *请妥善保管您的 Token，不要分享给他人！*`;

    await telegram.sendMessage({
      type: 'markdown',
      chat_id: chatId,
      message: message,
    });
  } catch (error) {
    await telegram.sendMessage({
      type: 'text',
      chat_id: chatId,
      message: '生成 Token 失败，请稍后重试',
    });
  }
}

/**
 * 处理 /usage 命令
 */
async function handleUsage(telegram: TelegramClient, chatId: string): Promise<void> {
  const usageText = `📖 *使用示例*

*1\. 发送文本消息*
\`GET\` \`/api?token=XXX&message=Hello\`

*2\. 发送 Markdown 格式*
\`GET\` \`/api?token=XXX&type=markdown&message=*粗体*_斜体_\`

*3\. 发送图片*
\`POST\` \`/api\`
\`\`\`json
{
  "token": "XXX",
  "type": "photo",
  "photo": "https://example.com/image.jpg",
  "caption": "图片描述"
}
\`\`\`

*4\. 发送文档*
\`\`\`json
{
  "token": "XXX",
  "type": "document",
  "document": "https://example.com/file.pdf",
  "caption": "文件说明"
}
\`\`\`

*5\. 发送位置*
\`\`\`json
{
  "token": "XXX",
  "type": "location",
  "latitude": 39.9042,
  "longitude": 116.4074
}
\`\`\`

*6\. 创建投票*
\`\`\`json
{
  "token": "XXX",
  "type": "poll",
  "question": "你喜欢这个功能吗？",
  "options": "喜欢,不喜欢,一般"
}
\`\`\`

*完整文档*
发送 /help 查看更多消息类型`;

  await telegram.sendMessage({
    type: 'markdown',
    chat_id: chatId,
    message: usageText,
  });
}

/**
 * 处理 /help 命令
 */
async function handleHelp(telegram: TelegramClient, chatId: string): Promise<void> {
  const helpText = `❓ *帮助文档*

*可用命令：*
/start - 开始使用
/token - 获取 API Token
/usage - 使用示例
/help - 帮助文档
/info - 查看您的信息

*支持的消息类型：*
• text - 纯文本（默认）
• markdown - MarkdownV2 格式
• html - HTML 格式
• photo - 图片（URL 或 file_id）
• document - 文档/文件
• video - 视频
• audio - 音频文件
• voice - 语音消息
• location - 地理位置
• contact - 联系人
• poll - 投票
• sticker - 贴纸

*可选参数：*
• disable_notification - 静默发送（true/false）
• protect_content - 保护内容（true/false）
• reply_to_message_id - 回复某条消息
• caption - 图片/文件说明

*提示：*
发送 /usage 查看具体示例`;

  await telegram.sendMessage({
    type: 'markdown',
    chat_id: chatId,
    message: helpText,
  });
}

/**
 * 处理 /info 命令
 */
async function handleInfo(
  telegram: TelegramClient,
  chatId: string,
  from: { id: number; first_name?: string; username?: string } | undefined
): Promise<void> {
  if (!from) return;

  const infoText = `👤 *您的信息*

*ID:* \`${from.id}\`
*名字:* ${from.first_name || '未知'}
*用户名:* ${from.username ? '@' + from.username : '未设置'}

*Chat ID:* \`${chatId}\``;

  await telegram.sendMessage({
    type: 'markdown',
    chat_id: chatId,
    message: infoText,
  });
}

/**
 * 处理回调查询
 */
async function handleCallbackQuery(
  telegram: TelegramClient,
  callbackQuery: { id: string; data?: string; from: { id: number } }
): Promise<void> {
  // 回答回调查询（消除加载状态）
  // 这里我们直接使用 telegram 实例的 request 方法
  try {
    await telegram.request('answerCallbackQuery', {
      callback_query_id: callbackQuery.id,
    });
  } catch (error) {
    console.error('Failed to answer callback query:', error);
  }

  // 可以在这里处理按钮点击逻辑
  if (callbackQuery.data) {
    console.log('Callback data:', callbackQuery.data);
  }
}
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      callback_query_id: callbackQuery.id,
    }),
  });

  // 可以在这里处理按钮点击逻辑
  if (callbackQuery.data) {
    console.log('Callback data:', callbackQuery.data);
  }
}
