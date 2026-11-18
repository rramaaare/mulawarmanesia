/**
 * Komponen Garment: menggambar PDH (kemeja lengan pendek) atau VEST sebagai SVG.
 * Warna tiap bagian = properti `fill` dari objek `colors` (nama bagian -> kode hex),
 * jadi mengubah warna di editor langsung mengubah gambar. Logo dan teks digambar
 * di atasnya pada posisi preset. Dipakai di landing, editor, dan halaman status.
 */
import type { CSSProperties } from "react";
import { POSITIONS, FONTS, type PositionKey, type ProductType } from "@/features/editor/garment-data";

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
  /** Nama bagian -> kode warna hex, mis. { Badan: "#1F2A44" }. */
  colors: Record<string, string>;
  side?: "front" | "back";
  images?: GarmentImage[];
  texts?: GarmentText[];
  /** Tampilkan garis putus-putus area cetak aman untuk posisi ini. */
  highlight?: PositionKey | null;
  className?: string;
  /** Gaya tambahan, mis. lebar tetap untuk zoom. */
  style?: CSSProperties;
}

/** Warna cadangan jika bagian belum punya warna. */
const FALLBACK = "#CCCCCC";
const STROKE = { stroke: "#111111", strokeWidth: 2.5, strokeLinejoin: "round" as const };

/** Posisi kancing di tengah plaket kemeja (sumbu Y). */
const BUTTON_ROWS = [90, 120, 150, 180, 210, 240, 270];

/** Dua lengan pendek + list (manset) hitam di ujungnya; dipakai tampak depan dan belakang. */
function ShortSleeves({ c }: { c: (part: string) => string }) {
  return (
    <>
      <path d="M95 40 L26 78 L8 124 L62 142 L92 98 Z" fill={c("Lengan")} />
      <path d="M205 40 L274 78 L292 124 L238 142 L208 98 Z" fill={c("Lengan")} />
      <path d="M8 124 L62 142 L57 160 L3 142 Z" fill={c("List lengan")} />
      <path d="M292 124 L238 142 L243 160 L297 142 Z" fill={c("List lengan")} />
    </>
  );
}

/** Gambar PDH tampak depan: kemeja kerah, plaket berkancing, dua saku dengan tutup. */
function PdhFront({ c }: { c: (part: string) => string }) {
  return (
    <g {...STROKE}>
      <ShortSleeves c={c} />
      <path d="M95 40 L125 30 L175 30 L205 40 L208 100 L214 318 L86 318 L92 100 Z" fill={c("Badan")} />
      <rect x="143" y="58" width="14" height="260" fill={c("Plaket")} />
      {/* Saku: badan saku + tutup saku di atasnya */}
      <rect x="102" y="118" width="38" height="42" fill={c("Badan")} />
      <rect x="160" y="118" width="38" height="42" fill={c("Badan")} />
      <rect x="102" y="118" width="38" height="15" fill={c("Tutup saku")} />
      <rect x="160" y="118" width="38" height="15" fill={c("Tutup saku")} />
      {BUTTON_ROWS.map((y) => (
        <circle key={y} cx="150" cy={y} r="2.8" fill="#FFFFFF" strokeWidth="1.5" />
      ))}
      <path d="M125 30 L150 62 L133 82 L104 50 Z" fill={c("Kerah")} />
      <path d="M175 30 L150 62 L167 82 L196 50 Z" fill={c("Kerah")} />
    </g>
  );
}

/** Gambar PDH tampak belakang: tanpa plaket/saku, kerah belakang rendah. */
function PdhBack({ c }: { c: (part: string) => string }) {
  return (
    <g {...STROKE}>
      <ShortSleeves c={c} />
      <path d="M95 40 L125 30 L175 30 L205 40 L208 100 L214 318 L86 318 L92 100 Z" fill={c("Badan")} />
      <path d="M125 30 Q150 48 175 30 L172 42 Q150 58 128 42 Z" fill={c("Kerah")} />
    </g>
  );
}

/** Gambar VEST: leher V lebar, strip reflektif vertikal + horizontal, dua saku, ritsleting. */
function Vest({ c, side }: { c: (part: string) => string; side: "front" | "back" }) {
  return (
    <g {...STROKE}>
      <path
        d={side === "front"
          ? "M84 30 L124 30 L150 82 L176 30 L216 30 L226 110 L218 322 L82 322 L74 110 Z"
          : "M84 30 Q150 54 216 30 L226 110 L218 322 L82 322 L74 110 Z"}
        fill={c("Badan")}
      />
      {/* Strip reflektif: dua vertikal di sisi, dua horizontal di bawah */}
      <rect x="96" y="30" width="16" height="292" fill={c("Strip reflektif")} />
      <rect x="188" y="30" width="16" height="292" fill={c("Strip reflektif")} />
      <rect x="82" y="196" width="136" height="14" fill={c("Strip reflektif")} />
      <rect x="82" y="224" width="136" height="14" fill={c("Strip reflektif")} />
      {side === "front" && (
        <>
          <rect x="100" y="262" width="42" height="44" fill={c("Saku")} />
          <rect x="158" y="262" width="42" height="44" fill={c("Saku")} />
          <line x1="150" y1="82" x2="150" y2="322" stroke={c("Ritsleting")} strokeWidth="4" />
        </>
      )}
    </g>
  );
}

export function Garment({ product, colors, side = "front", images = [], texts = [], highlight, className, style }: GarmentProps) {
  /** Mengambil warna bagian; jika kosong pakai abu-abu. */
  const c = (part: string) => colors[part] ?? FALLBACK;
  const visible = <T extends { position: PositionKey }>(items: T[]) => items.filter((item) => POSITIONS[item.position].side === side);

  return (
    <svg viewBox="0 0 300 340" className={className} style={style} role="img" aria-label={`${product} tampak ${side === "front" ? "depan" : "belakang"}`}>
      {product === "PDH" ? (side === "front" ? <PdhFront c={c} /> : <PdhBack c={c} />) : <Vest c={c} side={side} />}

      {/* Logo */}
      {visible(images).map((image, index) => {
        const spot = POSITIONS[image.position];
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
      {visible(texts).map((text, index) => {
        const spot = POSITIONS[text.position];
        const font = FONTS.find((item) => item.name === text.fontName) ?? FONTS[0];
        return (
          <text
            key={`${text.position}-${index}`}
            x={spot.x}
            y={spot.y + 4}
            textAnchor="middle"
            fontFamily={font.css}
            fontWeight={font.weight}
            fontSize={Math.max(8, Math.min(18, 150 / Math.max(text.content.length, 6)))}
            fill={text.colorHex}
          >
            {text.content}
          </text>
        );
      })}

      {/* Area cetak aman (garis putus-putus) untuk posisi yang sedang dipilih */}
      {highlight && POSITIONS[highlight].side === side && (
        <rect
          x={POSITIONS[highlight].x - POSITIONS[highlight].size / 2 - 3}
          y={POSITIONS[highlight].y - POSITIONS[highlight].size / 2 - 3}
          width={POSITIONS[highlight].size + 6}
          height={POSITIONS[highlight].size + 6}
          fill="none"
          stroke="#C12822"
          strokeWidth="2"
          strokeDasharray="5 4"
        />
      )}
    </svg>
  );
}
