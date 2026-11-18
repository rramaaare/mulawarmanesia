/**
 * Route API: POST /api/payments/simulate
 * Dipakai HANYA oleh halaman "Simulator Gateway" untuk meniru gateway yang
 * mengirim webhook. Menandatangani pesan lalu memprosesnya lewat jalur webhook asli.
 */
import { z } from "zod";
import { handle } from "@/server/api-helpers";
import { AppError } from "@/server/errors";
import { simulateGatewayResult } from "@/server/services/payment-service";

const bodySchema = z.object({
  gatewayRef: z.string().min(1),
  status: z.enum(["sukses", "gagal", "kedaluwarsa"]),
});

export async function POST(request: Request) {
  return handle(async () => {
    // Simulator tidak boleh aktif di produksi sungguhan
    if (process.env.NODE_ENV === "production" && process.env.ENABLE_PAYMENT_SIMULATOR !== "true") {
      throw new AppError("Simulator pembayaran dimatikan", 403);
    }
    const { gatewayRef, status } = bodySchema.parse(await request.json());
    return simulateGatewayResult(gatewayRef, status);
  });
}
