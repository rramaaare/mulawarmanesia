/**
 * Halaman Lacak Pesanan ("/lacak"): berisi form nomor pesanan + nomor WhatsApp.
 */
import { Navbar } from "@/components/ui/Navbar";
import { TrackingForm } from "@/features/tracking/TrackingForm";

export default function TrackingPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 px-4 py-12">
        <TrackingForm />
      </main>
    </>
  );
}
