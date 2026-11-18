"use client";
/**
 * Panel Teks: tambah teks (nama organisasi, slogan, dll.), pilih font,
 * warna benang/tinta, dan posisi preset. Isi teks 1-40 karakter, tanpa emoji.
 */
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Field, SelectInput, TextInput } from "@/components/ui/Field";
import { designTextSchema } from "@/lib/validation/order";
import { FONTS, POSITIONS, POSITION_KEYS, THREAD_COLORS, type PositionKey } from "../garment-data";
import type { EditorText } from "../types";

interface TextPanelProps {
  texts: EditorText[];
  onAdd: (text: EditorText) => void;
  onRemove: (id: string) => void;
  onFocusPosition: (position: PositionKey | null) => void;
}

export function TextPanel({ texts, onAdd, onRemove, onFocusPosition }: TextPanelProps) {
  const [content, setContent] = useState("");
  const [fontName, setFontName] = useState<string>(FONTS[0].name);
  const [colorName, setColorName] = useState<string>(THREAD_COLORS[0].name);
  const [position, setPosition] = useState<PositionKey>("punggung_tengah");
  const [error, setError] = useState<string>();

  /** Memeriksa teks dengan skema Zod yang SAMA dengan server, lalu menambahkannya. */
  function handleAdd() {
    const result = designTextSchema.safeParse({ content, font: fontName, color: colorName, position });
    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }
    setError(undefined);
    onAdd({ id: crypto.randomUUID(), content, fontName, colorName, position });
    setContent("");
  }

  return (
    <div className="flex flex-col gap-4">
      <Field label="Isi teks" error={error} hint={`${content.length}/40 karakter`}>
        {(props) => (
          <TextInput
            {...props}
            value={content}
            error={error}
            placeholder="Contoh: HIMA TEKNIK INFORMATIKA"
            onChange={(event) => {
              setContent(event.target.value);
              // Peringatan langsung saat melewati batas, tanpa menunggu tombol
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
            {POSITION_KEYS.map((key) => <option key={key} value={key}>{POSITIONS[key].label}</option>)}
          </SelectInput>
        )}
      </Field>
      <Button onClick={handleAdd}>Tambah teks</Button>

      <ul className="flex flex-col gap-2">
        {texts.map((text) => (
          <li key={text.id}>
            <Card flat className="flex items-center justify-between gap-3 p-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{text.content}</p>
                <p className="text-xs text-ink-muted">{text.fontName} · {text.colorName} · {POSITIONS[text.position].label}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => onRemove(text.id)} aria-label={`Hapus teks ${text.content}`}>Hapus</Button>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}
