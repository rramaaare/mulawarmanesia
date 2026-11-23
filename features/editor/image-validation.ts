/**
 * File ini untuk apa:
 * Memeriksa file logo di browser SEBELUM ditambahkan ke desain (PRD §10.2):
 * format, ukuran, dan resolusi. Server memeriksa ulang (isi file) saat unggah.
 */
import { MAX_LOGO_BYTES } from "@/lib/domain/constants";

/** Resolusi minimal sisi terpendek untuk gambar bitmap agar bordir tajam. */
const MIN_SIDE_PX = 500;

/** Membaca lebar dan tinggi gambar dari file (juga dipakai untuk menyimpan bentuk logo). */
export function readSize(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      resolve({ width: image.naturalWidth, height: image.naturalHeight });
      URL.revokeObjectURL(url);
    };
    image.onerror = () => {
      reject(new Error("gagal dibaca"));
      URL.revokeObjectURL(url);
    };
    image.src = url;
  });
}

/**
 * Mengembalikan pesan error (diawali [!]) jika file tidak layak, atau null jika lolos.
 */
export async function validateLogoFile(file: File): Promise<string | null> {
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (!["png", "jpg", "jpeg", "svg"].includes(extension)) {
    return `[!] Format .${extension} belum didukung. Gunakan PNG, SVG, atau JPG`;
  }
  if (file.size > MAX_LOGO_BYTES) {
    return `[!] File ${(file.size / 1024 / 1024).toFixed(1).replace(".", ",")} MB. Maksimal 5 MB`;
  }
  if (extension !== "svg") {
    try {
      const { width, height } = await readSize(file);
      const shortest = Math.min(width, height);
      if (shortest < MIN_SIDE_PX) {
        return `[!] Resolusi ${shortest} px terlalu kecil. Minimal ${MIN_SIDE_PX} px agar bordir tajam`;
      }
    } catch {
      return "[!] File gambar rusak atau tidak bisa dibaca";
    }
  }
  return null;
}
