/**
 * ManifestoSection: pita pastel kuning dengan garis hitam atas-bawah berisi
 * pernyataan merek dan tiga janji. Angka "12" putih di latar bergerak paralaks 0.3×.
 */
import { ParallaxLayer } from "@/components/ParallaxLayer";

const PROMISES = [
  { title: "Jahitan rapi", text: "Setiap pcs lolos QC sebelum dikemas." },
  { title: "Warna jujur", text: "Palet hanya dari kain yang benar-benar ada di stok." },
  { title: "Jadwal jelas", text: "Status pesanan bisa dipantau kapan saja." },
];

export function ManifestoSection() {
  return (
    <section className="relative overflow-y-clip border-y-2 border-ink bg-pastel-butter">
      <div className="relative mx-auto max-w-7xl px-4 py-14 md:px-8 md:py-16">
        <ParallaxLayer speed={0.3} className="pointer-events-none absolute right-4 top-2 z-0 select-none md:right-8">
          <span className="block text-[clamp(170px,30vw,430px)] font-semibold leading-none text-white" aria-hidden>
            12
          </span>
        </ParallaxLayer>
        <div className="relative z-10 flex flex-col gap-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-accent">Manifesto</p>
          <h2 className="max-w-2xl text-3xl font-medium leading-[1.15] tracking-tight md:text-5xl">
            Seragam bukan sekadar kain. Ia tanda bahwa kita <span className="text-accent">satu barisan.</span>
          </h2>
          <ul className="mt-6 grid gap-6 md:grid-cols-3">
            {PROMISES.map((item) => (
              <li key={item.title}>
                <h3 className="text-sm font-semibold">{item.title}</h3>
                <p className="mt-1 text-xs text-ink-soft">{item.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
