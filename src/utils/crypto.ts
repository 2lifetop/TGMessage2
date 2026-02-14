/**
 * 加密工具类 - 使用 AES-GCM 进行加密
 */
export class CryptoUtils {
  private encoder: TextEncoder;
  private decoder: TextDecoder;

  constructor() {
    this.encoder = new TextEncoder();
    this.decoder = new TextDecoder();
  }

  /**
   * 生成密钥
   */
  private async getKey(secret: string): Promise<CryptoKey> {
    const keyData = this.encoder.encode(secret.padEnd(32, '0').slice(0, 32));
    return await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'AES-GCM' },
      false,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * 加密 chat_id
   */
  async encrypt(chatId: string, secret: string): Promise<string> {
    try {
      const key = await this.getKey(secret);
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const data = this.encoder.encode(chatId);

      const encrypted = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        data
      );

      // 组合 IV 和加密数据
      const result = new Uint8Array(iv.length + encrypted.byteLength);
      result.set(iv);
      result.set(new Uint8Array(encrypted), iv.length);

      // Base64 编码
      return btoa(String.fromCharCode(...result));
    } catch (error) {
      throw new Error(`Encryption failed: ${error}`);
    }
  }

  /**
   * 解密 token 获取 chat_id
   */
  async decrypt(token: string, secret: string): Promise<string> {
    try {
      const key = await this.getKey(secret);
      const data = Uint8Array.from(atob(token), c => c.charCodeAt(0));

      // 提取 IV 和加密数据
      const iv = data.slice(0, 12);
      const encrypted = data.slice(12);

      const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        key,
        encrypted
      );

      return this.decoder.decode(decrypted);
    } catch (error) {
      throw new Error(`Decryption failed: invalid token`);
    }
  }

  /**
   * 生成随机 ID
   */
  generateId(): string {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
  }
}

export const cryptoUtils = new CryptoUtils();
