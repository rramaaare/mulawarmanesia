/**
 * Halaman Lacak Pesanan ("/lacak"): form nomor pesanan + nomor WhatsApp, dengan kartu ilustrasi
 * contoh status di bawahnya (di desktop berdampingan).
 */
import { Navbar } from "@/components/ui/Navbar";
import { TrackingForm } from "@/features/tracking/TrackingForm";

/** Tiga langkah contoh untuk kartu ilustrasi: [judul, keterangan, keadaan]. */
const EXAMPLE_STEPS = [
  ["Dibayar", "16 Nov · pembayaran diterima", "done"],
  ["Cek desain", "17 Nov · sedang diperiksa admin", "current"],
  ["Produksi", "Menunggu giliran", "next"],
] as const;

export default function TrackingPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 px-4 py-7 md:py-12">
        <div className="mx-auto grid max-w-5xl items-start gap-6 lg:grid-cols-2 lg:gap-12">
          <TrackingForm />
          {/* Kartu ilustrasi: contoh tampilan status pesanan */}
          <div className="rounded-panel border-2 border-ink bg-pastel-mint p-5 shadow-hard-lg" aria-hidden>
            <div className="flex flex-col gap-3 rounded-card border-2 border-ink bg-surface p-4">
              {EXAMPLE_STEPS.map(([title, text, state]) => (
                <div key={title} className="flex items-center gap-3">
                  <span
                    className={
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold " +
                      (state === "done" ? "border-accent bg-accent text-white" : state === "current" ? "border-ink bg-ink text-white" : "border-line text-ink-muted")
                    }
                  >
                    {state === "done" ? "✓" : state === "current" ? "2" : "3"}
                  </span>
                  <div>
                    <p className="text-sm font-semibold">{title}</p>
                    <p className="text-xs text-ink-muted">{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
