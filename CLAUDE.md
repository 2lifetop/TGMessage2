# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TGMessage2 is a Telegram message push bot built for Vercel serverless functions (PHP). It provides a simple HTTP API to send messages to Telegram, similar to "Server Chan" but for Telegram.

## Architecture

The project uses a simple serverless PHP architecture on Vercel:

- **Bot.php**: Core wrapper class for Telegram Bot API
  - Handles authentication via `token` environment variable
  - Encrypts/decrypts chat_id using base64 with a key prefix (`sign_key` env var, default: 'abc')
  - Automatically escapes MarkdownV2 special characters in messages
  - Makes cURL requests to `https://api.telegram.org/bot{token}/{method}`

- **api/index.php**: Main message sending endpoint (`/api`)
  - Accepts `token` (encrypted chat_id) and `message` via GET/POST
  - Returns JSON: `{"code":200,"message":"success"}` or `{"code":422,"message":"error"}`

- **api/webhook.php**: Telegram webhook handler (`/webhook`)
  - Handles bot commands: `/start`, `/token`, `/usage`
  - `/token` returns the encrypted chat_id for API usage

- **api/setWebHook.php**: Webhook setup endpoint (`/setWebHook`)
  - Protected by `key` environment variable
  - Sets Telegram webhook URL

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `token` | Yes | Telegram bot token from BotFather |
| `sign_key` | No | Encryption key for chat_id (default: 'abc') |
| `url` | No | Webhook callback URL |
| `key` | No | Secret key for accessing `/setWebHook` endpoint |

## Development Commands

This is a pure PHP project with no build step. To develop locally:

```bash
# Install Vercel CLI globally
npm i -g vercel

# Run local development server
vercel dev
```

Local server will start (typically on port 3000). The PHP runtime is handled by Vercel's `vercel-php@0.6.0`.

## Deployment

Deploy via Vercel CLI or Git integration:

```bash
# Deploy to production
vercel --prod

# Or deploy preview
vercel
```

## Setup Flow

1. Create a bot via BotFather, get `token`
2. Deploy to Vercel and set `token` environment variable
3. Set webhook: `GET https://your-domain.com/setWebHook?key=YOUR_KEY&url=https://your-domain.com/webhook`
4. In Telegram, send `/token` to your bot to get encrypted chat_id
5. Send messages: `GET https://your-domain.com/api?token=ENCRYPTED_TOKEN&message=Hello`

## Important Notes

- The encryption in `Bot.php` is simple base64 encoding with a key prefix - not cryptographically secure
- All API responses are JSON with `code` and `message` fields
- MarkdownV2 is enabled by default; special characters are auto-escaped
- The `url` parameter in webhook.php contains a hardcoded example domain that should be updated for new deployments
