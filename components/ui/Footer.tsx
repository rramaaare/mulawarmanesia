/**
 * Komponen Footer: penutup halaman bermode gelap.
 * Susunan (atas ke bawah): logo + deskripsi di kiri dan tiga kolom tautan (Produk, Layanan, Kontak)
 * di kanan, wordmark merah raksasa rata kiri, lalu baris hak cipta dan kebijakan.
 * Tautan produk benar-benar membuka editor dengan kategori yang dimaksud (ID dari database).
 */
import Link from "next/link";
import type { ReactNode } from "react";
import type { Catalog } from "@/server/services/catalog-service";
import { Logo } from "./Logo";

/** Produk yang ditautkan di footer: [jenis produk, nama kategori]. */
const PRODUCT_LINKS = [
  ["PDH", "Model 01"],
  ["PDH", "Model 07"],
  ["VEST", "Model 01"],
  ["VEST", "Model 04"],
] as const;

/** Tautan layanan. */
const SERVICE_LINKS = [
  ["Custom Desain", "/editor"],
  ["Cara Pesan", "/#cara-pesan"],
  ["Lacak Pesanan", "/lacak"],
  ["Panduan Ukuran", "/panduan-ukuran"],
] as const;

/** Judul kolom: huruf kapital kecil berwarna merah muda. */
const COLUMN_TITLE = "text-[10px] font-semibold uppercase tracking-widest text-[#F0807A]";

/** Satu tautan: tautan ke bagian halaman (#id) memakai <a> agar langsung meloncat, selain itu <Link>. */
function FooterLink({ href, children }: { href: string; children: ReactNode }) {
  const className = "hover:text-white";
  return href.includes("#") ? (
    <a href={href} className={className}>{children}</a>
  ) : (
    <Link href={href} className={className}>{children}</Link>
  );
}

export function Footer({ catalog }: { catalog: Catalog }) {
  // Cari ID kategori di database; bila tidak ketemu, tautan jatuh ke editor biasa
  const productLinks = PRODUCT_LINKS.map(([product, name]) => {
    const category = catalog.categories.find((item) => item.product === product && item.name === name);
    return { label: `${product} ${name}`, href: category ? `/editor?kategori=${category.id}` : "/editor" };
  });

  return (
    <footer className="mt-auto bg-ink text-white">
      <div className="mx-auto max-w-7xl px-4 pb-6 pt-10 md:px-8">
        {/* Baris atas: logo kiri, kolom tautan kanan */}
        <div className="flex flex-col gap-10 md:flex-row md:justify-between">
          <div className="flex max-w-[260px] flex-col gap-3">
            <Logo inverse />
            <p className="text-sm leading-relaxed text-disabled md:text-[11px]">Konveksi PDH dan VEST custom. Workshop di Samarinda, kirim ke seluruh Indonesia.</p>
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-8 text-sm md:flex md:flex-wrap md:gap-x-10 md:text-[11px]">
            <div className="flex flex-col gap-3">
              <p className={COLUMN_TITLE}>Produk</p>
              <ul className="flex flex-col gap-3 text-disabled">
                {productLinks.map((item) => (
                  <li key={item.label}><FooterLink href={item.href}>{item.label}</FooterLink></li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col gap-3">
              <p className={COLUMN_TITLE}>Layanan</p>
              <ul className="flex flex-col gap-3 text-disabled">
                {SERVICE_LINKS.map(([label, href]) => (
                  <li key={label}><FooterLink href={href}>{label}</FooterLink></li>
                ))}
              </ul>
            </div>
            <div className="col-span-2 flex flex-col gap-3 md:col-span-1">
              <p className={COLUMN_TITLE}>Kontak</p>
              <ul className="flex flex-col gap-3 text-disabled">
                <li>WA 0812 5555 0199</li>
                <li>halo@mulawarmanesia.id</li>
                <li>Jl. Mulawarman No. 12, Samarinda</li>
                <li>Senin–Sabtu 08.00–17.00</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Wordmark raksasa rata kiri; ukuran mengikuti lebar layar agar tampil utuh */}
        <p
          className="mt-12 select-none whitespace-nowrap text-[clamp(32px,8.8vw,120px)] font-medium uppercase leading-none tracking-tighter text-accent md:mt-14"
          aria-hidden
        >
          MULAWARMANESIA
        </p>

        {/* Baris bawah */}
        <div className="mt-12 flex flex-wrap items-center justify-between gap-2 text-xs text-disabled md:text-[10px]">
          <span>© 2026 MULAWARMANESIA</span>
          <span>Kebijakan Privasi · Syarat Produksi &amp; Revisi</span>
        </div>
      </div>
    </footer>
  );
}
