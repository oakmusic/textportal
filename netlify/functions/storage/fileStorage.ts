import { R2StorageProvider } from './r2';
import { LocalFileStorageProvider } from './local';

export interface FileStorageProvider {
  uploadFile(key: string, fileBuffer: Buffer, mimeType: string): Promise<void>;
  getDownloadUrl(key: string, filename: string): Promise<string>;
  deleteFile(key: string): Promise<void>;
}

let providerInstance: FileStorageProvider | null = null;

export function getFileStorageProvider(): FileStorageProvider {
  if (providerInstance) return providerInstance;
  
  const providerType = process.env.FILE_STORAGE_PROVIDER || 'local';
  
  if (providerType === 'r2') {
    providerInstance = new R2StorageProvider();
    console.log('Using R2 File Storage Provider');
  } else {
    providerInstance = new LocalFileStorageProvider();
    console.log('Using Local File Storage Provider');
  }
  
  return providerInstance;
}
