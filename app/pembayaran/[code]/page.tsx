/**
 * Halaman Pembayaran ("/pembayaran/MLW-xxxx?token=...").
 * Token dari tautan wajib benar; bila salah, tampil halaman "tidak ditemukan".
 * Server langsung membuatkan tagihan QRIS (atau memakai ulang yang masih menunggu),
 * jadi kode QR sudah tampil begitu halaman terbuka.
 */
import { notFound, redirect } from "next/navigation";
import { CheckoutHeader } from "@/components/ui/CheckoutHeader";
import { PaymentApp } from "@/features/payment/PaymentApp";
import { nowMs } from "@/lib/clock";
import { getOrderByToken } from "@/server/services/order-view-service";
import { startPayment } from "@/server/services/payment-service";

export const dynamic = "force-dynamic";

export default async function PaymentPage({
  params,
  searchParams,
}: {
  params: Promise<{ code: string }>;
  searchParams: Promise<{ token?: string; hasil?: string }>;
}) {
  const { code } = await params;
  const { token = "", hasil } = await searchParams;
  const order = await getOrderByToken(code, token).catch(() => null);
  if (!order) notFound();
  // Sudah lunas: tidak ada lagi yang perlu dibayar
  if (order.paymentState === "lunas") redirect(`/pesanan-berhasil/${code}?token=${token}`);

  // Tagihan awal (QRIS). Gagal dibuat (mis. pesanan kedaluwarsa) -> null, halaman menampilkan pesan.
  const created = await startPayment(code, "qris").catch(() => null);
  const ticket = created
    ? { gatewayRef: created.gatewayRef, method: created.method, amount: created.amount, instruction: created.instruction }
    : null;

  return (
    <>
      <CheckoutHeader step={3} />
      <main className="flex-1">
        <PaymentApp
          initialOrder={order}
          token={token}
          initialTicket={ticket}
          serverNow={nowMs()}
          notice={hasil === "gagal" || hasil === "kedaluwarsa" ? hasil : undefined}
        />
      </main>
    </>
  );
}
