"use client";
/**
 * Toaster: menampilkan daftar toast di pojok kanan bawah layar (dipasang sekali di layout utama).
 * Hijau = berhasil, merah = gagal, kuning = info. Bisa ditutup dengan tombol ×, dan hilang sendiri.
 * Dibaca pembaca layar lewat role="status" (berhasil/info) atau role="alert" (gagal).
 */
import { useSyncExternalStore } from "react";
import { cn } from "@/lib/cn";
import { dismiss, getToasts, subscribeToasts, type ToastTone } from "@/lib/toast";

const NO_TOASTS: never[] = [];

/** Gaya dan ikon tiap jenis toast. */
const STYLES: Record<ToastTone, { box: string; icon: string; mark: string }> = {
  success: { box: "bg-pastel-mint", icon: "bg-success text-white", mark: "✓" },
  error: { box: "bg-accent-subtle", icon: "bg-accent text-white", mark: "!" },
  info: { box: "bg-pastel-butter", icon: "bg-ink text-white", mark: "i" },
};

export function Toaster() {
  const items = useSyncExternalStore(subscribeToasts, getToasts, () => NO_TOASTS);
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-[min(92vw,380px)] flex-col gap-3 print:hidden">
      {items.map((item) => (
        <div
          key={item.id}
          role={item.tone === "error" ? "alert" : "status"}
          className={cn("pointer-events-auto flex items-start gap-3 rounded-card border-2 border-ink p-3.5 shadow-hard-sm animate-[toast-in_0.2s_ease-out]", STYLES[item.tone].box)}
        >
          <span aria-hidden className={cn("flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-ink text-xs font-bold", STYLES[item.tone].icon)}>
            {STYLES[item.tone].mark}
          </span>
          <p className="flex-1 text-sm font-medium leading-snug">{item.message}</p>
          <button type="button" onClick={() => dismiss(item.id)} aria-label="Tutup pesan" className="-mr-1 -mt-0.5 px-1.5 text-lg leading-none text-ink-soft hover:text-ink">
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
