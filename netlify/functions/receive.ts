import { Handler } from '@netlify/functions';
import { getStorageProvider } from './storage';
import { getFileStorageProvider } from './storage/fileStorage';
import { trackBlockedIpEvent, trackMessageRetrieved, trackFileDownloaded } from './utils/stats';

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { code } = JSON.parse(event.body || '{}');
    
    if (!code || typeof code !== 'string' || code.length !== 4) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Invalid code format' }) };
    }

    const ip = event.headers['x-forwarded-for'] || event.headers['client-ip'] || 'unknown-ip';
    const storage = getStorageProvider();
    
    // Check if IP is blocked
    if (await storage.isIpBlocked(ip)) {
      await trackBlockedIpEvent(ip);
      return { statusCode: 429, body: JSON.stringify({ error: 'Too many invalid attempts. Try again in 1 minute.' }) };
    }

    const message = await storage.getMessage(code);
    const file = await storage.getFileMetadata(code);
    
    if (!message && !file) {
      // Register failure
      const fails = await storage.registerFailedAttempt(ip);
      if (fails >= 5) {
        await storage.blockIp(ip, 60); // block for 1 min
        await trackBlockedIpEvent(ip);
      }
      return { statusCode: 404, body: JSON.stringify({ error: 'Not found or expired' }) };
    }
    
    // Success: reset failures
    await storage.resetFailedAttempts(ip);
    
    const userAgent = event.headers['user-agent'] || 'Unknown';
    
    if (message) {
      await trackMessageRetrieved(code, message.createdAt, message.text.length, userAgent);
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'text', text: message.text })
      };
    } else if (file) {
      await trackFileDownloaded(code, file.uploadedAt, file.size, userAgent);
      const fileStorage = getFileStorageProvider();
      const downloadUrl = await fileStorage.getDownloadUrl(file.fileKey, file.filename);
      
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          type: 'file', 
          file: {
            filename: file.filename,
            size: file.size,
            mimeType: file.mimeType,
            downloadUrl
          }
        })
      };
    }
  } catch (error) {
    console.error('Receive error:', error);
    return { statusCode: 500, body: JSON.stringify({ error: 'Internal Server Error' }) };
  }
  
  return { statusCode: 500, body: 'Unknown error' };
};
