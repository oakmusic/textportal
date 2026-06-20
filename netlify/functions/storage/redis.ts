import { Redis } from '@upstash/redis';
import { StorageProvider, TextData, FileMetadata } from './provider';

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
    
    const result = await this.redis.set(key, JSON.stringify(data), { nx: true, ex: ttlSeconds });
    return result === 'OK';
  }

  async getMessage(code: string): Promise<TextData | null> {
    const key = `msg:${code}`;
    const data = await this.redis.get<TextData>(key);
    return data || null;
  }

  async saveFileMetadata(code: string, metadata: FileMetadata, ttlSeconds: number): Promise<boolean> {
    const key = `file:${code}`;
    
    const result = await this.redis.set(key, JSON.stringify(metadata), { nx: true, ex: ttlSeconds });
    if (result === 'OK') {
      // Track active files for cron cleanup
      await this.redis.hset('active_files_meta', { [code]: metadata.fileKey });
      return true;
    }
    return false;
  }

  async getFileMetadata(code: string): Promise<FileMetadata | null> {
    const key = `file:${code}`;
    const data = await this.redis.get<FileMetadata>(key);
    return data || null;
  }

  async deleteMessage(code: string): Promise<void> {
    const msgKey = `msg:${code}`;
    const fileKey = `file:${code}`;
    await this.redis.del(msgKey, fileKey);
    await this.removeActiveFileCode(code);
  }

  async getTTL(code: string): Promise<number> {
    let ttl = await this.redis.ttl(`msg:${code}`);
    if (ttl < 0) {
      ttl = await this.redis.ttl(`file:${code}`);
    }
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

  // --- Rate limiting for files ---

  async trackFileUploadRateLimit(ip: string, sizeBytes: number): Promise<{ size: number; count: number }> {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const sizeKey = `ratelimit:file:size:${ip}:${today}`;
    const countKey = `ratelimit:file:count:${ip}:${today}`;

    // Use a transaction/pipeline to increment both
    const pipeline = this.redis.pipeline();
    pipeline.incrby(sizeKey, sizeBytes);
    pipeline.incr(countKey);
    pipeline.expire(sizeKey, 86400); // 24 hours
    pipeline.expire(countKey, 86400);

    const results = await pipeline.exec();
    
    return {
      size: Number(results[0]),
      count: Number(results[1])
    };
  }

  // --- Cron tracking ---

  async getActiveFileCodes(): Promise<string[]> {
    return await this.redis.smembers('active_files');
  }

  async removeActiveFileCode(code: string): Promise<void> {
    await this.redis.srem('active_files', code);
  }
}
