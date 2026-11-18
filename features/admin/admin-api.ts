/**
 * File ini untuk apa:
 * Satu fungsi kecil untuk memanggil route API admin dari komponen client, supaya tiap komponen
 * tidak menulis ulang fetch + pembacaan JSON. Mengembalikan hasil dalam bentuk seragam, dan
 * otomatis memunculkan toast: hijau bila berhasil (teks dari `successMessage`), merah bila gagal.
 */

import { toast } from "@/lib/toast";

/** Hasil pemanggilan API: ok = berhasil; selain itu `message` berisi pesan error untuk pengguna. */
export interface AdminApiResult {
  ok: boolean;
  message?: string;
  fields?: Record<string, string>;
}

/** Mengirim `body` (JSON) ke `url` dengan metode `method`, lalu merapikan hasilnya dan menampilkan toast. */
export async function callAdminApi(url: string, method: "POST" | "PATCH", body: unknown, successMessage = "Berhasil disimpan."): Promise<AdminApiResult> {
  const result = await request(url, method, body);
  if (result.ok) toast.success(successMessage);
  else toast.error(result.message ?? "Gagal menyimpan. Coba lagi.");
  return result;
}

/** Bagian yang benar-benar memanggil server (tanpa toast). */
async function request(url: string, method: "POST" | "PATCH", body: unknown): Promise<AdminApiResult> {
  try {
    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then((r) => r.json());
    // Pesan pertama dari error field dipakai bila ada (mis. "[!] Masukkan angka...")
    const firstField = response.fields ? Object.values<string>(response.fields)[0] : undefined;
    return { ok: Boolean(response.ok), message: firstField ?? response.message, fields: response.fields };
  } catch {
    return { ok: false, message: "Tidak bisa menghubungi server. Coba lagi." };
  }
}
