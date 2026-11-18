/**
 * HowToOrder: lima langkah memesan, dari desain sampai menerima barang.
 */
import { Card } from "@/components/ui/Card";
import { SectionTitle } from "@/components/ui/SectionTitle";

/** Isi lima langkah (urutan = alur pelanggan di PRD §6). */
const STEPS = [
  { title: "Desain di editor", text: "Pilih model, warna, logo, dan teks. Tanpa perlu login." },
  { title: "Isi ukuran & data", text: "Jumlah per ukuran, data pemesan, dan pengiriman di satu halaman." },
  { title: "Bayar", text: "QRIS, virtual account, atau e-wallet. Lunas atau DP 50%." },
  { title: "Kami produksi", text: "Cek desain, potong, jahit, bordir, lalu QC." },
  { title: "Lacak & terima", text: "Pantau status dengan nomor pesanan dan nomor WhatsApp." },
];

export function HowToOrder() {
  return (
    <section id="cara-pesan">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-14 md:px-8 md:py-16">
        <SectionTitle title="Cara pesan, 5 langkah" />
        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {STEPS.map((step, index) => (
            <li key={step.title}>
              <Card shadow="sm" className="flex h-full flex-col gap-3 !p-4">
                <span className="flex h-7 w-9 items-center justify-center rounded-control border-2 border-ink bg-accent text-xs font-semibold text-white">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="text-sm font-semibold">{step.title}</h3>
                <p className="text-xs leading-relaxed text-ink-soft">{step.text}</p>
              </Card>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
