/**
 * Halaman Status Pesanan ("/status/MLW-xxxx?token=..."): nomor pesanan, tag status,
 * alert (revisi/dikirim/DP), timeline 8 tahap, ringkasan desain, dan tombol bantuan WhatsApp.
 */
import { notFound } from "next/navigation";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Navbar } from "@/components/ui/Navbar";
import { Tag } from "@/components/ui/Tag";
import { OrderDesignPreview } from "@/features/status/OrderDesignPreview";
import { OrderTimeline } from "@/features/status/OrderTimeline";
import { STATUS_LABEL } from "@/lib/domain/order-status";
import { formatRupiah } from "@/lib/format";
import { getCatalog } from "@/server/services/catalog-service";
import { getOrderByToken } from "@/server/services/order-view-service";

export const dynamic = "force-dynamic";

/** Nomor WhatsApp admin untuk tombol bantuan (dummy). */
const ADMIN_WA = "6281255550199";

export default async function StatusPage({
  params,
  searchParams,
}: {
  params: Promise<{ code: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const { code } = await params;
  const { token = "" } = await searchParams;
  const order = await getOrderByToken(code, token).catch(() => null);
  if (!order) notFound();
  const catalog = await getCatalog();

  const remaining = order.total - order.amountPaid;
  const waLink = `https://wa.me/${ADMIN_WA}?text=${encodeURIComponent(`Halo admin, saya mau tanya pesanan ${order.code}`)}`;

  return (
    <>
      <Navbar />
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-10 md:px-8">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-semibold">{order.code}</h1>
          <Tag tone={order.status === "perlu_revisi" ? "warning" : order.status === "selesai" ? "success" : "accent"}>{STATUS_LABEL[order.status]}</Tag>
        </div>

        {order.status === "perlu_revisi" && <Alert tone="warning" title="Desainmu perlu direvisi">{order.revisionReason} Admin akan menghubungi lewat WhatsApp.</Alert>}
        {order.status === "dikirim" && <Alert tone="success" title="Pesananmu sedang dikirim">{order.courier} · nomor resi {order.resi}</Alert>}
        {order.status === "kedaluwarsa" && <Alert tone="danger" title="Pesanan kedaluwarsa">[!] Batas waktu pembayaran habis. Buat pesanan baru dari editor.</Alert>}
        {order.paymentState === "dp_dibayar" && remaining > 0 && (
          <Alert tone="info" title={`Sisa tagihan ${formatRupiah(remaining)}`}>
            Lunasi sebelum pesanan siap kirim.{" "}
            <a className="font-semibold underline" href={`/pembayaran/${order.code}?token=${token}`}>Bayar sisa tagihan →</a>
          </Alert>
        )}

        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          {/* self-start: kartu hanya setinggi isinya (tidak ditarik setinggi kolom kanan), sticky saat di-scroll */}
          <Card className="self-start lg:sticky lg:top-24">
            <h2 className="mb-4 text-xl font-semibold">Timeline</h2>
            <OrderTimeline order={order} />
          </Card>
          <div className="flex flex-col gap-6 self-start lg:sticky lg:top-24">
            <Card className="flex flex-col gap-4">
              <h2 className="text-xl font-semibold">Ringkasan</h2>
              <OrderDesignPreview order={order} catalog={catalog} />
              <dl className="grid grid-cols-2 gap-y-1 text-sm">
                <dt className="text-ink-muted">Produk</dt><dd>{order.item.product} {order.item.categoryName}</dd>
                <dt className="text-ink-muted">Bahan</dt><dd>{order.item.materialName}</dd>
                <dt className="text-ink-muted">Ukuran</dt><dd>{order.item.sizes.map((row) => `${row.size}:${row.qty}`).join(" · ")}</dd>
                <dt className="text-ink-muted">Total pcs</dt><dd>{order.item.totalPcs}</dd>
                <dt className="text-ink-muted">Tujuan</dt><dd>{order.shippingMethod === "KIRIM" ? order.city : "Ambil di workshop"}</dd>
                <dt className="text-ink-muted">Pembayaran</dt><dd>{order.paymentState === "lunas" ? "Lunas" : order.paymentState === "dp_dibayar" ? "DP dibayar" : "Belum dibayar"}</dd>
                <dt className="font-semibold">Total</dt><dd className="font-semibold text-accent">{formatRupiah(order.total)}</dd>
              </dl>
            </Card>
            <Button href={waLink} variant="secondary" className="w-full">Chat admin via WhatsApp →</Button>
          </div>
        </div>
      </main>
    </>
  );
}
