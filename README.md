# MULAWARMANESIA

Website profil bisnis + kustomisasi dan pemesanan seragam **PDH** dan **VEST** untuk vendor konveksi di Samarinda, Kalimantan Timur.

Dibuat untuk **Lomba Pengembangan Website FUAD FAIR 2026** (UINSI Samarinda), tema *Digital Innovation for Local Impact*, kategori **Local Business Innovation** (Bisnis dan UMKM).

## Deskripsi

Pemesanan seragam di UMKM konveksi biasanya lewat chat WhatsApp: tanya model, kirim contoh gambar, tawar-menawar, transfer manual, lalu menunggu tanpa kabar. Website ini mengubahnya menjadi alur mandiri:

1. **Landing page** dengan efek paralaks (hanya di halaman ini).
2. **Editor desain** di browser: pilih kategori, warna tiap bagian, unggah logo, tambah teks, tampak depan/belakang, undo/redo, draf tersimpan otomatis.
3. **Halaman Pesanan**: ukuran dan jumlah, nama per orang, data pemesan, pengiriman, skema bayar Lunas atau DP 50%.
4. **Pembayaran** lewat payment gateway (di demo: simulator gateway + webhook ber-tanda-tangan).
5. **Lacak pesanan** dengan nomor pesanan + nomor WhatsApp, lengkap dengan timeline status.
6. **Panel admin**: dashboard bersusunan Banner → Pesanan & Produksi (kartu angka + statistik bertab) → Penjualan & Produksi (pendapatan mingguan, ukuran terlaris) → Pesanan & Tindakan (pesanan terbaru, perlu tindakan, kapasitas, konversi, warna kain) → Sistem (khusus superadmin), daftar pesanan dengan filter status berupa checkbox, detail desain dan file logo, ubah status produksi. Semua tabel bisa diatur jumlah barisnya.

## Teknologi

| Bagian | Teknologi |
|---|---|
| Kerangka | Next.js (App Router) + React + TypeScript |
| Gaya | Tailwind CSS v4, font Poppins, gaya neo-brutalism |
| Database | MySQL 8 (InnoDB, mendukung ACID) lewat Prisma ORM |
| Validasi | Zod (satu skema dipakai browser dan server) |
| Paralaks | GSAP ScrollTrigger |
| Grafik | Recharts |
| Tes | Vitest |

## Cara menjalankan

Prasyarat: Node.js 20+ dan MySQL 8 (mis. dari Laragon).

```bash
# 1. pasang library
npm install

# 2. salin konfigurasi, lalu isi nilainya
cp .env.example .env          # Windows: copy .env.example .env

# 3. buat database kosong bernama "mulawarmanesia" di MySQL, lalu:
npx prisma migrate deploy     # membuat tabel
npx prisma generate           # membuat tipe Prisma
npm run seed                  # data master + akun admin dari .env
npm run seed:demo             # (opsional) pesanan contoh untuk dashboard

# 4. jalankan
npm run dev                   # http://localhost:3000
```

Isi `.env` (lihat `.env.example`): `DATABASE_URL`, `SESSION_SECRET`, `PAYMENT_WEBHOOK_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, dan `ENABLE_PAYMENT_SIMULATOR="true"` untuk demo.

Login panel: `/admin/login`. Akun dibuat oleh `npm run seed` dari `.env`:

| Peran | Variabel `.env` | Boleh melakukan |
|---|---|---|
| **Admin** | `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Dashboard, daftar dan detail pesanan, ubah status, ekspor CSV |
| **Superadmin** | `SUPERADMIN_EMAIL`, `SUPERADMIN_PASSWORD` | Semua hak admin **+** Master data (harga, bahan, ongkir, stok warna), Akun admin (tambah, nonaktifkan, reset sandi), Pengaturan (kapasitas, batas waktu bayar), Log aktivitas |

Peran dicek di server pada setiap permintaan (`server/auth/session.ts`), bukan hanya disembunyikan di menu. Setiap perubahan superadmin ditulis ke tabel `AuditLog` dalam transaksi yang sama dengan perubahannya.

Perintah lain:

```bash
npm test            # tes domain + tes ACID (butuh MySQL yang sudah di-seed)
npm run lint        # cek gaya kode
npm run build       # build produksi
```

## Struktur kode (ringkas)

```
app/            halaman (URL) dan route API tipis
components/     komponen UI yang dipakai ulang (Button, Card, Field, Modal, Garment, ...)
features/       komponen per fitur: landing, editor, order, payment, status, tracking, admin
lib/domain/     aturan bisnis murni: harga, urutan status, nomor pesanan, nomor WhatsApp
lib/validation/ aturan validasi Zod (dipakai browser dan server)
server/         service (logika + transaksi database), login admin, upload file
prisma/         skema database, seed
tests/          tes otomatis
docs/           PRD, desain, dan panduan membaca kode
```

Alur kode selalu satu arah: **halaman → komponen → route API → service → Prisma → MySQL**.
Panduan lengkap untuk membaca dan menjelaskan kode ada di [`docs/ALUR-KODE.md`](docs/ALUR-KODE.md).

## Integritas data (ACID)

- Checkout menulis semua tabel pesanan dalam **satu transaksi**; jika gagal di tengah, tidak ada data setengah jadi.
- Nomor pesanan `MLW-YYMM-NNNN` dibuat dari penghitung yang dikunci, sehingga checkout bersamaan tidak menghasilkan nomor kembar.
- Webhook pembayaran **idempoten** (`UNIQUE(gatewayRef)` + kunci baris): dikirim dua kali, uang tercatat sekali.
- Urutan status dan aturan DP dijaga di server, bukan hanya di tombol.
- Harga selalu dihitung ulang di server.

Semua ini diuji otomatis di `tests/acid.test.ts`.

## Catatan demo

- Pembayaran memakai **simulator gateway** (`/gateway/...`) yang mengirim webhook ber-tanda-tangan HMAC lewat jalur yang sama dengan webhook asli. Penyedia nyata (Midtrans/Xendit) bisa dipasang kemudian tanpa mengubah halaman.
- Harga, minimal order, durasi produksi, alamat, dan testimoni adalah **data contoh**.
- Notifikasi email/WhatsApp, 2FA admin, halaman Produksi/Laporan/Pengaturan, dan unduh PNG desain belum dibuat.

## Tim

- (isi nama ketua dan anggota tim)

## Atribusi

- Font [Poppins](https://fonts.google.com/specimen/Poppins) (SIL Open Font License).
- Library open source: Next.js, React, Tailwind CSS, Prisma, Zod, GSAP, Recharts, bcryptjs, Vitest (lisensi masing-masing).
- Ilustrasi garmen dibuat sendiri sebagai SVG.
- Desain antarmuka dibuat di FigCraft (`docs/MULAWARMANESIA Website v1.figcraft`). Pengembangan dibantu AI (diperbolehkan oleh juknis).
