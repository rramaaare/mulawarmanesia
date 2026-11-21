/**
 * File ini untuk apa:
 * Membuat pesanan (checkout). Bagian terpenting: SEMUA tabel pesanan ditulis
 * dalam SATU transaksi database (prinsip Atomicity pada ACID). Jika salah satu
 * langkah gagal, seluruh perubahan dibatalkan sehingga tidak ada data setengah jadi.
 */
import { randomBytes } from "node:crypto";
import { Prisma } from "@/generated/prisma/client";
import { db } from "@/server/db";
import { AppError } from "@/server/errors";
import { SIZES, findMotif } from "@/lib/domain/constants";
import { buildOrderCode, periodOf } from "@/lib/domain/order-code";
import { normalizeWhatsapp } from "@/lib/domain/phone";
import { calculatePrice, type SizeQuantities } from "@/lib/domain/pricing";
import { checkoutSchema, type CheckoutInput } from "@/lib/validation/order";
import { getSettings } from "./settings-service";

/** Tipe koneksi di dalam transaksi (dipakai fungsi pembantu di bawah). */
type Tx = Prisma.TransactionClient;

/**
 * Mengambil nomor urut berikutnya untuk bulan ini, dengan aman saat banyak
 * pelanggan memesan bersamaan (Isolation): baris penghitung dikunci sampai transaksi selesai.
 */
async function nextOrderCode(tx: Tx, now: Date): Promise<string> {
  const period = periodOf(now);
  // Tambah 1 dalam satu perintah atomik; jika bulan belum ada, buat baris dengan nilai 1
  await tx.$executeRaw`
    INSERT INTO OrderCounter (period, lastNumber) VALUES (${period}, 1)
    ON DUPLICATE KEY UPDATE lastNumber = lastNumber + 1`;
  // Baca nilainya; baris masih terkunci oleh transaksi ini sehingga tidak ada nomor kembar
  const rows = await tx.$queryRaw<{ lastNumber: number }[]>`
    SELECT lastNumber FROM OrderCounter WHERE period = ${period} FOR UPDATE`;
  return buildOrderCode(period, Number(rows[0].lastNumber));
}

/** Memastikan semua warna yang dipilih ada di palet dan stoknya tersedia. */
async function assertColorsAvailable(tx: Tx, colors: Record<string, string>): Promise<void> {
  // Motif (mis. batik) bukan warna kain stok; namanya sudah dicek terhadap daftar MOTIFS
  const names = Array.from(new Set(Object.values(colors))).filter((name) => !findMotif(name));
  const found = await tx.fabricColor.findMany({ where: { name: { in: names }, inStock: true } });
  if (found.length !== names.length) {
    throw new AppError("[!] Ada warna yang stoknya habis atau tidak tersedia. Pilih warna lain.", 400);
  }
}

/** Mengambil ongkir dari kota tujuan (0 untuk ambil di workshop). */
async function resolveShippingFee(tx: Tx, input: CheckoutInput): Promise<number> {
  if (input.shipping.method === "AMBIL") return 0;
  const city = await tx.city.findUnique({ where: { name: input.shipping.city ?? "" } });
  if (!city) throw new AppError("[!] Pilih kota tujuan", 400, { "shipping.city": "[!] Pilih kota tujuan" });
  const rate = await tx.shippingRate.findUnique({ where: { zone: city.zone } });
  return rate?.fee ?? 0;
}

/** Hasil singkat yang dikembalikan ke browser setelah pesanan dibuat. */
export interface CreatedOrder {
  code: string;
  trackingToken: string;
  total: number;
}

/**
 * Membuat pesanan baru dari data checkout.
 * Langkah: validasi ulang -> (transaksi) cek master data, hitung harga, nomor pesanan,
 * simpan pesanan + rincian + log status -> kembalikan nomor pesanan.
 */
export async function createOrder(rawInput: unknown): Promise<CreatedOrder> {
  // 1. Validasi ulang di server (sumber kebenaran, browser hanya membantu)
  const input = checkoutSchema.parse(rawInput);
  const quantities = input.quantities as SizeQuantities;
  const whatsapp = normalizeWhatsapp(input.customer.whatsapp) as string;

  return db.$transaction(async (tx) => {
    const now = new Date();
    const settings = await getSettings(tx); // batas waktu bayar bisa diubah superadmin

    // 2. Ambil data master dari database (harga TIDAK dipercaya dari browser)
    const category = await tx.category.findUnique({ where: { id: input.design.categoryId } });
    const material = await tx.material.findUnique({ where: { id: input.design.materialId } });
    if (!category || !material || category.product !== input.design.product || material.product !== input.design.product) {
      throw new AppError("[!] Pilih satu kategori desain dan bahan yang sesuai", 400);
    }
    await assertColorsAvailable(tx, input.design.colors);
    const shippingFee = await resolveShippingFee(tx, input);

    // 3. Hitung harga resmi di server
    const price = calculatePrice({
      basePrice: category.basePrice,
      materialSurcharge: material.surcharge,
      decorationTechniques: input.design.images.map((image) => image.technique),
      namePerPerson: input.namePerPerson,
      quantities,
      shippingFee,
      fees: settings.fees,
    });

    // 4. Nomor pesanan unik + simpan semua data sekaligus (nested create = satu rangkaian di transaksi)
    const code = await nextOrderCode(tx, now);
    const trackingToken = randomBytes(18).toString("hex");
    const bodyColor = input.design.colors["Badan"] ?? Object.values(input.design.colors)[0] ?? "-";

    await tx.order.create({
      data: {
        code,
        paymentScheme: input.paymentScheme,
        customerName: input.customer.name,
        whatsapp,
        email: input.customer.email,
        organization: input.customer.organization || null,
        shippingMethod: input.shipping.method,
        address: input.shipping.method === "KIRIM" ? input.shipping.address : null,
        city: input.shipping.method === "KIRIM" ? input.shipping.city : null,
        postalCode: input.shipping.method === "KIRIM" ? input.shipping.postalCode : null,
        subtotal: price.subtotal,
        discount: price.discount,
        shippingFee: price.shippingFee,
        total: price.total,
        trackingToken,
        expiresAt: new Date(now.getTime() + settings.paymentDeadlineHours * 3_600_000),
        items: {
          create: {
            product: input.design.product,
            categoryId: category.id,
            materialId: material.id,
            // Model selalu diambil dari kategori (bukan dipercaya dari browser)
            designJson: { ...input.design, model: category.designModel ?? undefined } as unknown as Prisma.InputJsonValue,
            bodyColor,
            notes: input.notes || null,
            namePerson: input.namePerPerson,
            unitPrice: price.unitPrice,
            sizes: {
              create: SIZES.filter((size) => (quantities[size] ?? 0) > 0).map((size) => ({
                size,
                qty: quantities[size] as number,
              })),
            },
            names: input.namePerPerson ? { create: input.names.map((row) => ({ name: row.name, size: row.size })) } : undefined,
            assets: {
              create: input.design.images.map((image) => ({
                fileName: image.fileName,
                technique: image.technique,
                position: image.position,
              })),
            },
          },
        },
        logs: { create: { status: "menunggu_pembayaran", note: "Pesanan dibuat", changedBy: "sistem" } },
      },
    });

    return { code, trackingToken, total: price.total };
  });
}
