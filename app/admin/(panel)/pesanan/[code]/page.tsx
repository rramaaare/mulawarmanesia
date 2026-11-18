/**
 * Halaman Detail Pesanan Admin ("/admin/pesanan/MLW-xxxx") - desain "Detail pesanan".
 * Kiri: desain depan/belakang, warna per bagian, file logo (dengan cek resolusi), rincian ukuran,
 * pemesan & pengiriman. Kanan: ubah status, pembayaran, riwayat status, dan chat WhatsApp.
 */
import Link from "next/link";
import { notFound } from "next/navigation";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { StatusChanger } from "@/features/admin/StatusChanger";
import { StatusPill } from "@/features/admin/StatusPill";
import { OrderDesignPreview, type StoredDesign } from "@/features/status/OrderDesignPreview";
import { POSITIONS, type PositionKey } from "@/features/editor/garment-data";
import { SIZES } from "@/lib/domain/constants";
import { STATUS_LABEL } from "@/lib/domain/order-status";
import { cn } from "@/lib/cn";
import { formatDateTimeWita, formatRupiah } from "@/lib/format";
import { getCatalog } from "@/server/services/catalog-service";
import { getOrderForAdmin } from "@/server/services/order-view-service";
import { readUploadInfo } from "@/server/services/upload-service";

export const dynamic = "force-dynamic";

/** Batas sisi terpendek (px) agar bordir tajam; sama dengan aturan di editor. */
const MIN_SIDE_PX = 500;

/** Baris "label ..... nilai" yang rata kiri-kanan. */
function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-6 text-sm">
      <dt className="text-ink-muted">{label}</dt>
      <dd className="text-right">{value}</dd>
    </div>
  );
}

