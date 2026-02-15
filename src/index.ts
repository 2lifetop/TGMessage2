import type { Env } from './types';
import { handleApiRequest } from './handlers/api';
import { handleWebhookRequest } from './handlers/webhook';
import {
  handleSetupRequest,
  handleWebhookInfoRequest,
  handleDeleteWebhookRequest,
} from './handlers/setup';

/**
 * Cloudflare Worker 入口
 */
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const pathname = url.pathname;

    // CORS 预检请求处理
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    try {
      // 路由分发
      switch (pathname) {
        case '/api':
        case '/api/':
          return await handleApiRequest(request, env);

        case '/webhook':
        case '/webhook/':
          return await handleWebhookRequest(request, env);

        case '/setup':
        case '/setup/':
          return await handleSetupRequest(request, env);

        case '/webhook-info':
        case '/webhook-info/':
          return await handleWebhookInfoRequest(request, env);

        case '/delete-webhook':
        case '/delete-webhook/':
          return await handleDeleteWebhookRequest(request, env);

        case '/health':
        case '/health/':
          return jsonResponse({
            code: 200,
            message: 'healthy',
            timestamp: new Date().toISOString(),
          });

        case '/':
          return new Response(getHomePage(), {
            headers: { 'Content-Type': 'text/html; charset=utf-8' },
          });

        default:
          return jsonResponse(
            {
              code: 404,
              message: 'Not Found',
            },
            404
          );
      }
    } catch (error) {
      console.error('Unhandled error:', error);
      return jsonResponse(
        {
          code: 500,
          message: 'Internal Server Error',
        },
        500
      );
    }
  },
};

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

/**
 * 获取首页 HTML
 */
