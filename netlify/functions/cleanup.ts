import type { Config } from "@netlify/functions";
import { getFileStorageProvider } from "./storage/fileStorage";
import { Redis } from '@upstash/redis';

export default async function handler(req: Request) {
  try {
    const fileStorage = getFileStorageProvider();
    
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;
    
    if (!url || !token) {
      console.log('Redis not configured, skipping cleanup.');
      return new Response('No redis', { status: 200 });
    }

    const redis = new Redis({ url, token });
    
    const activeFiles = await redis.hgetall<{ [code: string]: string }>('active_files_meta');
    if (!activeFiles) return new Response('No active files', { status: 200 });

    let deletedCount = 0;
    for (const [code, fileKey] of Object.entries(activeFiles)) {
      const exists = await redis.exists(`file:${code}`);
      if (!exists) {
        // Expired! Delete from R2
        try {
          await fileStorage.deleteFile(fileKey);
          await redis.hdel('active_files_meta', code);
          deletedCount++;
        } catch (e) {
          console.error(`Failed to delete file ${fileKey}`, e);
        }
      }
    }
    
    return new Response(`Cleanup complete. Deleted ${deletedCount} files.`, { status: 200 });
  } catch (error) {
    console.error('Cleanup error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}

export const config: Config = {
  schedule: "@hourly",
};

