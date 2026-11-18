/**
 * Halaman Panduan Ukuran ("/panduan-ukuran"): tabel lingkar dada dan panjang badan tiap ukuran
 * beserta cara mengukur. Data tabel sama dengan dialog "Panduan ukuran" di halaman Pesanan.
 */
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Footer } from "@/components/ui/Footer";
import { Navbar } from "@/components/ui/Navbar";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { SIZE_GUIDE } from "@/lib/domain/size-guide";
import { getCatalog } from "@/server/services/catalog-service";

export const dynamic = "force-dynamic";

export const metadata = { title: "Panduan Ukuran | MULAWARMANESIA" };

export default async function SizeGuidePage() {
  const catalog = await getCatalog();
  return (
    <>
      <Navbar />
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-4 py-12 md:px-8">
        <SectionTitle title="Panduan ukuran" description="Ukur badan atau kemeja yang pas dipakai, lalu cocokkan dengan tabel di bawah. Angka dalam sentimeter." />
        <Card className="overflow-x-auto !p-0">
          <table className="w-full min-w-[360px] text-left text-sm">
            <thead>
              <tr className="border-b-2 border-ink bg-subtle">
                <th className="px-5 py-3">Ukuran</th>
                <th className="px-5 py-3">Lingkar dada (cm)</th>
                <th className="px-5 py-3">Panjang badan (cm)</th>
              </tr>
            </thead>
            <tbody>
              {SIZE_GUIDE.map(({ size, chest, length }) => (
                <tr key={size} className="border-b border-line last:border-b-0">
                  <td className="px-5 py-3 font-semibold">{size}</td>
                  <td className="px-5 py-3">{chest}</td>
                  <td className="px-5 py-3">{length}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
        <Card tone="butter" className="flex flex-col gap-2 text-sm">
          <h2 className="font-semibold">Cara mengukur</h2>
          <p><span className="font-semibold">Lingkar dada:</span> lingkarkan meteran di bagian dada terlebar, di bawah ketiak.</p>
          <p><span className="font-semibold">Panjang badan:</span> ukur dari pangkal leher di bahu sampai ujung bawah kemeja.</p>
          <p className="text-ink-soft">Ragu antara dua ukuran? Pilih yang lebih besar.</p>
        </Card>
        <Button href="/editor" className="w-fit">Mulai Custom →</Button>
      </main>
      <Footer catalog={catalog} />
    </>
  );
}
