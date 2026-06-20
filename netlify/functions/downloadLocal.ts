import { Handler } from '@netlify/functions';
import * as fs from 'fs';
import * as path from 'path';

const UPLOADS_DIR = path.resolve(process.cwd(), '.local-store', 'uploads');

export const handler: Handler = async (event) => {
  const { key, filename } = event.queryStringParameters || {};
  if (!key) return { statusCode: 400, body: 'Missing key' };

  const filePath = path.join(UPLOADS_DIR, key.replace(/\//g, '_'));
  
  if (!fs.existsSync(filePath)) {
    return { statusCode: 404, body: 'File not found' };
  }

  const fileBuffer = fs.readFileSync(filePath);

  const ext = path.extname(filename || '').toLowerCase();
  let contentType = 'application/octet-stream';
  let disposition = 'attachment';

  if (['.jpg', '.jpeg'].includes(ext)) contentType = 'image/jpeg';
  else if (ext === '.png') contentType = 'image/png';
  else if (ext === '.webp') contentType = 'image/webp';
  else if (ext === '.gif') contentType = 'image/gif';

  if (contentType.startsWith('image/')) {
    disposition = 'inline';
  }

  return {
    statusCode: 200,
    headers: {
      'Content-Disposition': `${disposition}; filename="${filename || 'download'}"`,
      'Content-Type': contentType,
    },
    body: fileBuffer.toString('base64'),
    isBase64Encoded: true,
  };
};
