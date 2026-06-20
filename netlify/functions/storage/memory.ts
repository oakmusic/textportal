import * as fs from 'fs';
import * as path from 'path';
import { StorageProvider, TextData, FileMetadata } from './provider';

interface StoreState {
  store: Record<string, { data: TextData, expiresAt: number }>;
  files: Record<string, { data: FileMetadata, expiresAt: number }>;
  fails: Record<string, { count: number, resetAt: number }>;
  blocks: Record<string, number>;
  rateLimits: Record<string, { size: number, count: number, resetAt: number }>;
}

const STORE_PATH = path.resolve(process.cwd(), '.local-store.json');

export class MemoryStorageProvider implements StorageProvider {
  private readState(): StoreState {
    try {
      if (fs.existsSync(STORE_PATH)) {
        const data = fs.readFileSync(STORE_PATH, 'utf-8');
        const parsed = JSON.parse(data);
        return {
          store: parsed.store || {},
          files: parsed.files || {},
          fails: parsed.fails || {},
          blocks: parsed.blocks || {},
          rateLimits: parsed.rateLimits || {}
        };
      }
    } catch (e) {
      console.error('Error reading local store', e);
    }
    return { store: {}, files: {}, fails: {}, blocks: {}, rateLimits: {} };
  }

  private writeState(state: StoreState) {
    try {
      fs.writeFileSync(STORE_PATH, JSON.stringify(state, null, 2), 'utf-8');
    } catch (e) {
      console.error('Error writing local store', e);
    }
  }

  async saveMessage(code: string, text: string, ttlSeconds: number): Promise<boolean> {
    const state = this.readState();
    this.cleanup(state);
    
    if (state.store[code] || state.files[code]) {
      return false; // already exists
    }
    
    state.store[code] = {
      data: { text, createdAt: Date.now() },
      expiresAt: Date.now() + (ttlSeconds * 1000)
    };
    
    this.writeState(state);
    return true;
  }

  async getMessage(code: string): Promise<TextData | null> {
    const state = this.readState();
    this.cleanup(state);
    this.writeState(state);
    
    const item = state.store[code];
    if (!item) return null;
    return item.data;
  }

  async saveFileMetadata(code: string, metadata: FileMetadata, ttlSeconds: number): Promise<boolean> {
    const state = this.readState();
    this.cleanup(state);
    
    if (state.store[code] || state.files[code]) {
      return false; // already exists
    }
    
    state.files[code] = {
      data: metadata,
      expiresAt: Date.now() + (ttlSeconds * 1000)
    };
    
    this.writeState(state);
    return true;
  }

  async getFileMetadata(code: string): Promise<FileMetadata | null> {
    const state = this.readState();
    this.cleanup(state);
    this.writeState(state);
    
    const item = state.files[code];
    if (!item) return null;
    return item.data;
  }

  async deleteMessage(code: string): Promise<void> {
    const state = this.readState();
    delete state.store[code];
    delete state.files[code];
    this.writeState(state);
  }

  async getTTL(code: string): Promise<number> {
    const state = this.readState();
    this.cleanup(state);
    this.writeState(state);
    
    const item = state.store[code] || state.files[code];
    if (!item) return -1;
    return Math.max(0, Math.floor((item.expiresAt - Date.now()) / 1000));
  }

  async registerFailedAttempt(ip: string): Promise<number> {
    const state = this.readState();
    this.cleanup(state);
    
    const now = Date.now();
    let current = state.fails[ip];
    
    if (!current || current.resetAt < now) {
      current = { count: 0, resetAt: now + (5 * 60 * 1000) }; // reset fail count after 5 mins
    }
    
    current.count += 1;
    state.fails[ip] = current;
    this.writeState(state);
    
    return current.count;
  }

  async resetFailedAttempts(ip: string): Promise<void> {
    const state = this.readState();
    delete state.fails[ip];
    this.writeState(state);
  }

  async blockIp(ip: string, durationSeconds: number): Promise<void> {
    const state = this.readState();
    state.blocks[ip] = Date.now() + (durationSeconds * 1000);
    this.writeState(state);
  }

  async isIpBlocked(ip: string): Promise<boolean> {
    const state = this.readState();
    this.cleanup(state);
    this.writeState(state);
    
    const expiresAt = state.blocks[ip];
    if (!expiresAt) return false;
    return expiresAt > Date.now();
  }

  async trackFileUploadRateLimit(ip: string, sizeBytes: number): Promise<{ size: number; count: number }> {
    const state = this.readState();
    this.cleanup(state);
    
    const today = new Date().toISOString().split('T')[0];
    const key = `${ip}:${today}`;
    let current = state.rateLimits[key];
    
    if (!current) {
      current = { size: 0, count: 0, resetAt: Date.now() + 86400000 };
    }
    
    current.size += sizeBytes;
    current.count += 1;
    state.rateLimits[key] = current;
    
    this.writeState(state);
    return { size: current.size, count: current.count };
  }

  async getActiveFileCodes(): Promise<string[]> {
    const state = this.readState();
    this.cleanup(state);
    return Object.keys(state.files);
  }

  async removeActiveFileCode(code: string): Promise<void> {
    // Handled by deleteMessage/cleanup
  }

  // Helper to cleanup expired entries
  private cleanup(state: StoreState) {
    const now = Date.now();
    for (const k of Object.keys(state.store)) {
      if (state.store[k].expiresAt <= now) delete state.store[k];
    }
    for (const k of Object.keys(state.files || {})) {
      if (state.files[k].expiresAt <= now) delete state.files[k];
    }
    for (const k of Object.keys(state.fails)) {
      if (state.fails[k].resetAt <= now) delete state.fails[k];
    }
    for (const k of Object.keys(state.blocks)) {
      if (state.blocks[k] <= now) delete state.blocks[k];
    }
    for (const k of Object.keys(state.rateLimits || {})) {
      if (state.rateLimits[k].resetAt <= now) delete state.rateLimits[k];
    }
  }
}
