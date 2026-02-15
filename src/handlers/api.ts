import type { Env, ApiResponse, Message } from '../types';
import { MessageType } from '../types';
import { cryptoUtils } from '../utils/crypto';
import { TelegramClient } from '../utils/telegram';

/**
 * 处理消息发送 API 请求
 */
export async function handleApiRequest(
  request: Request,
  env: Env
): Promise<Response> {
  const url = new URL(request.url);
  const telegram = new TelegramClient(env.BOT_TOKEN);

  // 获取 token（加密后的 chat_id）
  // 注意：Token 可能包含 + 号，URL 解码时会变成空格，需要恢复
  const token = url.searchParams.get('token')?.replace(/ /g, '+');
  if (!token) {
    return jsonResponse({
      code: 422,
      message: 'token 不能为空',
    }, 422);
  }

  // 解密获取 chat_id
  let chatId: string;
  try {
    chatId = await cryptoUtils.decrypt(token, env.SECRET_KEY);
    console.log('Decrypted chatId:', chatId);
  } catch (err) {
    console.error('Decrypt error:', err);
    return jsonResponse({
      code: 401,
      message: '无效的 token',
    }, 401);
  }

  // 验证 Token 是否与 KV 中存储的一致（确保 Token 未被替换）
  const storedToken = await env.KV.get(`user:${chatId}`);
  if (storedToken && storedToken !== token) {
    return jsonResponse({
      code: 401,
      message: 'Token 已失效，请在 Telegram 中发送 /token 获取新 Token',
    }, 401);
  }

  // 根据请求方法和内容类型解析参数
  let params: Record<string, string>;
  if (request.method === 'POST') {
    const contentType = request.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      try {
        params = await request.json() as Record<string, string>;
      } catch {
        return jsonResponse({
          code: 400,
          message: '无效的 JSON 格式',
        }, 400);
      }
    } else {
      const formData = await request.formData();
      params = Object.fromEntries(formData.entries()) as Record<string, string>;
    }
  } else {
    params = Object.fromEntries(url.searchParams.entries());
  }

  // 构建消息对象
  const message = buildMessage(chatId, params);
  if (!message) {
    return jsonResponse({
      code: 422,
      message: '缺少必要参数或无效的消息类型',
    }, 422);
  }

  // 发送消息
  try {
    console.log('Sending message:', JSON.stringify(message));
    console.log('BOT_TOKEN exists:', !!env.BOT_TOKEN);
    const result = await telegram.sendMessage(message);
    console.log('Telegram response:', JSON.stringify(result));

    if (result.ok) {
      // 生成 shell 测试命令示例
      const shellExample = generateShellExample(params, token);

      return jsonResponse({
        code: 200,
        message: 'success',
        data: result.result,
        example: shellExample,
      });
    } else {
      return jsonResponse({
        code: result.error_code || 422,
        message: result.description || '发送失败',
      }, result.error_code || 422);
    }
  } catch (error) {
    console.error('Send message error:', error);
    return jsonResponse({
      code: 500,
      message: `发送错误: ${error}`,
    }, 500);
  }
}

/**
 * 构建消息对象
 */
function buildMessage(chatId: string, params: Record<string, string>): Message | null {
  const type = (params.type || 'text') as MessageType;

  const baseParams = {
    chat_id: chatId,
    disable_notification: params.disable_notification === 'true',
    protect_content: params.protect_content === 'true',
    reply_to_message_id: params.reply_to_message_id ? parseInt(params.reply_to_message_id) : undefined,
    parse_mode: (params.parse_mode as 'MarkdownV2' | 'HTML' | 'Markdown') || undefined,
  };

  // 处理 reply_markup（如果有）
  if (params.reply_markup) {
    try {
      baseParams.reply_markup = JSON.parse(params.reply_markup);
    } catch {
      // 忽略解析错误
    }
  }

  switch (type) {
    case MessageType.TEXT:
    case MessageType.MARKDOWN:
    case MessageType.HTML:
      if (!params.message && !params.text) return null;
      return {
        type,
        ...baseParams,
        message: params.message || params.text || '',
      };

    case MessageType.PHOTO:
      if (!params.photo) return null;
      return {
        type,
        ...baseParams,
        photo: params.photo,
        caption: params.caption,
      };

    case MessageType.DOCUMENT:
      if (!params.document) return null;
      return {
        type,
        ...baseParams,
        document: params.document,
        caption: params.caption,
        file_name: params.file_name,
      };

    case MessageType.VIDEO:
      if (!params.video) return null;
      return {
        type,
        ...baseParams,
        video: params.video,
        caption: params.caption,
      };

    case MessageType.AUDIO:
      if (!params.audio) return null;
      return {
        type,
        ...baseParams,
        audio: params.audio,
        caption: params.caption,
        title: params.title,
        performer: params.performer,
      };

    case MessageType.VOICE:
      if (!params.voice) return null;
      return {
        type,
        ...baseParams,
        voice: params.voice,
        caption: params.caption,
      };

    case MessageType.LOCATION:
      if (!params.latitude || !params.longitude) return null;
      return {
        type,
        ...baseParams,
        latitude: parseFloat(params.latitude),
        longitude: parseFloat(params.longitude),
      };

    case MessageType.CONTACT:
      if (!params.phone_number || !params.first_name) return null;
      return {
        type,
        ...baseParams,
        phone_number: params.phone_number,
        first_name: params.first_name,
        last_name: params.last_name,
      };

    case MessageType.POLL:
      if (!params.question || !params.options) return null;
      return {
        type,
        ...baseParams,
        question: params.question,
        options: params.options.split(',').map(o => o.trim()),
        is_anonymous: params.is_anonymous !== 'false',
        allows_multiple_answers: params.allows_multiple_answers === 'true',
      };

    case MessageType.STICKER:
      if (!params.sticker) return null;
      return {
        type,
        ...baseParams,
        sticker: params.sticker,
      };

    default:
      return null;
  }
}

