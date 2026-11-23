"use client";
/**
 * AdminSidebar: menu samping panel admin: logo, label peran, menu berkelompok dengan ikon dan angka
 * kecil (badge), serta kartu akun di bawah. Di layar lebar sidebar bisa DIPERKECIL menjadi deretan ikon
 * (tombol di bagian atas) dan pilihannya diingat di browser. Di layar kecil menjadi bilah atas yang bisa digulir.
 * Menu superadmin hanya tampil bagi superadmin; penjaga sebenarnya ada di server (requireSuperadminPage).
 */
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";
import { HamburgerButton } from "@/components/ui/HamburgerButton";
import { Logo } from "@/components/ui/Logo";
import { cn } from "@/lib/cn";
import { LogoutButton } from "./LogoutButton";
import { OverviewIcon, type IconName } from "./overview/icons";

interface SidebarItem {
  label: string;
  href: string;
  icon: IconName;
  /** Kunci angka kecil: "active" = pesanan berjalan, "production" = sedang produksi. */
  badge?: "active" | "production";
}

/** Menu paling atas, berdiri sendiri. */
const DASHBOARD_ITEM: SidebarItem = { label: "Dashboard", href: "/admin", icon: "dashboard" };

/** Menu berkelompok (seperti Prime Lite HR). `superOnly` = hanya tampil untuk superadmin. */
const GROUPS: { title: string; superOnly: boolean; items: SidebarItem[] }[] = [
  {
    title: "Operasional",
    superOnly: false,
    items: [
      { label: "Pesanan", href: "/admin/pesanan", icon: "orders", badge: "active" },
      { label: "Produksi", href: "/admin/produksi", icon: "factory", badge: "production" },
    ],
  },
  { title: "Katalog", superOnly: true, items: [{ label: "Master data", href: "/admin/master-data", icon: "database" }] },
  {
    title: "Sistem",
    superOnly: true,
    items: [
      { label: "Akun admin", href: "/admin/akun", icon: "users" },
      { label: "Pengaturan", href: "/admin/pengaturan", icon: "system" },
      { label: "Log aktivitas", href: "/admin/log", icon: "log" },
    ],
  },
];

// ---- Pilihan "sidebar diperkecil": disimpan di localStorage, dibaca lewat useSyncExternalStore ----
const STORAGE_KEY = "mlw_sidebar_collapsed";
const EVENT = "mlw-sidebar-change";