/** 1200000 byte -> "1,2 MB". */
function formatBytes(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toLocaleString("id-ID", { maximumFractionDigits: 1 })} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const order = await getOrderForAdmin(code).catch(() => null);
  if (!order) notFound();
  const catalog = await getCatalog();
  const design = order.item.designJson as StoredDesign;

  // Info tiap file logo (ukuran, dimensi) dari folder unggahan
  const assets = await Promise.all(
    order.item.assets.map(async (asset) => ({
      ...asset,
      label: design.images.find((image) => image.fileName === asset.fileName)?.label ?? asset.fileName,
      info: await readUploadInfo(asset.fileName),
    })),
  );
  const lowResolution = assets.filter((asset) => asset.info && !asset.info.isVector && asset.info.width && Math.min(asset.info.width, asset.info.height ?? 0) < MIN_SIDE_PX);

  // Pembayaran sukses terakhir
  const paid = order.payments.find((payment) => payment.status === "sukses");
  const methodLabel = paid ? ({ qris: "QRIS", va: "Virtual Account", ewallet: "E-wallet" } as Record<string, string>)[paid.method] ?? paid.method : "-";
  const sizeMap = new Map(order.item.sizes.map((row) => [row.size, row.qty]));

  return (
    <div className="flex flex-col gap-6">
      <Link href="/admin/pesanan" className="w-fit text-sm font-medium text-ink-soft hover:underline">← Kembali ke daftar</Link>

      {/* Judul */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-4xl font-medium tracking-tight">{order.code}</h1>
          <p className="mt-1 text-sm text-ink-soft">
            {order.customerName}{order.organization && ` · ${order.organization}`} · dibuat {formatDateTimeWita(order.createdAt)}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <StatusPill status={order.status} prefix="Status: " />
          <Button href={`/admin/pesanan/${order.code}/lembar`} variant="secondary">Unduh lembar produksi (PDF)</Button>
        </div>
      </div>

      <div className="grid items-start gap-6 xl:grid-cols-[1fr_380px]">
        <div className="flex min-w-0 flex-col gap-6 xl:sticky xl:top-6">
          {/* Desain */}
          <Card className="flex flex-col gap-5 !p-5">
            <div>
              <h2 className="text-xl font-medium">Desain</h2>
              <p className="mt-0.5 text-xs text-ink-muted">{order.item.product} {order.item.categoryName} · {order.item.materialName} · render dari data editor</p>
            </div>
            <OrderDesignPreview order={order} catalog={catalog} separate heightClass="h-56" />

            <div>
              <h3 className="mb-2 text-sm font-medium">Warna per bagian</h3>
              <ul className="flex flex-wrap gap-2">
                {Object.entries(design.colors).map(([part, colorName]) => (
                  <li key={part} className="flex items-center gap-2 rounded-full border-2 border-ink bg-surface px-3 py-1 text-xs font-medium">
                    <span className="h-3.5 w-3.5 rounded-full border-2 border-ink" style={{ backgroundColor: catalog.colors.find((color) => color.name === colorName)?.hex ?? "#ccc" }} />
                    {part}: {colorName}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col gap-3">
              <h3 className="text-sm font-medium">File dari pelanggan</h3>
              {assets.length === 0 && <p className="text-sm text-ink-muted">Tidak ada logo.</p>}
              {assets.map((asset) => (
                <div key={asset.fileName} className="flex items-center gap-4 rounded-card border-2 border-ink bg-surface p-3 shadow-hard-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`/api/uploads/${asset.fileName}`} alt="" className="h-14 w-14 rounded-control border-2 border-ink bg-pastel-blue object-contain p-1" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{asset.label}</p>
                    <p className="text-xs text-ink-muted">
                      {asset.info ? formatBytes(asset.info.sizeBytes) : "ukuran tidak diketahui"}
                      {asset.info?.isVector ? " · vektor (SVG)" : asset.info?.width ? ` · ${asset.info.width} × ${asset.info.height} px` : ""}
                      {` · ${asset.technique === "bordir" ? "Bordir" : "Sablon"} · ${POSITIONS[asset.position as PositionKey]?.label.toLowerCase() ?? asset.position}`}
                    </p>
                  </div>
                  <a href={`/api/uploads/${asset.fileName}`} download={asset.label} className="shrink-0 text-sm font-semibold text-accent hover:underline">Unduh</a>
                </div>
              ))}
              {assets.length > 0 && (lowResolution.length === 0 ? (
                <Alert tone="success" title="Resolusi logo memenuhi syarat">
                  {assets.every((asset) => asset.info?.isVector)
                    ? "Semua logo berformat vektor, tajam di ukuran berapa pun."
                    : `Sisi terpendek ${Math.min(...assets.filter((asset) => asset.info?.width).map((asset) => Math.min(asset.info!.width!, asset.info!.height ?? Infinity)))} px, minimal ${MIN_SIDE_PX} px untuk bordir.`}
                </Alert>
              ) : (
                <Alert tone="warning" title="Resolusi logo rendah">
                  {lowResolution.map((asset) => `${asset.label}: sisi terpendek ${Math.min(asset.info!.width!, asset.info!.height ?? Infinity)} px`).join("; ")}. Minimal {MIN_SIDE_PX} px agar bordir tajam. Pertimbangkan meminta revisi.
                </Alert>
              ))}
            </div>
          </Card>

          {/* Rincian ukuran */}
          <Card className="flex flex-col gap-4 !p-5">
            <div>
              <h2 className="text-xl font-medium">Rincian ukuran</h2>
              <p className="mt-0.5 text-xs text-ink-muted">{order.item.totalPcs} pcs · {order.item.names.length > 0 ? "dengan nama per orang" : "tanpa nama per orang"}</p>
            </div>
            <div className="overflow-x-auto">
              <div className="min-w-[480px] overflow-hidden rounded-card border-2 border-ink">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-ink text-xs text-white">
                      <th className="px-4 py-3 text-left font-medium">Ukuran</th>
                      {SIZES.map((size) => <th key={size} className="px-2 py-3 text-center font-medium">{size}</th>)}
                      <th className="px-4 py-3 text-right font-medium">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="px-4 py-3">Pcs</td>
                      {SIZES.map((size) => <td key={size} className="px-2 py-3 text-center tabular-nums">{sizeMap.get(size) ?? 0}</td>)}
                      <td className="px-4 py-3 text-right font-semibold tabular-nums">{order.item.totalPcs}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            {order.item.names.length > 0 && (
              <ol className="grid list-decimal gap-x-8 pl-5 text-sm sm:grid-cols-2">
                {order.item.names.map((row, index) => <li key={index}>{row.name} ({row.size})</li>)}
              </ol>
            )}
            <div className="flex items-start justify-between gap-6 text-sm">
              <span className="text-ink-muted">Catatan pelanggan</span>
              <span className="text-right">{order.item.notes ?? "-"}</span>
            </div>
          </Card>

          {/* Pemesan & pengiriman */}
          <Card className="flex flex-col gap-4 !p-5">
            <h2 className="text-xl font-medium">Pemesan &amp; pengiriman</h2>
            <dl className="flex flex-col gap-3">
              <Row label="Nama" value={order.customerName} />
              <Row label="WhatsApp" value={<a className="hover:underline" href={`https://wa.me/${order.whatsapp}`}>{order.whatsapp}</a>} />
              <Row label="Email" value={order.email} />
              <Row label="Organisasi" value={order.organization ?? "-"} />
              <Row label="Pengiriman" value={order.shippingMethod === "KIRIM" ? `Kirim ke alamat · ${formatRupiah(order.shippingFee)}` : "Ambil di workshop"} />
              {order.shippingMethod === "KIRIM" && <Row label="Alamat" value={`${order.address}, ${order.city}${order.postalCode ? ` ${order.postalCode}` : ""}`} />}
              {order.resi && <Row label="Resi" value={`${order.courier} ${order.resi}`} />}
            </dl>
          </Card>
        </div>

        <div className="flex min-w-0 flex-col gap-6 xl:sticky xl:top-6">
          <StatusChanger code={order.code} current={order.status} />

          <Card className="flex flex-col gap-4 !p-5">
            <h2 className="text-xl font-medium">Pembayaran</h2>
            <dl className="flex flex-col gap-3">
              <Row label="Skema" value={order.paymentScheme === "DP50" ? "DP 50%" : "Lunas"} />
              <Row label="Metode" value={methodLabel} />
              <Row label="Diterima" value={paid?.paidAt ? formatDateTimeWita(paid.paidAt) : "Belum ada"} />
              <Row label="Sudah dibayar" value={formatRupiah(order.amountPaid)} />
            </dl>
            <div className="flex items-end justify-between border-t-2 border-ink pt-4">
              <span className="text-sm font-semibold">Total</span>
              <span className="text-3xl font-medium text-accent">{formatRupiah(order.total)}</span>
            </div>
          </Card>

          <Card className="!p-5">
            <h2 className="mb-4 text-xl font-medium">Riwayat status</h2>
            <ol className="flex flex-col">
              {order.logs.map((log, index) => {
                const isLast = index === order.logs.length - 1;
                return (
                  <li key={index} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <span
                        className={cn(
                          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-semibold text-white",
                          isLast ? "border-ink bg-ink shadow-[3px_3px_0_0_#c12822]" : "border-accent bg-accent",
                        )}
                        aria-hidden
                      >
                        {isLast ? index + 1 : "✓"}
                      </span>
                      {!isLast && <span className="w-0.5 flex-1 bg-accent" />}
                    </div>
                    <div className="pb-5">
                      <p className="text-sm font-medium">{STATUS_LABEL[log.status]}</p>
                      <p className="text-xs text-ink-muted">{formatDateTimeWita(log.changedAt)} · {log.changedBy}</p>
                      {log.note && <p className="mt-1 text-xs text-ink-soft">“{log.note}”</p>}
                    </div>
                  </li>
                );
              })}
            </ol>
          </Card>

          <Button href={`https://wa.me/${order.whatsapp}?text=${encodeURIComponent(`Halo ${order.customerName}, soal pesanan ${order.code}`)}`} variant="dark" size="lg" className="w-full">
            Chat pemesan via WhatsApp →
          </Button>
        </div>
      </div>
    </div>
  );
}
