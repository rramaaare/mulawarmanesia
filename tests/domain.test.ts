// Tes fungsi murni: harga, status, nomor pesanan, nomor WhatsApp.
import { describe, expect, it } from "vitest";
import { calculatePrice } from "@/lib/domain/pricing";
import { allowedNextStatuses, canChangeStatus } from "@/lib/domain/order-status";
import { buildOrderCode, normalizeOrderCode } from "@/lib/domain/order-code";
import { normalizeWhatsapp } from "@/lib/domain/phone";
import { bodyFrame, foldVisibleBox, layoutOverlay, placementNote, positionKeysFor } from "@/features/editor/garment-data";

describe("harga", () => {
  it("cocok dengan contoh desain: 20 pcs PDH Organisasi + bordir + ongkir Kaltim", () => {
    const result = calculatePrice({
      basePrice: 185_000,
      materialSurcharge: 0,
      decorationTechniques: ["bordir"],
      namePerPerson: false,
      quantities: { S: 2, M: 6, L: 8, XL: 4 },
      shippingFee: 48_000,
    });
    expect(result.totalPcs).toBe(20);
    expect(result.decorationTotal).toBe(300_000);
    expect(result.total).toBe(4_048_000);
  });

  it("memberi diskon 5% untuk 50 pcs dan tambahan ukuran XXL", () => {
    const result = calculatePrice({
      basePrice: 100_000,
      materialSurcharge: 0,
      decorationTechniques: [],
      namePerPerson: false,
      quantities: { L: 40, XXL: 10 },
      shippingFee: 0,
    });
    expect(result.subtotal).toBe(40 * 100_000 + 10 * 110_000);
    expect(result.discount).toBe(Math.round(result.subtotal * 0.05));
  });
});

describe("status", () => {
  it("hanya boleh maju satu tahap", () => {
    expect(canChangeStatus("dibayar", "cek_desain")).toBe(true);
    expect(canChangeStatus("dibayar", "produksi")).toBe(false);
    expect(canChangeStatus("produksi", "cek_desain")).toBe(false);
  });
  it("cek_desain boleh ke perlu_revisi dan kembali", () => {
    expect(allowedNextStatuses("cek_desain")).toContain("perlu_revisi");
    expect(canChangeStatus("perlu_revisi", "cek_desain")).toBe(true);
  });
});

describe("nomor pesanan & WhatsApp", () => {
  it("menyusun dan merapikan nomor pesanan", () => {
    expect(buildOrderCode("2611", 42)).toBe("MLW-2611-0042");
    expect(normalizeOrderCode(" mlw-2611-0042 ")).toBe("MLW-2611-0042");
    expect(normalizeOrderCode("ABC")).toBeNull();
  });
  it("menormalkan nomor WhatsApp", () => {
    expect(normalizeWhatsapp("0812 5555 0199")).toBe("6281255550199");
    expect(normalizeWhatsapp("+62 812-5555-0199")).toBe("6281255550199");
    expect(normalizeWhatsapp("0812")).toBeNull();
  });
});

