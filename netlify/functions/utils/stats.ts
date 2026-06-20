import { Redis } from '@upstash/redis';

let redisInstance: Redis | null = null;

function getRedis() {
  if (!redisInstance) {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;
    if (url && token) {
      redisInstance = new Redis({ url, token });
    }
  }
  return redisInstance;
}

export type EventType = 'Created' | 'Retrieved' | 'Expired' | 'Blocked' | 'FileUploaded' | 'FileDownloaded';

export interface ActivityEvent {
  timestamp: number;
  code: string;
  type: EventType;
}

export interface StatsOverview {
  activeCodes: number;
  totalTransfers: number;
  successRate: number; // percentage 0-100
  avgTransferTime: number; // seconds
}

export interface MessageStats {
  totalSent: number;
  totalRetrieved: number;
  totalExpired: number;
  totalActive: number;
}

export interface CharacterStats {
  totalCharacters: number;
  avgMessageLength: number;
  largestMessage: number;
}

export interface FileStats {
  filesUploaded: number;
  totalStorage: number;
  totalDownloads: number;
  largestFile: number;
  avgFileSize: number;
}

export interface FlowStats {
  [key: string]: number; // "Desktop \u2192 Mobile": 5
}

function parseUserAgent(ua: string) {
  const lowerUA = ua.toLowerCase();
  
  // Device
  let device = 'Desktop';
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(lowerUA)) {
    device = 'Tablet';
  } else if (/Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
    device = 'Mobile';
  }

  // OS
  let os = 'Other';
  if (/windows/i.test(lowerUA)) os = 'Windows';
  else if (/android/i.test(lowerUA)) os = 'Android';
  else if (/ipad|iphone|ipod/i.test(lowerUA)) os = 'iOS';
  else if (/mac os/i.test(lowerUA) || /macintosh/i.test(lowerUA)) os = 'MacOS';
  else if (/linux/i.test(lowerUA)) os = 'Linux';

  // Browser
  let browser = 'Other';
  if (/edg/i.test(lowerUA)) browser = 'Edge';
  else if (/chrome|crios/i.test(lowerUA) && !/edg/i.test(lowerUA)) browser = 'Chrome';
  else if (/firefox|fxios/i.test(lowerUA)) browser = 'Firefox';
  else if (/safari/i.test(lowerUA) && !/chrome|crios/i.test(lowerUA)) browser = 'Safari';

  return { device, os, browser };
}

export async function trackFileUploaded(code: string, sizeBytes: number, mimeType: string, userAgent: string, ttlSeconds: number) {
  const redis = getRedis();
  if (!redis) return;

  try {
    const pipeline = redis.pipeline();
    const now = Date.now();
    const expiry = now + (ttlSeconds * 1000);

    pipeline.incr('stats:files:uploaded');
    pipeline.incrby('stats:files:storage', sizeBytes);
    
    // Type categorization
    let cat = 'Other';
    if (mimeType.startsWith('image/')) cat = 'Images';
    else if (mimeType === 'application/pdf') cat = 'PDF';
    else if (mimeType === 'application/zip' || mimeType === 'application/x-zip-compressed') cat = 'ZIP';
    else if (mimeType.includes('msword') || mimeType.includes('office') || mimeType.includes('presentation') || mimeType.includes('spreadsheet')) cat = 'Office Documents';
    else if (mimeType.startsWith('text/')) cat = 'Text Files';
    
    pipeline.incr(`stats:filetype:${cat}`);

    const currentLargest = Number(await redis.get('stats:files:largest') || 0);
    if (sizeBytes > currentLargest) {
      pipeline.set('stats:files:largest', sizeBytes);
    }

    pipeline.zadd('stats:active_codes', { score: expiry, member: JSON.stringify({ c: code, l: sizeBytes, isFile: true }) });

    const { device, os, browser } = parseUserAgent(userAgent);
    pipeline.incr(`stats:device:${device}`);
    pipeline.incr(`stats:os:${os}`);
    pipeline.incr(`stats:browser:${browser}`);
    pipeline.set(`flow_source:${code}`, device, { ex: ttlSeconds });

    const date = new Date(now);
    const dayStr = date.toISOString().split('T')[0];
    const hourStr = `${dayStr}-${date.getUTCHours().toString().padStart(2, '0')}`;
    pipeline.incr(`stats:day:${dayStr}`);
    pipeline.incr(`stats:hour:${hourStr}`);

    const event: ActivityEvent = { timestamp: now, code, type: 'FileUploaded' };
    pipeline.lpush('stats:recent_activity', JSON.stringify(event));
    pipeline.ltrim('stats:recent_activity', 0, 49);

    await pipeline.exec();
  } catch (e) {
    console.error('Error tracking file creation:', e);
  }
}

