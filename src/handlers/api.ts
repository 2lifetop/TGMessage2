import type { Env, ApiResponse, Message, MessageType } from '../types';
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
  const token = url.searchParams.get('token');
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
  } catch {
    return jsonResponse({
      code: 401,
      message: '无效的 token',
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
    const result = await telegram.sendMessage(message);

    if (result.ok) {
      return jsonResponse({
        code: 200,
        message: 'success',
        data: result.result,
      });
    } else {
      return jsonResponse({
        code: result.error_code || 422,
        message: result.description || '发送失败',
      }, result.error_code || 422);
    }
  } catch (error) {
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
