import { Handler } from '@netlify/functions';
import { getStorageProvider } from './storage';

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const code = event.queryStringParameters?.code;
    
    if (!code || code.length !== 4) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Invalid code' }) };
    }

    const storage = getStorageProvider();
    
    const message = await storage.getMessage(code);
    const ttlRemaining = await storage.getTTL(code);
    
    if (!message || ttlRemaining < 0) {
      return { statusCode: 404, body: JSON.stringify({ error: 'Message not found or expired' }) };
    }
    
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: true, text: message.text, ttlRemaining })
    };
  } catch (error) {
    console.error('Message info error:', error);
    return { statusCode: 500, body: JSON.stringify({ error: 'Internal Server Error' }) };
  }
};