export async function trackFileDownloaded(code: string, createdTimestamp: number, sizeBytes: number, userAgent: string) {
  const redis = getRedis();
  if (!redis) return;

  try {
    const pipeline = redis.pipeline();
    const now = Date.now();

    pipeline.incr('stats:files:downloaded');

    const retrievalTimeMs = now - createdTimestamp;
    pipeline.incrby('stats:retrieval_time_sum', retrievalTimeMs);

    const { device: destDevice } = parseUserAgent(userAgent);
    const sourceDevice = await redis.get(`flow_source:${code}`);
    const flowKey = sourceDevice ? `${sourceDevice} → ${destDevice}` : `Unknown → ${destDevice}`;
    pipeline.incr(`stats:flow:${flowKey}`);

    pipeline.zrem('stats:active_codes', JSON.stringify({ c: code, l: sizeBytes, isFile: true }));
    
    const event: ActivityEvent = { timestamp: now, code, type: 'FileDownloaded' };
    pipeline.lpush('stats:recent_activity', JSON.stringify(event));
    pipeline.ltrim('stats:recent_activity', 0, 49);

    await pipeline.exec();
  } catch (e) {
    console.error('Error tracking file download:', e);
  }
}

export async function trackMessageCreated(code: string, textLength: number, userAgent: string, ttlSeconds: number) {
  const redis = getRedis();
  if (!redis) return;

  try {
    const pipeline = redis.pipeline();
    const now = Date.now();
    const expiry = now + (ttlSeconds * 1000);

    pipeline.incr('stats:total_sent');
    pipeline.incrby('stats:characters_total', textLength);
    
    // Largest message
    const currentLargest = Number(await redis.get('stats:largest_message') || 0);
    if (textLength > currentLargest) {
      pipeline.set('stats:largest_message', textLength);
    }

    // Active code tracker
    pipeline.zadd('stats:active_codes', { score: expiry, member: JSON.stringify({ c: code, l: textLength }) });

    // Devices & OS
    const { device, os, browser } = parseUserAgent(userAgent);
    pipeline.incr(`stats:device:${device}`);
    pipeline.incr(`stats:os:${os}`);
    pipeline.incr(`stats:browser:${browser}`);

    // Store source device for flow tracking
    pipeline.set(`flow_source:${code}`, device, { ex: ttlSeconds });

    // Date grouping
    const date = new Date(now);
    const dayStr = date.toISOString().split('T')[0];
    const hourStr = `${dayStr}-${date.getUTCHours().toString().padStart(2, '0')}`;
    pipeline.incr(`stats:day:${dayStr}`);
    pipeline.incr(`stats:hour:${hourStr}`);

    // Activity log
    const event: ActivityEvent = { timestamp: now, code, type: 'Created' };
    pipeline.lpush('stats:recent_activity', JSON.stringify(event));
    pipeline.ltrim('stats:recent_activity', 0, 49);

    await pipeline.exec();
  } catch (e) {
    console.error('Error tracking creation:', e);
  }
}

