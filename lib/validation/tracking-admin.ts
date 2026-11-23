/**
 * File ini untuk apa:
 * Aturan validasi untuk form Lacak Pesanan (PRD §10.6) dan panel admin (PRD §10.7).
 */
import { z } from "zod";
import { normalizeOrderCode } from "@/lib/domain/order-code";
import { normalizeWhatsapp } from "@/lib/domain/phone";

/** Teks pesan error standar diawali [!]. */
const err = (message: string) => `[!] ${message}`;

/** Form lacak: nomor pesanan + nomor WhatsApp. */
export const trackingSchema = z.object({
  code: z.string().refine((value) => normalizeOrderCode(value) !== null, err("Format nomor pesanan: MLW-2611-0042")),
  whatsapp: z.string().refine((value) => normalizeWhatsapp(value) !== null, err("Nomor belum lengkap")),
});

/** Form login admin. */
export const loginSchema = z.object({
  email: z.string().trim().email(err("Email atau kata sandi salah")),
  password: z.string().min(1, err("Email atau kata sandi salah")),
});

/** Admin mengubah status pesanan. Alasan wajib bila ke perlu_revisi. */
export const changeStatusSchema = z
  .object({
    status: z.enum(["cek_desain", "perlu_revisi", "produksi", "qc", "siap_kirim", "dikirim", "selesai"]),
    note: z.string().trim().max(300).optional(),
    courier: z.string().trim().max(40).optional(),
    resi: z.string().trim().max(60).optional(),
  })
  .superRefine((value, ctx) => {
    if (value.status === "perlu_revisi") {
      const length = (value.note ?? "").length;
      if (length < 10 || length > 300) {
        ctx.addIssue({
          code: "custom",
          path: ["note"],
          message: err("Tulis alasan revisi agar pelanggan tahu apa yang perlu diperbaiki"),
        });
      }
    }
    // Kurir & resi hanya wajib untuk pesanan yang dikirim ke alamat (dicek di status-service,
    // karena skema ini tidak tahu cara pengiriman pesanan)
  });
