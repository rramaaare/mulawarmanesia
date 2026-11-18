"use client";
/**
 * QrFrame: kotak putih bergaris hitam berisi kode QR asli yang dibuat dari teks `value`
 * (library qrcode.react menggambarnya sebagai SVG, jadi tajam di ukuran berapa pun).
 */
import { QRCodeSVG } from "qrcode.react";

export function QrFrame({ value, size = 168 }: { value: string; size?: number }) {
  return (
    <div className="inline-block shrink-0 rounded-card border-2 border-ink bg-white p-3">
      <QRCodeSVG value={value} size={size} level="M" marginSize={0} fgColor="#111111" bgColor="#FFFFFF" />
    </div>
  );
}
