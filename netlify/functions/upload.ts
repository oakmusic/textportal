import { Handler } from '@netlify/functions';
import Busboy from 'busboy';
import { getStorageProvider } from './storage';
import { getFileStorageProvider } from './storage/fileStorage';
import { generateCode } from './utils/codeGenerator';
import { trackFileUploaded } from './utils/stats';

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const MAX_FILE_SIZE = 50 * 1024 * 1024;
const TTL_SECONDS = 24 * 60 * 60; // 24 hours

const DANGEROUS_EXTENSIONS = ['.exe', '.bat', '.cmd', '.ps1', '.msi', '.vbs', '.scr'];

function isImage(mimeType: string) {
  return mimeType.startsWith('image/') && ['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(mimeType);
}

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const ip = event.headers['x-forwarded-for'] || event.headers['client-ip'] || 'unknown-ip';
  const storage = getStorageProvider();

  return new Promise((resolve) => {
    // Determine content type for Busboy
    let contentType = event.headers['content-type'] || event.headers['Content-Type'];
    if (!contentType) {
      return resolve({ statusCode: 400, body: JSON.stringify({ error: 'Missing Content-Type header' }) });
    }

    const busboy = Busboy({
      headers: { 'content-type': contentType },
      limits: {
        fileSize: MAX_FILE_SIZE,
        files: 1
      }
    });

    let fileData: Buffer[] = [];
    let uploadError: string | null = null;
    let fileMeta: { filename: string; mimeType: string; size: number } | null = null;

    busboy.on('file', (name, file, info) => {
      const { filename, mimeType } = info;
      
      const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'));
      if (DANGEROUS_EXTENSIONS.includes(ext)) {
        uploadError = 'Dangerous file types are not allowed.';
        file.resume();
        return;
      }

      fileMeta = { filename, mimeType, size: 0 };

      file.on('data', (data) => {
        fileData.push(data);
        fileMeta!.size += data.length;
        
        const isImg = isImage(mimeType);
        const limit = isImg ? MAX_IMAGE_SIZE : MAX_FILE_SIZE;

        if (fileMeta!.size > limit) {
          uploadError = `File exceeds the limit of ${limit / (1024 * 1024)}MB.`;
          file.resume(); // drain stream
        }
      });
    });

    busboy.on('finish', async () => {
      if (uploadError) {
        return resolve({ statusCode: 400, body: JSON.stringify({ error: uploadError }) });
      }
      if (!fileMeta || fileData.length === 0) {
        return resolve({ statusCode: 400, body: JSON.stringify({ error: 'No file uploaded.' }) });
      }

      const fileBuffer = Buffer.concat(fileData);

      try {
        // Rate limits
        const { size, count } = await storage.trackFileUploadRateLimit(ip, fileBuffer.length);
        if (size > 100 * 1024 * 1024 || count > 10) {
          return resolve({ statusCode: 429, body: JSON.stringify({ error: 'Daily upload limit reached.' }) });
        }

        const fileStorage = getFileStorageProvider();
        let code = '';
        let saved = false;
        let attempts = 0;
        let fileKey = '';

        while (!saved && attempts < 5) {
          code = generateCode(4);
          fileKey = `uploads/${code}/${fileMeta.filename.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
          
          saved = await storage.saveFileMetadata(code, {
            type: 'file',
            fileKey,
            filename: fileMeta.filename,
            size: fileMeta.size,
            mimeType: fileMeta.mimeType,
            uploadedAt: Date.now()
          }, TTL_SECONDS);
          attempts++;
        }

        if (!saved) {
          return resolve({ statusCode: 500, body: JSON.stringify({ error: 'Failed to generate unique code.' }) });
        }

        // Upload to R2 / Local
        await fileStorage.uploadFile(fileKey, fileBuffer, fileMeta.mimeType);

        // Track stats
        const userAgent = event.headers['user-agent'] || 'Unknown';
        await trackFileUploaded(code, fileMeta.size, fileMeta.mimeType, userAgent, TTL_SECONDS);

        const baseUrl = process.env.VITE_APP_URL || 'http://localhost:5173';
        const url = `${baseUrl}/r/${code}`;

        resolve({
          statusCode: 200,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code, url })
        });

      } catch (err) {
        console.error('Upload error:', err);
        resolve({ statusCode: 500, body: JSON.stringify({ error: 'Internal Server Error' }) });
      }
    });

    if (event.isBase64Encoded) {
      busboy.write(Buffer.from(event.body || '', 'base64'));
    } else {
      busboy.write(event.body || '');
    }
    busboy.end();
  });
};
