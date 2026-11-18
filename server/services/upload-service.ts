/**
 * File ini untuk apa:
 * Menyimpan file logo yang diunggah pelanggan ke folder `storage/uploads`.
 * Keamanan: tipe file diperiksa dari ISI file (magic bytes), bukan hanya ekstensi,
 * ukuran dibatasi 5 MB, dan SVG yang berisi skrip ditolak.
 */
import { randomBytes } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { MAX_LOGO_BYTES } from "@/lib/domain/constants";
import { AppError } from "@/server/errors";

/** Folder penyimpanan; dibuat otomatis bila belum ada. */
const UPLOAD_DIR = path.join(process.cwd(), "storage", "uploads");

/** Tipe file yang diizinkan beserta ekstensi dan content-type-nya. */
const TYPES = {
  png: { ext: "png", mime: "image/png" },
  jpg: { ext: "jpg", mime: "image/jpeg" },
  svg: { ext: "svg", mime: "image/svg+xml" },
} as const;

/** Mendeteksi tipe file dari byte awalnya. Mengembalikan null jika tidak dikenal. */
function detectType(bytes: Buffer): keyof typeof TYPES | null {
  if (bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "png";
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "jpg";
  const head = bytes.subarray(0, 512).toString("utf8").trimStart().toLowerCase();
  if (head.startsWith("<svg") || (head.startsWith("<?xml") && head.includes("<svg"))) return "svg";
  return null;
}

/** Menolak SVG yang memuat skrip atau atribut event (mis. onclick) demi keamanan. */
function assertSafeSvg(bytes: Buffer): void {
  const text = bytes.toString("utf8").toLowerCase();
  if (text.includes("<script") || /\son\w+\s*=/.test(text) || text.includes("javascript:")) {
    throw new AppError("[!] File SVG berisi skrip dan tidak diizinkan", 400);
  }
}

/** Menyimpan file unggahan dan mengembalikan nama file acak di server. */
export async function saveUpload(file: File): Promise<{ fileName: string }> {
  if (file.size > MAX_LOGO_BYTES) {
    const mb = (file.size / 1024 / 1024).toFixed(1).replace(".", ",");
    throw new AppError(`[!] File ${mb} MB. Maksimal 5 MB`, 400);
  }
  const bytes = Buffer.from(await file.arrayBuffer());
  const type = detectType(bytes);
  if (!type) throw new AppError("[!] Format file belum didukung. Gunakan PNG, SVG, atau JPG", 400);
  if (type === "svg") assertSafeSvg(bytes);

  await mkdir(UPLOAD_DIR, { recursive: true });
  const fileName = `${randomBytes(16).toString("hex")}.${TYPES[type].ext}`;
  await writeFile(path.join(UPLOAD_DIR, fileName), bytes);
  return { fileName };
}

/** Membaca file unggahan untuk ditampilkan/diunduh. Nama file dicek agar tidak keluar folder. */
export async function readUpload(fileName: string): Promise<{ bytes: Buffer; mime: string }> {
  if (!/^[a-f0-9]{32}\.(png|jpg|svg)$/.test(fileName)) throw new AppError("File tidak ditemukan", 404);
  const ext = fileName.split(".")[1] as keyof typeof TYPES;
  try {
    return { bytes: await readFile(path.join(UPLOAD_DIR, fileName)), mime: TYPES[ext].mime };
  } catch {
    throw new AppError("File tidak ditemukan", 404);
  }
}

/** Info file logo untuk halaman admin: ukuran file, dimensi (bila bitmap), dan apakah vektor. */
export interface UploadInfo {
  sizeBytes: number;
  width: number | null;
  height: number | null;
  isVector: boolean;
}

/** Membaca lebar/tinggi PNG dari kepala file (blok IHDR). */
function pngSize(bytes: Buffer): { width: number; height: number } | null {
  if (bytes.length < 24) return null;
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
}

/** Membaca lebar/tinggi JPEG dengan mencari penanda "Start Of Frame". */
function jpegSize(bytes: Buffer): { width: number; height: number } | null {
  let offset = 2;
  while (offset + 9 < bytes.length) {
    if (bytes[offset] !== 0xff) return null;
    const marker = bytes[offset + 1];
    const length = bytes.readUInt16BE(offset + 2);
    // SOF0-SOF15 (kecuali DHT/JPG/DAC) berisi tinggi lalu lebar
    if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
      return { height: bytes.readUInt16BE(offset + 5), width: bytes.readUInt16BE(offset + 7) };
    }
    offset += 2 + length;
  }
  return null;
}

/** Mengambil info satu file unggahan; null bila file tidak ada. */
export async function readUploadInfo(fileName: string): Promise<UploadInfo | null> {
  try {
    const { bytes } = await readUpload(fileName);
    if (fileName.endsWith(".svg")) return { sizeBytes: bytes.length, width: null, height: null, isVector: true };
    const size = fileName.endsWith(".png") ? pngSize(bytes) : jpegSize(bytes);
    return { sizeBytes: bytes.length, width: size?.width ?? null, height: size?.height ?? null, isVector: false };
  } catch {
    return null;
  }
}
