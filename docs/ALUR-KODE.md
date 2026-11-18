# Panduan membaca kode (untuk presentasi)

Dokumen ini membantu menjawab pertanyaan juri: **"bagian ini kodenya di mana dan cara kerjanya bagaimana?"**
Setiap file kode diawali komentar "file ini untuk apa", dan setiap fungsi punya komentar singkat tujuannya.

## 1. Gambaran besar

```
Browser (pelanggan)
   │  membuka halaman / mengisi form
   ▼
app/<halaman>/page.tsx        ← halaman (Server Component, membaca data)
   │
   ▼
features/<fitur>/*.tsx        ← komponen interaktif ("use client")
   │  fetch("/api/...")
   ▼
app/api/<endpoint>/route.ts   ← pintu API, tipis: hanya memanggil service
   │
   ▼
server/services/*.ts          ← logika + transaksi database
   │            ▲
   │            └── lib/domain/*.ts  aturan murni (harga, status)
   ▼
Prisma (prisma/schema.prisma) → MySQL
```

Aturan emas: **tampilan tidak berisi logika bisnis**. Harga, urutan status, dan validasi ada di `lib/`.

## 2. Jika juri bertanya...

| Pertanyaan | Buka file | Intinya |
|---|---|---|
| "Bagaimana harga dihitung?" | `lib/domain/pricing.ts`, angka di `lib/domain/constants.ts` | Fungsi murni `calculatePrice`; dipakai browser (estimasi) dan server (resmi) |
| "Bagaimana warna garmen berubah?" | `components/Garment.tsx` | Setiap bagian SVG punya `fill` dari objek `colors` |
| "Bagaimana efek paralaks?" | `components/ParallaxLayer.tsx`, `features/landing/HeroSection.tsx` | GSAP ScrollTrigger; hanya `transform`/`opacity`; mati saat reduced-motion |
| "Bagaimana undo/redo?" | `features/editor/useDesignHistory.ts` | Tiga daftar: `past`, `present`, `future` |
| "Draf tidak hilang saat tab ditutup?" | `features/editor/draft-storage.ts` | Data desain di localStorage, file logo di IndexedDB |
| "Bagaimana validasi form?" | `lib/validation/order.ts` | Satu skema Zod dipakai browser dan server |
| "Bagaimana pesanan disimpan?" | `server/services/order-service.ts` | `createOrder`: satu transaksi untuk semua tabel |
| "Bagaimana pembayaran aman?" | `server/services/payment-service.ts` | Webhook ber-tanda-tangan HMAC, idempoten, baris dikunci |
| "Apa itu ACID di proyek ini?" | `tests/acid.test.ts` | Empat tes: atomicity, isolation, idempotensi, consistency |
| "Bagaimana status dijaga?" | `lib/domain/order-status.ts`, `server/services/status-service.ts` | Hanya maju satu tahap; DP harus lunas sebelum siap kirim |
| "Bagaimana login admin?" | `server/auth/session.ts` | bcrypt + cookie bertanda-tangan HMAC; peran dan status aktif dicek ke database tiap permintaan |
| "Siapa boleh mengubah harga?" | `server/services/master-data-service.ts`, `requireSuperadminApi` di `session.ts` | Hanya superadmin; perubahan + audit log satu transaksi |
| "Bagaimana akun admin dikelola?" | `server/services/account-service.ts` | Tambah/nonaktifkan/reset sandi; tidak boleh menonaktifkan diri sendiri atau superadmin terakhir |
| "Bagaimana dashboard dihitung?" | `server/services/dashboard-service.ts`, tampilan di `features/admin/overview/` | Satu fungsi `getDashboard` menghitung kartu, status aktif, kategori, ukuran, warna, konversi, kapasitas, dan pesanan terbaru; bagian Sistem hanya untuk superadmin |
| "Bagaimana filter dan jumlah baris tabel bekerja?" | `features/admin/overview/FilterSelect.tsx`, `PagedTable.tsx` | Filter disimpan di alamat halaman (server memuat ulang data); jumlah baris tabel diatur di browser tanpa memanggil server |
| "Mengapa file logo aman?" | `server/services/upload-service.ts` | Cek isi file (magic bytes), batas 5 MB, SVG berskrip ditolak |
| "Di mana desain warna/bayangan?" | `app/globals.css` | Semua design token di satu tempat |

