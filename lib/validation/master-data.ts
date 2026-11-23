/**
 * File ini untuk apa:
 * Aturan validasi (Zod) untuk halaman superadmin: master data, pengaturan, pengumuman landing, dan akun admin.
 * Pesan error berbahasa Indonesia dan diawali "[!]" seperti di bagian lain aplikasi.
 */
import { z } from "zod";
import { ANNOUNCEMENT_LIMITS } from "@/lib/domain/announcement";

const err = (message: string) => `[!] ${message}`;

/** Harga/tarif dalam rupiah: bilangan bulat 0 sampai 100 juta. */
const rupiah = z
  .number({ error: err("Masukkan angka tanpa huruf. Contoh: 225000") })
  .int(err("Masukkan angka tanpa huruf. Contoh: 225000"))
  .min(0, err("Harga tidak boleh negatif"))
  .max(100_000_000, err("Angka terlalu besar"));

/** Satu perubahan data master. Bentuknya dibedakan oleh field `type`. */
export const masterDataChangeSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("category"), id: z.number().int().positive(), value: rupiah }),
  z.object({ type: z.literal("material"), id: z.number().int().positive(), value: rupiah }),
  z.object({ type: z.literal("shipping"), zone: z.string().min(1).max(20), value: rupiah }),
  z.object({ type: z.literal("color"), id: z.number().int().positive(), inStock: z.boolean() }),
  /** Biaya dekorasi, nama per orang, dan tambahan ukuran (disimpan di tabel Setting). */
  z.object({ type: z.literal("fee"), key: z.enum(["bordir", "sablon", "namePerPerson", "XXL", "XXXL"]), value: rupiah }),
  /** Menambah warna kain baru. */
  z.object({
    type: z.literal("color_add"),
    name: z.string().trim().min(2, err("Nama warna minimal 2 huruf")).max(40, err("Nama warna maksimal 40 karakter")),
    hex: z.string().regex(/^#[0-9a-fA-F]{6}$/, err("Kode warna harus berbentuk #RRGGBB")),
  }),
]);
export type MasterDataChange = z.infer<typeof masterDataChangeSchema>;

/** Beberapa perubahan sekaligus (tombol "Simpan perubahan"); semuanya berhasil atau semuanya batal. */
export const masterDataBatchSchema = z.object({
  changes: z.array(masterDataChangeSchema).min(1, err("Tidak ada perubahan untuk disimpan")).max(200),
});

/** Pengaturan: kapasitas produksi mingguan dan batas waktu bayar. */
export const settingsSchema = z.object({
  weeklyCapacity: z
    .number({ error: err("Masukkan angka. Contoh: 600") })
    .int(err("Masukkan angka bulat. Contoh: 600"))
    .min(1, err("Kapasitas minimal 1 pcs"))
    .max(100_000, err("Angka terlalu besar")),
  paymentDeadlineHours: z
    .number({ error: err("Masukkan angka jam. Contoh: 24") })
    .int(err("Masukkan angka bulat. Contoh: 24"))
    .min(1, err("Minimal 1 jam"))
    .max(168, err("Maksimal 168 jam (7 hari)")),
});

/** Teks pengumuman: spasi ganda/baris baru dirapikan, lalu dibatasi panjangnya. */
const announcementText = (max: number) =>
  z
    .string({ error: err("Teks tidak valid") })
    .transform((value) => value.replace(/\s+/g, " ").trim())
    .refine((value) => value.length <= max, err(`Maksimal ${max} karakter`));

/** Pengumuman landing page: label PO batch di hero + maksimal 6 pesan di pita merah. */
export const announcementSchema = z
  .object({
    badge: z.object({ on: z.boolean(), text: announcementText(ANNOUNCEMENT_LIMITS.badge) }),
    ticker: z
      .array(z.object({ on: z.boolean(), text: announcementText(ANNOUNCEMENT_LIMITS.tickerText) }))
      .max(ANNOUNCEMENT_LIMITS.tickerMax, err(`Maksimal ${ANNOUNCEMENT_LIMITS.tickerMax} pesan`)),
  })
  .superRefine((value, ctx) => {
    // Yang dinyalakan harus ada isinya; yang dimatikan boleh kosong (barisnya dibuang saat disimpan)
    if (value.badge.on && !value.badge.text) {
      ctx.addIssue({ code: "custom", path: ["badge", "text"], message: err("Isi label PO, atau matikan labelnya") });
    }
    value.ticker.forEach((item, index) => {
      if (item.on && !item.text) {
        ctx.addIssue({ code: "custom", path: ["ticker", index, "text"], message: err("Isi pesan ini, atau matikan/hapus barisnya") });
      }
    });
  });

/** Kata sandi baru: minimal 8 karakter. */
const password = z.string().min(8, err("Kata sandi minimal 8 karakter")).max(72, err("Kata sandi maksimal 72 karakter"));

/** Membuat akun admin baru. */
export const createAdminSchema = z.object({
  email: z.string().trim().email(err("Format email belum benar. Contoh: nama@email.com")).max(120),
  name: z.string().trim().min(2, err("Nama minimal 2 huruf")).max(60, err("Nama maksimal 60 karakter")),
  password,
  role: z.enum(["ADMIN", "SUPERADMIN"]),
});

/** Mengubah akun admin: aktif/nonaktif atau kata sandi baru (salah satu). */
export const updateAdminSchema = z.union([
  z.object({ active: z.boolean() }),
  z.object({ password }),
]);
