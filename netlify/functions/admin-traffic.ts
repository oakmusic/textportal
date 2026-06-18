import { Handler } from '@netlify/functions';
import { verifyAdminSession } from './utils/auth';
import { getAdminTraffic } from './utils/stats';

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const authorized = await verifyAdminSession(event);
  if (!authorized) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }) };
  }

  try {
    const data = await getAdminTraffic();
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    };
  } catch (error) {
    console.error('Admin traffic error:', error);
    return { statusCode: 500, body: JSON.stringify({ error: 'Internal Server Error' }) };
  }
};
