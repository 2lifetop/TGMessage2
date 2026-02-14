// Cloudflare Worker 环境变量绑定
export interface Env {
  BOT_TOKEN: string;
  SECRET_KEY: string;
  KV: KVNamespace;
}

// 消息类型枚举
export enum MessageType {
  TEXT = 'text',
  MARKDOWN = 'markdown',
  HTML = 'html',
  PHOTO = 'photo',
  DOCUMENT = 'document',
  VIDEO = 'video',
  AUDIO = 'audio',
  VOICE = 'voice',
  LOCATION = 'location',
  CONTACT = 'contact',
  POLL = 'poll',
  STICKER = 'sticker',
}

// 基础消息接口
export interface BaseMessage {
  chat_id: string;
  message?: string;
  caption?: string;
  parse_mode?: 'MarkdownV2' | 'HTML' | 'Markdown';
  disable_notification?: boolean;
  protect_content?: boolean;
  reply_to_message_id?: number;
  reply_markup?: InlineKeyboardMarkup | ReplyKeyboardMarkup;
}

// 文本消息
export interface TextMessage extends BaseMessage {
  type: MessageType.TEXT | MessageType.MARKDOWN | MessageType.HTML;
  message: string;
}

// 图片消息
export interface PhotoMessage extends BaseMessage {
  type: MessageType.PHOTO;
  photo: string; // URL 或 file_id
  caption?: string;
}

// 文档消息
export interface DocumentMessage extends BaseMessage {
  type: MessageType.DOCUMENT;
  document: string; // URL 或 file_id
  caption?: string;
  file_name?: string;
}

// 视频消息
export interface VideoMessage extends BaseMessage {
  type: MessageType.VIDEO;
  video: string; // URL 或 file_id
  caption?: string;
}

// 音频消息
export interface AudioMessage extends BaseMessage {
  type: MessageType.AUDIO;
  audio: string; // URL 或 file_id
  caption?: string;
  title?: string;
  performer?: string;
}

// 语音消息
export interface VoiceMessage extends BaseMessage {
  type: MessageType.VOICE;
  voice: string; // URL 或 file_id
  caption?: string;
}

// 位置消息
export interface LocationMessage extends BaseMessage {
  type: MessageType.LOCATION;
  latitude: number;
  longitude: number;
}

// 联系消息
export interface ContactMessage extends BaseMessage {
  type: MessageType.CONTACT;
  phone_number: string;
  first_name: string;
  last_name?: string;
}

// 投票消息
export interface PollMessage extends BaseMessage {
  type: MessageType.POLL;
  question: string;
  options: string[];
  is_anonymous?: boolean;
  allows_multiple_answers?: boolean;
}

// 贴纸消息
export interface StickerMessage extends BaseMessage {
  type: MessageType.STICKER;
  sticker: string; // file_id
}

// 联合类型
export type Message =
  | TextMessage
  | PhotoMessage
  | DocumentMessage
  | VideoMessage
  | AudioMessage
  | VoiceMessage
  | LocationMessage
  | ContactMessage
  | PollMessage
  | StickerMessage;

// 内联键盘
export interface InlineKeyboardButton {
  text: string;
  url?: string;
  callback_data?: string;
  web_app?: { url: string };
}

export interface InlineKeyboardMarkup {
  inline_keyboard: InlineKeyboardButton[][];
}

// 回复键盘
export interface KeyboardButton {
  text: string;
  request_contact?: boolean;
  request_location?: boolean;
}

export interface ReplyKeyboardMarkup {
  keyboard: KeyboardButton[][];
  resize_keyboard?: boolean;
  one_time_keyboard?: boolean;
}

// API 响应格式
export interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data?: T;
}

// Telegram API 响应
export interface TelegramResponse<T = unknown> {
  ok: boolean;
  result?: T;
  description?: string;
  error_code?: number;
}

// Telegram 更新对象
export interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
  callback_query?: CallbackQuery;
}

export interface TelegramMessage {
  message_id: number;
  from?: TelegramUser;
  chat: TelegramChat;
  date: number;
  text?: string;
  caption?: string;
  photo?: PhotoSize[];
  document?: Document;
  video?: Video;
  audio?: Audio;
  voice?: Voice;
  location?: Location;
  contact?: Contact;
  sticker?: Sticker;
  entities?: MessageEntity[];
}

export interface TelegramUser {
  id: number;
  is_bot: boolean;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

export interface TelegramChat {
  id: number;
  type: 'private' | 'group' | 'supergroup' | 'channel';
  first_name?: string;
  last_name?: string;
  username?: string;
  title?: string;
}

export interface PhotoSize {
  file_id: string;
  file_unique_id: string;
  width: number;
  height: number;
  file_size?: number;
}

export interface Document {
  file_id: string;
  file_unique_id: string;
  file_name?: string;
  mime_type?: string;
  file_size?: number;
}

export interface Video {
  file_id: string;
  file_unique_id: string;
  width: number;
  height: number;
  duration: number;
  file_name?: string;
  mime_type?: string;
  file_size?: number;
}

export interface Audio {
  file_id: string;
  file_unique_id: string;
  duration: number;
  performer?: string;
  title?: string;
  file_name?: string;
  mime_type?: string;
  file_size?: number;
}

export interface Voice {
  file_id: string;
  file_unique_id: string;
  duration: number;
  mime_type?: string;
  file_size?: number;
}

export interface Location {
  latitude: number;
  longitude: number;
}

export interface Contact {
  phone_number: string;
  first_name: string;
  last_name?: string;
  user_id?: number;
}

export interface Sticker {
  file_id: string;
  file_unique_id: string;
  type: string;
  width: number;
  height: number;
  is_animated: boolean;
  is_video: boolean;
}

export interface MessageEntity {
  type: string;
  offset: number;
  length: number;
  url?: string;
  user?: TelegramUser;
}

export interface CallbackQuery {
  id: string;
  from: TelegramUser;
  message?: TelegramMessage;
  data?: string;
}
