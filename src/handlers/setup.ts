import type { Env } from '../types';
import { TelegramClient } from '../utils/telegram';

/**
 * 处理 Webhook 设置请求
 */
export async function handleSetupRequest(
  request: Request,
  env: Env
): Promise<Response> {
  const url = new URL(request.url);
  const secretKey = url.searchParams.get('key');

  // 验证密钥（可以使用 SECRET_KEY 或其他方式验证）
  if (secretKey !== env.SECRET_KEY) {
    return jsonResponse({
      code: 401,
      message: '无效的密钥',
    }, 401);
  }

  // 获取 webhook URL
  const webhookUrl = url.searchParams.get('url');
  if (!webhookUrl) {
    return jsonResponse({
      code: 422,
      message: '缺少 webhook URL 参数',
    }, 422);
  }

  // 验证 URL 格式
  try {
    new URL(webhookUrl);
  } catch {
    return jsonResponse({
      code: 422,
      message: '无效的 webhook URL 格式',
    }, 422);
  }

  // 设置 webhook
  const telegram = new TelegramClient(env.BOT_TOKEN);

  try {
    const result = await telegram.setWebhook(webhookUrl, env.SECRET_KEY);

    if (result.ok) {
      return jsonResponse({
        code: 200,
        message: 'Webhook 设置成功',
        data: {
          url: webhookUrl,
          info: result.result,
        },
      });
    } else {
      return jsonResponse({
        code: 422,
        message: result.description || '设置失败',
      }, 422);
    }
  } catch (error) {
    return jsonResponse({
      code: 500,
      message: `设置失败: ${error}`,
    }, 500);
  }
}

/**
 * 处理获取 Webhook 信息请求
 */
export async function handleWebhookInfoRequest(
  request: Request,
  env: Env
): Promise<Response> {
  const url = new URL(request.url);
  const secretKey = url.searchParams.get('key');

  if (secretKey !== env.SECRET_KEY) {
    return jsonResponse({
      code: 401,
      message: '无效的密钥',
    }, 401);
  }

  const telegram = new TelegramClient(env.BOT_TOKEN);

  try {
    const result = await telegram.getWebhookInfo();

    if (result.ok) {
      return jsonResponse({
        code: 200,
        message: 'success',
        data: result.result,
      });
    } else {
      return jsonResponse({
        code: 422,
        message: result.description || '获取失败',
      }, 422);
    }
  } catch (error) {
    return jsonResponse({
      code: 500,
      message: `获取失败: ${error}`,
    }, 500);
  }
}

/**
 * 处理删除 Webhook 请求
 */
export async function handleDeleteWebhookRequest(
  request: Request,
  env: Env
): Promise<Response> {
  const url = new URL(request.url);
  const secretKey = url.searchParams.get('key');

  if (secretKey !== env.SECRET_KEY) {
    return jsonResponse({
      code: 401,
      message: '无效的密钥',
    }, 401);
  }

  const telegram = new TelegramClient(env.BOT_TOKEN);

  try {
    const result = await telegram.deleteWebhook();

    if (result.ok) {
      return jsonResponse({
        code: 200,
        message: 'Webhook 删除成功',
      });
    } else {
      return jsonResponse({
        code: 422,
        message: result.description || '删除失败',
      }, 422);
    }
  } catch (error) {
    return jsonResponse({
      code: 500,
      message: `删除失败: ${error}`,
    }, 500);
  }
}

/**
 * 返回 JSON 响应
 */
function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
