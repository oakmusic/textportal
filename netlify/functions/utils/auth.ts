import * as cookie from 'cookie';
import * as crypto from 'crypto';

function getAdminSecret() {
  return process.env.ADMIN_PASSWORD || 'default_secret';
}

function generateToken() {
  return crypto.createHmac('sha256', getAdminSecret()).update('admin_session').digest('hex');
}

export async function createAdminSession(): Promise<string> {
  return generateToken();
}

export async function verifyAdminSession(event: any): Promise<boolean> {
  const cookieHeader = event.headers.cookie;
  if (!cookieHeader) return false;
  
  const cookies = cookie.parse(cookieHeader);
  const token = cookies.admin_session;
  if (!token) return false;

  return token === generateToken();
}

export async function clearAdminSession(event: any): Promise<void> {
  // Stateless session, so clearing is just handled by removing the cookie in the route
}
