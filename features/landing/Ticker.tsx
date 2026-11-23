/**
 * Ticker: strip merah berjalan ke kanan di paling atas landing berisi info penting
 * (PO batch, minimal order, durasi produksi). Isinya diatur superadmin di Pengaturan > Pengumuman
 * landing. Diulang dua kali agar animasi tampak tanpa putus. Tanpa pesan aktif, strip tidak ditampilkan.
 */
export function Ticker({ messages }: { messages: string[] }) {
  if (messages.length === 0) return null;
  const row = messages.map((message, index) => (
    <span key={index} className="mx-8 whitespace-nowrap text-xs font-medium uppercase tracking-wide md:text-[10px]">
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
