// Tes fungsi murni: harga, status, nomor pesanan, nomor WhatsApp.
import { describe, expect, it } from "vitest";
import { calculatePrice } from "@/lib/domain/pricing";
import { allowedNextStatuses, canChangeStatus } from "@/lib/domain/order-status";
import { buildOrderCode, normalizeOrderCode } from "@/lib/domain/order-code";
import { normalizeWhatsapp } from "@/lib/domain/phone";

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
