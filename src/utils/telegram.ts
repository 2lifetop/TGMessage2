import {
  type TelegramResponse,
  type Message,
  MessageType,
  type TextMessage,
  type PhotoMessage,
  type DocumentMessage,
  type VideoMessage,
  type AudioMessage,
  type VoiceMessage,
  type LocationMessage,
  type ContactMessage,
  type PollMessage,
  type StickerMessage,
} from '../types';

/**
 * Telegram API 客户端
 */
export class TelegramClient {
  private token: string;
  private baseUrl: string;

  constructor(token: string) {
    this.token = token;
    this.baseUrl = `https://api.telegram.org/bot${token}`;
  }

  /**
   * 发送请求到 Telegram API
   */
  async request<T>(method: string, params: Record<string, unknown>): Promise<TelegramResponse<T>> {
    const url = `${this.baseUrl}/${method}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    return await response.json() as TelegramResponse<T>;
  }

  /**
   * 转义 MarkdownV2 特殊字符
   */
  escapeMarkdown(text: string): string {
    const specialChars = ['_', '*', '[', ']', '(', ')', '~', '`', '>', '#', '+', '-', '=', '|', '{', '}', '.', '!'];
    return specialChars.reduce((acc, char) => acc.replaceAll(char, `\\${char}`), text);
  }

  /**
   * 发送消息（统一接口）
   */
  async sendMessage(message: Message): Promise<TelegramResponse> {
    const commonParams = {
      chat_id: message.chat_id,
      disable_notification: message.disable_notification ?? false,
      protect_content: message.protect_content ?? false,
      reply_to_message_id: message.reply_to_message_id,
      reply_markup: message.reply_markup,
    };

    switch (message.type) {
      case MessageType.TEXT:
      case MessageType.MARKDOWN:
      case MessageType.HTML: {
        const msg = message as TextMessage;
        return this.request('sendMessage', {
          ...commonParams,
          text: msg.message,
          parse_mode: msg.parse_mode ?? (msg.type === MessageType.MARKDOWN ? 'MarkdownV2' : undefined),
        });
      }

      case MessageType.PHOTO: {
        const msg = message as PhotoMessage;
        return this.request('sendPhoto', {
          ...commonParams,
          photo: msg.photo,
          caption: msg.caption,
          parse_mode: msg.parse_mode,
        });
      }

      case MessageType.DOCUMENT: {
        const msg = message as DocumentMessage;
        return this.request('sendDocument', {
          ...commonParams,
          document: msg.document,
          caption: msg.caption,
          parse_mode: msg.parse_mode,
          file_name: msg.file_name,
        });
      }

      case MessageType.VIDEO: {
        const msg = message as VideoMessage;
        return this.request('sendVideo', {
          ...commonParams,
          video: msg.video,
          caption: msg.caption,
          parse_mode: msg.parse_mode,
        });
      }

      case MessageType.AUDIO: {
        const msg = message as AudioMessage;
        return this.request('sendAudio', {
          ...commonParams,
          audio: msg.audio,
          caption: msg.caption,
          parse_mode: msg.parse_mode,
          title: msg.title,
          performer: msg.performer,
        });
      }

      case MessageType.VOICE: {
        const msg = message as VoiceMessage;
        return this.request('sendVoice', {
          ...commonParams,
          voice: msg.voice,
          caption: msg.caption,
          parse_mode: msg.parse_mode,
        });
      }

      case MessageType.LOCATION: {
        const msg = message as LocationMessage;
        return this.request('sendLocation', {
          ...commonParams,
          latitude: msg.latitude,
          longitude: msg.longitude,
        });
      }

      case MessageType.CONTACT: {
        const msg = message as ContactMessage;
        return this.request('sendContact', {
          ...commonParams,
          phone_number: msg.phone_number,
          first_name: msg.first_name,
          last_name: msg.last_name,
        });
      }

      case MessageType.POLL: {
        const msg = message as PollMessage;
        return this.request('sendPoll', {
          ...commonParams,
          question: msg.question,
          options: msg.options.map(opt => ({ text: opt })),
          is_anonymous: msg.is_anonymous ?? true,
          allows_multiple_answers: msg.allows_multiple_answers ?? false,
        });
      }

      case MessageType.STICKER: {
        const msg = message as StickerMessage;
        return this.request('sendSticker', {
          ...commonParams,
          sticker: msg.sticker,
        });
      }

      default:
        throw new Error(`Unsupported message type: ${(message as Message).type}`);
    }
  }

  /**
   * 设置 Webhook
   */
  async setWebhook(url: string, secretToken?: string): Promise<TelegramResponse> {
    return this.request('setWebhook', {
      url,
      secret_token: secretToken,
      allowed_updates: ['message', 'callback_query'],
    });
  }

  /**
   * 删除 Webhook
   */
  async deleteWebhook(): Promise<TelegramResponse> {
    return this.request('deleteWebhook', {});
  }

  /**
   * 获取 Webhook 信息
   */
  async getWebhookInfo(): Promise<TelegramResponse> {
    return this.request('getWebhookInfo', {});
  }

  /**
   * 获取 Bot 信息
   */
  async getMe(): Promise<TelegramResponse> {
    return this.request('getMe', {});
  }
}
