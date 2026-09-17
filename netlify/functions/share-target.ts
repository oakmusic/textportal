import { Handler } from '@netlify/functions';
import Busboy from 'busboy';
import { getStorageProvider } from './storage';
import { getFileStorageProvider } from './storage/fileStorage';
import { generateCode } from './utils/codeGenerator';
import { trackFileUploaded } from './utils/stats';

const MAX_IMAGE_SIZE = 15 * 1024 * 1024;
const MAX_FILE_SIZE = 50 * 1024 * 1024;
const TTL_SECONDS = 30 * 60; // 30 minutes

const DANGEROUS_EXTENSIONS = ['.exe', '.bat', '.cmd', '.ps1', '.msi', '.vbs', '.scr'];

function isImage(mimeType: string) {
  return mimeType.startsWith('image/') && ['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(mimeType);
}

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 303,
      headers: { Location: '/send' }
    };
  }

  const ip = event.headers['x-forwarded-for'] || event.headers['client-ip'] || 'unknown-ip';
  const storage = getStorageProvider();

  return new Promise((resolve) => {
    const contentType = event.headers['content-type'] || event.headers['Content-Type'];
    if (!contentType) {
      return resolve({
        statusCode: 303,
        headers: { Location: '/send' }
      });
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

    busboy.on('file', (_name, file, info) => {
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
          file.resume();
        }
      });
    });

    busboy.on('finish', async () => {
      if (uploadError || !fileMeta || fileData.length === 0) {
        return resolve({
          statusCode: 303,
          headers: { Location: '/send' }
        });
      }

      const fileBuffer = Buffer.concat(fileData);

      try {
        const { size, count } = await storage.trackFileUploadRateLimit(ip, fileBuffer.length);
        if (size > 100 * 1024 * 1024 || count > 10) {
          return resolve({
            statusCode: 303,
            headers: { Location: '/send' }
          });
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
          return resolve({
            statusCode: 303,
            headers: { Location: '/send' }
          });
        }

        await fileStorage.uploadFile(fileKey, fileBuffer, fileMeta.mimeType);

        const userAgent = event.headers['user-agent'] || 'Unknown';
        await trackFileUploaded(code, fileMeta.size, fileMeta.mimeType, userAgent, TTL_SECONDS);

        // Redirect directly to the received result page
        resolve({
          statusCode: 303,
          headers: {
            Location: `/r/${code}`
          }
        });

      } catch (err) {
        console.error('Server share-target upload error:', err);
        resolve({
          statusCode: 303,
          headers: { Location: '/send' }
        });
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
