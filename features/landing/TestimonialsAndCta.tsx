/**
 * Dua section penutup landing: Testimonials (3 kutipan klien, contoh) dan CtaSection
 * (kartu merah ajakan terakhir "Siap bikin seragammu?").
 */
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SectionTitle } from "@/components/ui/SectionTitle";

/** Kutipan contoh; ganti dengan testimoni asli sebelum rilis. */
const QUOTES = [
  { text: "Warna di layar sama dengan yang datang. Logo himpunan dibordir rapi.", who: "Ketua himpunan", note: "PDH 120 pcs", initial: "K", tone: "bg-pastel-blue" },
  { text: "Rompi datang sebelum proyek mulai. Statusnya bisa dicek tanpa harus menelepon.", who: "Koordinator K3", note: "VEST 60 pcs", initial: "K", tone: "bg-pastel-butter" },
  { text: "Editor-nya gampang, anggota bisa ikut memilih warna sebelum kami pesan.", who: "Pengurus komunitas", note: "PDH 45 pcs", initial: "P", tone: "bg-pastel-mint" },
] as const;

export function Testimonials() {
  return (
    <section>
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-14 md:px-8 md:py-16">
        <SectionTitle title="Kata mereka" />
        <div className="grid gap-6 md:grid-cols-3">
          {QUOTES.map((quote) => (
            <Card key={quote.text} className="flex flex-col justify-between gap-6">
              <blockquote className="text-sm leading-relaxed">“{quote.text}”</blockquote>
              <div className="flex items-center gap-3">
                <span className={`flex h-9 w-9 items-center justify-center rounded-full border-2 border-ink text-xs font-semibold ${quote.tone}`} aria-hidden>
                  {quote.initial}
                </span>
                <div>
                  <p className="text-xs font-semibold">{quote.who}</p>
                  <p className="text-[11px] text-ink-muted">Contoh testimoni · {quote.note}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

export function CtaSection() {
  return (
    <section>
      <div className="mx-auto max-w-7xl px-4 pb-16 md:px-8 md:pb-20">
        <div className="flex flex-wrap items-center justify-between gap-6 rounded-panel border-2 border-ink bg-accent p-8 text-white shadow-hard-lg md:p-12">
          <div className="flex max-w-xl flex-col gap-2">
            <h2 className="text-3xl font-medium md:text-4xl">Siap bikin seragammu?</h2>
            <p className="text-sm">Coba editor sekarang. Gratis, tanpa login, dan draf tersimpan otomatis.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button href="/editor" variant="dark">Mulai Custom →</Button>
            <Button href="https://wa.me/6281255550199?text=Halo%20MULAWARMANESIA%2C%20saya%20mau%20tanya%20soal%20seragam" variant="secondary">Tanya via WhatsApp</Button>
          </div>
        </div>
      </div>
    </section>
  );
}
