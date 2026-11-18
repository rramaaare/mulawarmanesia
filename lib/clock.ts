/**
 * File ini untuk apa:
 * Satu-satunya tempat membaca "waktu sekarang" untuk halaman server. Dipisah supaya jelas bahwa
 * nilainya dikirim ke komponen client sebagai prop (snapshot), sehingga hasil render di server dan
 * di browser sama persis dan tidak terjadi hydration mismatch.
 */

/** Waktu sekarang dalam milidetik (sama dengan Date.now()). */
export function nowMs(): number {
  return Date.now();
}
