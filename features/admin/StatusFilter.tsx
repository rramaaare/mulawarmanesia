"use client";
/**
 * StatusFilter: tombol "Filter status" dengan panel berisi checkbox tiap status (boleh pilih beberapa),
 * lengkap dengan jumlah pesanannya. Pilihan baru berlaku saat "Terapkan" ditekan dan disimpan di alamat
 * halaman (?status=dibayar,cek_desain), jadi bisa dibagikan dan tetap ada saat halaman dimuat ulang.
 */
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

interface StatusFilterProps {
  options: { value: string; label: string; count: number }[];
  /** Status yang sedang aktif (dari alamat). */
  selected: string[];
}

export function StatusFilter({ options, selected }: StatusFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<string[]>(selected); // pilihan sementara di dalam panel
  const rootRef = useRef<HTMLDivElement>(null);

  // Tutup panel saat klik di luar atau menekan Esc
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  /** Membuka panel dengan pilihan sementara = pilihan yang sedang aktif. */
  function toggleOpen() {
    if (!open) setDraft(selected);
    setOpen((current) => !current);
  }

  /** Mencentang atau membatalkan satu status di pilihan sementara. */
  function toggle(value: string) {
    setDraft((current) => (current.includes(value) ? current.filter((item) => item !== value) : [...current, value]));
  }

  /** Menyimpan pilihan ke alamat halaman (kosong = hapus filter) dan kembali ke halaman pertama. */
  function apply(values: string[]) {
    const params = new URLSearchParams(searchParams.toString());
    if (values.length === 0) params.delete("status");
    else params.set("status", values.join(","));
    params.delete("page");
    const text = params.toString();
    router.push(text ? `${pathname}?${text}` : pathname);
    setOpen(false);
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={toggleOpen}
        className={cn(
          "flex items-center gap-2 rounded-control border-2 border-ink bg-surface px-4 py-2.5 text-sm font-semibold transition-all",
          "shadow-hard-sm active:translate-x-[3px] active:translate-y-[3px] active:shadow-none",
          selected.length > 0 && "bg-accent-subtle",
        )}
      >
        Filter status
        {selected.length > 0 && <span className="rounded-full bg-accent px-2 text-xs text-white">{selected.length}</span>}
        <svg aria-hidden viewBox="0 0 24 24" className={cn("h-4 w-4 transition-transform", open && "rotate-180")} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div role="dialog" aria-label="Pilih status pesanan" className="absolute right-0 top-[calc(100%+8px)] z-40 w-72 rounded-card border-2 border-ink bg-surface p-4 shadow-hard">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink-muted">Tampilkan status</p>
          <ul className="flex max-h-72 flex-col gap-1 overflow-y-auto pr-1">
            {options.map((option) => (
              <li key={option.value}>
                <label className="flex cursor-pointer items-center gap-3 rounded-control px-2 py-1.5 text-sm hover:bg-subtle">
                  <input
                    type="checkbox"
                    checked={draft.includes(option.value)}
                    onChange={() => toggle(option.value)}
                    className="h-4 w-4 shrink-0 accent-[#C12822]"
                  />
                  <span className="flex-1">{option.label}</span>
                  <span className="text-xs text-ink-muted tabular-nums">{option.count}</span>
                </label>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex justify-end gap-2 border-t border-line pt-3">
            <Button size="sm" variant="secondary" onClick={() => apply([])}>Reset</Button>
            <Button size="sm" onClick={() => apply(draft)}>Terapkan</Button>
          </div>
        </div>
      )}
    </div>
  );
}
