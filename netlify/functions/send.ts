import { Handler } from '@netlify/functions';
import { getStorageProvider } from './storage';
import { generateCode } from './utils/codeGenerator';

const MAX_LENGTH = 20000;
const TTL_SECONDS = 300; // 5 minutes

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { text } = JSON.parse(event.body || '{}');
    
    if (!text || typeof text !== 'string' || text.trim() === '') {
      return { statusCode: 400, body: JSON.stringify({ error: 'Text is empty' }) };
    }
    
    if (text.length > MAX_LENGTH) {
      return { statusCode: 400, body: JSON.stringify({ error: `Text exceeds ${MAX_LENGTH} characters` }) };
    }

    const storage = getStorageProvider();
    
    // Generate unique code (try a few times)
    let code = '';
    let saved = false;
    let attempts = 0;
    
    while (!saved && attempts < 5) {
      code = generateCode(4);
      saved = await storage.saveMessage(code, text, TTL_SECONDS);
      attempts++;
    }
    
    if (!saved) {
      return { statusCode: 500, body: JSON.stringify({ error: 'Failed to generate unique code' }) };
    }
    
    const baseUrl = process.env.VITE_APP_URL || 'http://localhost:5173';
    const url = `${baseUrl}/r/${code}`;
    
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, url })
    };
  } catch (error) {
    console.error('Send error:', error);
    return { statusCode: 500, body: JSON.stringify({ error: 'Internal Server Error' }) };
  }
};
