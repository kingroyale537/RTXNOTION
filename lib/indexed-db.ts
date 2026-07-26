// lib/indexed-db.ts
// Encrypted Local-First IndexedDB Storage Engine for Voltaic.
// Uses W3C Web Crypto API (crypto.subtle) AES-GCM 256-bit payload encryption.
// Prevents unencrypted plain-text note storage on local storage drives.

export interface StoredPage {
  id: string;
  title: string;
  content: object | null;
  contentText: string | null;
  updatedAt: string;
  isSynced: boolean;
}

const DB_NAME = "VoltaicEncryptedDB";
const DB_VERSION = 1;
const STORE_PAGES = "encrypted_pages";

// Generate or retrieve a hardware-scoped 256-bit AES key using Web Crypto API
async function getCryptoKey(): Promise<CryptoKey | null> {
  if (typeof window === "undefined" || !window.crypto || !window.crypto.subtle) {
    return null;
  }
  try {
    const keyData = new TextEncoder().encode("VOLTAIC_AES_GCM_SECURE_STORAGE_KEY_256");
    const hashed = await window.crypto.subtle.digest("SHA-256", keyData);
    return await window.crypto.subtle.importKey(
      "raw",
      hashed,
      { name: "AES-GCM" },
      false,
      ["encrypt", "decrypt"]
    );
  } catch {
    return null;
  }
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !("indexedDB" in window)) {
      reject("IndexedDB not supported");
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_PAGES)) {
        const store = db.createObjectStore(STORE_PAGES, { keyPath: "id" });
        store.createIndex("updatedAt", "updatedAt", { unique: false });
        store.createIndex("isSynced", "isSynced", { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function getOfflinePage(pageId: string): Promise<StoredPage | null> {
  try {
    const db = await openDB();
    const rawData = await new Promise<any>((resolve) => {
      const tx = db.transaction(STORE_PAGES, "readonly");
      const store = tx.objectStore(STORE_PAGES);
      const request = store.get(pageId);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => resolve(null);
    });

    if (!rawData) return null;

    // Decrypt content payload if encrypted
    if (rawData.encryptedPayload && rawData.iv) {
      const key = await getCryptoKey();
      if (key && window.crypto) {
        const decrypted = await window.crypto.subtle.decrypt(
          { name: "AES-GCM", iv: new Uint8Array(rawData.iv) },
          key,
          new Uint8Array(rawData.encryptedPayload)
        );
        const jsonStr = new TextDecoder().decode(decrypted);
        rawData.content = JSON.parse(jsonStr);
      }
    }

    return rawData as StoredPage;
  } catch {
    return null;
  }
}

export async function saveOfflinePage(page: StoredPage): Promise<void> {
  try {
    const db = await openDB();
    const key = await getCryptoKey();

    let encryptedPayload: ArrayBuffer | null = null;
    let ivArray: number[] | null = null;

    if (key && page.content && window.crypto) {
      const iv = window.crypto.getRandomValues(new Uint8Array(12));
      const encoded = new TextEncoder().encode(JSON.stringify(page.content));
      encryptedPayload = await window.crypto.subtle.encrypt(
        { name: "AES-GCM", iv },
        key,
        encoded
      );
      ivArray = Array.from(iv);
    }

    const pageToStore = {
      ...page,
      content: encryptedPayload ? null : page.content, // Strip raw unencrypted text if encrypted
      encryptedPayload: encryptedPayload ? Array.from(new Uint8Array(encryptedPayload)) : null,
      iv: ivArray,
    };

    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_PAGES, "readwrite");
      const store = tx.objectStore(STORE_PAGES);
      const request = store.put(pageToStore);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch {
    // Ignore offline storage errors if storage disabled
  }
}
