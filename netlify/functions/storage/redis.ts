import { Redis } from '@upstash/redis';
import { StorageProvider, TextData } from './provider';

export class RedisStorageProvider implements StorageProvider {
  private redis: Redis;

  constructor() {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;
    
    if (!url || !token) {
      throw new Error('Upstash Redis credentials are not configured.');
    }
    
    this.redis = new Redis({ url, token });
  }

  async saveMessage(code: string, text: string, ttlSeconds: number): Promise<boolean> {
    const key = `msg:${code}`;
    const data: TextData = { text, createdAt: Date.now() };
    
    // nx: only set if it does not exist
    const result = await this.redis.set(key, JSON.stringify(data), { nx: true, ex: ttlSeconds });
    return result === 'OK';
  }

  async getMessage(code: string): Promise<TextData | null> {
    const key = `msg:${code}`;
    const data = await this.redis.get<TextData>(key);
    return data || null;
  }

  async deleteMessage(code: string): Promise<void> {
    const key = `msg:${code}`;
    await this.redis.del(key);
  }

  async getTTL(code: string): Promise<number> {
    const key = `msg:${code}`;
    const ttl = await this.redis.ttl(key);
    return ttl >= 0 ? ttl : -1;
  }

  async registerFailedAttempt(ip: string): Promise<number> {
    const key = `fail:${ip}`;
    const count = await this.redis.incr(key);
    if (count === 1) {
      await this.redis.expire(key, 5 * 60); // Expire failures after 5 mins
    }
    return count;
  }

  async resetFailedAttempts(ip: string): Promise<void> {
    const key = `fail:${ip}`;
    await this.redis.del(key);
  }

  async blockIp(ip: string, durationSeconds: number): Promise<void> {
    const key = `blocked:${ip}`;
    await this.redis.set(key, '1', { ex: durationSeconds });
  }

  async isIpBlocked(ip: string): Promise<boolean> {
    const key = `blocked:${ip}`;
    const exists = await this.redis.exists(key);
    return exists === 1;
  }
}
