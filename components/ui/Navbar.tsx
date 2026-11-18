"use client";
/**
 * Komponen Navbar: bilah navigasi selebar layar yang menempel di atas (sticky).
 * Di layar lebar tampil menu mendatar, di mobile menjadi tombol menu yang membuka daftar tautan.
 */
import { useState } from "react";
import { Button } from "./Button";
import { Logo } from "./Logo";

/** Daftar tautan menu. `href` memakai "/#id" untuk loncat ke section di landing. */
const LINKS = [
  { label: "Katalog", href: "/#katalog" },
  { label: "Custom Desain", href: "/editor" },
  { label: "Cara Pesan", href: "/#cara-pesan" },
  { label: "Portofolio", href: "/#portofolio" },
  { label: "Lacak Pesanan", href: "/lacak" },
];

export function Navbar() {
  const [open, setOpen] = useState(false); // menu mobile terbuka?

  return (
    <header className="sticky top-0 z-40 border-b-2 border-ink bg-surface print:hidden">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-8" aria-label="Navigasi utama">
        <Logo />

        {/* Menu desktop */}
        <ul className="hidden items-center gap-7 text-[13px] font-medium lg:flex">
          {LINKS.map((link) => (
            <li key={link.href}>
              <a href={link.href} className="hover:text-accent">
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          {/* Dibungkus div agar bisa disembunyikan di mobile (class `hidden` bentrok dengan `inline-flex` milik Button) */}
          <div className="hidden sm:block">
            <Button href="/editor" size="sm">
              Mulai Custom →
            </Button>
          </div>
          {/* Tombol menu mobile */}
          <button
            type="button"
            className="rounded-control border-2 border-ink bg-surface px-3 py-1.5 text-sm font-semibold lg:hidden"
            aria-expanded={open}
            aria-controls="menu-mobile"
            onClick={() => setOpen((value) => !value)}
          >
            {open ? "Tutup" : "Menu"}
          </button>
        </div>
      </nav>

      {/* Daftar menu mobile */}
      {open && (
        <ul id="menu-mobile" className="flex flex-col gap-1 border-t-2 border-ink bg-surface px-4 py-3 lg:hidden">
          {LINKS.map((link) => (
            <li key={link.href}>
              <a href={link.href} className="block rounded-control px-3 py-2 font-medium hover:bg-subtle" onClick={() => setOpen(false)}>
                {link.label}
              </a>
            </li>
          ))}
          <li>
            <Button href="/editor" className="mt-2 w-full">
              Mulai Custom →
            </Button>
          </li>
        </ul>
      )}
    </header>
  );
}
