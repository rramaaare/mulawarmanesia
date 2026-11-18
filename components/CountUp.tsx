"use client";
/**
 * Komponen CountUp: menampilkan angka yang "berhitung" dari 0 sampai nilai akhir saat
 * komponen pertama kali terlihat di layar.
 *
 * Cara pakai: <CountUp value="1.200+" />  <CountUp value="10–14" />  <CountUp value="12 pcs" />
 * Setiap angka di dalam teks dihitung naik (titik dibaca sebagai pemisah ribuan);
 * teks lain (+, pcs, tanda –) dibiarkan. Dimatikan bila pengguna memilih "kurangi gerakan".
 */
import { useEffect, useRef, useState } from "react";

/** Memecah teks menjadi potongan angka dan bukan-angka (angka ditangkap oleh tanda kurung). */
const SPLIT_NUMBERS = /(\d+(?:\.\d{3})*)/;

/** Efek melambat di akhir (easeOutCubic): 0 -> 1. */
function easeOut(progress: number): number {
  return 1 - Math.pow(1 - progress, 3);
}

interface CountUpProps {
  value: string;
  /** Lama hitungan dalam milidetik. */
  durationMs?: number;
}

export function CountUp({ value, durationMs = 1600 }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [progress, setProgress] = useState(0); // 0 = belum mulai, 1 = selesai

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    let frame = 0;

    // Pengguna meminta mengurangi gerakan: langsung tampilkan angka akhir
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      frame = requestAnimationFrame(() => setProgress(1));
      return () => cancelAnimationFrame(frame);
    }

    // Mulai berhitung ketika elemen sudah terlihat (sekali saja)
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        const startTime = performance.now();
        const tick = (now: number) => {
          const ratio = Math.min(1, (now - startTime) / durationMs);
          setProgress(easeOut(ratio));
          if (ratio < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );
    observer.observe(element);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [durationMs]);

  // Ganti tiap angka dengan nilai berjalan; potongan lain dibiarkan
  const text = value
    .split(SPLIT_NUMBERS)
    .map((part) => (/^\d/.test(part) ? Math.round(Number(part.replace(/\./g, "")) * progress).toLocaleString("id-ID") : part))
    .join("");

  return (
    <span ref={ref} className="tabular-nums" aria-label={value}>
      <span aria-hidden>{text}</span>
    </span>
  );
}
