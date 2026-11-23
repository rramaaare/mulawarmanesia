// Tes integrasi ACID: berjalan ke database MySQL sungguhan (perlu `npx prisma db seed` dahulu).
import "dotenv/config";
import { afterAll, describe, expect, it } from "vitest";
import { db } from "@/server/db";
import { createOrder } from "@/server/services/order-service";
import { simulateGatewayResult, startPayment } from "@/server/services/payment-service";
import { changeOrderStatus } from "@/server/services/status-service";

/** Data checkout contoh yang valid: 12 pcs PDH Model 01 diambil di workshop. */
async function sampleCheckout(overrides: Record<string, unknown> = {}) {
  const category = await db.category.findFirstOrThrow({ where: { product: "PDH", name: "Model 01" } });
  const material = await db.material.findFirstOrThrow({ where: { product: "PDH", name: "American Drill" } });
  return {
    design: {
      product: "PDH",
      categoryId: category.id,
      materialId: material.id,
      colors: { Badan: "Navy" },
      images: [],
      texts: [],
    },
    quantities: { M: 6, L: 6 },
    namePerPerson: false,
    names: [],
    customer: { name: "Tes Otomatis", whatsapp: "0812 5555 0199", email: "tes@email.com" },
    shipping: { method: "AMBIL" },
    paymentScheme: "DP50",
    agreed: true,
    ...overrides,
  };
}

const createdCodes: string[] = [];

afterAll(async () => {
  // Bersihkan data tes agar dashboard demo tidak tercemar
  await db.order.deleteMany({ where: { code: { in: createdCodes } } });
  await db.auditLog.deleteMany({ where: { actorEmail: "tes" } }); // jejak audit dari perubahan status di tes
  await db.$disconnect();
});

describe("ACID", () => {
  it("Atomicity: checkout yang gagal tidak meninggalkan baris pesanan", async () => {
    const before = await db.order.count();
    // Kota tidak ada -> transaksi dibatalkan setelah sebagian langkah berjalan
    const bad = await sampleCheckout({
      shipping: { method: "KIRIM", address: "Jl. Contoh No. 1 RT 01", city: "Kota Fiktif", postalCode: "12345" },
    });
    await expect(createOrder(bad)).rejects.toThrow();
    expect(await db.order.count()).toBe(before);
  });

  it("Isolation: 10 checkout bersamaan menghasilkan 10 nomor pesanan unik", async () => {
    const input = await sampleCheckout();
    const results = await Promise.all(Array.from({ length: 10 }, () => createOrder(input)));
    results.forEach((result) => createdCodes.push(result.code));
    expect(new Set(results.map((result) => result.code)).size).toBe(10);
  });

  it("Idempotensi: webhook sukses dikirim dua kali hanya mencatat uang sekali", async () => {
    const order = await createOrder(await sampleCheckout());
    createdCodes.push(order.code);
    const ticket = await startPayment(order.code, "qris");

    const first = await simulateGatewayResult(ticket.gatewayRef, "sukses");
    const second = await simulateGatewayResult(ticket.gatewayRef, "sukses");
    expect(first.duplicate).toBe(false);
    expect(second.duplicate).toBe(true);

    const saved = await db.order.findUniqueOrThrow({ where: { code: order.code } });
    expect(saved.amountPaid).toBe(ticket.amount); // DP 50% saja, tidak 100%
    expect(saved.paymentState).toBe("dp_dibayar");
    expect(saved.status).toBe("dibayar");
  });

  it("Consistency: tidak bisa lompat status dan tidak bisa siap kirim sebelum lunas", async () => {
    const order = await createOrder(await sampleCheckout());
    createdCodes.push(order.code);
    const ticket = await startPayment(order.code, "va");
    await simulateGatewayResult(ticket.gatewayRef, "sukses");

    await expect(changeOrderStatus(order.code, "tes", { status: "produksi" })).rejects.toThrow(/satu tahap/);
    await changeOrderStatus(order.code, "tes", { status: "cek_desain" });
    await changeOrderStatus(order.code, "tes", { status: "produksi" });
    await changeOrderStatus(order.code, "tes", { status: "qc" });
    // DP belum dilunasi -> siap_kirim ditolak
    await expect(changeOrderStatus(order.code, "tes", { status: "siap_kirim" })).rejects.toThrow(/DP/);

    // Lunasi sisa lewat tagihan kedua, lalu boleh siap_kirim
    const second = await startPayment(order.code, "qris");
    await simulateGatewayResult(second.gatewayRef, "sukses");
    await changeOrderStatus(order.code, "tes", { status: "siap_kirim" });
    const saved = await db.order.findUniqueOrThrow({ where: { code: order.code } });
    expect(saved.paymentState).toBe("lunas");
    expect(saved.amountPaid).toBe(saved.total);
  });

  /** Membuat pesanan lunas lalu memajukannya sampai siap_kirim. */
  async function orderReadyToShip(shipping: Record<string, unknown>) {
    const order = await createOrder(await sampleCheckout({ shipping, paymentScheme: "LUNAS" }));
    createdCodes.push(order.code);
    const ticket = await startPayment(order.code, "va");
    await simulateGatewayResult(ticket.gatewayRef, "sukses");
    for (const status of ["cek_desain", "produksi", "qc", "siap_kirim"] as const) await changeOrderStatus(order.code, "tes", { status });
    return order.code;
  }

  it("Ambil di workshop: boleh 'Sudah diambil' tanpa kurir & resi", async () => {
    const code = await orderReadyToShip({ method: "AMBIL" });
    await changeOrderStatus(code, "tes", { status: "dikirim" });
    const saved = await db.order.findUniqueOrThrow({ where: { code } });
    expect(saved.status).toBe("dikirim");
    expect(saved.resi).toBeNull();
  });

  it("Kirim ke alamat: tetap wajib kurir & resi", async () => {
    const code = await orderReadyToShip({ method: "KIRIM", address: "Jl. Contoh No. 1 RT 01", city: "Samarinda", postalCode: "75111" });
    await expect(changeOrderStatus(code, "tes", { status: "dikirim" })).rejects.toThrow(/kurir dan nomor resi/);
    await changeOrderStatus(code, "tes", { status: "dikirim", courier: "JNE", resi: "JNE123" });
    expect((await db.order.findUniqueOrThrow({ where: { code } })).resi).toBe("JNE123");
  });
});
