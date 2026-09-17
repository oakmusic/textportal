export interface SharedData {
  id?: string;
  file?: File | Blob;
  fileName?: string;
  fileType?: string;
  fileSize?: number;
  text?: string;
  title?: string;
  url?: string;
  timestamp: number;
}

const DB_NAME = 'textportal_pwa_share_db';
const STORE_NAME = 'shared_items';
const DB_VERSION = 1;
const PENDING_KEY = 'pending_share';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      return reject(new Error('IndexedDB is not supported'));
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveSharedItem(data: Omit<SharedData, 'id'>): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    const item: SharedData = {
      ...data,
      id: PENDING_KEY,
    };

    store.put(item);

    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error);
    };
  });
}

export async function getAndClearSharedItem(): Promise<SharedData | null> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(PENDING_KEY);

      req.onsuccess = () => {
        const result = req.result as SharedData | undefined;
        if (result) {
          store.delete(PENDING_KEY);
        }
        tx.oncomplete = () => {
          db.close();
          resolve(result || null);
        };
      };

      req.onerror = () => {
        db.close();
        reject(req.error);
      };
      tx.onerror = () => {
        db.close();
        reject(tx.error);
      };
    });
  } catch (err) {
    console.warn('[sharedStore] Failed to get shared item:', err);
    return null;
  }
}
