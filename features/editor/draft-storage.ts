/**
 * File ini untuk apa:
 * Menyimpan draf desain di browser supaya tidak hilang saat tab ditutup (PRD §6).
 *  - Data desain (teks kecil)  -> localStorage
 *  - File logo (bisa sampai 5 MB) -> IndexedDB, karena localStorage hanya ±5 MB
 * Semua fungsi aman dipanggil walau penyimpanan diblokir (mengembalikan null / diam).
 */
import type { DesignState } from "./types";

const DRAFT_KEY = "mlw_draft_v1";
const DB_NAME = "mlw_files";
const STORE = "files";

// ---------- IndexedDB: penyimpanan file ----------

/** Membuka database IndexedDB (membuat "store" file jika belum ada). */
function openFileDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/** Menyimpan satu file dengan kunci tertentu. */
export async function saveFile(key: string, file: Blob): Promise<void> {
  try {
    const db = await openFileDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).put(file, key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    /* penyimpanan diblokir: abaikan, file tetap ada di memori selama tab terbuka */
  }
}

/** Mengambil file berdasarkan kunci; null jika tidak ada. */
export async function loadFile(key: string): Promise<Blob | null> {
  try {
    const db = await openFileDb();
    return await new Promise<Blob | null>((resolve, reject) => {
      const request = db.transaction(STORE, "readonly").objectStore(STORE).get(key);
      request.onsuccess = () => resolve((request.result as Blob | undefined) ?? null);
      request.onerror = () => reject(request.error);
    });
  } catch {
    return null;
  }
}

// ---------- localStorage: data desain ----------

/** Menyimpan desain (tanpa previewUrl, karena URL blob tidak berlaku lagi setelah tab ditutup). */
export function saveDraft(design: DesignState): void {
  try {
    const plain: DesignState = { ...design, images: design.images.map(({ previewUrl, ...rest }) => { void previewUrl; return rest; }) };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(plain));
  } catch {
    /* kuota penuh atau diblokir: abaikan */
  }
}

/** Membaca draf; null jika belum ada atau rusak. */
export function loadDraft(): DesignState | null {
  try {
    const text = localStorage.getItem(DRAFT_KEY);
    // Draf lama (sebelum ada model) diselaraskan oleh syncModelWithCategory saat dibuka
    return text ? (JSON.parse(text) as DesignState) : null;
  } catch {
    return null;
  }
}

/** Membuat URL pratinjau untuk setiap logo dari file di IndexedDB. */
export async function restorePreviews(design: DesignState): Promise<DesignState> {
  const images = await Promise.all(
    design.images.map(async (image) => {
      const blob = await loadFile(image.fileKey);
      return blob ? { ...image, previewUrl: URL.createObjectURL(blob) } : null;
    }),
  );
  return { ...design, images: images.filter((image): image is NonNullable<typeof image> => image !== null) };
}
