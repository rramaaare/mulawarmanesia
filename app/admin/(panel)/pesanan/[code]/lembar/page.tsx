/**
 * Halaman Lembar Produksi ("/admin/pesanan/MLW-xxxx/lembar"): lembar kerja satu halaman untuk
 * workshop (desain depan/belakang, warna, tabel ukuran, daftar nama, catatan). Tombol "Cetak / simpan PDF"
 * membuka dialog cetak browser; menu samping dan tombol disembunyikan saat dicetak.
 */
import Link from "next/link";
import { notFound } from "next/navigation";
import { PrintButton } from "@/features/admin/PrintButton";
import { OrderDesignPreview, type StoredDesign } from "@/features/status/OrderDesignPreview";
import { SIZES } from "@/lib/domain/constants";
import { formatDateTimeWita } from "@/lib/format";
import { getCatalog } from "@/server/services/catalog-service";
import { getOrderForAdmin } from "@/server/services/order-view-service";

export const dynamic = "force-dynamic";

export default async function ProductionSheetPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const order = await getOrderForAdmin(code).catch(() => null);
  if (!order) notFound();
  const catalog = await getCatalog();
  const design = order.item.designJson as StoredDesign;
  const sizeMap = new Map(order.item.sizes.map((row) => [row.size, row.qty]));

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 print:max-w-none print:gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link href={`/admin/pesanan/${order.code}`} className="text-sm font-medium text-ink-soft hover:underline">← Kembali ke detail</Link>
        <PrintButton />
      </div>

      <header className="border-b-2 border-ink pb-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-accent">MULAWARMANESIA · Lembar produksi</p>
        <h1 className="text-4xl font-medium tracking-tight">{order.code}</h1>
        <p className="text-sm text-ink-soft">
          {order.item.product} {order.item.categoryName} · {order.item.materialName} · {order.item.totalPcs} pcs · dibuat {formatDateTimeWita(order.createdAt)}
        </p>
        <p className="text-sm text-ink-soft">Pemesan: {order.customerName}{order.organization && ` (${order.organization})`}</p>
      </header>

      <OrderDesignPreview order={order} catalog={catalog} separate heightClass="h-60" />

      <section>
        <h2 className="mb-2 text-lg font-medium">Warna per bagian</h2>
        <ul className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
          {Object.entries(design.colors).map(([part, colorName]) => <li key={part}>{part}: <span className="font-semibold">{colorName}</span></li>)}
        </ul>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-medium">Logo &amp; teks</h2>
        <ul className="flex flex-col gap-1 text-sm">
          {design.images.map((image) => <li key={image.fileName}>Logo {image.label ?? image.fileName} · {image.technique ?? "bordir"} · {image.position.replace(/_/g, " ")}</li>)}
          {design.texts.map((text, index) => <li key={index}>Teks “{text.content}” · {text.font} · {text.color} · {text.position.replace(/_/g, " ")}</li>)}
          {design.images.length === 0 && design.texts.length === 0 && <li className="text-ink-muted">Tanpa logo atau teks.</li>}
        </ul>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-medium">Rincian ukuran</h2>
        <table className="w-full border-2 border-ink text-center text-sm">
          <thead>
            <tr className="border-b-2 border-ink bg-subtle">
              {SIZES.map((size) => <th key={size} className="py-2">{size}</th>)}
              <th className="py-2">Total</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              {SIZES.map((size) => <td key={size} className="py-2 tabular-nums">{sizeMap.get(size) ?? 0}</td>)}
              <td className="py-2 font-semibold tabular-nums">{order.item.totalPcs}</td>
            </tr>
          </tbody>
        </table>
      </section>

      {order.item.names.length > 0 && (
        <section>
          <h2 className="mb-2 text-lg font-medium">Daftar nama</h2>
          <ol className="grid list-decimal gap-x-8 pl-5 text-sm sm:grid-cols-2">
            {order.item.names.map((row, index) => <li key={index}>{row.name} ({row.size})</li>)}
          </ol>
        </section>
      )}

      <section>
        <h2 className="mb-2 text-lg font-medium">Catatan pelanggan</h2>
        <p className="text-sm">{order.item.notes ?? "-"}</p>
      </section>
    </div>
  );
}
