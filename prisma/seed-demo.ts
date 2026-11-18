/**
 * File ini untuk apa:
 * Membuat pesanan CONTOH agar dashboard admin tidak kosong saat demo.
 * Memakai service yang sama dengan aplikasi (createOrder, pembayaran, ubah status),
 * jadi data contoh ikut melewati semua aturan bisnis. Jalankan: npm run seed:demo
 */
import "dotenv/config";
import { db } from "../server/db";
import { createOrder } from "../server/services/order-service";
import { simulateGatewayResult, startPayment } from "../server/services/payment-service";
import { changeOrderStatus } from "../server/services/status-service";
import type { StatusName } from "../lib/domain/order-status";

/** Skenario pesanan contoh: produk, kategori, jumlah per ukuran, skema bayar, dan status akhir. */
const SCENARIOS: {
  name: string; org: string; product: "PDH" | "VEST"; category: string;
  quantities: Record<string, number>; scheme: "LUNAS" | "DP50"; city?: string;
  method: "qris" | "va" | "ewallet"; target: StatusName | "menunggu_pembayaran";
}[] = [
  { name: "Rizky Pratama", org: "HIMA Teknik Informatika", product: "PDH", category: "Organisasi", quantities: { S: 2, M: 6, L: 8, XL: 4 }, scheme: "LUNAS", city: "Balikpapan", method: "qris", target: "cek_desain" },
  { name: "Andi Saputra", org: "Tim K3 Proyek Gudang", product: "VEST", category: "Proyek", quantities: { M: 20, L: 25, XL: 15 }, scheme: "DP50", method: "va", target: "dibayar" },
  { name: "Dewi Lestari", org: "Komunitas Tepian Runners", product: "PDH", category: "Komunitas", quantities: { S: 4, M: 10, L: 10 }, scheme: "LUNAS", method: "ewallet", target: "menunggu_pembayaran" },
  { name: "Budi Santoso", org: "Dinas Pendidikan", product: "PDH", category: "Instansi", quantities: { M: 30, L: 40, XL: 20, XXL: 10 }, scheme: "LUNAS", method: "va", target: "produksi" },
  { name: "Siti Rahma", org: "BEM Fakultas", product: "PDH", category: "Organisasi", quantities: { S: 5, M: 15, L: 10 }, scheme: "DP50", method: "qris", target: "qc" },
  { name: "Joko Widodo", org: "CV Karya Mandiri", product: "PDH", category: "Perusahaan", quantities: { M: 8, L: 12, XL: 6 }, scheme: "LUNAS", method: "qris", target: "perlu_revisi" },
  { name: "Maya Putri", org: "UKM Pecinta Alam", product: "VEST", category: "Relawan", quantities: { M: 10, L: 10 }, scheme: "LUNAS", method: "ewallet", target: "selesai" },
  { name: "Hendra Wijaya", org: "Event Organizer Samarinda", product: "VEST", category: "Event", quantities: { L: 20, XL: 10 }, scheme: "DP50", method: "va", target: "dibayar" },
];

/** Urutan status yang harus dilalui admin untuk mencapai target. */
const PATH: Partial<Record<StatusName, StatusName[]>> = {
  cek_desain: ["cek_desain"],
  perlu_revisi: ["cek_desain", "perlu_revisi"],
  produksi: ["cek_desain", "produksi"],
  qc: ["cek_desain", "produksi", "qc"],
  selesai: ["cek_desain", "produksi", "qc", "siap_kirim", "dikirim", "selesai"],
};

async function main(): Promise<void> {
  const categories = await db.category.findMany();
  const materials = await db.material.findMany();

  for (const [index, item] of SCENARIOS.entries()) {
    const category = categories.find((row) => row.product === item.product && row.name === item.category)!;
    const material = materials.find((row) => row.product === item.product)!;
    const colors = item.product === "PDH" ? { Badan: "Navy", Lengan: "Navy", Kerah: "Hitam", "Tutup saku": "Navy", Plaket: "Navy", "List lengan": "Hitam" } : { Badan: "Hijau Army", "Strip reflektif": "Kuning", Saku: "Hijau Army", Ritsleting: "Hitam" };
    const order = await createOrder({
      design: { product: item.product, categoryId: category.id, materialId: material.id, colors, images: [], texts: [{ content: item.org.slice(0, 30), font: "Poppins Tebal", color: "Putih", position: "punggung_tengah" }] },
      quantities: item.quantities,
      namePerPerson: false,
      names: [],
      customer: { name: item.name, whatsapp: `0812555501${String(index).padStart(2, "0")}`, email: `demo${index}@email.com`, organization: item.org },
      shipping: item.city ? { method: "KIRIM", address: "Jl. Contoh No. 8, RT 02/RW 05, Kel. Contoh", city: item.city, postalCode: "76114" } : { method: "AMBIL" },
      paymentScheme: item.scheme,
      agreed: true,
    });

    if (item.target === "menunggu_pembayaran") continue;
    // Bayar pesanan lewat jalur webhook yang sama dengan aplikasi
    const ticket = await startPayment(order.code, item.method);
    await simulateGatewayResult(ticket.gatewayRef, "sukses");
    // Pelunasan sisa DP untuk pesanan yang sudah jauh di produksi (agar boleh siap_kirim)
    if (item.scheme === "DP50" && ["qc", "selesai"].includes(item.target)) {
      const rest = await startPayment(order.code, item.method);
      await simulateGatewayResult(rest.gatewayRef, "sukses");
    }
    for (const status of PATH[item.target] ?? []) {
      await changeOrderStatus(order.code, "admin@mulawarmanesia.test", status === "perlu_revisi"
        ? { status, note: "Resolusi logo terlalu kecil. Mohon kirim ulang file minimal 500 px." }
        : status === "dikirim" ? { status, courier: "JNE", resi: "JNE0012345678" } : { status });
    }
    console.log(`${order.code} -> ${item.target}`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
