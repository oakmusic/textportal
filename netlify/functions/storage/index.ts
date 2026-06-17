import { StorageProvider } from './provider';
import { MemoryStorageProvider } from './memory';
import { RedisStorageProvider } from './redis';

let providerInstance: StorageProvider | null = null;

export function getStorageProvider(): StorageProvider {
  if (providerInstance) return providerInstance;
  
  const providerType = process.env.STORAGE_PROVIDER || 'memory';
  
  if (providerType === 'redis') {
    try {
      providerInstance = new RedisStorageProvider();
      console.log('Using Redis Storage Provider');
    } catch (e) {
      console.error('Failed to initialize Redis provider, falling back to memory', e);
      providerInstance = new MemoryStorageProvider();
    }
  } else {
    providerInstance = new MemoryStorageProvider();
    console.log('Using Memory Storage Provider');
  }
  
  return providerInstance;
}
