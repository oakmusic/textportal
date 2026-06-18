import { Handler } from '@netlify/functions';
import * as cookie from 'cookie';
import { clearAdminSession } from './utils/auth';

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  await clearAdminSession(event);

  const cookieString = cookie.serialize('admin_session', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0,
    path: '/'
  });

  return {
    statusCode: 200,
    headers: {
      'Set-Cookie': cookieString,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ success: true })
  };
};
