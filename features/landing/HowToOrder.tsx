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
              <Card shadow="sm" className="flex h-full flex-row items-start gap-3.5 !p-4 lg:flex-col lg:gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-control border-2 border-ink bg-accent text-base font-semibold text-white lg:h-7 lg:w-9 lg:text-xs">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="flex min-w-0 flex-col gap-1 lg:gap-3">
                  <h3 className="text-xl font-semibold lg:text-sm">{step.title}</h3>
                  <p className="text-sm leading-relaxed text-ink-soft lg:text-xs">{step.text}</p>
                </div>
              </Card>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
