/**
 * File ini untuk apa:
 * Aturan validasi (Zod) untuk data pesanan. SATU skema ini dipakai di browser
 * (menampilkan error di bawah field) dan di server (penjaga sebenarnya), sehingga
 * aturan tidak pernah berbeda. Pesan error sesuai PRD §10 dan diawali "[!]".
 */
import { z } from "zod";
import { DESIGN_MODELS, MAX_IMAGES, MIN_ORDER_PCS, SIZES } from "@/lib/domain/constants";
import { normalizeWhatsapp } from "@/lib/domain/phone";

/** Teks pesan error standar: diawali [!] agar tidak hanya mengandalkan warna. */
const err = (message: string) => `[!] ${message}`;

/** Aturan satu gambar/logo di desain. */
export const designImageSchema = z.object({
  fileName: z.string().min(1), // nama file hasil unggah di server
  position: z.enum([
    "dada_kiri",
    "dada_kanan",
    "lengan_kiri",
    "lengan_kanan",
    "punggung_atas",
    "punggung_tengah",
  ]),
  technique: z.enum(["bordir", "sablon"]),
  /** Nama file asli dari komputer pelanggan (hanya untuk ditampilkan admin). */
  label: z.string().max(120).optional(),
});

/** Aturan satu teks di desain. */
export const designTextSchema = z.object({
  content: z
    .string()
    .min(1, err("Isi teks tidak boleh kosong"))
    .max(40, err("Teks maksimal 40 karakter"))
    // Tolak emoji karena tidak bisa dibordir/disablon
    .refine((value) => !/\p{Extended_Pictographic}/u.test(value), err("Teks tidak boleh berisi emoji")),
  font: z.string().min(1),
  color: z.string().min(1),
  position: z.string().min(1),
});

/** Aturan desain: produk, kategori, bahan, warna per bagian, gambar, dan teks. */
export const designSchema = z.object({
  product: z.enum(["PDH", "VEST"]),
  /** Model baju dari mockup (server memakai model kategori); opsional agar desain lama tetap valid. */
  model: z.enum(DESIGN_MODELS).optional(),
  categoryId: z.number().int().positive(err("Pilih satu kategori desain untuk melanjutkan")),
  materialId: z.number().int().positive(err("Pilih jenis bahan")),
  colors: z.record(z.string(), z.string()), // nama bagian -> nama warna kain
  images: z.array(designImageSchema).max(MAX_IMAGES, err(`Maksimal ${MAX_IMAGES} gambar per desain`)),
  texts: z.array(designTextSchema).max(10),
});
export type DesignInput = z.infer<typeof designSchema>;

/** Aturan jumlah per ukuran: bilangan bulat 0-999. */
const quantitySchema = z.number().int(err("Masukkan angka 0–999")).min(0, err("Masukkan angka 0–999")).max(999, err("Masukkan angka 0–999"));

/** Aturan data pemesan. */
export const customerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, err("Masukkan nama lengkap (minimal 3 huruf)"))
    .max(60, err("Nama maksimal 60 karakter"))
    .regex(/^[\p{L}\s.']+$/u, err("Nama hanya boleh berisi huruf, spasi, titik, dan apostrof")),
  whatsapp: z
    .string()
    .refine((value) => normalizeWhatsapp(value) !== null, err("Nomor belum lengkap. Contoh: 0812 5555 0199")),
  email: z.string().trim().email(err("Format email belum benar. Contoh: nama@email.com")),
  organization: z.string().trim().max(80, err("Maksimal 80 karakter")).optional(),
});

/** Aturan pengiriman. Alamat/kota/kode pos wajib bila memilih kirim ke alamat. */
export const shippingSchema = z
  .object({
    method: z.enum(["KIRIM", "AMBIL"], { error: err("Pilih kirim ke alamat atau ambil di workshop") }),
    address: z.string().trim().optional(),
    city: z.string().trim().optional(),
    postalCode: z.string().trim().optional(),
  })
  .superRefine((value, ctx) => {
    if (value.method !== "KIRIM") return;
    const address = value.address ?? "";
    if (address.length < 10 || address.length > 200) {
      ctx.addIssue({ code: "custom", path: ["address"], message: err("Tulis alamat lengkap: jalan, nomor, RT/RW, kelurahan") });
    }
    if (!value.city) {
      ctx.addIssue({ code: "custom", path: ["city"], message: err("Pilih kota tujuan") });
    }
    if (!/^\d{5}$/.test(value.postalCode ?? "")) {
      ctx.addIssue({ code: "custom", path: ["postalCode"], message: err("Kode pos harus 5 digit") });
    }
  });

/** Aturan lengkap halaman Pesanan (dikirim saat menekan "Bayar sekarang"). */
export const checkoutSchema = z
  .object({
    design: designSchema,
    quantities: z.object(Object.fromEntries(SIZES.map((size) => [size, quantitySchema.optional()]))),
    namePerPerson: z.boolean(),
    names: z.array(z.object({ name: z.string(), size: z.enum(SIZES) })),
    notes: z.string().max(300, err("Maksimal 300 karakter")).optional(),
    customer: customerSchema,
    shipping: shippingSchema,
    paymentScheme: z.enum(["LUNAS", "DP50"], { error: err("Pilih lunas atau DP 50%") }),
    agreed: z.literal(true, { error: err("Centang persetujuan syarat produksi untuk melanjutkan") }),
  })
  .superRefine((value, ctx) => {
    // Total pcs harus memenuhi minimal order
    const total = SIZES.reduce((sum, size) => sum + ((value.quantities as Record<string, number | undefined>)[size] ?? 0), 0);
    if (total < MIN_ORDER_PCS) {
      ctx.addIssue({
        code: "custom",
        path: ["quantities"],
        message: err(`Total ${total} pcs. Minimal order ${MIN_ORDER_PCS} pcs, tambah ${MIN_ORDER_PCS - total} lagi`),
      });
    }
    // Daftar nama harus sama jumlahnya dengan total pcs dan tiap nama 1-20 karakter
    if (value.namePerPerson) {
      const emptyRows = value.names.filter((row) => row.name.trim().length < 1 || row.name.length > 20).length;
      if (value.names.length !== total || emptyRows > 0) {
        ctx.addIssue({
          code: "custom",
          path: ["names"],
          message: err(emptyRows > 0 ? `Ada ${emptyRows} baris nama yang belum benar (1–20 karakter)` : "Jumlah baris nama harus sama dengan total pcs"),
        });
      }
    }
  });
export type CheckoutInput = z.infer<typeof checkoutSchema>;