## 3. Peta folder

| Folder | Isi | Contoh |
|---|---|---|
| `app/` | Halaman dan route API (nama folder = alamat URL) | `app/editor/page.tsx` → `/editor` |
| `components/ui/` | Komponen kecil dipakai di mana-mana | `Button`, `Card`, `Field`, `Modal`, `Navbar` |
| `components/` | Komponen gambar bersama | `Garment`, `ParallaxLayer` |
| `features/landing/` | Section landing | `HeroSection`, `CatalogSection` |
| `features/editor/` | Editor desain | `EditorApp`, `panels/*`, `draft-storage` |
| `features/order/` | Halaman Pesanan | `OrderForm`, `OrderSummary` |
| `features/payment/` | Pembayaran + simulator | `PaymentApp`, `GatewaySimulator` |
| `features/status/`, `features/tracking/` | Status & lacak | `OrderTimeline`, `TrackingForm` |
| `features/admin/` | Panel admin | `DashboardView`, `StatusChanger` |
| `lib/domain/` | Aturan bisnis murni | `pricing`, `order-status`, `order-code` |
| `lib/validation/` | Skema Zod | `order.ts`, `tracking-admin.ts` |
| `server/services/` | Logika + database | `order-service`, `payment-service` |
| `prisma/` | Skema tabel, seed | `schema.prisma` |

## 4. Alur pemesanan (untuk demo)

1. **Landing** `/` → klik *Mulai Custom* atau kartu katalog.
2. **Editor** `/editor` → pilih kategori, warna, logo, teks → *Lanjut*.
3. **Pesanan** `/pesanan` → ukuran, data pemesan, pengiriman, skema bayar → *Bayar sekarang*.
   - Browser memvalidasi (Zod), mengunggah logo (`/api/uploads`), lalu `POST /api/orders` → `createOrder` (transaksi).
4. **Pembayaran** `/pembayaran/MLW-…` → pilih metode → *Buka simulator gateway* → *Bayar sukses*.
   - Simulator memanggil `/api/payments/simulate` → membuat webhook bertanda-tangan → `processPaymentWebhook`.
5. **Pesanan berhasil** `/pesanan-berhasil/MLW-…` (hanya "berhasil" jika server sudah mencatat uang).
6. **Lacak** `/lacak` atau tautan `/status/MLW-…?token=…`.
7. **Admin** `/admin` → dashboard → *Pesanan* → buka detail → *Ubah status*.

## 5. Konsep yang mungkin ditanyakan

- **Server Component vs Client Component (Next.js).** File tanpa `"use client"` berjalan di server dan boleh membaca database langsung (mis. `app/page.tsx`). File dengan `"use client"` berjalan di browser dan dipakai untuk interaksi (mis. `EditorApp.tsx`).
- **Mengapa harga dihitung dua kali?** Browser memberi estimasi cepat; server menghitung ulang dari database karena angka di browser bisa diubah pengguna.
- **Mengapa DP punya `payment_state` terpisah?** Status produksi (`produksi`, `qc`, ...) dan keadaan uang (`dp_dibayar`, `lunas`) adalah dua hal berbeda. Dipisah agar timeline produksi tetap sederhana dan aturan "belum lunas tidak boleh siap kirim" mudah ditulis.
- **Apa itu webhook idempoten?** Gateway bisa mengirim pesan yang sama berkali-kali. Kolom `gatewayRef` unik dan baris pesanan dikunci, sehingga uang hanya dicatat sekali.
- **Mengapa pesan error diawali `[!]`?** Warna merek sudah merah, jadi error tidak boleh hanya mengandalkan warna (aksesibilitas).

## 6. Yang sengaja belum dibuat

Email/WhatsApp otomatis, 2FA admin, halaman Produksi/Laporan/Pengaturan, Master data, unduh PNG desain, daftar nama via CSV, pelacakan event konversi di dashboard. Semuanya tercatat di PRD sebagai tahap lanjut.
