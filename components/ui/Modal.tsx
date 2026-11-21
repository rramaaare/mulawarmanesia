"use client";
/**
 * Komponen Modal: kotak dialog di tengah layar dengan latar gelap.
 * Dipakai untuk konfirmasi (ganti kategori, mulai produksi) dan panduan ukuran.
 * Tombol Esc menutup dialog; fokus dipindah ke dialog saat terbuka.
 */
import { useEffect, useRef, type ReactNode } from "react";

interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}

export function Modal({ open, title, onClose, children }: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  // onClose disimpan di ref: pemanggil biasanya mengirim fungsi baru setiap render, dan bila
  // fungsi itu jadi dependensi effect, fokus akan direbut ke dialog pada setiap ketikan.
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  // Fokus ke dialog HANYA saat dialog baru dibuka.
  useEffect(() => {
    if (open) dialogRef.current?.focus();
  }, [open]);

  // Tombol Esc menutup dialog.
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && onCloseRef.current();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/60 p-4 sm:items-center" onClick={onClose}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className="max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto rounded-panel border-2 border-ink bg-surface p-5 shadow-hard-lg sm:p-6 [&_.modal-actions]:flex-col-reverse sm:[&_.modal-actions]:flex-row [&_.modal-actions>*]:w-full sm:[&_.modal-actions>*]:w-auto"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 className="mb-3 text-xl font-semibold">{title}</h2>
        {children}
      </div>
    </div>
  );
}
