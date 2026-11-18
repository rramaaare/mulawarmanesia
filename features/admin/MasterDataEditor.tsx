"use client";
/**
 * MasterDataEditor: halaman Master data untuk superadmin (desain "Master data").
 * Empat tab: Harga dasar, Biaya dekorasi, Palet warna & stok, Tarif ongkir.
 * Cara kerja: perubahan DITAMPUNG dulu di browser (draf); tombol "Simpan perubahan" memeriksa semuanya,
 * lalu mengirim satu paket ke /api/admin/master-data yang disimpan dalam SATU transaksi (semua berhasil
 * atau semua batal) dan dicatat di Log aktivitas. Isian yang salah ditandai dan dijelaskan di atas halaman.
 */
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Field, TextInput } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { cn } from "@/lib/cn";
import { formatRupiah } from "@/lib/format";
import type { MasterData } from "@/server/services/master-data-service";
import { callAdminApi } from "./admin-api";

const URL = "/api/admin/master-data";
const TABS = ["Harga dasar", "Biaya dekorasi", "Palet warna & stok", "Tarif ongkir"] as const;
type Tab = (typeof TABS)[number];

/** Daftar biaya dekorasi: kunci, label, dan keterangan. */
const FEES: { key: "bordir" | "sablon" | "namePerPerson" | "XXL" | "XXXL"; label: string; hint: string }[] = [
  { key: "bordir", label: "Bordir", hint: "Per gambar, per pcs" },
  { key: "sablon", label: "Sablon", hint: "Per gambar, per pcs" },
  { key: "namePerPerson", label: "Nama per orang", hint: "Per pcs bila fitur nama aktif" },
  { key: "XXL", label: "Tambahan ukuran XXL", hint: "Per pcs ukuran XXL" },
  { key: "XXXL", label: "Tambahan ukuran XXXL", hint: "Per pcs ukuran XXXL" },
];

/** Satu angka yang bisa diubah: isi saat ini (draf), nilai asli, dan label untuk pesan error. */
interface NumericField {
  key: string; // mis. "category:3"
  label: string; // mis. "Harga PDH Instansi"
  original: number;
}

/** Baris label + kolom angka. Kolom ditandai merah bila isinya bukan angka. */
function MoneyRow({ label, hint, text, original, error, onChange }: { label: string; hint?: string; text: string; original: number; error?: string; onChange: (text: string) => void }) {
  const changed = text.trim() !== String(original);
  return (
    <div className={cn("flex flex-col gap-1 border-b border-line py-3 last:border-b-0", error && "rounded-control bg-accent-subtle px-3")}>
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">{label}{changed && !error && <span className="ml-2 text-xs font-normal text-accent">diubah</span>}</p>
          {hint && <p className="text-xs text-ink-muted">{hint}</p>}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="text-sm text-ink-muted">Rp</span>
          <TextInput aria-label={label} inputMode="numeric" className="w-32 text-right" error={error} value={text} onChange={(event) => onChange(event.target.value)} />
        </div>
      </div>
      {error && <p className="text-right text-xs font-semibold text-danger">{error}</p>}
    </div>
  );
}

