import { Handler } from '@netlify/functions';
import { getStorageProvider } from './storage';

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
      return { statusCode: 429, body: JSON.stringify({ error: 'Too many invalid attempts. Try again in 5 minutes.' }) };
    }

    const message = await storage.getMessage(code);
    
    if (!message) {
      // Register failure
      const fails = await storage.registerFailedAttempt(ip);
      if (fails >= 3) {
        await storage.blockIp(ip, 300); // block for 5 mins
      }
      return { statusCode: 404, body: JSON.stringify({ error: 'Message not found or expired' }) };
    }
    
    // Success: reset failures and return message
    await storage.resetFailedAttempts(ip);
    
    // Message should be single-read? The requirement says:
    // "No history. Texts automatically expire after 5 minutes." 
    // It doesn't explicitly say read-once, but usually short codes are.
    // If it expires after 5 mins naturally TTL, we leave it, or we delete on read.
    // Let's delete on read for security, if someone else guesses it. Actually, wait.
    // "Texts automatically expire after 5 minutes." Let's keep it until TTL expires so they can refresh,
    // or let's just let it naturally expire. "Messages expire automatically after: 300 seconds".
    // We will let TTL handle it so they don't lose it if they reload.
    
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: true, text: message.text })
    };
  } catch (error) {
    console.error('Receive error:', error);
    return { statusCode: 500, body: JSON.stringify({ error: 'Internal Server Error' }) };
  }
};