/** Berlangganan perubahan pilihan (tab ini lewat event, tab lain lewat "storage"). */
function subscribe(callback: () => void): () => void {
  window.addEventListener(EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

/** Membaca pilihan; penyimpanan yang diblokir dianggap "tidak diperkecil". */
function readCollapsed(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

/** Menyimpan pilihan baru lalu memberi tahu semua pembaca. */
function writeCollapsed(value: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEY, value ? "1" : "0");
  } catch {
    /* diblokir: pilihan hanya berlaku sampai halaman dimuat ulang */
  }
  window.dispatchEvent(new Event(EVENT));
}

// ---- Penanda "baru": angka di menu hanya menghitung pesanan yang belum "dilihat" ----
// Saat halaman menu dibuka, jumlah saat itu disimpan sebagai "sudah dilihat" sehingga angkanya hilang.
// Pesanan baru yang masuk setelahnya membuat angka muncul lagi (selisihnya saja).
const SEEN_EVENT = "mlw-seen-change";

/** Membaca jumlah yang sudah dilihat untuk satu menu (kunci "active" / "production"). */
function readSeen(key: string): number {
  try {
    return Number(localStorage.getItem(`mlw_seen_${key}`) ?? 0) || 0;
  } catch {
    return 0;
  }
}

/** Menyimpan jumlah yang sudah dilihat lalu memberi tahu pembaca. */
function writeSeen(key: string, value: number): void {
  try {
    localStorage.setItem(`mlw_seen_${key}`, String(value));
  } catch {
    /* diblokir: angka akan muncul lagi setelah dimuat ulang */
  }
  window.dispatchEvent(new Event(SEEN_EVENT));
}

/** Berlangganan perubahan "sudah dilihat". */
function subscribeSeen(callback: () => void): () => void {
  window.addEventListener(SEEN_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(SEEN_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

interface AdminSidebarProps {
  role: "ADMIN" | "SUPERADMIN";
  name: string;
  email: string;
  counts: { active: number; production: number };
}

export function AdminSidebar({ role, name, email, counts }: AdminSidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false); // menu mobile terbuka?
  // Di server selalu "tidak diperkecil" agar render server dan browser sama saat hidrasi
  const collapsed = useSyncExternalStore(subscribe, readCollapsed, () => false);
  // Di server nilainya -1 (belum diketahui) supaya angka tidak berkedip sebelum browser membaca penyimpanan
  const seen = {
    active: useSyncExternalStore(subscribeSeen, () => readSeen("active"), () => -1),
    production: useSyncExternalStore(subscribeSeen, () => readSeen("production"), () => -1),
  };

  // Esc menutup menu mobile
  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setMobileOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  // Bila halaman menu sedang dibuka, atau jumlahnya turun di bawah yang tercatat, anggap semuanya sudah dilihat
  useEffect(() => {
    for (const item of [...GROUPS.flatMap((group) => group.items)]) {
      if (!item.badge) continue;
      const total = counts[item.badge];
      const opened = pathname.startsWith(item.href);
      if ((opened && seen[item.badge] !== total) || (seen[item.badge] > total)) writeSeen(item.badge, total);
    }
  }, [pathname, counts, seen.active, seen.production]); // eslint-disable-line react-hooks/exhaustive-deps

  /** Satu menu: aktif = latar hitam dengan bayangan merah; angka kecil di kanan. */
  const renderItem = (item: SidebarItem) => {
    const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
    // Angka = jumlah yang belum dilihat; 0 atau belum diketahui = tidak ditampilkan
    const fresh = item.badge && seen[item.badge] >= 0 ? counts[item.badge] - seen[item.badge] : 0;
    const badge = fresh > 0 ? fresh : undefined;
    return (
      <Link
        key={item.href}
        href={item.href}
        aria-current={active ? "page" : undefined}
        aria-label={item.label}
        title={collapsed ? item.label : undefined}
        onClick={() => setMobileOpen(false)}
        className={cn(
          "relative flex items-center gap-3 whitespace-nowrap rounded-control px-3 py-3 text-base font-medium transition-all lg:py-2.5 lg:text-sm",
          collapsed && "lg:justify-center lg:px-0",
          active ? "bg-ink text-white shadow-[3px_3px_0_0_#c12822]" : "text-ink hover:bg-subtle",
        )}
      >
        <OverviewIcon name={item.icon} className={cn("h-[18px] w-[18px] shrink-0", active ? "text-white" : "text-ink-soft")} />
        <span className={cn("flex-1", collapsed && "lg:hidden")}>{item.label}</span>
        {badge !== undefined && (
          <span
            className={cn(
              "min-w-7 rounded-full border-2 px-2 text-center text-xs font-semibold",
              active ? "border-accent bg-accent text-white" : "border-ink bg-surface text-ink",
              collapsed && "lg:absolute lg:-right-1 lg:-top-1 lg:min-w-5 lg:px-1 lg:text-[10px] lg:leading-4",
            )}
          >
            {badge}
          </span>
        )}
      </Link>
    );
  };

  return (
    <aside
      className={cn(
        "sticky top-0 z-40 flex shrink-0 flex-col gap-3 border-b-2 border-ink bg-surface px-4 py-3 transition-[width] duration-200 print:hidden max-lg:max-h-dvh max-lg:overflow-y-auto",
        "lg:sticky lg:top-0 lg:z-20 lg:h-screen lg:gap-6 lg:border-b-0 lg:border-r-2 lg:py-6",
        collapsed ? "lg:w-[84px] lg:px-3" : "lg:w-[248px]",
      )}
    >
      {/* Atas: logo + label peran */}
      <div className="flex items-center justify-between lg:block">
        <div className={cn("flex flex-col gap-1.5", collapsed && "lg:items-center")}>
          <Logo compact={collapsed} href="/admin" label="MULAWARMANESIA, ke dashboard admin" />
          <p className={cn("text-[10px] font-semibold uppercase tracking-widest text-accent max-lg:hidden", collapsed && "lg:hidden")}>{role === "SUPERADMIN" ? "Superadmin" : "Panel admin"}</p>
        </div>
        {/* Hamburger: hanya mobile */}
        <HamburgerButton open={mobileOpen} onClick={() => setMobileOpen((value) => !value)} controls="menu-admin" className="lg:hidden" />
      </div>

      {/* Tombol perbesar/perkecil: menempel di tepi kanan sidebar */}
      <button
        type="button"
        onClick={() => writeCollapsed(!collapsed)}
        aria-label={collapsed ? "Perbesar sidebar" : "Perkecil sidebar"}
        aria-pressed={collapsed}
        title={collapsed ? "Perbesar sidebar" : "Perkecil sidebar"}
        className="absolute -right-4 top-[68px] z-30 hidden h-8 w-8 items-center justify-center rounded-full border-2 border-ink bg-surface shadow-hard-sm transition-all hover:bg-subtle active:translate-x-[2px] active:translate-y-[2px] active:shadow-none lg:flex"
      >
        <OverviewIcon name={collapsed ? "expand" : "collapse"} className="h-3.5 w-3.5" />
      </button>

      <nav id="menu-admin" aria-label="Menu admin" className={cn("flex-col gap-1.5 lg:flex lg:flex-1 lg:overflow-y-auto lg:overflow-x-visible lg:pr-1", mobileOpen ? "flex" : "hidden")}>
        {renderItem(DASHBOARD_ITEM)}
        {GROUPS.filter((group) => !group.superOnly || role === "SUPERADMIN").map((group) => (
          <div key={group.title} className="flex flex-col gap-1.5">
            <p className={cn("px-3 pt-4 text-[10px] font-semibold uppercase tracking-widest text-ink-muted", collapsed && "lg:hidden")}>{group.title}</p>
            {collapsed && <span className="hidden h-0.5 bg-line lg:mt-2 lg:block" aria-hidden />}
            {group.items.map(renderItem)}
          </div>
        ))}
      </nav>

      {/* Kartu akun */}
      <div className={cn("items-center gap-3 border-t-2 border-line pt-3 lg:flex lg:border-0 lg:pt-0", mobileOpen ? "flex" : "hidden", collapsed && "lg:flex-col")}>
        <span title={`${name} (${email})`} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-ink bg-pastel-butter text-sm font-semibold" aria-hidden>
          {name.charAt(0).toUpperCase()}
        </span>
        <div className={cn("min-w-0 flex-1", collapsed && "lg:hidden")}>
          <p className="truncate text-sm font-semibold">{name}</p>
          <p className="truncate text-xs text-ink-muted" title={email}>{role === "SUPERADMIN" ? "Superadmin" : "Admin"}</p>
        </div>
        <div className={cn(collapsed && "lg:hidden")}><LogoutButton /></div>
        {collapsed && <div className="hidden lg:block"><LogoutButton compact /></div>}
      </div>
    </aside>
  );
}
