/**
 * OrderSummary: kartu ringkasan desain dan harga di kolom kanan halaman Pesanan.
 * Murni tampilan: menerima hasil hitungan harga lewat props.
 */
import { Garment } from "@/components/Garment";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { PriceResult } from "@/lib/domain/pricing";
import { formatRupiah } from "@/lib/format";
import type { GarmentImage, GarmentText } from "@/components/Garment";
import type { ProductType } from "@/features/editor/garment-data";

interface OrderSummaryProps {
  product: ProductType;
  title: string; // mis. "PDH Organisasi"
  subtitle: string; // mis. "American Drill · 1 bordir dada kiri"
  hexColors: Record<string, string>;
  images: GarmentImage[];
  texts: GarmentText[];
  price: PriceResult;
  schemeLabel: string;
  payNowAmount: number;
  submitting: boolean;
  onSubmit: () => void;
}

/** Satu baris "label ..... nilai". */
function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={strong ? "flex justify-between text-base font-semibold" : "flex justify-between text-sm text-ink-soft"}>
      <span>{label}</span>
      <span className={strong ? "text-accent" : ""}>{value}</span>
    </div>
  );
}

export function OrderSummary({ product, title, subtitle, hexColors, images, texts, price, schemeLabel, payNowAmount, submitting, onSubmit }: OrderSummaryProps) {
  return (
    // self-start: kartu hanya setinggi isinya (tidak ditarik memenuhi tinggi baris), lalu menempel (sticky) saat di-scroll
    <Card className="flex flex-col gap-3 self-start !p-4 lg:sticky lg:top-24">
      <div className="rounded-card border-2 border-ink bg-subtle p-2">
        <Garment product={product} colors={hexColors} images={images} texts={texts} className="mx-auto h-32 w-auto" />
      </div>
      <div>
        <p className="font-semibold">{title}</p>
        <p className="text-xs text-ink-muted">{subtitle}</p>
      </div>
      <div className="flex flex-col gap-1.5 border-t-2 border-ink pt-3">
        <Row label={`${title} × ${price.totalPcs} pcs`} value={formatRupiah(price.subtotal - price.decorationTotal)} />
        {price.decorationTotal > 0 && <Row label={`Bordir/sablon × ${price.totalPcs}`} value={formatRupiah(price.decorationTotal)} />}
        {price.discount > 0 && <Row label="Diskon volume" value={`− ${formatRupiah(price.discount)}`} />}
        <Row label="Ongkir" value={formatRupiah(price.shippingFee)} />
        <Row label="Total" value={formatRupiah(price.total)} strong />
        <Row label={`Dibayar sekarang (${schemeLabel})`} value={formatRupiah(payNowAmount)} />
      </div>
      <Button size="lg" onClick={onSubmit} disabled={submitting} className="w-full">
        {submitting ? "Memproses…" : "Bayar sekarang →"}
      </Button>
      <p className="text-xs text-ink-muted">Harga dihitung ulang di server saat checkout. Produksi dimulai setelah pembayaran diterima.</p>
    </Card>
  );
}
