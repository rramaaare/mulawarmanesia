<div align="center">
  
# 🧵 MULAWARMANESIA

<a href="https://github.com/rramaaare/mulawarmanesia">
  <img src="https://readme-typing-svg.demolab.com?font=Poppins&weight=600&size=22&duration=3200&pause=900&color=C12822&center=true&vCenter=true&width=720&lines=Desain+seragam+sendiri+langsung+di+browser;Pesan+dan+bayar+tanpa+ribet;Pantau+status+pesanan+kapan+saja;Dibuat+untuk+UMKM+konveksi+Samarinda" alt="Typing animation" />
</a>

</div>

---

## 📚 Daftar Isi

- [📌 Deskripsi Website](#-deskripsi-website)
- [🎯 Tujuan Pengembangan](#-tujuan-pengembangan)
- [⚙️ Fitur Utama](#️-fitur-utama)
- [🔐 Peran dan Hak Akses](#-peran-dan-hak-akses)
- [🧰 Teknologi yang Digunakan](#-teknologi-yang-digunakan)
- [🖼️ Tampilan Website](#️-tampilan-website)
- [🧭 Flowchart](#-flowchart)
- [🚀 Cara Menjalankan Proyek](#-cara-menjalankan-proyek)
- [🩹 Troubleshooting](#-troubleshooting)
- [👥 Anggota Tim](#-anggota-tim)
  
---

## 📌 Deskripsi Website

**MULAWARMANESIA** adalah website untuk vendor konveksi di **Samarinda, Kalimantan Timur** yang melayani pembuatan seragam **PDH** dan **VEST**. Selain sebagai profil bisnis, website ini membuat pelanggan bisa **mendesain seragam sendiri**, **memesan**, **membayar**, dan **melacak pesanan** tanpa harus bolak-balik chat.

Selama ini pesan seragam di UMKM konveksi biasanya lewat WhatsApp: tanya model, kirim contoh gambar, tawar-menawar, transfer manual, lalu menunggu tanpa kabar. Website ini mengubah proses itu jadi alur yang jelas dan bisa dijalankan sendiri oleh pelanggan, sementara pemilik usaha mendapat panel untuk mengelola pesanan dan produksi.

Pengguna dalam website ini terdapat tiga role:

| Role | Yang bisa dilakukan |
|---|---|
| **Pelanggan** | Lihat produk, buat desain, pesan, bayar, dan lacak pesanan. Tidak perlu login. |
| **Admin** | Lihat dashboard, kelola pesanan, ubah status produksi, ekspor CSV. |
| **Superadmin** | Semua hak admin, ditambah master data, akun admin, pengaturan, dan log aktivitas. |

---

## 🎯 Tujuan Pengembangan

a. Mempermudah pelanggan memesan seragam tanpa harus chat berulang kali.

b. Membuat proses pemesanan lebih jelas, mulai dari desain, harga, pembayaran, sampai pengiriman.

c. Membantu vendor konveksi mengelola pesanan dan produksi dalam satu tempat.

d. Mengurangi salah paham soal desain, ukuran, dan harga karena semuanya tercatat di sistem.

e. Mendukung UMKM lokal agar lebih siap bersaing lewat pemanfaatan teknologi digital.

---

## ⚙️ Fitur Utama

### Fitur untuk Pelanggan

**1. Landing Page**

Halaman awal berisi profil usaha, produk PDH & VEST, cara pesan, portofolio, dan testimoni, lengkap dengan efek paralaks. Ada juga halaman **Panduan Ukuran** untuk membantu memilih ukuran yang pas.

<img width="1440" height="5039" alt="Group" src="https://github.com/user-attachments/assets/6f2d6570-9ce7-41ac-a9bf-f4364b53d43e" /><br>

**2. Editor Desain**

Pelanggan bisa membuat desain seragam langsung di browser:
- Pilih model (PDH atau VEST), kategori desain, dan bahan
- Atur warna tiap bagian pakaian
- Unggah logo (posisi, ukuran, teknik bordir atau sablon)
- Tambah teks nama atau instansi
- Lihat tampak depan dan belakang, plus undo/redo dan zoom
- Draf tersimpan otomatis di browser, jadi tidak hilang kalau tab ditutup

<img width="1440" height="1163" alt="Group (2)" src="https://github.com/user-attachments/assets/c06f3cce-cbdb-4b81-b9f3-069e15ffc4b3" /><br>

**3. Halaman Pesanan**

Isi ukuran dan jumlah (bisa pakai nama per orang), data pemesan, pengiriman (kirim ke alamat atau ambil di workshop), lalu pilih bayar **Lunas** atau **DP 50%**. Minimal total pesanan **12 pcs**, dan harga dihitung otomatis termasuk diskon volume.

<img width="1440" height="2152" alt="Group (3)" src="https://github.com/user-attachments/assets/b7b61631-dd29-4937-8759-d8abab08204e" /><br>

**4. Pembayaran**

Pilih metode QRIS, Virtual Account, atau e-wallet lewat payment gateway. Pada versi demo dipakai simulator gateway. Pesanan yang tidak dibayar dalam **24 jam** kedaluwarsa otomatis.

<img width="1440" height="1155" alt="Group (11)" src="https://github.com/user-attachments/assets/fc3f926c-243d-43c7-8787-2909122dcfea" /><br>

**5. Lacak Pesanan**

Cek status pakai nomor pesanan dan nomor WhatsApp, lengkap dengan timeline 8 tahap. Pelanggan juga bisa melihat alasan revisi jika desainnya diminta diperbaiki.

<img width="1440" height="1423" alt="Group (12)" src="https://github.com/user-attachments/assets/8b50ca56-d199-44f8-9872-8180a0ed0e18" /><br>

---
### Fitur untuk Admin

**1. Login**

Untuk masuk ke sistem, admin perlu memasukkan email dan kata sandi beserta kode verifikasi (2FA).

<img width="1440" height="900" alt="Group (4)" src="https://github.com/user-attachments/assets/aa9bd360-fa17-4138-a9af-968c5e5bf1f6" /><br>

**2. Dashboard**

Ringkasan pesanan dan pendapatan, tren penjualan, kategori dan ukuran terlaris, kapasitas produksi, konversi, dan warna kain yang paling laku.

<img width="1440" height="2374" alt="Group (5)" src="https://github.com/user-attachments/assets/4c3e15e6-ab24-4ef0-9ba4-4f2df6552b79" /><br>

**3. Kelola Pesanan**

Lihat daftar pesanan dengan pencarian dan filter status, buka detail desain dan unduh file logo, ubah status produksi, minta revisi ke pelanggan, cetak **lembar produksi** satu halaman untuk workshop, dan ekspor data ke CSV.

<img width="1440" height="1078" alt="Group (8)" src="https://github.com/user-attachments/assets/fa3dfdd0-61e4-4440-883f-dbc0a53823ae" /><br>

**4. Produksi**

Antrean kerja workshop: pesanan yang sedang diproduksi, di tahap QC, dan siap kirim, lengkap dengan total pcs tiap tahap.

<img width="1440" height="900" alt="Group (9)" src="https://github.com/user-attachments/assets/f65dbf40-a51e-4d6b-b396-7c0e2f4f2801" /><br>

---

### 🛠️ Fitur Tambahan Superadmin

**🗂️ Master Data**

Untuk mengatur harga dasar, biaya dekorasi, palet warna dan stok kain (bisa tambah warna baru), serta tarif ongkir.

<img width="1440" height="938" alt="Group (10)" src="https://github.com/user-attachments/assets/831d0884-f4ea-437b-b9d1-fbf3298933a3" /><br>

**👤 Akun Admin**

Tambah akun (pilih peran Admin atau Superadmin), nonaktifkan atau aktifkan akun, dan reset kata sandi. Superadmin tidak bisa menonaktifkan dirinya sendiri, dan harus selalu ada minimal satu superadmin aktif.

**⚙️ Pengaturan**

Mengatur kapasitas produksi mingguan dan batas waktu bayar pesanan baru.

**📜 Log Aktivitas**

Catatan perubahan harga, biaya, stok, ongkir, akun, pengaturan, dan status pesanan.

---

## 🔐 Peran dan Hak Akses

Admin dan Superadmin **masuk lewat form login yang sama** (`/admin/login`). Peran dibaca dari akun di database, lalu menentukan dashboard dan menu yang tampil.

| Menu | Admin | Superadmin |
|---|:---:|:---:|
| Dashboard (ringkasan pesanan, pendapatan, kapasitas) | ✅ | ✅ |
| Dashboard bagian **Sistem** (akun, stok warna, aktivitas terbaru) | ❌ | ✅ |
| Pesanan (daftar, detail, ubah status, ekspor CSV, lembar produksi) | ✅ | ✅ |
| Produksi | ✅ | ✅ |
| Master data | ❌ | ✅ |
| Akun admin | ❌ | ✅ |
| Pengaturan | ❌ | ✅ |
| Log aktivitas | ❌ | ✅ |

---

## 🧰 Teknologi yang Digunakan

| Bagian | Teknologi | Fungsi |
|---|---|---|
| Kerangka | **Next.js 16** (App Router) + **React 19** + **TypeScript 5** | Halaman web dan API dalam satu proyek |
| Tampilan | **Tailwind CSS 4**, font **Poppins**, gaya neo-brutalism | Desain antarmuka |
| Database | **MySQL 8** (InnoDB) lewat **Prisma ORM 7** dengan driver `mariadb` | Menyimpan data pesanan, harga, dan akun |
| Validasi | **Zod 4** | Satu aturan validasi untuk browser dan server |
| Animasi | **GSAP** (ScrollTrigger) | Efek paralaks di landing page |
| Grafik | **Recharts** | Grafik di dashboard admin |
| Pembayaran | **qrcode.react** + simulator gateway buatan sendiri | Menampilkan QR dan menjalankan alur bayar demo |
| Keamanan | **bcryptjs** + cookie login bertanda tangan HMAC | Login admin dan superadmin |
| Pengujian | **Vitest 5** | Tes domain, ACID, dashboard, dan superadmin |
| Peralatan dev | **ESLint 9**, **tsx**, **dotenv** | Cek kode, menjalankan seed, membaca `.env` |
| Pendukung | Laragon, Git & GitHub, draw.io, FigCraft | Database lokal, versi kode, diagram, dan desain UI |

---

## 🧭 Flowchart

### 1. Halaman Awal Pelanggan

<img width="826" height="1034" alt="Mulawarmanesia-1  Halaman Awal (Pelanggan) drawio" src="https://github.com/user-attachments/assets/c4c59ad9-b581-471a-848d-292413a26dff" />

### 2. Edit Desain

<img width="992" height="1858" alt="Mulawarmanesia-2  Editor Desain drawio" src="https://github.com/user-attachments/assets/fc71bd05-98a7-4fcd-b0e0-bd6ec3b676a2" />

### 3. Halaman Pesanan

<img width="1025" height="1866" alt="Mulawarmanesia-3  Halaman Pesanan drawio" src="https://github.com/user-attachments/assets/6660300a-53f8-44eb-bd55-43a06d23461f" />

### 4. Pembayaran

<img width="1532" height="1194" alt="Mulawarmanesia-4  Pembayaran drawio" src="https://github.com/user-attachments/assets/b02cfd2a-424f-42d2-a050-3ec3ce3070c1" />

### 5. Lacak Pesanan

<img width="972" height="1034" alt="Mulawarmanesia-5  Lacak Pesanan drawio" src="https://github.com/user-attachments/assets/622fcc97-752e-4c54-bcc9-31293e24d0ec" />

### 6. Login Admin

<img width="934" height="1194" alt="Mulawarmanesia-6  Login Admin   Superadmin drawio" src="https://github.com/user-attachments/assets/04f7bfc9-f5af-4bc2-85f7-e0dfdb054b2a" />

### 7. Dashboard Admin

<img width="1120" height="1182" alt="Mulawarmanesia-7  Dashboard Admin drawio" src="https://github.com/user-attachments/assets/bff58356-8172-467e-9cf6-54083ebf1218" />

### 8. Dashboard Superadmin

<img width="1176" height="1886" alt="Mulawarmanesia-8  Dashboard Superadmin drawio" src="https://github.com/user-attachments/assets/7e5b1dee-f555-4209-a7ab-dfacb5f3e9e0" />

### 9. Kelola Pesanan

<img width="1628" height="2802" alt="Mulawarmanesia-9  Kelola Pesanan drawio" src="https://github.com/user-attachments/assets/a4b573dc-22ea-4de5-86e4-fed9a048b42e" />

### 10. Kelola Data Master

<img width="970" height="1210" alt="Mulawarmanesia-10  Kelola Master Data (Superadmin) drawio" src="https://github.com/user-attachments/assets/a3a65ce5-9352-4e7f-9c7c-1ee431747599" />

---

## 🚀 Cara Menjalankan Proyek

### 1️⃣ Yang Perlu Disiapkan

- **Node.js 22.12** atau lebih baru (cek dengan `node -v`). Versi 20 tidak cukup karena Vitest 5 butuh Node 22.12+.
- **MySQL 8** (paling mudah lewat [Laragon](https://laragon.org/)). Pastikan servernya sudah menyala.
- **Git**

### 2️⃣ Langkah-langkah

**1. Unduh proyek**

```bash
git clone https://github.com/rramaaare/mulawarmanesia.git
cd mulawarmanesia
```

**2. Pasang library**

```bash
npm install
```

**3. Salin file konfigurasi**

```bash
cp .env.example .env          # Windows: copy .env.example .env
```

Lalu buka `.env` dan isi nilainya:

| Variabel | Isi |
|---|---|
| `DATABASE_URL` | Alamat database. Bawaan Laragon: `mysql://root:@localhost:3306/mulawarmanesia` |
| `SESSION_SECRET` | Kunci rahasia acak untuk cookie login (minimal 32 karakter) |
| `PAYMENT_WEBHOOK_SECRET` | Kunci rahasia untuk tanda tangan webhook simulator pembayaran |
| `ADMIN_EMAIL` dan `ADMIN_PASSWORD` | Akun admin awal (kata sandi minimal 8 karakter) |
| `SUPERADMIN_EMAIL` dan `SUPERADMIN_PASSWORD` | Akun superadmin awal (kata sandi minimal 8 karakter) |
| `ENABLE_PAYMENT_SIMULATOR` | Isi `"true"` agar simulator pembayaran tetap aktif di mode produksi (`npm start`). Di `npm run dev` simulator selalu aktif. |

**4. Siapkan database**

Buat database kosong, misalnya lewat HeidiSQL (Laragon) atau terminal MySQL:

```sql
CREATE DATABASE mulawarmanesia CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Lalu jalankan:

```bash
npx prisma migrate deploy     # membuat tabel
npx prisma generate           # membuat tipe Prisma
npm run seed                  # data master + akun admin dan superadmin dari .env
npm run seed:demo             # (opsional) pesanan contoh untuk dashboard
```

**5. Jalankan website**

```bash
npm run dev
```

Buka **http://localhost:3000** di browser. 🎉

**6. Coba login panel**

Buka **http://localhost:3000/admin/login**, lalu masuk dengan akun dari `.env`:

| Ingin mencoba | Masuk dengan |
|---|---|
| Tampilan **Admin** | `ADMIN_EMAIL` dan `ADMIN_PASSWORD` |
| Tampilan **Superadmin** | `SUPERADMIN_EMAIL` dan `SUPERADMIN_PASSWORD` |

### 3️⃣ Alamat Penting

| Halaman | Alamat |
|---|---|
| Landing page | `/` |
| Editor desain | `/editor` |
| Halaman pesanan | `/pesanan` |
| Panduan ukuran | `/panduan-ukuran` |
| Lacak pesanan | `/lacak` |
| Login admin dan superadmin | `/admin/login` |
| Dashboard | `/admin` |
| Pesanan (admin) | `/admin/pesanan` |
| Produksi (admin) | `/admin/produksi` |
| Master data (superadmin) | `/admin/master-data` |
| Akun admin (superadmin) | `/admin/akun` |
| Pengaturan (superadmin) | `/admin/pengaturan` |
| Log aktivitas (superadmin) | `/admin/log` |

### 4️⃣ Perintah Lain

```bash
npm test            # tes domain, ACID, dashboard, superadmin (butuh MySQL yang sudah di-seed)
npm run lint        # cek gaya kode
npm run build       # build produksi
npm start           # jalankan hasil build
```

---

## 🩹 Troubleshooting

| Masalah | Penyebab dan solusi |
|---|---|
| `Cannot find module '@/generated/prisma/client'` | Tipe Prisma belum dibuat. Jalankan `npx prisma generate`. |
| `Access denied` atau gagal terhubung ke database | Periksa `DATABASE_URL` di `.env` dan pastikan MySQL menyala di port 3306. |
| Tabel tidak ada (`table ... doesn't exist`) | Migrasi belum dijalankan. Jalankan `npx prisma migrate deploy`. |
| Tidak bisa login admin | Seed belum dijalankan, atau `ADMIN_EMAIL` dan `ADMIN_PASSWORD` di `.env` masih kosong. Isi lalu jalankan `npm run seed` lagi. |
| Akun terkunci 15 menit | Terlalu banyak salah kata sandi (5 kali). Tunggu 15 menit, atau jalankan ulang server. |
| Muncul error versi saat `npm install` atau `npm test` | Versi Node terlalu lama. Pakai Node 22.12 atau lebih baru. |
| Simulator pembayaran ditolak ("Simulator pembayaran dimatikan") | Terjadi saat memakai `npm run build` lalu `npm start`. Isi `ENABLE_PAYMENT_SIMULATOR="true"` di `.env`, lalu jalankan ulang server. |

---

## 👥 Anggota Tim

<div align="center">

| **Nama** |**Peran** | **Kontribusi** |
|---|---|---|
| Taufik Ramadhani | Ketua tim | backend dan database |
| Ahmad Sepriza | Anggota | UI/UX dan frontend |
| Nabila Fitriani | Anggota | dokumentasi dan pengujian |

</div>

---

<div align="center">

<br/>

**Dibuat dengan ❤️ untuk UMKM konveksi Samarinda**

[⬆️ Kembali ke Awal](#)

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=12,20,24&height=120&section=footer" alt="Footer" />

</div>