export async function trackMessageRetrieved(code: string, createdTimestamp: number, textLength: number, userAgent: string) {
  const redis = getRedis();
  if (!redis) return;

  try {
    const pipeline = redis.pipeline();
    const now = Date.now();

    pipeline.incr('stats:total_retrieved');

    // Retrieval time
    const retrievalTimeMs = now - createdTimestamp;
    pipeline.incrby('stats:retrieval_time_sum', retrievalTimeMs);
    
    const fastest = Number(await redis.get('stats:fastest_retrieval') || Infinity);
    const slowest = Number(await redis.get('stats:slowest_retrieval') || 0);
    
    if (retrievalTimeMs < fastest || fastest === 0) {
      pipeline.set('stats:fastest_retrieval', retrievalTimeMs);
    }
    if (retrievalTimeMs > slowest) {
      pipeline.set('stats:slowest_retrieval', retrievalTimeMs);
    }

    // Flow tracking
    const { device: destDevice } = parseUserAgent(userAgent);
    const sourceDevice = await redis.get(`flow_source:${code}`);
    const flowKey = sourceDevice ? `${sourceDevice} → ${destDevice}` : `Unknown → ${destDevice}`;
    pipeline.incr(`stats:flow:${flowKey}`);

    // Remove from active codes
    pipeline.zrem('stats:active_codes', JSON.stringify({ c: code, l: textLength }));
    
    // Activity log
    const event: ActivityEvent = { timestamp: now, code, type: 'Retrieved' };
    pipeline.lpush('stats:recent_activity', JSON.stringify(event));
    pipeline.ltrim('stats:recent_activity', 0, 49);

    await pipeline.exec();
  } catch (e) {
    console.error('Error tracking retrieval:', e);
  }
}

export async function trackBlockedIpEvent(ip: string) {
  const redis = getRedis();
  if (!redis) return;
  try {
    const event: ActivityEvent = { timestamp: Date.now(), code: 'N/A', type: 'Blocked' };
    const pipeline = redis.pipeline();
    pipeline.lpush('stats:recent_activity', JSON.stringify(event));
    pipeline.ltrim('stats:recent_activity', 0, 49);
    await pipeline.exec();
  } catch(e) {}
}

export async function getAdminOverview() {
  const redis = getRedis();
  if (!redis) {
    return { activeCodes: 0, totalTransfers: 0, successRate: 0, avgTransferTime: 0 };
  }

  const now = Date.now();
  await redis.zremrangebyscore('stats:active_codes', 0, now);

  const activeCodesCount = await redis.zcount('stats:active_codes', now, '+inf');
  const totalSent = Number(await redis.get('stats:total_sent') || 0);
  const totalRetrieved = Number(await redis.get('stats:total_retrieved') || 0);
  
  const filesUploaded = Number(await redis.get('stats:files:uploaded') || 0);
  const filesDownloaded = Number(await redis.get('stats:files:downloaded') || 0);
  
  const totalUploads = totalSent + filesUploaded;
  const totalDowns = totalRetrieved + filesDownloaded;

  const successRate = totalUploads > 0 ? ((totalDowns / totalUploads) * 100).toFixed(1) : 0;
  
  const retrievalTimeSum = Number(await redis.get('stats:retrieval_time_sum') || 0);
  const avgTransferTime = totalDowns > 0 ? (retrievalTimeSum / totalDowns / 1000).toFixed(1) : 0;

  return {
    activeCodes: activeCodesCount,
    totalTransfers: totalUploads,
    successRate: Number(successRate),
    avgTransferTime: Number(avgTransferTime)
  };
}