describe("tata letak logo/teks di baju", () => {
  it("logo panjang dipasang memanjang, logo persegi tidak", () => {
    const wide = layoutOverlay("PDH", "punggung_atas", { kind: "image", aspect: 4 });
    const square = layoutOverlay("PDH", "punggung_atas", { kind: "image", aspect: 1 });
    expect(wide.w).toBeGreaterThan(square.w * 2);
    expect(wide.w / wide.h).toBeCloseTo(4);
  });

  it("skala memperbesar dan geseran memindah titik tengah", () => {
    const base = layoutOverlay("PDH", "dada_kiri", { kind: "image", aspect: 1 });
    const big = layoutOverlay("PDH", "dada_kiri", { kind: "image", aspect: 1, scale: 1.4 });
    const moved = layoutOverlay("PDH", "dada_kiri", { kind: "image", aspect: 1, offsetX: 10, offsetY: -5 });
    expect(big.w).toBeCloseTo(base.w * 1.4);
    expect(moved.x - base.x).toBeCloseTo(10);
    expect(moved.y - base.y).toBeCloseTo(-5);
  });

  it("digeser jauh ke tepi: melengkung, tidak keluar dari badan", () => {
    const box = layoutOverlay("VEST", "dada_kanan", { kind: "image", aspect: 1, offsetX: 150, offsetY: 150 });
    const front = foldVisibleBox(box, "front");
    expect(box.y + box.h).toBeLessThanOrEqual(340);
    if (front) expect(front.x + front.w).toBeLessThanOrEqual(150 + bodyFrame("VEST", box.y + box.h / 2).r + 0.01); // tetap di dalam badan
  });

  it("logo lebar di dada yang melewati tepi badan berlanjut ke punggung", () => {
    const box = layoutOverlay("PDH", "dada_kanan", { kind: "image", aspect: 6, scale: 2.5, offsetX: 80 });
    const front = foldVisibleBox(box, "front")!;
    expect(front.x + front.w).toBeLessThanOrEqual(150 + bodyFrame("PDH", box.y + box.h / 2).r + 0.01); // tetap di dalam badan
    expect(foldVisibleBox(box, "back")).not.toBeNull();
  });

  it("teks besar di lengan: dipotong di tepi lengan, sisanya di lengan yang sama di tampak belakang", () => {
    const box = layoutOverlay("PDH", "lengan_kiri", { kind: "text", content: "jksbdjhdfsjhghjgjh,g,jJGHJ", scale: 2.5 });
    const front = foldVisibleBox(box, "front")!;
    const back = foldVisibleBox(box, "back")!;
    expect(front.x).toBeGreaterThanOrEqual(41 - 21 - 0.01); // tidak keluar dari lengan (koordinat sumbu lengan)
    expect(front.x + front.w).toBeLessThanOrEqual(41 + 21 + 0.01);
    expect(back.x).toBeGreaterThanOrEqual(259 - 21 - 0.01); // lengan yang sama di tampak belakang
    expect(box.frame?.angle).toBe(22); // bingkai lengan miring mengikuti lengan
  });

  it("logo kecil di tengah dada utuh dan tidak muncul di belakang", () => {
    const box = layoutOverlay("PDH", "dada_kiri", { kind: "image", aspect: 1 });
    const front = foldVisibleBox(box, "front")!;
    expect(front.w).toBeCloseTo(box.w); // tidak dipotong/menyempit
    expect(foldVisibleBox(box, "back")).toBeNull();
  });

  it("logo yang digeser ke samping: TIDAK menyempit, bagian yang lewat tepi pindah utuh ke belakang", () => {
    const box = layoutOverlay("PDH", "dada_kanan", { kind: "image", aspect: 2, scale: 2, offsetX: 50 });
    const edge = 150 + bodyFrame("PDH", box.y + box.h / 2).r;
    const front = foldVisibleBox(box, "front")!;
    const back = foldVisibleBox(box, "back")!;
    expect(front.x + front.w).toBeCloseTo(edge); // dipotong tepat di tepi badan
    expect(front.w + back.w).toBeCloseTo(box.w); // panjang total tetap (tidak ada yang menyempit)
    expect(back.x).toBeCloseTo(150 - bodyFrame("PDH", box.y + box.h / 2).r); // mulai dari tepi yang sama di punggung
  });

  it("posisi lingkar: teks panjang berlanjut di punggung dengan panjang total tetap", () => {
    const box = layoutOverlay("PDH", "lingkar_bawah", { kind: "text", content: "HIMPUNAN MAHASISWA INFORMATIKA" });
    const front = foldVisibleBox(box, "front")!;
    const back = foldVisibleBox(box, "back")!;
    expect(front.w + back.w).toBeCloseTo(box.w);
  });

  it("teks panjang di area kecil tetap bisa dibesar-kecilkan", () => {
    const small = layoutOverlay("PDH", "dada_kiri", { kind: "text", content: "jksbdjhdfsjhghjgjhgjJGHJGHVHCFGCYYTJ", scale: 0.75 });
    const big = layoutOverlay("PDH", "dada_kiri", { kind: "text", content: "jksbdjhdfsjhghjgjhgjJGHJGHVHCFGCYYTJ", scale: 1.4 });
    expect(big.fontSize).toBeGreaterThan(small.fontSize);
  });

  it("VEST tidak punya posisi lengan, tapi punya posisi belakang tambahan", () => {
    const vest = positionKeysFor("VEST");
    expect(vest).not.toContain("lengan_kiri");
    expect(vest).toEqual(expect.arrayContaining(["kerah_belakang", "punggung_bawah", "lingkar_bawah"]));
  });

  it("keterangan ukuran untuk lembar produksi", () => {
    expect(placementNote({})).toBe("");
    expect(placementNote({ scale: 1.4, offsetX: 3 })).toBe(" · ukuran Besar (140%) · digeser manual");
    expect(placementNote({ flipX: true })).toBe(" · dibalik kiri-kanan");
  });
});
