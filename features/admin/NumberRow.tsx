"use client";
/**
 * NumberRow: satu baris "label + kolom angka + tombol Simpan" yang bisa dipakai ulang untuk
 * semua angka di halaman superadmin (harga kategori, tambahan bahan, ongkir, pengaturan).
 * Tombol Simpan aktif hanya bila nilai berubah; pesan error tampil di bawah baris.
 */
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { TextInput } from "@/components/ui/Field";
import { formatRupiah } from "@/lib/format";
import { callAdminApi } from "./admin-api";

interface NumberRowProps {
  label: string;
  /** Keterangan kecil di bawah label (opsional). */
  hint?: string;
  initial: number;
  /** Alamat API, metode, dan fungsi yang menyusun body dari angka baru. */
  url: string;
  buildBody: (value: number) => unknown;
  /** "rupiah" menampilkan Rp di samping; "plain" untuk angka biasa (pcs, jam). */
  unit?: "rupiah" | "plain";
  suffix?: string;
}

export function NumberRow({ label, hint, initial, url, buildBody, unit = "rupiah", suffix }: NumberRowProps) {
  const router = useRouter();
  const [text, setText] = useState(String(initial));
  const [error, setError] = useState<string>();
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  // Angka hanya sah bila isinya digit semua; selain itu dikirim sebagai NaN agar ditolak validasi
  const parsed = /^\d+$/.test(text.trim()) ? Number(text.trim()) : Number.NaN;
  const changed = text.trim() !== String(initial);

  /** Kirim angka baru ke server lalu muat ulang data halaman. */
  async function save() {
    setSaving(true);
    setError(undefined);
    setSaved(false);
    const result = await callAdminApi(url, "PATCH", buildBody(parsed), `${label} disimpan.`);
    setSaving(false);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    setSaved(true);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-1 border-b border-line py-3 last:border-b-0">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">{label}</p>
          {hint && <p className="text-xs text-ink-muted">{hint}</p>}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {unit === "rupiah" && <span className="text-sm text-ink-muted">Rp</span>}
          <TextInput
            aria-label={label}
            inputMode="numeric"
            className="w-28 text-right"
            error={error}
            value={text}
            onChange={(event) => {
              setText(event.target.value);
              setSaved(false);
            }}
          />
          {suffix && <span className="text-sm text-ink-muted">{suffix}</span>}
          <Button size="sm" onClick={save} disabled={!changed || saving}>{saving ? "Menyimpan…" : "Simpan"}</Button>
        </div>
      </div>
      {error && <p className="text-right text-xs font-semibold text-danger">{error}</p>}
      {saved && !changed && <p className="text-right text-xs font-semibold text-success">Tersimpan ✓ {unit === "rupiah" ? formatRupiah(initial) : ""}</p>}
    </div>
  );
}