export async function getAdminActivity() {
  const redis = getRedis();
  if (!redis) {
    return {
      recentActivity: [], activeCodes: [], devices: {}, os: {}, browsers: {}, flows: {}, blockedIps: [], fileTypes: {},
      performance: { fastest: 0, slowest: 0 },
      messageStats: { totalSent: 0, totalRetrieved: 0, totalExpired: 0, totalActive: 0 },
      characterStats: { totalCharacters: 0, avgMessageLength: 0, largestMessage: 0 },
      fileStats: { filesUploaded: 0, totalStorage: 0, totalDownloads: 0, largestFile: 0, avgFileSize: 0 }
    };
  }

  const now = Date.now();
  await redis.zremrangebyscore('stats:active_codes', 0, now);

  const recentStrs = await redis.lrange('stats:recent_activity', 0, 49);
  const recentActivity = recentStrs.map(s => typeof s === 'string' ? JSON.parse(s) : s);

  const activeCodeStrs = await redis.zrange('stats:active_codes', 0, -1, { withScores: true });
  const activeCodes = [];
  let textActive = 0;
  for (let i = 0; i < activeCodeStrs.length; i += 2) {
    const dataVal = activeCodeStrs[i];
    const expiresAt = Number(activeCodeStrs[i + 1]);
    try {
      const { c, l, isFile } = typeof dataVal === 'string' ? JSON.parse(dataVal) : dataVal;
      activeCodes.push({ code: c, length: l, expiresAt, isFile });
      if (!isFile) textActive++;
    } catch(e) {
      activeCodes.push({ code: String(dataVal), length: 0, expiresAt, isFile: false });
      textActive++;
    }
  }

  const deviceKeys = await redis.keys('stats:device:*');
  const devices: Record<string, number> = {};
  for (const k of deviceKeys) devices[k.split(':').pop()!] = Number(await redis.get(k) || 0);

  const osKeys = await redis.keys('stats:os:*');
  const os: Record<string, number> = {};
  for (const k of osKeys) os[k.split(':').pop()!] = Number(await redis.get(k) || 0);

  const browserKeys = await redis.keys('stats:browser:*');
  const browsers: Record<string, number> = {};
  for (const k of browserKeys) browsers[k.split(':').pop()!] = Number(await redis.get(k) || 0);

  const flowKeys = await redis.keys('stats:flow:*');
  const flows: Record<string, number> = {};
  for (const k of flowKeys) flows[k.substring('stats:flow:'.length)] = Number(await redis.get(k) || 0);
  
  const fileTypeKeys = await redis.keys('stats:filetype:*');
  const fileTypes: Record<string, number> = {};
  for (const k of fileTypeKeys) fileTypes[k.split(':').pop()!] = Number(await redis.get(k) || 0);

  const blockedKeys = await redis.keys('blocked:*');
  const blockedIps = [];
  for (const k of blockedKeys) {
    const ttl = await redis.ttl(k);
    if (ttl > 0) {
      blockedIps.push({ ip: k.split(':')[1], remainingSeconds: ttl });
    }
  }

  const fastest = Number(await redis.get('stats:fastest_retrieval') || 0);
  const slowest = Number(await redis.get('stats:slowest_retrieval') || 0);

  const totalSent = Number(await redis.get('stats:total_sent') || 0);
  const totalRetrieved = Number(await redis.get('stats:total_retrieved') || 0);
  const totalExpired = Math.max(0, totalSent - totalRetrieved - textActive);
  const charsTotal = Number(await redis.get('stats:characters_total') || 0);
  const avgMessageLength = totalSent > 0 ? Math.round(charsTotal / totalSent) : 0;
  const largestMessage = Number(await redis.get('stats:largest_message') || 0);
  
  const filesUploaded = Number(await redis.get('stats:files:uploaded') || 0);
  const totalStorage = Number(await redis.get('stats:files:storage') || 0);
  const totalDownloads = Number(await redis.get('stats:files:downloaded') || 0);
  const largestFile = Number(await redis.get('stats:files:largest') || 0);
  const avgFileSize = filesUploaded > 0 ? Math.round(totalStorage / filesUploaded) : 0;

  return {
    recentActivity,
    activeCodes,
    devices,
    os,
    browsers,
    flows,
    fileTypes,
    blockedIps,
    performance: { fastest, slowest },
    messageStats: { totalSent, totalRetrieved, totalExpired, totalActive: textActive },
    characterStats: { totalCharacters: charsTotal, avgMessageLength, largestMessage },
    fileStats: { filesUploaded, totalStorage, totalDownloads, largestFile, avgFileSize }
  };
}

export async function getAdminTraffic() {
  const redis = getRedis();
  if (!redis) {
    return { last24h: [], last30d: [] };
  }

  const now = new Date();
  const hours24 = [];
  for (let i = 23; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 60 * 60 * 1000);
    const dayStr = d.toISOString().split('T')[0];
    const hourStr = `${dayStr}-${d.getUTCHours().toString().padStart(2, '0')}`;
    hours24.push({ key: `stats:hour:${hourStr}`, label: d.getUTCHours().toString().padStart(2, '0') + ':00' });
  }

  const days30 = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dayStr = d.toISOString().split('T')[0];
    days30.push({ key: `stats:day:${dayStr}`, label: d.getUTCDate().toString() });
  }

  const last24h = [];
  for (const h of hours24) {
    last24h.push({ label: h.label, transfers: Number(await redis.get(h.key) || 0) });
  }

  const last30d = [];
  for (const d of days30) {
    last30d.push({ label: d.label, transfers: Number(await redis.get(d.key) || 0) });
  }

  return { last24h, last30d };
}
