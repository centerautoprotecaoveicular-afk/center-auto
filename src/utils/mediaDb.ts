import { useState, useEffect } from 'react';

const DB_NAME = 'centerauto_media_db';
const DB_VERSION = 1;
const STORE_NAME = 'media_files';

interface MediaRecord {
  id: string;
  blob: Blob;
  name: string;
  type: string;
  createdAt: number;
}

// In-memory cache of idb:// references -> blob: object URLs
const objectUrlCache = new Map<string, string>();

function openMediaDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB não suportado neste navegador.'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Erro ao abrir IndexedDB'));
  });
}

export function isIndexedDbMediaRef(src?: string): boolean {
  return Boolean(src && src.startsWith('idb://'));
}

export function getCachedMediaUrl(src: string): string {
  if (!src) return '';
  if (!isIndexedDbMediaRef(src)) return src;
  return objectUrlCache.get(src) || '';
}

export async function saveMediaFile(file: File | Blob): Promise<string> {
  const id = `idb://media_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const db = await openMediaDb();

  const record: MediaRecord = {
    id,
    blob: file,
    name: (file as File).name || 'arquivo',
    type: file.type || '',
    createdAt: Date.now(),
  };

  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.put(record);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error || new Error('Erro ao salvar arquivo no banco local'));
    tx.oncomplete = () => db.close();
    tx.onerror = () => db.close();
  });

  // Pre-warm cache immediately so the UI renders without delay
  const blobUrl = URL.createObjectURL(file);
  objectUrlCache.set(id, blobUrl);

  return id;
}

export async function getMediaBlobUrl(ref: string): Promise<string> {
  if (!ref) return '';
  if (!isIndexedDbMediaRef(ref)) return ref;

  const cached = objectUrlCache.get(ref);
  if (cached) return cached;

  try {
    const db = await openMediaDb();
    const record = await new Promise<MediaRecord | undefined>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(ref);
      req.onsuccess = () => resolve(req.result as MediaRecord | undefined);
      req.onerror = () => reject(req.error);
      tx.oncomplete = () => db.close();
      tx.onerror = () => db.close();
    });

    if (record && record.blob) {
      const url = URL.createObjectURL(record.blob);
      objectUrlCache.set(ref, url);
      return url;
    }
  } catch (err) {
    console.error('Erro ao carregar mídia do IndexedDB:', err);
  }

  return '';
}

export async function deleteMediaFile(ref: string): Promise<void> {
  if (!isIndexedDbMediaRef(ref)) return;

  const cached = objectUrlCache.get(ref);
  if (cached) {
    URL.revokeObjectURL(cached);
    objectUrlCache.delete(ref);
  }

  try {
    const db = await openMediaDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(ref);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
      tx.oncomplete = () => db.close();
      tx.onerror = () => db.close();
    });
  } catch (err) {
    console.warn('Erro ao remover mídia do IndexedDB:', err);
  }
}

export function useResolvedMediaUrl(src: string): string {
  const [resolved, setResolved] = useState<string>(() => getCachedMediaUrl(src));

  useEffect(() => {
    let active = true;

    if (!src) {
      setResolved('');
      return;
    }

    if (!isIndexedDbMediaRef(src)) {
      setResolved(src);
      return;
    }

    const cached = getCachedMediaUrl(src);
    if (cached) {
      setResolved(cached);
      return;
    }

    getMediaBlobUrl(src).then((url) => {
      if (active) {
        setResolved(url);
      }
    });

    return () => {
      active = false;
    };
  }, [src]);

  return resolved;
}
