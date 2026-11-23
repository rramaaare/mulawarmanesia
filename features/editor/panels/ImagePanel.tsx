"use client";
/**
 * Panel Gambar: unggah logo (PNG/SVG/JPG, maks. 5 MB), pilih posisi preset, ukuran,
 * dan teknik (bordir/sablon). Logo juga bisa digeser/diubah ukurannya langsung di gambar baju. Maksimal 4 gambar per desain. File disimpan di
 * browser (IndexedDB) sampai pengguna menekan "Bayar sekarang".
 */
import { useRef, useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SelectInput } from "@/components/ui/Field";
import { MAX_IMAGES, DECORATION_FEE } from "@/lib/domain/constants";
import { formatRupiah } from "@/lib/format";
import { saveFile } from "../draft-storage";
import { readSize, validateLogoFile } from "../image-validation";
import { cn } from "@/lib/cn";
import { SizeControls } from "./SizeControls";
import { POSITIONS, positionKeysFor, type PositionKey, type ProductType } from "../garment-data";
import type { DecorationTechnique, EditorImage } from "../types";

interface ImagePanelProps {
  /** Produk; menentukan posisi yang tersedia (VEST tanpa lengan). */
  product: ProductType;
  images: EditorImage[];
  onAdd: (image: EditorImage) => void;
  onChange: (id: string, patch: Partial<EditorImage>) => void;
  onRemove: (id: string) => void;
  /** Memberi tahu editor posisi mana yang sedang disorot (garis putus-putus). */
  onFocusPosition: (position: PositionKey | null) => void;
  /** Logo yang sedang dipilih di gambar baju (disorot di daftar). */
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function ImagePanel({ product, images, onAdd, onChange, onRemove, onFocusPosition, selectedId, onSelect }: ImagePanelProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  /** Dipanggil saat pengguna memilih file: validasi lalu tambahkan ke desain. */
  async function handleFile(file: File) {
    setError(null);
    if (images.length >= MAX_IMAGES) {
      setError(`[!] Maksimal ${MAX_IMAGES} gambar per desain`);
      return;
    }
    const problem = await validateLogoFile(file);
    if (problem) {
      setError(problem); // file ditolak, tidak ditambahkan ke desain
      return;
    }
    const id = crypto.randomUUID();
    await saveFile(id, file);
    // Bentuk logo (lebar/tinggi) supaya logo panjang dipasang memanjang
    const aspect = await readSize(file)
      .then(({ width, height }) => (width > 0 && height > 0 ? Math.round((width / height) * 100) / 100 : 1))
      .catch(() => 1);
    // Pilih posisi depan pertama yang belum dipakai
    const used = new Set(images.map((image) => image.position));
    const position = positionKeysFor(product).find((key) => !used.has(key)) ?? "dada_kiri";
    onAdd({ id, fileKey: id, fileName: file.name, previewUrl: URL.createObjectURL(file), position, technique: "bordir", aspect });
  }

  return (
    <div className="flex flex-col gap-4">
      {error && <Alert tone="danger" title="File ditolak">{error}</Alert>}

      {/* Area unggah */}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          const file = event.dataTransfer.files[0];
          if (file) void handleFile(file);
        }}
        className="rounded-card border-2 border-dashed border-ink bg-surface p-6 text-center shadow-hard-sm transition-all hover:bg-subtle active:translate-x-[3px] active:translate-y-[3px] active:shadow-none"
      >
        <span className="block text-sm font-semibold">Tarik file ke sini atau klik untuk memilih</span>
        <span className="block text-xs text-ink-muted">PNG, SVG, JPG · maks. 5 MB · min. 500 px · {images.length}/{MAX_IMAGES} gambar</span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept=".png,.jpg,.jpeg,.svg"
        className="sr-only"
        aria-label="Pilih file logo"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void handleFile(file);
          event.target.value = ""; // supaya file yang sama bisa dipilih lagi
        }}
      />

      {images.length > 0 && <p className="text-xs text-ink-muted">Tip: geser logo langsung di gambar baju, tarik bulatan di sudutnya untuk mengubah ukuran.</p>}

      {/* Daftar gambar yang sudah ditambahkan */}
      <ul className="flex flex-col gap-3">
        {images.map((image) => (
          <li key={image.id}>
            <Card flat className={cn("flex flex-col gap-3 p-3", image.id === selectedId && "border-accent bg-accent-subtle")}>
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={image.previewUrl} alt="" className="h-12 w-12 rounded-control border-2 border-ink bg-surface object-contain" />
                <button type="button" onClick={() => onSelect(image.id)} className="min-w-0 flex-1 truncate text-left text-sm font-semibold" title="Pilih di gambar baju">
                  {image.fileName}
                </button>
                <Button variant="ghost" size="sm" onClick={() => onRemove(image.id)} aria-label={`Hapus ${image.fileName}`}>Hapus</Button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <SelectInput
                  aria-label="Posisi"
                  value={image.position}
                  onFocus={() => onFocusPosition(image.position)}
                  onBlur={() => onFocusPosition(null)}
                  onChange={(event) => onChange(image.id, { position: event.target.value as PositionKey })}
                >
                  {positionKeysFor(product).map((key) => <option key={key} value={key}>{POSITIONS[key].label}</option>)}
                </SelectInput>
                <SelectInput
                  aria-label="Teknik"
                  value={image.technique}
                  onChange={(event) => onChange(image.id, { technique: event.target.value as DecorationTechnique })}
                >
                  <option value="bordir">Bordir (+{formatRupiah(DECORATION_FEE.bordir)}/pcs)</option>
                  <option value="sablon">Sablon (+{formatRupiah(DECORATION_FEE.sablon)}/pcs)</option>
                </SelectInput>
              </div>
              <SizeControls adjust={image} name={image.fileName} onChange={(patch) => onChange(image.id, patch)} />
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}
