"use client";
/**
 * PrintButton: tombol yang membuka dialog cetak browser (bisa dipilih "Simpan sebagai PDF").
 * Dipakai di halaman lembar produksi.
 */
import { Button } from "@/components/ui/Button";

export function PrintButton({ label = "Cetak / simpan PDF" }: { label?: string }) {
  return (
    <Button onClick={() => window.print()} className="print:hidden">
      {label}
    </Button>
  );
}