function getHomePage(): string {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TGMessage Bot - Cloudflare Worker</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 20px;
    }
    .container {
      background: white;
      border-radius: 20px;
      padding: 40px;
      max-width: 800px;
      width: 100%;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    }
    h1 {
      color: #333;
      font-size: 2.5em;
      margin-bottom: 10px;
      text-align: center;
    }
    .subtitle {
      color: #666;
      text-align: center;
      margin-bottom: 30px;
    }
    .badge {
      display: inline-block;
      background: #f0f0f0;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 0.85em;
      color: #555;
      margin: 0 5px;
    }
    .badge.active {
      background: #4caf50;
      color: white;
    }
    .section {
      margin: 30px 0;
    }
    .section h2 {
      color: #444;
      font-size: 1.3em;
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 2px solid #eee;
    }
    .feature-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 15px;
      margin: 20px 0;
    }
    .feature-item {
      background: #f8f9fa;
      padding: 15px;
      border-radius: 10px;
      text-align: center;
      transition: transform 0.2s;
    }
    .feature-item:hover {
      transform: translateY(-3px);
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
    }
    .feature-icon {
      font-size: 2em;
      margin-bottom: 8px;
    }
    .code-block {
      background: #1e1e1e;
      color: #d4d4d4;
      padding: 20px;
      border-radius: 10px;
      overflow-x: auto;
      font-family: 'Consolas', 'Monaco', monospace;
      font-size: 0.9em;
      margin: 15px 0;
    }
    .code-block .comment {
      color: #6a9955;
    }
    .code-block .string {
      color: #ce9178;
    }
    .code-block .keyword {
      color: #569cd6;
    }
    .endpoint {
      background: #e3f2fd;
      border-left: 4px solid #2196f3;
      padding: 15px;
      margin: 10px 0;
      border-radius: 0 10px 10px 0;
    }
    .endpoint h3 {
      color: #1976d2;
      margin-bottom: 5px;
    }
    .endpoint code {
      background: rgba(0, 0, 0, 0.1);
      padding: 2px 6px;
      border-radius: 4px;
      font-family: monospace;
    }
    .footer {
      text-align: center;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #eee;
      color: #999;
      font-size: 0.9em;
    }
    a {
      color: #667eea;
      text-decoration: none;
    }
    a:hover {
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🚀 TGMessage Bot</h1>
    <p class="subtitle">
      <span class="badge active">Cloudflare Worker</span>
      <span class="badge">TypeScript</span>
      <span class="badge">多消息格式</span>
    </p>

    <div class="section">
      <h2>✨ 功能特性</h2>
      <div class="feature-grid">
        <div class="feature-item">
          <div class="feature-icon">💬</div>
          <div>文本消息</div>
        </div>
        <div class="feature-item">
          <div class="feature-icon">🖼</div>
          <div>图片</div>
        </div>
        <div class="feature-item">
          <div class="feature-icon">📄</div>
          <div>文档</div>
        </div>
        <div class="feature-item">
          <div class="feature-icon">🎬</div>
          <div>视频</div>
        </div>
        <div class="feature-item">
          <div class="feature-icon">🎵</div>
          <div>音频</div>
        </div>
        <div class="feature-item">
          <div class="feature-icon">🎤</div>
          <div>语音</div>
        </div>
        <div class="feature-item">
          <div class="feature-icon">📍</div>
          <div>位置</div>
        </div>
        <div class="feature-item">
          <div class="feature-icon">👤</div>
          <div>联系人</div>
        </div>
        <div class="feature-item">
          <div class="feature-icon">📊</div>
          <div>投票</div>
        </div>
        <div class="feature-item">
          <div class="feature-icon">🎭</div>
          <div>贴纸</div>
        </div>
      </div>
    </div>

    <div class="section">
      <h2>📡 API 端点</h2>

      <div class="endpoint">
        <h3>发送消息</h3>
        <p><code>GET/POST</code> <code>/api</code></p>
        <div class="code-block">
<span class="comment">// GET 请求示例</span>
GET /api?token=<span class="string">YOUR_TOKEN</span>&message=<span class="string">Hello</span>

<span class="comment">// POST 请求示例 (JSON)</span>
POST /api
Content-Type: application/json

{
  <span class="string">"token"</span>: <span class="string">"YOUR_TOKEN"</span>,
  <span class="string">"type"</span>: <span class="string">"text"</span>,
  <span class="string">"message"</span>: <span class="string">"Hello World"</span>
}

<span class="comment">// 发送图片</span>
{
  <span class="string">"token"</span>: <span class="string">"YOUR_TOKEN"</span>,
  <span class="string">"type"</span>: <span class="string">"photo"</span>,
  <span class="string">"photo"</span>: <span class="string">"https://example.com/image.jpg"</span>,
  <span class="string">"caption"</span>: <span class="string">"图片描述"</span>
}
        </div>
      </div>

      <div class="endpoint">
        <h3>Telegram Webhook</h3>
        <p><code>POST</code> <code>/webhook</code></p>
        <p>接收 Telegram Bot 更新（由 Telegram 服务器调用）</p>
      </div>

      <div class="endpoint">
        <h3>设置 Webhook</h3>
        <p><code>GET</code> <code>/setup</code></p>
        <div class="code-block">
GET /setup?key=<span class="string">SECRET_KEY</span>&url=<span class="string">https://your-domain/webhook</span>
        </div>
      </div>
    </div>

    <div class="section">
      <h2>🧪 快速测试</h2>
      <p>下载测试脚本，一键测试所有消息类型：</p>
      <div style="display: flex; gap: 15px; margin: 20px 0; flex-wrap: wrap;">
        <a href="https://github.com/2lifetop/TGMessage2/raw/cloudflare-worker/test.sh" download style="display: inline-flex; align-items: center; gap: 8px; background: #4caf50; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 500;">
          📥 下载 Bash 测试脚本 (Linux/Mac)
        </a>
        <a href="https://github.com/2lifetop/TGMessage2/raw/cloudflare-worker/test.ps1" download style="display: inline-flex; align-items: center; gap: 8px; background: #2196f3; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 500;">
          📥 下载 PowerShell 测试脚本 (Windows)
        </a>
      </div>
      <div class="code-block">
<span class="comment"># 使用 Bash 脚本 (Linux/Mac)</span>
chmod +x test.sh
./test.sh YOUR_TOKEN

<span class="comment"># 使用 PowerShell 脚本 (Windows)</span>
.\test.ps1 -Token <span class="string">"YOUR_TOKEN"</span>
      </div>
    </div>

    <div class="section">
      <h2>🤖 使用步骤</h2>
      <div class="code-block">
<span class="comment">// 1. 在 Telegram 中向 Bot 发送 /start</span>
<span class="comment">// 2. 发送 /token 获取 API Token</span>
<span class="comment">// 3. 使用 Token 发送消息</span>

<span class="comment">// 示例：发送文本</span>
curl <span class="string">"https://your-domain/api?token=XXX&message=Hello"</span>

<span class="comment">// 示例：发送 Markdown</span>
curl -X POST <span class="string">"https://your-domain/api"</span> \\
  -H <span class="string">"Content-Type: application/json"</span> \\
  -d <span class="string">'{"token":"XXX","type":"markdown","message":"*粗体* _斜体_"}'</span>
      </div>
    </div>

    <div class="footer">
      <p>Powered by <a href="https://workers.cloudflare.com/" target="_blank">Cloudflare Workers</a></p>
      <p>源代码: <a href="https://github.com/anhao/TGMessage" target="_blank">GitHub</a></p>
    </div>
  </div>
</body>
</html>`;
}
