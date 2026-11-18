"use client";
/**
 * EditorApp: halaman editor desain (komponen induk).
 * Tata letak: panel alat kiri (Model, Warna, Gambar, Teks) · pratinjau tengah · ringkasan harga kanan.
 * Tugas file ini hanya MENGHUBUNGKAN bagian-bagian: state desain (useDesignHistory),
 * autosave (draft-storage), dan panel-panel. Logika detail ada di file masing-masing.
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Garment } from "@/components/Garment";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { cn } from "@/lib/cn";
import { formatRupiah } from "@/lib/format";
import type { Catalog } from "@/server/services/catalog-service";
import { colorsToHex, createInitialDesign, estimateUnitPrice, isDesignModified, resetPositions, toGarmentOverlays } from "./design-helpers";
import { loadDraft, restorePreviews, saveDraft } from "./draft-storage";
import { DEFAULT_COLORS, POSITIONS, type PositionKey } from "./garment-data";
import { ColorPanel } from "./panels/ColorPanel";
import { ImagePanel } from "./panels/ImagePanel";
import { ModelPanel } from "./panels/ModelPanel";
import { TextPanel } from "./panels/TextPanel";
import { useDesignHistory } from "./useDesignHistory";

/** Pilihan zoom (persen). Tombol + dan − berpindah satu langkah. */
const ZOOM_STEPS = [50, 75, 100, 125, 150, 200, 250];

/** Empat alat di panel kiri: Model, Warna, Gambar, Teks. */
const TABS = ["Model", "Warna", "Gambar", "Teks"] as const;
type Tab = (typeof TABS)[number];

interface EditorAppProps {
  catalog: Catalog;
  /** ID kategori dari alamat (?kategori=3), bila datang dari kartu katalog. */
  initialCategoryId?: number;
}

