import { Handler } from '@netlify/functions';
import { verifyAdminSession } from './utils/auth';

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const authorized = await verifyAdminSession(event);
  
  if (!authorized) {
    return { statusCode: 401, body: JSON.stringify({ authorized: false }) };
  }

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ authorized: true })
  };
};
