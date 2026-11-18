"use client";
/**
 * Komponen ParallaxLayer: membungkus elemen agar bergerak dengan kecepatan berbeda
 * saat halaman di-scroll (efek paralaks). Dipakai HANYA di landing page.
 *
 * Cara kerja: `speed` 1 = bergerak normal bersama halaman, 0 = diam, 0.2 = lambat.
 * Hanya `transform` dan `opacity` yang dianimasikan (ringan untuk browser).
 * Aturan aksesibilitas: dimatikan penuh bila pengguna memilih "kurangi gerakan",
 * dan di layar < 768 px hanya lapisan bertanda `mobile` yang aktif dengan setengah kecepatan.
 */
import { useEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/** Jarak scroll (px) untuk memudarkan elemen sepenuhnya pada mode `fadeOut`. */
const FADE_DISTANCE = 600;

interface ParallaxLayerProps {
  children: ReactNode;
  /** Kecepatan relatif terhadap scroll halaman (0 = diam, 1 = normal). */
  speed?: number;
  /** Arah gerak: vertikal (default) atau horizontal. */
  axis?: "y" | "x";
  /** Jarak geser tetap (px) untuk mode horizontal. */
  distance?: number;
  /** Putar elemen dari 0° ke sudut ini selama scroll (derajat). */
  rotateTo?: number;
  /** Memudar menjadi transparan selama 600 px scroll pertama (mulai dari posisi paling atas halaman). */
  fadeOut?: boolean;
  /**
   * Mulai animasi dari posisi paling atas halaman (untuk section pertama / hero).
   * Tanpa ini, animasi dimulai saat section muncul di bawah layar sehingga hero
   * sudah "setengah jalan" ketika halaman baru dibuka.
   */
  fromTop?: boolean;
  /**
   * Mode "turun perlahan": elemen sejajar saat section baru muncul, lalu bergeser ke bawah
   * sejauh nilai ini (px) seiring halaman di-scroll. Dipakai kartu tengah di Portofolio.
   */
  driftY?: number;
  /** Ikut aktif di layar kecil (dengan setengah kecepatan). */
  mobile?: boolean;
  className?: string;
}

export function ParallaxLayer({
  children,
  speed = 1,
  axis = "y",
  distance = 480,
  rotateTo,
  fadeOut = false,
  fromTop = false,
  driftY,
  mobile = false,
  className,
}: ParallaxLayerProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const media = gsap.matchMedia();
    const parent = element.parentElement ?? element;

    /** Memasang animasi scroll dengan kecepatan efektif tertentu. */
    const apply = (effectiveSpeed: number) => {
      // Memudar: selalu dihitung dari paling atas halaman agar hero tidak pudar saat dibuka
      if (fadeOut) {
        gsap.fromTo(
          element,
          { opacity: 1 },
          { opacity: 0, ease: "none", scrollTrigger: { trigger: parent, start: "top top", end: `+=${FADE_DISTANCE}`, scrub: true } },
        );
      }

      if (driftY !== undefined) {
        gsap.fromTo(
          element,
          { y: 0 },
          { y: driftY, ease: "none", scrollTrigger: { trigger: parent, start: "top 85%", end: "center 45%", scrub: true } },
        );
        return;
      }

      if (axis === "x") {
        gsap.fromTo(
          element,
          { x: 0 },
          { x: -distance * effectiveSpeed, ease: "none", scrollTrigger: { trigger: parent, start: "top bottom", end: "bottom top", scrub: true } },
        );
        return;
      }

      if (fromTop) {
        // Posisi awal = posisi asli (tidak bergeser). Bergeser lebih lambat dari halaman seiring scroll.
        gsap.fromTo(
          element,
          { y: 0, rotate: 0 },
          {
            // Dibatasi 35% tinggi section agar desain besar tidak terdorong keluar/terpotong
            y: () => (1 - effectiveSpeed) * parent.offsetHeight * 0.35,
            rotate: rotateTo ?? 0,
            ease: "none",
            scrollTrigger: { trigger: parent, start: "top top", end: "bottom top", scrub: true, invalidateOnRefresh: true },
          },
        );
        return;
      }

      // Section di tengah halaman: bergerak simetris saat melewati layar
      const shift = (1 - effectiveSpeed) * 100;
      gsap.fromTo(
        element,
        { y: -shift, rotate: 0 },
        { y: shift, rotate: rotateTo ?? 0, ease: "none", scrollTrigger: { trigger: parent, start: "top bottom", end: "bottom top", scrub: true } },
      );
    };

    // Hanya jalan jika pengguna TIDAK meminta mengurangi gerakan
    media.add("(prefers-reduced-motion: no-preference) and (min-width: 768px)", () => apply(speed));
    if (mobile) {
      // Di mobile kecepatan dibuat setengah jalan menuju 1 (efek lebih halus)
      media.add("(prefers-reduced-motion: no-preference) and (max-width: 767px)", () => apply(1 - (1 - speed) / 2));
    }
    return () => media.revert(); // bersihkan animasi saat komponen dilepas
  }, [speed, axis, distance, rotateTo, fadeOut, fromTop, driftY, mobile]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
