"use client";
/**
 * OrderNumberBox: kotak merah muda berisi nomor pesanan (MLW-...) yang besar, dengan tombol
 * "Salin" dan "Unduh bukti". Nomor ini dibutuhkan untuk melacak pesanan, jadi pelanggan
 * diminta menyimpannya: disalin ke clipboard atau diunduh sebagai file .txt.
 */
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { formatRupiah } from "@/lib/format";

interface OrderNumberBoxProps {
  code: string;
  token: string;
  title: string; // mis. "PDH Organisasi · 20 pcs"
  total: number;
  amountPaid: number;
}

export function OrderNumberBox({ code, token, title, total, amountPaid }: OrderNumberBoxProps) {
  const [copied, setCopied] = useState(false);

  /** Menyalin nomor pesanan; tombol berubah jadi "Tersalin" selama 2 detik. */
  async function copyCode() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard diblokir: pelanggan masih bisa mengunduh file */
    }
  }

  /** Membuat file teks bukti pesanan lalu mengunduhnya. */
  function downloadReceipt() {
    const origin = window.location.origin;
    const lines = [
      "MULAWARMANESIA - Bukti Pesanan",
      "================================",
      `Nomor pesanan : ${code}`,
      `Pesanan       : ${title}`,
      `Total         : ${formatRupiah(total)}`,
      `Sudah dibayar : ${formatRupiah(amountPaid)}`,
      "",
      "Cara melacak pesanan:",
      `1. Buka ${origin}/lacak lalu isi nomor pesanan di atas`,
      "   dan nomor WhatsApp yang kamu pakai saat checkout, atau",
      `2. Buka tautan langsung: ${origin}/status/${code}?token=${token}`,
      "",
      "Simpan file ini. Jangan bagikan tautan langsung ke orang lain.",
    ];
    const blob = new Blob([lines.join("\r\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `bukti-pesanan-${code}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-card border-2 border-ink bg-accent-subtle px-4 py-3">
      <div>
        <p className="text-xs text-ink-soft">Nomor pesanan</p>
        <p className="text-2xl font-medium tracking-tight md:text-3xl">{code}</p>
      </div>
      <div className="flex gap-3">
        <Button variant="secondary" size="sm" onClick={copyCode}>{copied ? "Tersalin ✓" : "Salin"}</Button>
        <Button variant="secondary" size="sm" onClick={downloadReceipt}>Unduh bukti</Button>
      </div>
    </div>
  );
}
