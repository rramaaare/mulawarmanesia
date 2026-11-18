/**
 * Ticker: strip merah berjalan ke kanan di paling atas landing berisi info penting
 * (PO batch, minimal order, durasi produksi). Isinya diulang dua kali agar animasi tampak tanpa putus.
 */
const MESSAGES = [
  "PO BATCH NOVEMBER DIBUKA",
  "MINIMAL ORDER 12 PCS",
  "PRODUKSI 10–14 HARI KERJA",
  "KIRIM KE SELURUH INDONESIA",
];

export function Ticker() {
  const row = MESSAGES.map((message) => (
    <span key={message} className="mx-8 whitespace-nowrap text-[10px] font-medium tracking-wide">
      {message} <span aria-hidden className="ml-8">→</span>
    </span>
  ));
  return (
    <div className="overflow-hidden bg-accent py-2 text-white" aria-label="Informasi penting">
      <div className="animate-marquee flex w-max">
        <div className="flex">{row}</div>
        <div className="flex" aria-hidden>{row}</div>
      </div>
    </div>
  );
}
