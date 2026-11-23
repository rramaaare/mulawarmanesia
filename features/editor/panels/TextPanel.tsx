"use client";
/**
 * Panel Teks: tambah teks (nama organisasi, slogan, dll.), pilih font,
 * warna benang/tinta, dan posisi preset. Isi teks 1-40 karakter, tanpa emoji.
 * Teks yang sudah ada bisa diubah (tombol "Ubah" atau klik teksnya di gambar baju), diatur ukurannya,
 * digeser langsung di gambar baju, dan dihapus.
 */
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Field, SelectInput, TextInput } from "@/components/ui/Field";
import { cn } from "@/lib/cn";
import { designTextSchema } from "@/lib/validation/order";
import { FONTS, POSITIONS, THREAD_COLORS, positionKeysFor, type OverlayAdjust, type PositionKey, type ProductType } from "../garment-data";
import type { EditorText } from "../types";
import { SizeControls } from "./SizeControls";

interface TextPanelProps {
  /** Produk; menentukan posisi yang tersedia (VEST tanpa lengan). */
  product: ProductType;
  texts: EditorText[];
  onAdd: (text: EditorText) => void;
  onUpdate: (id: string, patch: Omit<EditorText, "id">) => void;
  onRemove: (id: string) => void;
  onFocusPosition: (position: PositionKey | null) => void;
  /** Teks yang sedang diubah (null = mode tambah). Dikendalikan editor agar klik di gambar baju bisa membukanya. */
  editingId: string | null;
  onEditingChange: (id: string | null) => void;
  /** Ubah ukuran/geseran satu teks (tombol Kecil/Sedang/Besar dan Reset posisi). */
  onAdjust: (id: string, patch: OverlayAdjust) => void;
}

export function TextPanel({ product, texts, onAdd, onUpdate, onRemove, onFocusPosition, editingId, onEditingChange, onAdjust }: TextPanelProps) {
  const editing = texts.find((text) => text.id === editingId) ?? null;
  return (
    <div className="flex flex-col gap-4">
      {/* key: form diisi ulang setiap kali teks yang diubah berganti */}
      <TextForm
        key={editing?.id ?? "baru"}
        initial={editing}
        positions={positionKeysFor(product)}
        onFocusPosition={onFocusPosition}
        onSubmit={(values) => {
          if (editing) {
            onUpdate(editing.id, values);
            onEditingChange(null);
          } else {
            onAdd({ id: crypto.randomUUID(), ...values });
          }
        }}
        onCancel={() => onEditingChange(null)}
      />

      {texts.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-semibold">Teks di desain ({texts.length})</p>
          <ul className="flex flex-col gap-2">
            {texts.map((text) => (
              <li key={text.id}>
                <Card flat className={cn("flex flex-col gap-2 p-3", text.id === editingId && "border-accent bg-accent-subtle")}>
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{text.content}</p>
                      <p className="text-xs text-ink-muted">{text.fontName} · {text.colorName} · {POSITIONS[text.position].label}</p>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEditingChange(text.id === editingId ? null : text.id)}
                        aria-label={`Ubah teks ${text.content}`}
                        aria-pressed={text.id === editingId}
                      >
                        Ubah
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (text.id === editingId) onEditingChange(null);
                          onRemove(text.id);
                        }}
                        aria-label={`Hapus teks ${text.content}`}
                      >
                        Hapus
                      </Button>
                    </div>
                  </div>
                  <SizeControls adjust={text} name={text.content} onChange={(patch) => onAdjust(text.id, patch)} />
                </Card>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-ink-muted">Tip: klik teks di gambar baju untuk mengubahnya, geser untuk memindah, dan tarik bulatan di sudutnya untuk mengubah ukuran.</p>
        </div>
      )}
    </div>
  );
}

/** Form isian teks. `initial` terisi = mode ubah, kosong = mode tambah. */
function TextForm({
  initial,
  positions,
  onSubmit,
  onCancel,
  onFocusPosition,
}: {
  initial: EditorText | null;
  positions: PositionKey[];
  onSubmit: (values: Omit<EditorText, "id">) => void;
  onCancel: () => void;
  onFocusPosition: (position: PositionKey | null) => void;
}) {
  const [content, setContent] = useState(initial?.content ?? "");
  const [fontName, setFontName] = useState<string>(initial?.fontName ?? FONTS[0].name);
  const [colorName, setColorName] = useState<string>(initial?.colorName ?? THREAD_COLORS[0].name);
  const [position, setPosition] = useState<PositionKey>(initial?.position ?? "punggung_tengah");
  const [error, setError] = useState<string>();

  /** Memeriksa teks dengan skema Zod yang SAMA dengan server, lalu menyimpannya. */
  function handleSubmit() {
    if (content.length > 0 && !content.trim()) {
      setError("[!] Isi teks tidak boleh hanya spasi");
      return;
    }
    const result = designTextSchema.safeParse({ content, font: fontName, color: colorName, position });
    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }
    setError(undefined);
    onSubmit({ content, fontName, colorName, position });
    if (!initial) setContent("");
  }

  return (
    <div className={cn("flex flex-col gap-4", initial && "rounded-control border-2 border-accent bg-accent-subtle p-3")}>
      {initial && <p className="min-w-0 break-all text-sm font-semibold text-accent">Mengubah teks “{initial.content}”</p>}
      <Field label="Isi teks" error={error} hint={`${content.length}/40 karakter`}>
        {(props) => (
          <TextInput
            {...props}
            value={content}
            error={error}
            placeholder="Contoh: HIMA TEKNIK INFORMATIKA"
            onChange={(event) => {
              setContent(event.target.value);
              setError(event.target.value.length > 40 ? "[!] Teks maksimal 40 karakter" : undefined);
            }}
          />
        )}
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Font">
          {(props) => (
            <SelectInput {...props} value={fontName} onChange={(event) => setFontName(event.target.value)}>
              {FONTS.map((font) => <option key={font.name}>{font.name}</option>)}
            </SelectInput>
          )}
        </Field>
        <Field label="Warna benang">
          {(props) => (
            <SelectInput {...props} value={colorName} onChange={(event) => setColorName(event.target.value)}>
              {THREAD_COLORS.map((color) => <option key={color.name}>{color.name}</option>)}
            </SelectInput>
          )}
        </Field>
      </div>
      <Field label="Posisi">
        {(props) => (
          <SelectInput
            {...props}
            value={position}
            onFocus={() => onFocusPosition(position)}
            onBlur={() => onFocusPosition(null)}
            onChange={(event) => setPosition(event.target.value as PositionKey)}
          >
            {positions.map((key) => <option key={key} value={key}>{POSITIONS[key].label}</option>)}
          </SelectInput>
        )}
      </Field>
      {initial ? (
        <div className="grid grid-cols-2 gap-2">
          <Button variant="secondary" onClick={onCancel}>Batal</Button>
          <Button onClick={handleSubmit}>Simpan perubahan</Button>
        </div>
      ) : (
        <Button onClick={handleSubmit}>Tambah teks</Button>
      )}
    </div>
  );
}