export function MasterDataEditor({ data }: { data: MasterData }) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("Harga dasar");
  const [edits, setEdits] = useState<Record<string, string>>({}); // draf angka yang diubah
  const [stockEdits, setStockEdits] = useState<Record<number, boolean>>({}); // draf stok warna
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverMessage, setServerMessage] = useState<string>();
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newColor, setNewColor] = useState({ name: "", hex: "#1F2A44" });
  const [addError, setAddError] = useState<string>();

  // Semua angka yang bisa diubah, dengan nilai aslinya
  const fields: NumericField[] = [
    ...data.categories.map((row) => ({ key: `category:${row.id}`, label: `Harga ${row.product} ${row.name}`, original: row.basePrice })),
    ...data.materials.map((row) => ({ key: `material:${row.id}`, label: `Tambahan bahan ${row.product} · ${row.name}`, original: row.surcharge })),
    ...data.shipping.map((row) => ({ key: `shipping:${row.zone}`, label: `Ongkir ${row.label}`, original: row.fee })),
    ...FEES.map((fee) => ({ key: `fee:${fee.key}`, label: `Biaya ${fee.label.toLowerCase()}`, original: data.fees[fee.key] })),
  ];
  const fieldOf = (key: string) => fields.find((field) => field.key === key) as NumericField;

  /** Teks yang tampil di kolom: draf bila ada, jika tidak nilai asli. */
  const textOf = (key: string) => edits[key] ?? String(fieldOf(key).original);

  /** Menyimpan draf satu kolom; bila sama dengan nilai asli, drafnya dibuang. */
  function setText(key: string, text: string) {
    setSaved(false);
    setEdits((current) => {
      const next = { ...current };
      if (text.trim() === String(fieldOf(key).original)) delete next[key];
      else next[key] = text;
      return next;
    });
    setErrors((current) => {
      const next = { ...current };
      delete next[key];
      return next;
    });
  }

  /** Stok warna saat ini (draf bila ada). */
  const stockOf = (id: number, original: boolean) => stockEdits[id] ?? original;
  const dirtyCount = Object.keys(edits).length + Object.keys(stockEdits).length;

  /** Harga jadi per kategori x bahan untuk tabel pratinjau (memakai draf). */
  function finalPrice(categoryId: number, materialId: number): number | null {
    const base = Number(textOf(`category:${categoryId}`).trim());
    const extra = Number(textOf(`material:${materialId}`).trim());
    return /^\d+$/.test(textOf(`category:${categoryId}`).trim()) && /^\d+$/.test(textOf(`material:${materialId}`).trim()) ? base + extra : null;
  }

  /** Memeriksa semua draf, lalu mengirim satu paket perubahan ke server. */
  async function save() {
    setServerMessage(undefined);
    setSaved(false);
    const found: Record<string, string> = {};
    const changes: unknown[] = [];

    for (const [key, text] of Object.entries(edits)) {
      if (!/^\d+$/.test(text.trim())) {
        found[key] = "[!] Masukkan angka tanpa huruf. Contoh: 225000";
        continue;
      }
      const value = Number(text.trim());
      const [type, id] = key.split(":");
      if (type === "category" || type === "material") changes.push({ type, id: Number(id), value });
      else if (type === "shipping") changes.push({ type, zone: id, value });
      else changes.push({ type: "fee", key: id, value });
    }
    for (const [id, inStock] of Object.entries(stockEdits)) changes.push({ type: "color", id: Number(id), inStock });

    setErrors(found);
    if (Object.keys(found).length > 0) return; // ada isian salah: tampilkan di atas halaman
    if (changes.length === 0) return;

    setSaving(true);
    const result = await callAdminApi(URL, "PATCH", { changes }, "Perubahan master data disimpan.");
    setSaving(false);
    if (!result.ok) {
      setServerMessage(result.message);
      return;
    }
    setEdits({});
    setStockEdits({});
    setSaved(true);
    router.refresh();
  }

  /** Menambah warna baru (langsung disimpan, di luar draf). */
  async function addColor() {
    setAddError(undefined);
    const result = await callAdminApi(URL, "PATCH", { type: "color_add", name: newColor.name, hex: newColor.hex }, "Warna baru ditambahkan.");
    if (!result.ok) {
      setAddError(result.message);
      return;
    }
    setAdding(false);
    setNewColor({ name: "", hex: "#1F2A44" });
    router.refresh();
  }

  const errorEntries = Object.entries(errors);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-4xl font-medium">Master data</h1>
          <p className="mt-1 text-sm text-ink-soft">Harga, palet warna, dan ongkir yang dipakai editor dan halaman Pesanan</p>
        </div>
        <Button size="lg" onClick={save} disabled={saving || dirtyCount === 0}>
          {saving ? "Menyimpan…" : dirtyCount > 0 ? `Simpan perubahan (${dirtyCount})` : "Simpan perubahan"}
        </Button>
      </div>

      {/* Tab */}
      <div className="flex flex-wrap gap-3" role="tablist" aria-label="Kelompok master data">
        {TABS.map((item) => (
          <button
            key={item}
            type="button"
            role="tab"
            aria-selected={tab === item}
            onClick={() => setTab(item)}
            className={cn(
              "rounded-control border-2 border-ink px-4 py-2 text-sm font-semibold transition-all",
              tab === item ? "bg-ink text-white shadow-[0_4px_0_0_#c12822]" : "bg-surface hover:bg-subtle",
            )}
          >
            {item}
          </button>
        ))}
      </div>

      {errorEntries.length > 0 && (
        <Alert tone="danger" title={`Ada ${errorEntries.length} isian yang perlu diperbaiki`}>
          {errorEntries.map(([key]) => fieldOf(key).label).join(" · ")} belum berupa angka.
        </Alert>
      )}
      {serverMessage && <Alert tone="danger">{serverMessage}</Alert>}
      {saved && <Alert tone="success" title="Perubahan tersimpan">Harga baru sudah berlaku di editor, landing, dan checkout.</Alert>}

      {/* ===== Harga dasar ===== */}
      {tab === "Harga dasar" && (
        <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-2">
          <div className="flex min-w-0 flex-col gap-6 xl:sticky xl:top-6">
            <Card className="!p-5">
              <h2 className="text-xl font-medium">Harga dasar kategori</h2>
              <p className="mb-2 mt-0.5 text-xs text-ink-muted">Per pcs, sebelum bahan, bordir/sablon, dan ukuran.</p>
              {data.categories.map((row) => (
                <MoneyRow key={row.id} label={`${row.product} ${row.name}`} text={textOf(`category:${row.id}`)} original={row.basePrice} error={errors[`category:${row.id}`]} onChange={(text) => setText(`category:${row.id}`, text)} />
              ))}
            </Card>
            <Card className="!p-5">
              <h2 className="text-xl font-medium">Tambahan harga bahan</h2>
              <p className="mb-2 mt-0.5 text-xs text-ink-muted">Ditambahkan ke harga per pcs. Isi 0 bila sudah termasuk harga dasar.</p>
              {data.materials.map((row) => (
                <MoneyRow key={row.id} label={`${row.product} · ${row.name}`} text={textOf(`material:${row.id}`)} original={row.surcharge} error={errors[`material:${row.id}`]} onChange={(text) => setText(`material:${row.id}`, text)} />
              ))}
            </Card>
          </div>
          <Card className="!p-5">
            <h2 className="text-xl font-medium">Harga jadi per pcs</h2>
            <p className="mb-3 mt-0.5 text-xs text-ink-muted">Harga dasar + tambahan bahan. Dipakai untuk estimasi di editor dan dihitung ulang di server saat checkout.</p>
            <div className="overflow-x-auto rounded-card border-2 border-ink">
              <table className="w-full min-w-[420px] text-left text-sm">
                <thead>
                  <tr className="bg-ink text-xs text-white">
                    <th className="px-4 py-3 font-medium">Kategori</th>
                    <th className="px-4 py-3 font-medium">Bahan</th>
                    <th className="px-4 py-3 text-right font-medium">Harga</th>
                  </tr>
                </thead>
                <tbody>
                  {data.categories.flatMap((category) =>
                    data.materials.filter((material) => material.product === category.product).map((material, index) => {
                      const price = finalPrice(category.id, material.id);
                      return (
                        <tr key={`${category.id}-${material.id}`} className={cn(index % 2 === 1 && "bg-subtle")}>
                          <td className="px-4 py-2.5">{category.product} {category.name}</td>
                          <td className="px-4 py-2.5">{material.name}</td>
                          <td className="px-4 py-2.5 text-right tabular-nums">{price === null ? "—" : formatRupiah(price)}</td>
                        </tr>
                      );
                    }),
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* ===== Biaya dekorasi ===== */}
      {tab === "Biaya dekorasi" && (
        <Card className="max-w-2xl !p-5">
          <h2 className="text-xl font-medium">Biaya dekorasi &amp; tambahan</h2>
          <p className="mb-2 mt-0.5 text-xs text-ink-muted">Dihitung per pcs. Berlaku di editor, halaman Pesanan, dan checkout.</p>
          {FEES.map((fee) => (
            <MoneyRow key={fee.key} label={fee.label} hint={fee.hint} text={textOf(`fee:${fee.key}`)} original={data.fees[fee.key]} error={errors[`fee:${fee.key}`]} onChange={(text) => setText(`fee:${fee.key}`, text)} />
          ))}
        </Card>
      )}

      {/* ===== Palet warna & stok ===== */}
      {tab === "Palet warna & stok" && (
        <Card className="max-w-2xl !p-5">
          <h2 className="text-xl font-medium">Palet warna kain &amp; stok</h2>
          <p className="mb-3 mt-0.5 text-xs text-ink-muted">{data.colors.length} warna. Warna habis tampil bersilang di editor dan tidak bisa dipilih pelanggan.</p>
          <ul className="flex flex-col">
            {data.colors.map((color) => {
              const inStock = stockOf(color.id, color.inStock);
              return (
                <li key={color.id} className="flex items-center gap-3 border-b border-line py-2.5 last:border-b-0">
                  <span className="h-6 w-6 shrink-0 rounded-md border-2 border-ink" style={{ backgroundColor: color.hex }} />
                  <span className="flex-1 text-sm font-medium">
                    {color.name}
                    {stockEdits[color.id] !== undefined && <span className="ml-2 text-xs font-normal text-accent">diubah</span>}
                  </span>
                  <span className="text-xs text-ink-muted">{inStock ? `${color.usedPcs} pcs / 30 hari` : "tidak dijual"}</span>
                  <button
                    type="button"
                    aria-pressed={inStock}
                    aria-label={`${color.name}: ${inStock ? "tersedia" : "habis"}. Klik untuk mengubah`}
                    onClick={() =>
                      setStockEdits((current) => {
                        const next = { ...current };
                        if (!inStock === color.inStock) delete next[color.id];
                        else next[color.id] = !inStock;
                        return next;
                      })
                    }
                    className={cn(
                      "w-24 rounded-full border-2 border-ink px-3 py-1 text-xs font-semibold transition-all active:translate-y-0.5",
                      inStock ? "bg-pastel-mint" : "bg-accent text-white",
                    )}
                  >
                    {inStock ? "Tersedia" : "Habis"}
                  </button>
                </li>
              );
            })}
          </ul>
          <Button variant="secondary" className="mt-4 w-fit" onClick={() => setAdding(true)}>Tambah warna</Button>
        </Card>
      )}

      {/* ===== Tarif ongkir ===== */}
      {tab === "Tarif ongkir" && (
        <Card className="max-w-2xl !p-5">
          <h2 className="text-xl font-medium">Tarif ongkir</h2>
          <p className="mb-2 mt-0.5 text-xs text-ink-muted">Tarif tetap per wilayah tujuan.</p>
          {data.shipping.map((row) => (
            <MoneyRow key={row.zone} label={row.label} text={textOf(`shipping:${row.zone}`)} original={row.fee} error={errors[`shipping:${row.zone}`]} onChange={(text) => setText(`shipping:${row.zone}`, text)} />
          ))}
        </Card>
      )}

      {/* Dialog tambah warna */}
      <Modal open={adding} title="Tambah warna kain" onClose={() => setAdding(false)}>
        <div className="flex flex-col gap-3">
          <Field label="Nama warna" required error={addError}>
            {(props) => <TextInput {...props} error={addError} value={newColor.name} placeholder="Contoh: Biru Tua" onChange={(event) => setNewColor({ ...newColor, name: event.target.value })} />}
          </Field>
          <label className="flex items-center gap-3 text-sm font-semibold">
            Warna
            <input type="color" value={newColor.hex} onChange={(event) => setNewColor({ ...newColor, hex: event.target.value })} className="h-10 w-16 cursor-pointer rounded-control border-2 border-ink bg-surface p-1" />
            <span className="font-mono text-xs text-ink-muted">{newColor.hex.toUpperCase()}</span>
          </label>
        </div>
        <div className="mt-5 modal-actions flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setAdding(false)}>Batal</Button>
          <Button onClick={addColor}>Tambah</Button>
        </div>
      </Modal>
    </div>
  );
}
