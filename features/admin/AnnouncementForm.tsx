"use client";
/**
 * AnnouncementForm: pengaturan "Pengumuman landing page" untuk superadmin.
 *  - Label PO batch di hero (bisa dimatikan).
 *  - Daftar pesan di pita merah paling atas: maksimal 6, bisa dinyalakan/dimatikan, diurutkan, dihapus.
 *  - Pratinjau langsung memakai komponen Ticker yang sama dengan landing.
 * Perubahan baru berlaku setelah menekan "Simpan pengumuman".
 */
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { TextInput } from "@/components/ui/Field";
import { Tag } from "@/components/ui/Tag";
import { Ticker } from "@/features/landing/Ticker";
import { ANNOUNCEMENT_LIMITS, activeAnnouncement, defaultAnnouncement, type Announcement } from "@/lib/domain/announcement";
import { callAdminApi } from "./admin-api";

const URL = "/api/admin/pengumuman";

export function AnnouncementForm({ initial }: { initial: Announcement }) {
  const [badge, setBadge] = useState(initial.badge);
  const [ticker, setTicker] = useState(initial.ticker);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const draft: Announcement = { badge, ticker };
  const shown = activeAnnouncement(draft);

  function updateRow(index: number, patch: Partial<Announcement["ticker"][number]>) {
    setTicker((rows) => rows.map((row, position) => (position === index ? { ...row, ...patch } : row)));
  }

  function moveRow(index: number, direction: -1 | 1) {
    setTicker((rows) => {
      const target = index + direction;
      if (target < 0 || target >= rows.length) return rows;
      const next = [...rows];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  async function save() {
    setSaving(true);
    setErrors({});
    const result = await callAdminApi(URL, "PATCH", draft, "Pengumuman landing disimpan.");
    setSaving(false);
    if (!result.ok) setErrors(result.fields ?? {});
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Label PO batch di hero */}
      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold">Label PO batch di hero</p>
        <p className="text-xs text-ink-muted">Pil merah di atas judul landing, mis. &quot;PO Batch Desember&quot;.</p>
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-sm font-semibold">
            <input type="checkbox" checked={badge.on} onChange={(event) => setBadge({ ...badge, on: event.target.checked })} className="h-4 w-4 accent-accent" />
            Tampilkan
          </label>
          <div className="min-w-0 flex-1 basis-56">
            <TextInput
              aria-label="Teks label PO batch"
              value={badge.text}
              maxLength={ANNOUNCEMENT_LIMITS.badge}
              error={errors["badge.text"]}
              aria-invalid={Boolean(errors["badge.text"])}
              onChange={(event) => setBadge({ ...badge, text: event.target.value })}
              placeholder="PO Batch November"
            />
          </div>
        </div>
        {errors["badge.text"] && <p className="text-xs font-semibold text-danger">{errors["badge.text"]}</p>}
      </div>

      {/* Pesan di pita merah */}
      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold">Pesan di pita merah ({ticker.length}/{ANNOUNCEMENT_LIMITS.tickerMax})</p>
        <p className="text-xs text-ink-muted">Pita berjalan di paling atas landing. Urutan di sini = urutan tampil. Huruf otomatis kapital.</p>
        <ul className="flex flex-col gap-2">
          {ticker.map((row, index) => {
            const error = errors[`ticker.${index}.text`];
            return (
              <li key={index} className="flex flex-col gap-1">
                <div className="flex flex-wrap items-center gap-2">
                  <label className="flex shrink-0 items-center gap-1.5 text-xs font-semibold">
                    <input
                      type="checkbox"
                      checked={row.on}
                      onChange={(event) => updateRow(index, { on: event.target.checked })}
                      aria-label={`Tampilkan pesan ${index + 1}`}
                      className="h-4 w-4 accent-accent"
                    />
                    Tampil
                  </label>
                  <div className="min-w-0 flex-1 basis-48">
                    <TextInput
                      aria-label={`Pesan pita ${index + 1}`}
                      value={row.text}
                      maxLength={ANNOUNCEMENT_LIMITS.tickerText}
                      error={error}
                      aria-invalid={Boolean(error)}
                      onChange={(event) => updateRow(index, { text: event.target.value })}
                    />
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <Button variant="secondary" size="sm" onClick={() => moveRow(index, -1)} disabled={index === 0} aria-label={`Naikkan pesan ${index + 1}`}>↑</Button>
                    <Button variant="secondary" size="sm" onClick={() => moveRow(index, 1)} disabled={index === ticker.length - 1} aria-label={`Turunkan pesan ${index + 1}`}>↓</Button>
                    <Button variant="ghost" size="sm" onClick={() => setTicker((rows) => rows.filter((_, position) => position !== index))} aria-label={`Hapus pesan ${index + 1}`}>Hapus</Button>
                  </div>
                </div>
                {error && <p className="text-xs font-semibold text-danger">{error}</p>}
              </li>
            );
          })}
        </ul>
        <div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setTicker((rows) => [...rows, { on: true, text: "" }])}
            disabled={ticker.length >= ANNOUNCEMENT_LIMITS.tickerMax}
          >
            + Tambah pesan
          </Button>
        </div>
      </div>

      {/* Pratinjau */}
      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold">Pratinjau</p>
        <div className="overflow-hidden rounded-card border-2 border-ink">
          {shown.ticker.length > 0 ? <Ticker messages={shown.ticker} /> : <p className="bg-subtle p-3 text-xs text-ink-muted">Pita merah tidak akan tampil (tidak ada pesan aktif).</p>}
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs text-ink-muted">
          Label hero: {shown.badge ? <Tag tone="accent">{shown.badge}</Tag> : <span className="font-semibold">tidak tampil</span>}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={() => void save()} disabled={saving}>{saving ? "Menyimpan…" : "Simpan pengumuman"}</Button>
        <Button
          variant="ghost"
          onClick={() => {
            const fresh = defaultAnnouncement();
            setBadge(fresh.badge);
            setTicker(fresh.ticker);
            setErrors({});
          }}
          disabled={saving}
        >
          Kembalikan ke bawaan
        </Button>
      </div>
    </div>
  );
}
