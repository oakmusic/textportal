import * as fs from 'fs';
import * as path from 'path';
import { FileStorageProvider } from './fileStorage';

const UPLOADS_DIR = path.resolve(process.cwd(), '.local-store', 'uploads');

export class LocalFileStorageProvider implements FileStorageProvider {
  constructor() {
    if (!fs.existsSync(UPLOADS_DIR)) {
      fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    }
  }

  async uploadFile(key: string, fileBuffer: Buffer, mimeType: string): Promise<void> {
    const filePath = path.join(UPLOADS_DIR, key.replace(/\//g, '_'));
    fs.writeFileSync(filePath, fileBuffer);
  }

  async getDownloadUrl(key: string, filename: string, forceDownload?: boolean): Promise<string> {
    return `/.netlify/functions/downloadLocal?key=${encodeURIComponent(key)}&filename=${encodeURIComponent(filename)}${forceDownload ? '&download=1' : ''}`;
  }

  async deleteFile(key: string): Promise<void> {
    const filePath = path.join(UPLOADS_DIR, key.replace(/\//g, '_'));
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
}
