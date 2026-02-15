#!/bin/bash

# TGMessage Bot API 测试脚本
# 使用方法: ./test.sh YOUR_TOKEN

set -e

WORKER_URL="https://tgmessage.f1car.workers.dev"
TOKEN="${1:-}"

if [ -z "$TOKEN" ]; then
    echo "❌ 请提供 Token"
    echo "使用方法: ./test.sh YOUR_TOKEN"
    echo ""
    echo "💡 获取 Token:"
    echo "  在 Telegram 中向 Bot 发送 /token"
    exit 1
fi

echo "🚀 TGMessage Bot API 测试脚本"
echo "=============================="
echo ""
echo "Worker URL: $WORKER_URL"
echo "Token: ${TOKEN:0:10}..."
echo ""

# 测试 1: 文本消息
echo "📧 测试 1: 发送文本消息"
RESPONSE=$(curl -s "$WORKER_URL/api?token=$(echo "$TOKEN" | jq -sRr @uri)&message=你好，世界！这是一条测试消息。")
echo "响应: $RESPONSE"
echo ""

# 测试 2: Markdown 格式
echo "🎨 测试 2: 发送 Markdown 格式消息"
RESPONSE=$(curl -s "$WORKER_URL/api?token=$(echo "$TOKEN" | jq -sRr @uri)&type=markdown&message=*粗体文本* _斜体文本_ `代码文本`")
echo "响应: $RESPONSE"
echo ""

# 测试 3: HTML 格式
echo "🌐 测试 3: 发送 HTML 格式消息"
RESPONSE=$(curl -s "$WORKER_URL/api?token=$(echo "$TOKEN" | jq -sRr @uri)&type=html&message=<b>粗体</b><i>斜体</i><code>代码</code>")
echo "响应: $RESPONSE"
echo ""

# 测试 4: 发送图片
echo "🖼️  测试 4: 发送图片"
RESPONSE=$(curl -s -X POST "$WORKER_URL/api" \
  -H "Content-Type: application/json" \
  -d "{
    \"token\": \"$TOKEN\",
    \"type\": \"photo\",
    \"photo\": \"https://picsum.photos/400/300\",
    \"caption\": \"这是一张随机图片\"
  }")
echo "响应: $RESPONSE"
echo ""

# 测试 5: 发送位置
echo "📍 测试 5: 发送地理位置"
RESPONSE=$(curl -s -X POST "$WORKER_URL/api" \
  -H "Content-Type: application/json" \
  -d "{
    \"token\": \"$TOKEN\",
    \"type\": \"location\",
    \"latitude\": 39.9042,
    \"longitude\": 116.4074
  }")
echo "响应: $RESPONSE"
echo ""

# 测试 6: 创建投票
echo "📊 测试 6: 创建投票"
RESPONSE=$(curl -s -X POST "$WORKER_URL/api" \
  -H "Content-Type: application/json" \
  -d "{
    \"token\": \"$TOKEN\",
    \"type\": \"poll\",
    \"question\": \"你最喜欢什么编程语言？\",
    \"options\": \"JavaScript,TypeScript,Python,Go,Rust\",
    \"is_anonymous\": true
  }")
echo "响应: $RESPONSE"
echo ""

echo "✅ 所有测试完成！"
echo ""
echo "📖 更多用法请参考: $WORKER_URL"