export function EditorApp({ catalog, initialCategoryId }: EditorAppProps) {
  const router = useRouter();
  const { design, update, replace, undo, redo, canUndo, canRedo } = useDesignHistory(() => createInitialDesign(catalog, initialCategoryId));
  const [tab, setTab] = useState<Tab>("Model");
  const [side, setSide] = useState<"front" | "back">("front");
  const [zoom, setZoom] = useState<number>(100); // persen, salah satu dari ZOOM_STEPS
  const [focusPosition, setFocusPosition] = useState<PositionKey | null>(null);
  const [pendingCategory, setPendingCategory] = useState<number | null>(null); // menunggu konfirmasi
  const [restored, setRestored] = useState(false);

  // 1. Saat pertama dibuka: pulihkan draf terakhir (kecuali datang dari kartu katalog tertentu)
  useEffect(() => {
    (async () => {
      const draft = loadDraft();
      if (draft && !initialCategoryId && catalog.categories.some((item) => item.id === draft.categoryId)) {
        replace(await restorePreviews(draft));
      }
      setRestored(true);
    })();
  }, [catalog, initialCategoryId, replace]);

  // 2. Autosave: simpan draf 0,5 detik setelah perubahan terakhir
  useEffect(() => {
    if (!restored) return; // jangan menimpa draf sebelum selesai dipulihkan
    const timer = setTimeout(() => saveDraft(design), 500);
    return () => clearTimeout(timer);
  }, [design, restored]);

  /** Mengganti kategori: reset warna ke template dan posisi logo/teks ke preset. */
  const applyCategory = useCallback(
    (categoryId: number) => {
      const category = catalog.categories.find((item) => item.id === categoryId);
      if (!category) return;
      const material = catalog.materials.find((item) => item.product === category.product);
      update((current) => ({
        ...current,
        product: category.product,
        categoryId,
        materialId: current.product === category.product ? current.materialId : (material?.id ?? current.materialId),
        colors: { ...DEFAULT_COLORS[category.product] },
        images: resetPositions(current.images),
        texts: resetPositions(current.texts),
      }));
    },
    [catalog, update],
  );

  /** Pilih kategori: minta konfirmasi bila pengguna sudah mengubah desain. */
  function selectCategory(categoryId: number) {
    if (categoryId === design.categoryId) return;
    if (isDesignModified(design)) setPendingCategory(categoryId);
    else applyCategory(categoryId);
  }

  const hexColors = useMemo(() => colorsToHex(design.colors, catalog), [design.colors, catalog]);
  const overlays = useMemo(() => toGarmentOverlays(design), [design]);
  const category = catalog.categories.find((item) => item.id === design.categoryId);
  const unitPrice = estimateUnitPrice(design, catalog);

  /** Zoom satu langkah: arah +1 memperbesar, -1 memperkecil (berhenti di batas). */
  function stepZoom(direction: 1 | -1) {
    const index = ZOOM_STEPS.indexOf(zoom);
    const next = ZOOM_STEPS[Math.min(ZOOM_STEPS.length - 1, Math.max(0, index + direction))];
    setZoom(next);
  }

  /** Simpan draf lalu pindah ke halaman Pesanan. */
  function goToOrder() {
    saveDraft(design);
    router.push("/pesanan");
  }

  return (
    <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-6 pb-32 md:px-8 lg:grid-cols-[340px_1fr_300px] lg:pb-6">
      {/* ===== Panel alat kiri ===== */}
      <section aria-label="Alat desain" className="order-2 min-w-0 lg:order-1">
        <Card className="flex flex-col gap-5">
          <div className="grid grid-cols-4 gap-1" role="tablist" aria-label="Alat">
            {TABS.map((item) => (
              <button
                key={item}
                type="button"
                role="tab"
                aria-selected={tab === item}
                onClick={() => setTab(item)}
                className={cn(
                  "rounded-control border-2 border-ink px-1 py-2.5 text-sm font-semibold",
                  tab === item ? "bg-accent text-white" : "bg-surface hover:bg-subtle",
                )}
              >
                {item}
              </button>
            ))}
          </div>

          {tab === "Model" && (
            <ModelPanel
              catalog={catalog}
              product={design.product}
              categoryId={design.categoryId}
              materialId={design.materialId}
              onSelectCategory={selectCategory}
              onSelectMaterial={(materialId) => update((current) => ({ ...current, materialId }))}
            />
          )}
          {tab === "Warna" && (
            <ColorPanel
              catalog={catalog}
              product={design.product}
              colors={design.colors}
              onChangeColor={(part, colorName) => update((current) => ({ ...current, colors: { ...current.colors, [part]: colorName } }))}
            />
          )}
          {tab === "Gambar" && (
            <ImagePanel
              images={design.images}
              onAdd={(image) => {
                update((current) => ({ ...current, images: [...current.images, image] }));
                setSide(POSITIONS[image.position].side); // tampilkan sisi tempat logo dipasang
              }}
              onChange={(id, patch) => {
                update((current) => ({ ...current, images: current.images.map((image) => (image.id === id ? { ...image, ...patch } : image)) }));
                if (patch.position) setSide(POSITIONS[patch.position].side);
              }}
              onRemove={(id) => update((current) => ({ ...current, images: current.images.filter((image) => image.id !== id) }))}
              onFocusPosition={setFocusPosition}
            />
          )}
          {tab === "Teks" && (
            <TextPanel
              texts={design.texts}
              onAdd={(text) => {
                update((current) => ({ ...current, texts: [...current.texts, text] }));
                setSide(POSITIONS[text.position].side); // teks di punggung tidak terlihat bila pratinjau masih tampak depan
              }}
              onRemove={(id) => update((current) => ({ ...current, texts: current.texts.filter((text) => text.id !== id) }))}
              onFocusPosition={setFocusPosition}
            />
          )}
        </Card>
      </section>

      {/* ===== Pratinjau tengah ===== */}
      <section aria-label="Pratinjau desain" className="order-1 min-w-0 lg:order-2">
        <Card tone="white" className="flex flex-col gap-4 lg:sticky lg:top-24">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex gap-1" role="group" aria-label="Sisi">
              {(["front", "back"] as const).map((item) => (
                <button
                  key={item}
                  type="button"
                  aria-pressed={side === item}
                  onClick={() => setSide(item)}
                  className={cn("rounded-control border-2 border-ink px-3 py-1.5 text-sm font-semibold", side === item ? "bg-ink text-white" : "bg-surface")}
                >
                  {item === "front" ? "Depan" : "Belakang"}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1">
              <Button variant="secondary" size="sm" onClick={undo} disabled={!canUndo} aria-label="Undo">↶ Undo</Button>
              <Button variant="secondary" size="sm" onClick={redo} disabled={!canRedo} aria-label="Redo">Redo ↷</Button>
              {/* Zoom: − [persen] +. Mengklik angka mengembalikan ke 100%. */}
              <div className="ml-1 flex items-center gap-1" role="group" aria-label="Zoom pratinjau">
                <Button variant="secondary" size="sm" onClick={() => stepZoom(-1)} disabled={zoom <= ZOOM_STEPS[0]} aria-label="Perkecil">−</Button>
                <button type="button" onClick={() => setZoom(100)} title="Kembalikan ke 100%" aria-live="polite" className="min-w-12 rounded-control px-1 py-1 text-center text-sm font-semibold tabular-nums hover:bg-subtle">
                  {zoom}%
                </button>
                <Button variant="secondary" size="sm" onClick={() => stepZoom(1)} disabled={zoom >= ZOOM_STEPS[ZOOM_STEPS.length - 1]} aria-label="Perbesar">+</Button>
              </div>
            </div>
          </div>
          {/* Latar netral terang agar warna kain tampil jujur. Ukuran kotak TETAP; saat zoom hanya baju yang
              membesar/mengecil, dan bila lebih besar dari kotak, kotak bisa digulir. */}
          <div className="flex h-[440px] overflow-auto rounded-card border-2 border-ink bg-subtle p-4 md:h-[470px]">
            <Garment
              product={design.product}
              colors={hexColors}
              side={side}
              images={overlays.images}
              texts={overlays.texts}
              highlight={focusPosition}
              className="m-auto h-auto shrink-0 transition-[width]"
              // Lebar dasar 340 px (atau selebar kotak di layar kecil) dikali persen zoom
              style={{ width: `calc(min(340px, 100%) * ${zoom / 100})`, maxWidth: "none" }}
            />
          </div>
        </Card>
      </section>

      {/* ===== Ringkasan harga kanan (di mobile menempel di bawah layar) ===== */}
      <aside
        aria-label="Ringkasan harga"
        className="order-3 fixed inset-x-0 bottom-0 z-30 border-t-2 border-ink bg-page p-4 lg:sticky lg:top-24 lg:self-start lg:border-0 lg:bg-transparent lg:p-0"
      >
        <Card tone="pink" className="flex flex-col gap-3 !p-4">
          <p className="hidden text-xs font-semibold uppercase tracking-widest lg:block">Ringkasan</p>
          <p className="hidden text-sm lg:block">{design.product} {category?.name}</p>
          <div className="flex items-end justify-between lg:flex-col lg:items-start">
            <div>
              <p className="text-xs text-ink-soft">Estimasi per pcs</p>
              <p className="text-2xl font-semibold text-accent">{formatRupiah(unitPrice)}</p>
            </div>
            <p className="hidden text-xs text-ink-muted lg:block">Belum termasuk tambahan ukuran besar, diskon volume, dan ongkir. Harga resmi dihitung server saat checkout.</p>
          </div>
          <Button onClick={goToOrder} size="lg" className="w-full">Lanjut: isi ukuran &amp; data →</Button>
        </Card>
      </aside>

      {/* ===== Konfirmasi ganti kategori (V04) ===== */}
      <Modal open={pendingCategory !== null} title="Ganti kategori?" onClose={() => setPendingCategory(null)}>
        <p className="mb-5 text-sm text-ink-soft">Ganti kategori akan mengatur ulang warna dan posisi logo. Lanjutkan?</p>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setPendingCategory(null)}>Batal</Button>
          <Button
            onClick={() => {
              if (pendingCategory !== null) applyCategory(pendingCategory);
              setPendingCategory(null);
            }}
          >
            Ya, ganti
          </Button>
        </div>
      </Modal>
    </div>
  );
}
