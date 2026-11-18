"use client";
/**
 * FilterSelect: dropdown filter yang menyimpan pilihannya di ALAMAT halaman (?param=nilai).
 * Dipakai di dashboard (filter kategori, warna, rentang) dan di halaman daftar (jumlah baris).
 * Mengganti pilihan memuat ulang data di server tanpa menggeser posisi gulir halaman.
 */
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SelectInput } from "@/components/ui/Field";
import { cn } from "@/lib/cn";

interface FilterSelectProps {
  /** Nama parameter di alamat, mis. "katPcs". */
  param: string;
  /** Nilai terpilih saat ini ("" = tidak ada filter). */
  value: string;
  options: { value: string; label: string }[];
  /** Teks di sebelah kiri dropdown, mis. "Filter Kategori:". */
  label?: string;
  /** Parameter lain yang dihapus saat pilihan berubah (mis. "page" saat jumlah baris berganti). */
  resetParams?: string[];
  className?: string;
}

export function FilterSelect({ param, value, options, label, resetParams = [], className }: FilterSelectProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  /** Menyusun alamat baru dengan parameter ini diganti, lalu berpindah tanpa menggulir ke atas. */
  function handleChange(next: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (next === "") params.delete(param);
    else params.set(param, next);
    resetParams.forEach((key) => params.delete(key));
    const text = params.toString();
    router.push(text ? `${pathname}?${text}` : pathname, { scroll: false });
  }

  return (
    <div className={cn("flex items-center gap-2 text-sm", className)}>
      {label && <span className="shrink-0 font-medium text-ink-soft">{label}</span>}
      <div className="min-w-40">
        <SelectInput aria-label={label ?? param} value={value} className="!py-1.5" onChange={(event) => handleChange(event.target.value)}>
          {options.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </SelectInput>
      </div>
    </div>
  );
}
