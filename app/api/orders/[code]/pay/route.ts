/**
 * Route API: POST /api/orders/[code]/pay
 * Membuat tagihan pembayaran untuk pesanan (body: { method: "qris" | "va" | "ewallet" }).
 */
import { z } from "zod";
import { handle } from "@/server/api-helpers";
import { startPayment } from "@/server/services/payment-service";

const bodySchema = z.object({ method: z.enum(["qris", "va", "ewallet"]) });

export async function POST(request: Request, context: { params: Promise<{ code: string }> }) {
  return handle(async () => {
    const { code } = await context.params;
    const { method } = bodySchema.parse(await request.json());
    return startPayment(code, method);
  });
}
