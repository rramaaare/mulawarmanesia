/**
 * File ini untuk apa:
 * Mengisi database dengan data awal (master data + akun admin) saat pertama dijalankan.
 * Jalankan dengan: npx prisma db seed
 * Aman dijalankan berulang kali (memakai "upsert" = ubah jika sudah ada, tambah jika belum).
 */
import "dotenv/config";
import bcrypt from "bcryptjs";
import { db } from "../server/db";

/** Kategori desain beserta harga dasar (dummy, sesuai PRD §8.6). */
const CATEGORIES = [
  { product: "PDH", name: "Organisasi", basePrice: 185_000 },
  { product: "PDH", name: "Instansi", basePrice: 210_000 },
  { product: "PDH", name: "Komunitas", basePrice: 175_000 },
  { product: "PDH", name: "Perusahaan", basePrice: 225_000 },
  { product: "VEST", name: "Proyek", basePrice: 95_000 },
  { product: "VEST", name: "Event", basePrice: 110_000 },
  { product: "VEST", name: "Relawan", basePrice: 90_000 },
  { product: "VEST", name: "Brand", basePrice: 125_000 },
] as const;

/** Bahan kain dan tambahan harganya. */
const MATERIALS = [
  { product: "PDH", name: "American Drill", surcharge: 0 },
  { product: "PDH", name: "Nagata Drill", surcharge: 15_000 },
  { product: "VEST", name: "Taslan", surcharge: 0 },
  { product: "VEST", name: "Drill", surcharge: 10_000 },
] as const;

/** 16 warna kain; dua warna sengaja "habis" untuk memperlihatkan peringatan stok. */
const COLORS = [
  { name: "Navy", hex: "#1F2A44" },
  { name: "Hitam", hex: "#1A1A1A" },
  { name: "Maroon", hex: "#6D1F2B" },
  { name: "Hijau Army", hex: "#4B5320" },
  { name: "Abu Tua", hex: "#4A4F55" },
  { name: "Cream", hex: "#EFE4C8" },
  { name: "Biru Dongker", hex: "#14305A" },
  { name: "Putih", hex: "#F5F5F5" },
  { name: "Merah", hex: "#C12822" },
  { name: "Coklat Tua", hex: "#5A3A22" },
  { name: "Hijau Botol", hex: "#0F4D3A" },
  { name: "Abu Muda", hex: "#B8BCC2" },
  { name: "Khaki", hex: "#B8A06A" },
  { name: "Kuning", hex: "#E6C229" },
  { name: "Oranye", hex: "#E8731A", inStock: false },
  { name: "Biru Langit", hex: "#7EC3E8", inStock: false },
] as const;

/** Tarif ongkir tetap per wilayah. */
const SHIPPING_RATES = [
  { zone: "samarinda", label: "Samarinda", fee: 0 },
  { zone: "kaltim", label: "Kalimantan Timur", fee: 48_000 },
  { zone: "luar_kaltim", label: "Luar Kalimantan Timur", fee: 95_000 },
] as const;

/** Kota yang tampil di form pengiriman dan zona ongkirnya. */
const CITIES = [
  { name: "Samarinda", zone: "samarinda" },
  { name: "Balikpapan", zone: "kaltim" },
  { name: "Bontang", zone: "kaltim" },
  { name: "Kutai Kartanegara", zone: "kaltim" },
  { name: "Berau", zone: "kaltim" },
  { name: "Banjarmasin", zone: "luar_kaltim" },
  { name: "Makassar", zone: "luar_kaltim" },
  { name: "Surabaya", zone: "luar_kaltim" },
  { name: "Jakarta", zone: "luar_kaltim" },
] as const;

/** Fungsi utama seed: mengisi tiap tabel master lalu membuat akun admin. */
async function main(): Promise<void> {
  for (const item of CATEGORIES) {
    await db.category.upsert({
      where: { product_name: { product: item.product, name: item.name } },
      update: { basePrice: item.basePrice },
      create: item,
    });
  }
  for (const item of MATERIALS) {
    await db.material.upsert({
      where: { product_name: { product: item.product, name: item.name } },
      update: { surcharge: item.surcharge },
      create: item,
    });
  }
  for (const item of COLORS) {
    const inStock = "inStock" in item ? item.inStock : true;
    await db.fabricColor.upsert({
      where: { name: item.name },
      update: { hex: item.hex, inStock },
      create: { name: item.name, hex: item.hex, inStock },
    });
  }
  for (const item of SHIPPING_RATES) {
    await db.shippingRate.upsert({ where: { zone: item.zone }, update: { fee: item.fee }, create: item });
  }
  for (const item of CITIES) {
    await db.city.upsert({ where: { name: item.name }, update: { zone: item.zone }, create: item });
  }

  // Akun admin diambil dari .env agar kata sandi tidak tertulis di kode
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (email && password) {
    const passwordHash = await bcrypt.hash(password, 10);
    await db.adminUser.upsert({
      where: { email },
      update: { passwordHash },
      create: { email, passwordHash, name: "Admin Workshop" },
    });
  }
  // Superadmin: boleh mengatur master data, akun admin, dan pengaturan. Peran SELALU dipasang
  // SUPERADMIN di sini (update juga), sedangkan admin biasa tidak pernah dinaikkan oleh seed.
  const superEmail = process.env.SUPERADMIN_EMAIL;
  const superPassword = process.env.SUPERADMIN_PASSWORD;
  if (superEmail && superPassword) {
    const passwordHash = await bcrypt.hash(superPassword, 10);
    await db.adminUser.upsert({
      where: { email: superEmail },
      update: { passwordHash, role: "SUPERADMIN", active: true },
      create: { email: superEmail, passwordHash, name: "Superadmin", role: "SUPERADMIN" },
    });
  }
  console.log("Seed selesai.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
