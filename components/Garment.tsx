"use client";
/**
 * Komponen Garment: menggambar PDH (kemeja lengan panjang, Model 01-07) atau VEST (rompi, Model 01-06)
 * dari gambar mockup. Gambar tiap model disimpan di /public/mockup/views dan diambil saat dibutuhkan
 * (sekali per model, lalu disimpan di memori). Isi tiap bagian = warna (hex) atau motif kain,
 * dikirim lewat `colors` (nama bagian -> cat dari `toPaints`). Logo dan teks digambar di atasnya.
 * Dipakai di landing, editor, halaman pesanan, status, dan admin.
 */
import { useEffect, useId, useRef, useState, useSyncExternalStore, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";
import { MOTIFS } from "@/lib/domain/constants";
import { motifId } from "@/lib/domain/paint";

export { toPaints } from "@/lib/domain/paint";
import {
  FONTS,
  POSITIONS,
  PRODUCT_POSITIONS,
  bodyFrame,
  clampScale,
  foldSegments,
  foldVisibleBox,
  layoutOverlay,
  resolveModel,
  type OverlayAdjust,
  type OverlayBox,
  type PositionKey,
  type ProductType,
} from "@/features/editor/garment-data";

/** Satu logo yang akan digambar. */
export interface GarmentImage extends OverlayAdjust {
  /** ID item (dipakai editor untuk memilih/menggeser). */
  id?: string;
  src: string; // alamat gambar (URL unggahan atau blob URL pratinjau)
  position: PositionKey;
  /** Perbandingan lebar/tinggi gambar asli (kosong = persegi). */
  aspect?: number;
}

/** Satu teks yang akan digambar. */
export interface GarmentText extends OverlayAdjust {
  /** ID item (dipakai editor untuk memilih/menggeser). */
  id?: string;
  content: string;
  fontName: string;
  colorHex: string;
  position: PositionKey;
}

/** Jenis item yang bisa dipilih di gambar baju. */
export type OverlayKind = "image" | "text";

interface GarmentProps {
  product: ProductType;
  /** Nomor model ("01"-"07"). Kosong = Model 01. */
  model?: string | null;
  /** Nama bagian -> cat (kode hex atau motif dari `toPaints`), mis. { Badan: "#1F2A44" }. */
  colors: Record<string, string>;
  side?: "front" | "back";
  images?: GarmentImage[];
  texts?: GarmentText[];
  /** Tampilkan garis putus-putus area cetak aman untuk posisi ini. */
  highlight?: PositionKey | null;
  className?: string;
  /** Gaya tambahan, mis. lebar tetap untuk zoom. */
  style?: CSSProperties;
  /** Editor: ID item yang sedang dipilih (diberi kotak + pegangan ubah ukuran). */
  selectedId?: string | null;
  /** Editor: item diklik. Bila diisi, logo/teks bisa dipilih, digeser, dan diubah ukurannya. */
  onSelect?: (kind: OverlayKind, id: string) => void;
  /** Editor: hasil geser/ubah ukuran (dipanggil sekali saat jari/mouse dilepas). */
  onTransform?: (kind: OverlayKind, id: string, adjust: Required<OverlayAdjust>) => void;
}

/** Warna cadangan jika bagian belum punya warna. */
const FALLBACK = "#CCCCCC";

/** Area baju di gambar asli (x y lebar tinggi), rasionya sama dengan kanvas 300 x 340. */
const VIEWBOX: Record<ProductType, string> = { PDH: "71 130 668 757", VEST: "50 300 2735 3100" };

/** Menggelapkan warna hex (dipakai untuk bagian dalam). Motif dibiarkan apa adanya. */
function shade(hex: string, amount: number): string {
  const match = /^#?([0-9a-f]{6})$/i.exec(hex);
  if (!match) return hex;
  const value = parseInt(match[1], 16);
  const channel = (shift: number) => Math.round(((value >> shift) & 255) * (1 - amount));
  return `rgb(${channel(16)}, ${channel(8)}, ${channel(0)})`;
}

// ---- Pemuatan gambar mockup: diambil sekali per tampilan, dibagikan ke semua Garment ----
const viewCache = new Map<string, string>();
const loading = new Set<string>();
const listeners = new Set<() => void>();
function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
function loadView(key: string) {
  if (viewCache.has(key) || loading.has(key)) return;
  loading.add(key);
  fetch(`/mockup/views/${key}.svg`)
    .then((response) => (response.ok ? response.text() : ""))
    .catch(() => "")
    .then((markup) => {
      viewCache.set(key, markup);
      loading.delete(key);
      listeners.forEach((listener) => listener());
    });
}
function useMockupView(key: string): string {
  const markup = useSyncExternalStore(subscribe, () => viewCache.get(key) ?? "", () => "");
  useEffect(() => loadView(key), [key]);
  return markup;
}

/** Variabel CSS yang dibaca gambar mockup, dengan bagian cadangan untuk desain lama/bagian yang tidak ada. */
function paintVariables(product: ProductType, colors: Record<string, string>): CSSProperties {
  const badan = colors["Badan"] ?? colors["Badan bawah"] ?? FALLBACK;
  if (product === "VEST") {
    const bahu = colors["Bahu"] ?? badan;
    return {
      "--vest-badan": badan,
      "--vest-bahu": bahu,
      "--vest-saku": colors["Saku"] ?? badan,
      "--vest-aksen": colors["Aksen"] ?? shade(badan, 0.35),
      "--vest-atas": colors["Badan atas"] ?? bahu,
      "--vest-bawah": colors["Badan bawah"] ?? badan,
    } as CSSProperties;
  }
  const lengan = colors["Lengan"] ?? badan;
  const bahu = colors["Bahu"] ?? badan;
  return {
    "--pdh-badan": badan,
    "--pdh-lengan": lengan,
    "--pdh-manset": colors["List lengan"] ?? lengan,
    "--pdh-kerah": colors["Kerah"] ?? badan,
    "--pdh-plaket": colors["Plaket"] ?? badan,
    "--pdh-saku": colors["Saku"] ?? colors["Tutup saku"] ?? badan,
    "--pdh-bahu": bahu,
    "--pdh-samping": colors["Panel samping"] ?? badan,
    "--pdh-strip": colors["Strip"] ?? badan,
    "--pdh-epolet": colors["Epolet"] ?? bahu,
    "--pdh-dalam": shade(badan, 0.3),
  } as CSSProperties;
}

/** Keadaan saat item sedang digeser atau diubah ukurannya. */
interface DragState {
  kind: OverlayKind;
  id: string;
  mode: "move" | "resize";
  pointerId: number;
  start: { x: number; y: number };
  center: { x: number; y: number };
  /** Kemiringan item di layar (lengan), supaya geseran mengikuti arah lengan. */
  rotation: number;
  startDistance: number;
  original: Required<OverlayAdjust>;
  current: Required<OverlayAdjust>;
  moved: boolean;
}

/** Satu item siap gambar: data + kotak hasil tata letak. */
interface PlacedItem {
  kind: OverlayKind;
  id: string;
  position: PositionKey;
  adjust: Required<OverlayAdjust>;
  box: OverlayBox;
  image?: GarmentImage;
  text?: GarmentText;
}

const adjustOf = (item: OverlayAdjust): Required<OverlayAdjust> => ({
  offsetX: item.offsetX ?? 0,
  offsetY: item.offsetY ?? 0,
  scale: clampScale(item.scale),
  flipX: Boolean(item.flipX),
  flipY: Boolean(item.flipY),
});

/** Kemiringan bingkai (lengan) di sisi yang tampil; null bila bingkai tegak. */
function rotationOf(box: OverlayBox, side: "front" | "back"): { angle: number; x: number; y: number } | null {
  const frame = box.frame;
  if (!frame?.angle) return null;
  const home = side === box.home;
  return { angle: home ? frame.angle : -frame.angle, x: home ? frame.cx : (frame.cxBack ?? frame.cx), y: frame.cy ?? box.y + box.h / 2 };
}

/** Memutar titik (x, y) mengelilingi pusat putar. */
function rotatePoint(x: number, y: number, rotation: { angle: number; x: number; y: number } | null) {
  if (!rotation) return { x, y };
  const radians = (rotation.angle * Math.PI) / 180;
  const dx = x - rotation.x;
  const dy = y - rotation.y;
  return { x: rotation.x + dx * Math.cos(radians) - dy * Math.sin(radians), y: rotation.y + dx * Math.sin(radians) + dy * Math.cos(radians) };
}

export function Garment({ product, model, colors, side = "front", images = [], texts = [], highlight, className, style, selectedId, onSelect, onTransform }: GarmentProps) {
  const activeModel = resolveModel(product, model);
  const markup = useMockupView(`${product.toLowerCase()}-${activeModel}-${side}`);
  const svgRef = useRef<SVGSVGElement>(null);
  const clipBase = useId().replace(/[^a-zA-Z0-9]/g, "");
  const [drag, setDrag] = useState<DragState | null>(null);
  const interactive = Boolean(onSelect);

  // Di layar sentuh, browser menganggap geseran jari sebagai gulir halaman lalu membatalkan pointer
  // (touch-action pada elemen SVG tidak dihormati). Cegah gulir HANYA bila sentuhan dimulai di logo/teks.
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg || !interactive) return;
    const onTouchStart = (event: TouchEvent) => {
      if ((event.target as Element | null)?.closest?.("[data-overlay]")) event.preventDefault();
    };
    svg.addEventListener("touchstart", onTouchStart, { passive: false });
    return () => svg.removeEventListener("touchstart", onTouchStart);
  }, [interactive]);

  /** Motif yang dipakai desain ini (pola SVG-nya perlu didefinisikan). */
  const usedMotifs = MOTIFS.filter((motif) => Object.values(colors).includes(`url(#${motifId(motif.slug)})`));

  // Susun semua logo & teks, dengan penyesuaian sementara saat sedang digeser
  const place = (kind: OverlayKind, id: string, position: PositionKey, base: OverlayAdjust, layout: { kind: "image"; aspect?: number } | { kind: "text"; content: string }) => {
    const adjust = drag && drag.kind === kind && drag.id === id ? drag.current : adjustOf(base);
    return { kind, id, position, adjust, box: layoutOverlay(product, position, { ...layout, ...adjust }) };
  };
  const placed: PlacedItem[] = [
    ...images.map((image, index) => ({ ...place("image", image.id ?? `image-${index}`, image.position, image, { kind: "image", aspect: image.aspect }), image })),
    ...texts.map((text, index) => ({ ...place("text", text.id ?? `text-${index}`, text.position, text, { kind: "text", content: text.content }), text })),
  ].filter((item) => foldVisibleBox(item.box, side) !== null); // termasuk bagian yang berlanjut dari sisi lain

  /** Mengubah posisi pointer di layar menjadi koordinat kanvas 300 x 340. */
  function toCanvas(event: ReactPointerEvent): { x: number; y: number } {
    const svg = svgRef.current;
    const matrix = svg?.getScreenCTM();
    if (!svg || !matrix) return { x: 0, y: 0 };
    const point = svg.createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;
    const local = point.matrixTransform(matrix.inverse());
    return { x: local.x, y: local.y };
  }

  function startDrag(event: ReactPointerEvent, item: PlacedItem, mode: DragState["mode"]) {
    if (!onSelect) return;
    event.stopPropagation();
    event.preventDefault();
    onSelect(item.kind, item.id);
    const start = toCanvas(event);
    const shown = foldVisibleBox(item.box, side) ?? item.box;
    const rotation = rotationOf(item.box, side);
    const center = rotatePoint(shown.x + shown.w / 2, shown.y + shown.h / 2, rotation);
    svgRef.current?.setPointerCapture(event.pointerId);
    setDrag({
      kind: item.kind,
      id: item.id,
      mode,
      pointerId: event.pointerId,
      start,
      center,
      rotation: rotation?.angle ?? 0,
      startDistance: Math.max(4, Math.hypot(start.x - center.x, start.y - center.y)),
      original: item.adjust,
      current: item.adjust,
      moved: false,
    });
  }

  function moveDrag(event: ReactPointerEvent) {
    if (!drag || event.pointerId !== drag.pointerId) return;
    const point = toCanvas(event);
    // Item miring (lengan): ubah geseran layar ke arah sumbu item
    const radians = (-drag.rotation * Math.PI) / 180;
    const rawX = point.x - drag.start.x;
    const rawY = point.y - drag.start.y;
    const dx = rawX * Math.cos(radians) - rawY * Math.sin(radians);
    const dy = rawX * Math.sin(radians) + rawY * Math.cos(radians);
    const current =
      drag.mode === "move"
        ? { ...drag.original, offsetX: Math.round(drag.original.offsetX + dx), offsetY: Math.round(drag.original.offsetY + dy) }
        : { ...drag.original, scale: Math.round(clampScale((drag.original.scale * Math.hypot(point.x - drag.center.x, point.y - drag.center.y)) / drag.startDistance) * 100) / 100 };
    setDrag({ ...drag, current, moved: drag.moved || Math.hypot(rawX, rawY) > 1.5 });
  }

  function endDrag(event: ReactPointerEvent) {
    if (!drag || event.pointerId !== drag.pointerId) return;
    if (svgRef.current?.hasPointerCapture(event.pointerId)) svgRef.current.releasePointerCapture(event.pointerId);
    if (drag.moved) onTransform?.(drag.kind, drag.id, drag.current);
    setDrag(null);
  }

  /** Isi gambar/teks pada kotaknya (utuh, tidak diubah bentuknya), dibalik bila diminta. */
  function renderContent(item: PlacedItem) {
    const { box, adjust } = item;
    const centerX = box.x + box.w / 2;
    const centerY = box.y + box.h / 2;
    const flip =
      adjust.flipX || adjust.flipY
        ? `translate(${centerX} ${centerY}) scale(${adjust.flipX ? -1 : 1} ${adjust.flipY ? -1 : 1}) translate(${-centerX} ${-centerY})`
        : undefined;
    if (item.image) {
      return (
        <g transform={flip}>
          <image href={item.image.src} x={box.x} y={box.y} width={box.w} height={box.h} preserveAspectRatio="xMidYMid meet" />
        </g>
      );
    }
    const text = item.text as GarmentText;
    const font = FONTS.find((entry) => entry.name === text.fontName) ?? FONTS[0];
    return (
      <g transform={flip}>
        <text
          x={centerX}
          y={box.y + box.h * 0.82}
          textAnchor="middle"
          fontFamily={font.css}
          fontWeight={font.weight}
          fontSize={box.fontSize}
          // Lebar teks dipatok ke kotak supaya potongan depan-belakang menyambung tepat di tepi
          textLength={box.w}
          lengthAdjust="spacingAndGlyphs"
          fill={text.colorHex}
          // Garis tepi tipis agar teks tetap terbaca walau warnanya sama dengan kain
          stroke="rgba(17, 17, 17, 0.45)"
          strokeWidth={0.6}
          paintOrder="stroke"
        >
          {text.content}
        </text>
      </g>
    );
  }

  /** Satu logo/teks: potongan yang tampil di sisi ini + area sentuh, kotak pilihan, pegangan ubah ukuran. */
  function renderItem(item: PlacedItem, index: number) {
    const { box } = item;
    const selected = interactive && item.id === selectedId;
    const shown = foldVisibleBox(box, side);
    if (!shown) return null;
    const rotation = rotationOf(box, side);
    const content = renderContent(item);
    const segments = foldSegments(box, side);
    const continues = selected && foldVisibleBox(box, side === "front" ? "back" : "front") !== null;
    const label = rotatePoint(shown.x + shown.w / 2, shown.y + shown.h + 13, rotation);
    return (
      <g key={`${item.kind}-${item.id}`}>
        <g
          data-overlay={interactive ? "" : undefined}
          onPointerDown={interactive ? (event) => startDrag(event, item, "move") : undefined}
          style={interactive ? { cursor: "move", touchAction: "none" } : undefined}
          transform={rotation ? `rotate(${rotation.angle} ${rotation.x} ${rotation.y})` : undefined}
        >
          {interactive && <title>Klik untuk memilih, geser untuk memindah</title>}
          {/* Area sentuh transparan supaya mudah dipegang (termasuk sela antarhuruf) */}
          {interactive && <rect x={shown.x - 3} y={shown.y - 3} width={shown.w + 6} height={shown.h + 6} fill="transparent" />}
          {/* Potongan item: dipotong di tepi badan/lengan, bagian yang lewat tampil di sisi sebaliknya */}
          {segments.map((segment, segmentIndex) => {
            const clipId = `${clipBase}-${index}-${segmentIndex}`;
            const bounded = Number.isFinite(segment.x0);
            return (
              <g key={segmentIndex}>
                {bounded && (
                  <clipPath id={clipId}>
                    <rect x={segment.x0} y="0" width={segment.x1 - segment.x0} height="340" />
                  </clipPath>
                )}
                <g clipPath={bounded ? `url(#${clipId})` : undefined}>
                  <g transform={segment.shift ? `translate(${segment.shift} 0)` : undefined}>{content}</g>
                </g>
              </g>
            );
          })}
          {selected && (
            <>
              <rect x={shown.x - 3} y={shown.y - 3} width={shown.w + 6} height={shown.h + 6} fill="none" stroke="#C12822" strokeWidth="1.5" strokeDasharray="4 3" pointerEvents="none" />
              <circle
                cx={shown.x + shown.w + 3}
                cy={shown.y + shown.h + 3}
                r="5"
                fill="#FFFFFF"
                stroke="#C12822"
                strokeWidth="2"
                style={{ cursor: "nwse-resize", touchAction: "none" }}
                onPointerDown={(event) => startDrag(event, item, "resize")}
              >
                <title>Tarik untuk mengubah ukuran</title>
              </circle>
            </>
          )}
        </g>
        {/* Petunjuk kecil (tidak ikut miring) bila sebagian item berlanjut di tampak sebaliknya */}
        {continues && (
          <g pointerEvents="none">
            <rect x={Math.min(Math.max(label.x, 40), 260) - 38} y={label.y - 6} width="76" height="11" rx="5.5" fill="#C12822" />
            <text x={Math.min(Math.max(label.x, 40), 260)} y={label.y + 2} textAnchor="middle" fontSize="6.5" fontWeight="700" fill="#FFFFFF">
              {side === "front" ? "lanjut di belakang ↻" : "lanjut di depan ↻"}
            </text>
          </g>
        )}
      </g>
    );
  }

  /** Area cetak (garis putus-putus) untuk posisi yang sedang dipilih di panel. */
  const highlightArea = (() => {
    if (!highlight) return null;
    const area = PRODUCT_POSITIONS[product][highlight];
    if (!area) return null;
    const home = POSITIONS[highlight].side === "back" ? "back" : "front";
    const left = area.startBased ? area.x : area.x - area.w / 2;
    const box: OverlayBox = { x: left, y: area.y - area.h / 2, w: area.w, h: area.h, fontSize: 0, frame: area.frame ?? bodyFrame(product, area.y), home };
    const shown = foldVisibleBox(box, side);
    const rotation = rotationOf(box, side);
    return shown ? { ...shown, transform: rotation ? `rotate(${rotation.angle} ${rotation.x} ${rotation.y})` : undefined } : null;
  })();

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 300 340"
      className={className}
      style={{ userSelect: "none", ...style }}
      role="img"
      aria-label={`${product} Model ${activeModel} tampak ${side === "front" ? "depan" : "belakang"}`}
      onPointerMove={drag ? moveDrag : undefined}
      onPointerUp={drag ? endDrag : undefined}
      onPointerCancel={drag ? endDrag : undefined}
    >
      {usedMotifs.length > 0 && (
        <defs>
          {usedMotifs.map((motif) => (
            // Motif menutupi tiap bagian (seperti background-size: cover) tanpa terdistorsi
            <pattern
              key={motif.slug}
              id={motifId(motif.slug)}
              patternUnits="objectBoundingBox"
              width="1"
              height="1"
              viewBox={`0 0 ${motif.width} ${motif.height}`}
              preserveAspectRatio="xMidYMid slice"
            >
              <image href={motif.src} width={motif.width} height={motif.height} />
            </pattern>
          ))}
        </defs>
      )}
      <svg
        x="0"
        y="0"
        width="300"
        height="340"
        viewBox={VIEWBOX[product]}
        style={paintVariables(product, colors)}
        // Markup berasal dari file mockup milik sendiri (bukan input pengguna), jadi aman disisipkan.
        dangerouslySetInnerHTML={{ __html: markup }}
      />

      {/* Logo lalu teks (teks di atas logo) */}
      {placed.map(renderItem)}

      {highlightArea && highlightArea.w > 0 && (
        <rect
          x={highlightArea.x - 3}
          y={highlightArea.y - 3}
          width={highlightArea.w + 6}
          height={highlightArea.h + 6}
          fill="none"
          stroke="#C12822"
          strokeWidth="2"
          strokeDasharray="5 4"
          pointerEvents="none"
          transform={highlightArea.transform}
        />
      )}
    </svg>
  );
}