/**
 * 返回 JSON 响应
 */
/**
 * 生成 Shell 测试命令示例
 */
function generateShellExample(
  params: Record<string, string>,
  token: string
): { curl: string; description: string } {
  const type = params.type || 'text';
  const workerUrl = 'https://tgmessage.f1car.workers.dev';

  switch (type) {
    case 'text':
      return {
        curl: `curl "${workerUrl}/api?token=${encodeURIComponent(token)}&message=你好世界"`,
        description: '发送文本消息',
      };

    case 'markdown':
      return {
        curl: `curl "${workerUrl}/api?token=${encodeURIComponent(token)}&type=markdown&message=*粗体*_斜体_"`,
        description: '发送 Markdown 格式消息',
      };

    case 'html':
      return {
        curl: `curl "${workerUrl}/api?token=${encodeURIComponent(token)}&type=html&message=<b>粗体</b><i>斜体</i>"`,
        description: '发送 HTML 格式消息',
      };

    case 'photo':
      return {
        curl: `curl -X POST "${workerUrl}/api" \\
  -H "Content-Type: application/json" \\
  -d '{
    "token": "${token}",
    "type": "photo",
    "photo": "https://example.com/image.jpg",
    "caption": "图片描述"
  }'`,
        description: '发送图片（支持 URL 或 file_id）',
      };

    case 'document':
      return {
        curl: `curl -X POST "${workerUrl}/api" \\
  -H "Content-Type: application/json" \\
  -d '{
    "token": "${token}",
    "type": "document",
    "document": "https://example.com/file.pdf",
    "caption": "文件说明"
  }'`,
        description: '发送文档/文件',
      };

    case 'video':
      return {
        curl: `curl -X POST "${workerUrl}/api" \\
  -H "Content-Type: application/json" \\
  -d '{
    "token": "${token}",
    "type": "video",
    "video": "https://example.com/video.mp4",
    "caption": "视频描述"
  }'`,
        description: '发送视频',
      };

    case 'audio':
      return {
        curl: `curl -X POST "${workerUrl}/api" \\
  -H "Content-Type: application/json" \\
  -d '{
    "token": "${token}",
    "type": "audio",
    "audio": "https://example.com/music.mp3",
    "caption": "音乐描述",
    "title": "歌曲名",
    "performer": "艺术家"
  }'`,
        description: '发送音频文件',
      };

    case 'voice':
      return {
        curl: `curl -X POST "${workerUrl}/api" \\
  -H "Content-Type: application/json" \\
  -d '{
    "token": "${token}",
    "type": "voice",
    "voice": "https://example.com/voice.ogg"
  }'`,
        description: '发送语音消息',
      };

    case 'location':
      return {
        curl: `curl -X POST "${workerUrl}/api" \\
  -H "Content-Type: application/json" \\
  -d '{
    "token": "${token}",
    "type": "location",
    "latitude": 39.9042,
    "longitude": 116.4074
  }'`,
        description: '发送地理位置',
      };

    case 'contact':
      return {
        curl: `curl -X POST "${workerUrl}/api" \\
  -H "Content-Type: application/json" \\
  -d '{
    "token": "${token}",
    "type": "contact",
    "phone_number": "+8613800138000",
    "first_name": "张三",
    "last_name": "李四"
  }'`,
        description: '发送联系人信息',
      };

    case 'poll':
      return {
        curl: `curl -X POST "${workerUrl}/api" \\
  -H "Content-Type: application/json" \\
  -d '{
    "token": "${token}",
    "type": "poll",
    "question": "你最喜欢什么编程语言？",
    "options": "JavaScript,TypeScript,Python,Go,Rust",
    "is_anonymous": true
  }'`,
        description: '创建投票',
      };

    case 'sticker':
      return {
        curl: `curl -X POST "${workerUrl}/api" \\
  -H "Content-Type: application/json" \\
  -d '{
    "token": "${token}",
    "type": "sticker",
    "sticker": "CAACAgIAAxkBAA..."
  }'`,
        description: '发送贴纸',
      };

    default:
      return {
        curl: `curl "${workerUrl}/api?token=${encodeURIComponent(token)}&message=你好世界"`,
        description: '发送文本消息',
      };
  }
}

function jsonResponse(data: ApiResponse, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
