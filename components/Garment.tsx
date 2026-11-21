"use client";
/**
 * Komponen Garment: menggambar PDH (kemeja lengan panjang, Model 01-07) atau VEST (rompi, Model 01-06)
 * dari gambar mockup. Gambar tiap model disimpan di /public/mockup/views dan diambil saat dibutuhkan
 * (sekali per model, lalu disimpan di memori). Isi tiap bagian = warna (hex) atau motif kain,
 * dikirim lewat `colors` (nama bagian -> cat dari `toPaints`). Logo dan teks digambar di atasnya.
 * Dipakai di landing, editor, halaman pesanan, status, dan admin.
 */
import { useEffect, useSyncExternalStore, type CSSProperties } from "react";
import { MOTIFS } from "@/lib/domain/constants";
import { motifId } from "@/lib/domain/paint";

export { toPaints } from "@/lib/domain/paint";
import {
  FONTS,
  POSITIONS,
  PRODUCT_POSITIONS,
  resolveModel,
  type PositionKey,
  type ProductType,
} from "@/features/editor/garment-data";

/** Satu logo yang akan digambar. */
export interface GarmentImage {
  src: string; // alamat gambar (URL unggahan atau blob URL pratinjau)
  position: PositionKey;
}

/** Satu teks yang akan digambar. */
export interface GarmentText {
  content: string;
  fontName: string;
  colorHex: string;
  position: PositionKey;
}

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
  /** Bila diisi, teks di gambar bisa diklik (indeks = urutan di `texts`). Dipakai editor untuk mengubah teks. */
  onTextClick?: (index: number) => void;
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

export function Garment({ product, model, colors, side = "front", images = [], texts = [], highlight, className, style, onTextClick }: GarmentProps) {
  const activeModel = resolveModel(product, model);
  const markup = useMockupView(`${product.toLowerCase()}-${activeModel}-${side}`);
  const visible = <T extends { position: PositionKey }>(items: T[]) => items.filter((item) => POSITIONS[item.position].side === side);
  /** Indeks asli teks (sebelum disaring per sisi), supaya klik menunjuk teks yang benar. */
  const visibleTexts = texts.map((text, index) => ({ ...text, index })).filter((text) => POSITIONS[text.position].side === side);
  /** Titik dan ukuran area cetak sesuai gambar produk. */
  const spotOf = (position: PositionKey) => ({ ...POSITIONS[position], ...PRODUCT_POSITIONS[product][position] });
  /** Motif yang dipakai desain ini (pola SVG-nya perlu didefinisikan). */
  const usedMotifs = MOTIFS.filter((motif) => Object.values(colors).includes(`url(#${motifId(motif.slug)})`));

  return (
    <svg
      viewBox="0 0 300 340"
      className={className}
      style={{ userSelect: "none", ...style }}
      role="img"
      aria-label={`${product} Model ${activeModel} tampak ${side === "front" ? "depan" : "belakang"}`}
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

      {/* Logo */}
      {visible(images).map((image, index) => {
        const spot = spotOf(image.position);
        return (
          <image
            key={`${image.position}-${index}`}
            href={image.src}
            x={spot.x - spot.size / 2}
            y={spot.y - spot.size / 2}
            width={spot.size}
            height={spot.size}
            preserveAspectRatio="xMidYMid meet"
          />
        );
      })}

      {/* Teks */}
      {visibleTexts.map((text) => {
        const spot = spotOf(text.position);
        const font = FONTS.find((item) => item.name === text.fontName) ?? FONTS[0];
        return (
          <text
            key={`${text.position}-${text.index}`}
            x={spot.x}
            y={spot.y + 4}
            textAnchor="middle"
            fontFamily={font.css}
            fontWeight={font.weight}
            fontSize={Math.max(8, Math.min(18, 150 / Math.max(text.content.length, 6)))}
            fill={text.colorHex}
            // Garis tepi tipis agar teks tetap terbaca walau warnanya sama dengan kain
            stroke="rgba(17, 17, 17, 0.45)"
            strokeWidth={0.6}
            paintOrder="stroke"
            onClick={onTextClick ? () => onTextClick(text.index) : undefined}
            style={onTextClick ? { cursor: "pointer" } : undefined}
          >
            {onTextClick && <title>Klik untuk mengubah teks</title>}
            {text.content}
          </text>
        );
      })}

      {/* Area cetak aman (garis putus-putus) untuk posisi yang sedang dipilih */}
      {highlight && POSITIONS[highlight].side === side && (
        <rect
          x={spotOf(highlight).x - spotOf(highlight).size / 2 - 3}
          y={spotOf(highlight).y - spotOf(highlight).size / 2 - 3}
          width={spotOf(highlight).size + 6}
          height={spotOf(highlight).size + 6}
          fill="none"
          stroke="#C12822"
          strokeWidth="2"
          strokeDasharray="5 4"
        />
      )}
    </svg>
  );
}
