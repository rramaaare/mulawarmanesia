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

  useEffect(() => {
    if (!open) return;
    dialogRef.current?.focus();
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

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
