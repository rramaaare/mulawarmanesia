"use client";
/**
 * SizeGuideModal: dialog tabel panduan ukuran (lingkar dada dan panjang badan).
 * Datanya diambil dari lib/domain/size-guide.ts (sama dengan halaman /panduan-ukuran).
 */
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { SIZE_GUIDE } from "@/lib/domain/size-guide";

export function SizeGuideModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal open={open} title="Panduan ukuran" onClose={onClose}>
      <table className="mb-5 w-full text-left text-sm">
        <thead>
          <tr className="border-b-2 border-ink">
            <th className="py-2">Ukuran</th>
            <th>Lingkar dada (cm)</th>
            <th>Panjang badan (cm)</th>
          </tr>
        </thead>
        <tbody>
          {SIZE_GUIDE.map(({ size, chest, length }) => (
            <tr key={size} className="border-b border-line">
              <td className="py-2 font-semibold">{size}</td>
              <td>{chest}</td>
              <td>{length}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex justify-end">
        <Button onClick={onClose}>Tutup</Button>
      </div>
    </Modal>
  );
}
