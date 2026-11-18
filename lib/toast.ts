/**
 * File ini untuk apa:
 * "Toast" = pesan kecil singkat di pojok layar ("Berhasil disimpan", "Gagal ..."). File ini hanya
 * menyimpan daftar toast dan memberi tahu komponen <Toaster> bila ada yang berubah, jadi `toast.success(...)`
 * bisa dipanggil dari mana saja (komponen client, fungsi pembantu) tanpa Provider/Context.
 */

export type ToastTone = "success" | "error" | "info";

export interface ToastItem {
  id: number;
  tone: ToastTone;
  message: string;
}

/** Berapa lama (ms) tiap jenis toast tampil; error lebih lama supaya sempat dibaca. */
const DURATION: Record<ToastTone, number> = { success: 3500, info: 3500, error: 6000 };

let items: ToastItem[] = [];
let nextId = 1;
const listeners = new Set<() => void>();

/** Memberi tahu semua pendengar bahwa daftar berubah (daftar dibuat baru agar React sadar). */
function emit(): void {
  items = [...items];
  listeners.forEach((listener) => listener());
}

/** Menambah toast lalu menghapusnya otomatis setelah beberapa detik. */
function push(tone: ToastTone, message: string): void {
  const id = nextId++;
  items = [...items, { id, tone, message }].slice(-4); // paling banyak 4 toast sekaligus
  emit();
  setTimeout(() => dismiss(id), DURATION[tone]);
}

/** Menutup satu toast. */
export function dismiss(id: number): void {
  items = items.filter((item) => item.id !== id);
  emit();
}

/** Dipakai <Toaster> lewat useSyncExternalStore. */
export function subscribeToasts(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
export function getToasts(): ToastItem[] {
  return items;
}

/** Cara pakai: toast.success("Tersimpan"), toast.error("Gagal ..."), toast.info("..."). */
export const toast = {
  success: (message: string) => push("success", message),
  error: (message: string) => push("error", message),
  info: (message: string) => push("info", message),
};
