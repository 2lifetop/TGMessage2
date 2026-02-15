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
      await handleCallbackQuery(telegram, update.callback_query, env);
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
 * 处理 /token 命令 - 生成新 Token（覆盖旧的）
 */
async function handleToken(telegram: TelegramClient, chatId: string, env: Env): Promise<void> {
  try {
    // 检查是否已有 Token
    const existingToken = await env.KV.get(`user:${chatId}`);

    if (existingToken) {
      // 已有 Token，显示确认按钮
      await telegram.sendMessage({
        type: 'markdown',
        chat_id: chatId,
        message: `⚠️ *您已有一个有效的 Token*

重新生成将导致旧 Token 立即失效。

*确定要重新生成吗？*`,
        reply_markup: {
          inline_keyboard: [
            [
              { text: '✅ 确认重新生成', callback_data: 'confirm_new_token' },
              { text: '❌ 取消', callback_data: 'cancel_new_token' }
            ],
            [
              { text: '👁️ 查看现有 Token', callback_data: 'view_existing_token' }
            ]
          ]
        }
      });
    } else {
      // 没有 Token，直接生成
      await generateAndSendToken(telegram, chatId, env, false);
    }
  } catch (error) {
    console.error('Generate token error:', error);
    await telegram.sendMessage({
      type: 'text',
      chat_id: chatId,
      message: '生成 Token 失败，请稍后重试',
    });
  }
}

async function generateAndSendToken(
  telegram: TelegramClient,
  chatId: string,
  env: Env,
  isUpdate: boolean
): Promise<void> {
  // 生成新 Token
  const token = await cryptoUtils.encrypt(chatId, env.SECRET_KEY);

  // 存储新 Token 到 KV（覆盖旧的）
  await env.KV.put(`user:${chatId}`, token);

  const message = isUpdate
    ? `🔄 *Token 已更新*\n\n旧的 Token 已失效，请使用新的 Token：\n\n点击 👇 下方按钮一键复制`
    : `🔑 *您的 API Token*\n\n点击 👇 下方按钮一键复制\n\n⚠️ *请妥善保管，不要分享给他人！*`;

  // 发送消息，附带复制按钮
  await telegram.request('sendMessage', {
    chat_id: chatId,
    text: message,
    parse_mode: 'MarkdownV2',
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: '📋 点击复制 Token',
            copy_text: { text: token }
          }
        ]
      ]
    }
  });
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
  callbackQuery: { id: string; data?: string; from: { id: number } ; message?: { chat: { id: number }; message_id: number } },
  env: Env
): Promise<void> {
  const chatId = callbackQuery.from.id.toString();

  // 处理 Token 生成确认
  if (callbackQuery.data === 'confirm_new_token') {
    // 回答回调查询
    try {
      await telegram.request('answerCallbackQuery', {
        callback_query_id: callbackQuery.id,
        text: '正在生成新 Token...',
      });
    } catch (error) {
      console.error('Failed to answer callback query:', error);
    }

    // 生成新 Token
    await generateAndSendToken(telegram, chatId, env, true);

    // 删除原消息（带有按钮的确认消息）
    if (callbackQuery.message) {
      try {
        await telegram.request('deleteMessage', {
          chat_id: chatId,
          message_id: callbackQuery.message.message_id,
        });
      } catch (error) {
        console.error('Failed to delete message:', error);
      }
    }
    return;
  }

  // 处理查看现有 Token
  if (callbackQuery.data === 'view_existing_token') {
    try {
      await telegram.request('answerCallbackQuery', {
        callback_query_id: callbackQuery.id,
        text: '正在获取 Token...',
      });
    } catch (error) {
      console.error('Failed to answer callback query:', error);
    }

    // 从 KV 获取现有 Token
    const existingToken = await env.KV.get(`user:${chatId}`);
    if (existingToken) {
      // 使用 copy_text 按钮让用户一键复制
      await telegram.request('sendMessage', {
        chat_id: chatId,
        text: '🔑 *您当前的 API Token*\n\n点击 👇 下方按钮一键复制\n\n⚠️ *请妥善保管，不要分享给他人！*',
        parse_mode: 'MarkdownV2',
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: '📋 点击复制 Token',
                copy_text: { text: existingToken }
              }
            ]
          ]
        }
      });
    } else {
      await telegram.sendMessage({
        type: 'text',
        chat_id: chatId,
        message: '没有找到现有 Token，请发送 /token 生成新 Token',
      });
    }
    return;
  }

  // 处理取消
  if (callbackQuery.data === 'cancel_new_token') {
    // 回答回调查询
    try {
      await telegram.request('answerCallbackQuery', {
        callback_query_id: callbackQuery.id,
        text: '已取消',
      });
    } catch (error) {
      console.error('Failed to answer callback query:', error);
    }

    // 编辑原消息，显示已取消
    if (callbackQuery.message) {
      try {
        await telegram.request('editMessageText', {
          chat_id: chatId,
          message_id: callbackQuery.message.message_id,
          text: '❌ 已取消重新生成 Token',
          parse_mode: 'MarkdownV2',
        });
      } catch (error) {
        console.error('Failed to edit message:', error);
      }
    }
    return;
  }

  // 其他回调查询
  try {
    await telegram.request('answerCallbackQuery', {
      callback_query_id: callbackQuery.id,
    });
  } catch (error) {
    console.error('Failed to answer callback query:', error);
  }
}
