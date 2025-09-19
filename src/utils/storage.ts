// IndexedDB utilities for storing highlights and annotations
const DB_NAME = 'pdf-assistant';
const DB_VERSION = 1;
const HIGHLIGHTS_STORE = 'highlights';

export interface Highlight {
  id: string;
  documentId: string;
  page: number;
  text: string;
  bbox: number[];
  color: string;
  note?: string;
  createdAt: Date;
}

class StorageManager {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains(HIGHLIGHTS_STORE)) {
          const store = db.createObjectStore(HIGHLIGHTS_STORE, { keyPath: 'id' });
          store.createIndex('documentId', 'documentId', { unique: false });
          store.createIndex('page', 'page', { unique: false });
        }
      };
    });
  }

  async saveHighlight(highlight: Highlight): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([HIGHLIGHTS_STORE], 'readwrite');
      const store = transaction.objectStore(HIGHLIGHTS_STORE);
      const request = store.put(highlight);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getHighlights(documentId: string): Promise<Highlight[]> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([HIGHLIGHTS_STORE], 'readonly');
      const store = transaction.objectStore(HIGHLIGHTS_STORE);
      const index = store.index('documentId');
      const request = index.getAll(documentId);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async deleteHighlight(id: string): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([HIGHLIGHTS_STORE], 'readwrite');
      const store = transaction.objectStore(HIGHLIGHTS_STORE);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async updateHighlight(highlight: Partial<Highlight> & { id: string }): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([HIGHLIGHTS_STORE], 'readwrite');
      const store = transaction.objectStore(HIGHLIGHTS_STORE);
      
      const getRequest = store.get(highlight.id);
      getRequest.onsuccess = () => {
        const existingHighlight = getRequest.result;
        if (existingHighlight) {
          const updatedHighlight = { ...existingHighlight, ...highlight };
          const putRequest = store.put(updatedHighlight);
          putRequest.onsuccess = () => resolve();
          putRequest.onerror = () => reject(putRequest.error);
        } else {
          reject(new Error('Highlight not found'));
        }
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  }
}

export const storageManager = new StorageManager();