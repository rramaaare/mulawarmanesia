# PRD — Website MULAWARMANESIA

**Produk:** Website profil bisnis + kustomisasi & pemesanan seragam PDH dan VEST
**Pemilik produk:** MULAWARMANESIA (vendor konveksi, Samarinda, Kalimantan Timur)
**Versi dokumen:** 2.1 — 16 November 2026 (flow 5 langkah, gaya neo-brutalism, dashboard admin)
**Status:** Draf untuk ditinjau
**Desain:** FigCraft, file `MULAWARMANESIA Website v1.figcraft` (design system, halaman web desktop & mobile, panel admin)

### Ringkasan perubahan

| Area | v1.0 | v2.0 | v2.1 (dokumen ini) |
|---|---|---|---|
| Flow | 7 halaman | 5 langkah: landing → editor → pesanan → pembayaran → status | Tetap 5 langkah. Semua layar sudah didesain |
| Kategori desain | Halaman sendiri | Panel pertama di editor | Tetap |
| Detail pesanan + checkout | Dua halaman | Satu halaman Pesanan dengan ringkasan menempel | Tetap |
| Gaya visual | Gelap | Kertas terang, font Anton | **Neo-brutalism**: latar terang, garis hitam 2 px, sudut membulat, bayangan keras, latar pastel. Font **Poppins** |
| Panel admin | Daftar & detail pesanan | Sama | Ditambah **dashboard dengan visualisasi data** (§8.9) dan validasi admin (§10.7) |
| Cakupan desain | Desktop | Desktop | **Desktop 1440 px dan mobile 390 px** untuk semua halaman pelanggan; admin mobile untuk dashboard, pesanan, dan detail |
| Alat desain | Figma | FigCraft | FigCraft |

> Angka harga, minimal order, durasi produksi, alamat, dan konten lain di dokumen ini adalah **dummy**. Angka itu dipakai supaya aturan bisa ditulis jelas, dan harus diganti dengan angka asli sebelum pengembangan dimulai. Bagian yang masih menunggu keputusan ditandai **[KEPUTUSAN]**.

---

## 1. Ringkasan

MULAWARMANESIA membutuhkan website yang menjalankan dua fungsi sekaligus:

1. **Profil bisnis** yang meyakinkan calon klien (organisasi kampus, instansi, komunitas, perusahaan, kontraktor).
2. **Alat pemesanan mandiri.** Pelanggan memilih produk dan kategori desain, mengkustomisasi PDH/VEST langsung di browser (warna, gambar/logo, teks), mengisi ukuran, membayar lewat payment gateway, lalu melacak status produksinya.

Ciri khas visual website adalah **efek paralaks**, tetapi **hanya di landing page**. Halaman lain dibuat tanpa paralaks agar pelanggan fokus pada tugasnya.

## 2. Masalah

- Pemesanan seragam saat ini berjalan lewat chat WhatsApp: tanya model, kirim contoh gambar, tawar-menawar, transfer manual, lalu menunggu tanpa kabar.
- Pelanggan sulit membayangkan hasil akhir warna dan posisi logo sebelum produksi, sehingga sering terjadi revisi dan salah ekspektasi.
- Admin menghabiskan banyak waktu menjawab pertanyaan berulang ("sudah sampai mana?", "berapa harganya?").
- Pembayaran manual sulit dicocokkan dengan pesanan.

## 3. Tujuan & Metrik Keberhasilan

| Tujuan | Metrik | Target 3 bulan pertama (dummy) |
|---|---|---|
| Pelanggan bisa memesan tanpa chat admin | % pesanan yang selesai checkout tanpa kontak admin | ≥ 60% |
| Mengurangi revisi desain | % pesanan yang kembali ke status "Perlu revisi" | ≤ 15% |
| Mengurangi pertanyaan status | Jumlah chat "pesanan sampai mana" per minggu | turun 70% |
| Pembayaran otomatis tercatat | % pembayaran yang statusnya berubah lewat webhook (tanpa input manual) | 100% |
| Landing page meyakinkan | Klik "Mulai Custom" dari landing | ≥ 8% pengunjung |
| Editor dipakai sampai selesai | Pengunjung editor → sampai checkout | ≥ 20% |

## 4. Pengguna

| Persona | Kebutuhan utama | Catatan |
|---|---|---|
| **Pengurus organisasi kampus** (HIMA, BEM, UKM) | Seragam murah, cepat, sesuai warna organisasi; bisa diatur nama per orang | Sering memesan sekali per periode; dana dari kas organisasi |
| **Bendahara/staf instansi** (dinas, BUMD, sekolah) | Bukti pembayaran resmi, invoice, kepastian jadwal | Jumlah besar, butuh dokumen |
| **Kontraktor / proyek** | VEST reflektif dalam jumlah besar, repeat order | Mengutamakan ketahanan dan kecepatan |
| **Komunitas** | Desain bebas, sablon punggung, harga terjangkau | Pesanan kecil-menengah |
| **Admin MULAWARMANESIA** (internal) | Melihat pesanan masuk, memeriksa desain, memperbarui status produksi | Pengguna panel admin |

## 5. Ruang Lingkup

### 5.1 Termasuk (v1)

- Landing page profil bisnis dengan efek paralaks
- Pemilihan produk (PDH / VEST) dan kategori desain di dalam editor
- Editor desain 2D: warna per bagian, unggah gambar/logo, tambah teks, tampak depan & belakang
- Halaman Pesanan (satu halaman, tanpa login): jumlah per ukuran, nama per orang (opsional), catatan, data pemesan, pengiriman, ringkasan harga
- Pembayaran via payment gateway (QRIS, virtual account, e-wallet)
- Halaman status pembayaran & pesanan berhasil
- Lacak pesanan dengan nomor pesanan + nomor WhatsApp
- Panel admin: dashboard dengan visualisasi data, daftar pesanan, detail & file desain, ubah status, input resi, master data
- Notifikasi email (dan WhatsApp jika memungkinkan, lihat §9)
- Validasi input di semua form (lihat §10)

### 5.2 Tidak termasuk (v1)

- Akun pelanggan/login (direncanakan opsional di v2)
- Pratinjau 3D
- Kalkulasi ongkir otomatis multi-kurir (v1: tarif tetap per wilayah atau input manual, lihat §8.6)
- Aplikasi mobile native
- Multi-bahasa (v1 hanya Bahasa Indonesia)
- Marketplace / multi-vendor

## 6. Alur Pengguna

```
Landing page
   └─ Mulai Custom  (atau klik kartu katalog → editor dengan kategori terpilih)
        └─ 1. Editor (panel: Model & kategori → Warna → Gambar → Teks)
             └─ 2. Pesanan (ukuran & jumlah, data pemesan, pengiriman, skema bayar, ringkasan harga)
                  └─ 3. Pembayaran (payment gateway)
                       └─ 4. Pesanan berhasil
                            └─ 5. Status pesanan (tracking)
```

**Prinsip alur**

- **Tanpa login di awal.** Pengunjung langsung bisa mencoba editor. Identitas baru diminta di halaman Pesanan.
- **Paling sedikit perpindahan layar.** Memilih kategori, mengubah desain, dan melihat estimasi harga terjadi di satu layar editor. Mengisi ukuran sampai membayar terjadi di satu halaman.
- **Draf tersimpan otomatis** di browser (localStorage), sehingga pengguna yang menutup tab bisa melanjutkan. Tombol "Simpan desain" (unduh PNG + kode draf) tersedia sebelum pindah ke halaman Pesanan.
- **Upload gambar tetap di browser** selama mengedit. File baru dikirim ke server saat pengguna menekan "Bayar sekarang".
- **Produksi baru berjalan setelah pembayaran diterima** (lunas atau DP, lihat §8.5).
- **Satu titik revisi.** Revisi desain hanya terjadi di status "Cek desain". Setelah status "Produksi", desain dikunci.

## 7. Siklus Status Pesanan

| # | Status | Diubah oleh | Pemicu | Terlihat pelanggan sebagai |
|---|---|---|---|---|
| 1 | `menunggu_pembayaran` | Sistem | Pesanan dibuat | Menunggu pembayaran |
| 2 | `kedaluwarsa` | Sistem | Batas waktu bayar lewat (24 jam, dummy) | Kedaluwarsa |
| 3 | `dibayar` | Sistem | Webhook gateway: pembayaran sukses | Dibayar |
| 4 | `cek_desain` | Admin | Admin mulai memeriksa file | Cek desain |
| 4a | `perlu_revisi` | Admin | Desain bermasalah (resolusi logo rendah, dll.) | Perlu revisi, admin menghubungi via WA |
| 5 | `produksi` | Admin | Desain disetujui; desain dikunci | Produksi (sub-tahap: potong → jahit → sablon/bordir) |
| 6 | `qc` | Admin | Produksi selesai | QC & pengemasan |
| 7 | `siap_kirim` | Admin | Sudah dikemas | Siap kirim / siap diambil |
| 8 | `dikirim` | Admin | Resi diinput | Dikirim + nomor resi |
| 9 | `selesai` | Admin / Sistem | Diterima atau 7 hari setelah dikirim | Selesai |
| — | `dibatalkan` | Admin | Permintaan pelanggan sebelum produksi | Dibatalkan |

Setiap perubahan status dicatat dengan waktu (WITA) dan ditampilkan sebagai timeline di halaman status.

## 8. Kebutuhan Fungsional

### 8.1 Landing page (dengan paralaks)

Urutan section (sesuai desain):

| # | Section | Isi | Paralaks |
|---|---|---|---|
| 0 | Ticker | Strip merah berjalan: info PO batch, minimal order, durasi produksi | Tidak (marquee) |
| 1 | Navbar | Wordmark, Katalog, Custom, Cara Pesan, Portofolio, Lacak Pesanan, Keranjang | Sticky |
| 2 | Hero | Judul "Seragam Tanpa Kompromi", deskripsi, tombol Mulai Custom & Lihat Katalog, ilustrasi PDH & VEST | Ya, 5 lapisan |
| 3 | Profil | Cerita singkat, 4 statistik (pcs/bulan, jumlah klien, hari produksi, minimal order) | Angka latar "2019" |
| 4 | Katalog | 3 kartu produk (PDH Organisasi, PDH Instansi, VEST Proyek) + harga mulai | Tidak |
| 5 | Kategori desain | Strip kartu kategori | Bergeser horizontal |
| 6 | Cara pesan | 5 langkah | Tidak |
| 7 | Manifesto | Pita pastel kuning dengan garis hitam atas-bawah | Angka latar "12" |
| 8 | Portofolio | 3 foto proyek | Kecepatan berbeda per kolom |
| 9 | Testimoni | 3 kutipan klien | Tidak |
| 10 | CTA | "Siap bikin seragammu?" | Tidak |
| 11 | Footer | Alamat workshop, tautan, kontak, wordmark raksasa | Tidak |

**Spesifikasi paralaks**

| Lapisan | Elemen | Kecepatan | Arah | Catatan |
|---|---|---|---|---|
| Hero L0 | Latar halaman | 0× | — | Diam |
| Hero L1 | Teks latar "PDH / VEST" | 0.2× | Vertikal | Paling jauh |
| Hero L2 | Panel ilustrasi PDH | 0.5× | Vertikal | Rotasi 0° → −2° |
| Hero L3 | Panel ilustrasi VEST | 0.8× | Vertikal | Menutupi sudut panel PDH |
| Hero L4 | Judul + tombol | 1.0× | Vertikal | Opacity 1 → 0 di 600 px |
| Profil | Angka "2019" | 0.4× | Vertikal | Outline latar |
| Kategori | Strip kartu | 0.6× | Horizontal | Geser ± 480 px ke kiri |
| Manifesto | Angka "12" | 0.3× | Vertikal | — |
| Portofolio | 3 foto | 0.9× / 1.15× / 1.0× | Vertikal | Kolom tengah mendahului |

**Aturan paralaks**

1. Hanya animasikan `transform` (`translate3d`, `rotate`) dan `opacity`. Jangan animasikan `top`, `margin`, atau `height`.
2. Matikan semua paralaks saat `prefers-reduced-motion: reduce`. Lapisan tampil diam di posisi awal.
3. Di layar < 768 px, paralaks hanya untuk L1 dan L2 dengan setengah kecepatan. Strip kategori menjadi geser manual (swipe).
4. Konten penting (judul, tombol, harga) selalu di lapisan 1.0×.
5. Halaman selain landing **tidak boleh** memakai paralaks.
6. Implementasi yang disarankan: GSAP ScrollTrigger, atau CSS `animation-timeline: scroll()` dengan fallback diam.

### 8.2 Model & kategori desain (panel pertama di editor)

- Tab produk: **PDH** dan **VEST**.
- Kategori (dummy):
  - **PDH:** Organisasi, Instansi, Komunitas, Perusahaan
  - **VEST:** Proyek, Event, Relawan, Brand
- Setiap kategori adalah template dasar: potongan kerah, saku, list, posisi default logo/teks, dan palet warna awal.
- Kartu kategori ditampilkan di panel kiri editor (nomor, nama, harga mulai). Pratinjau di tengah langsung berganti saat kategori dipilih.
- Pengunjung dari tombol "Mulai Custom" masuk dengan PDH + kategori pertama sudah terpilih, jadi editor tidak pernah kosong.
- Pengunjung dari kartu katalog di landing masuk dengan produk dan kategori kartu itu.
- Mengganti kategori setelah ada perubahan menampilkan konfirmasi: "Ganti kategori akan mengatur ulang warna dan posisi logo. Lanjutkan?"

### 8.3 Editor desain

**Tata letak:** panel alat kiri (Model, Warna, Gambar, Teks), area pratinjau tengah, ringkasan harga kanan.

**Alat [00] Model & kategori**: lihat §8.2.

**Alat [01] Warna**
- Setiap bagian garmen dapat diwarnai terpisah.
  - **PDH:** Badan, Lengan, Kerah, Tutup saku, Plaket, List lengan
  - **VEST:** Badan, Strip reflektif, Saku, Ritsleting
- Palet warna kain sesuai stok (dummy: 16 warna, misalnya Navy, Hitam, Maroon, Hijau Army, Abu Tua, Cream, Biru Dongker). Warna di luar stok **tidak** bisa dipilih bebas lewat color picker. Harga dan ketersediaan kain bergantung pada stok.
- Swatch terpilih ditandai bingkai merah.

**Alat [02] Gambar**
- Unggah logo (PNG/SVG/JPG, maks. 5 MB).
- Posisi preset: dada kiri, dada kanan, lengan kiri, lengan kanan, punggung atas, punggung tengah.
- Gambar dapat digeser, diubah ukuran (dengan batas maksimal area cetak), dan dihapus.
- Pilihan teknik: Bordir / Sablon. Teknik memengaruhi harga.
- Maksimal 4 gambar per desain (dummy).

**Alat [03] Teks**
- Tambah teks, misalnya nama organisasi, slogan, atau "nama per orang" (placeholder yang diisi di langkah detail pesanan).
- Pilihan font terbatas (dummy: 4 font yang tersedia untuk bordir/sablon), warna dari palet benang/tinta, ukuran, dan posisi.
- Teks dapat digeser dan dihapus.

**Pratinjau**
- Tampak depan dan belakang (toggle).
- Latar netral terang agar warna pilihan tampil jujur.
- Zoom 100% / 150%.
- Area cetak aman ditampilkan sebagai garis putus-putus saat objek dipilih.

**Lainnya**
- Undo/redo (minimal 20 langkah).
- Autosave draf ke localStorage.
- Estimasi harga per pcs diperbarui langsung di panel kanan.
- Tombol "Lanjut: isi ukuran & data" membuka halaman Pesanan.

### 8.4 Halaman Pesanan: ukuran & jumlah

Halaman ini menggabungkan detail pesanan dan checkout dari v1.0. Susunan: kolom kiri berisi empat blok berurutan (Ukuran & jumlah, Data pemesan, Pengiriman, Pembayaran); kolom kanan berisi ringkasan desain dan harga yang menempel saat di-scroll.

- Tabel ukuran: S, M, L, XL, XXL, XXXL, masing-masing dengan stepper jumlah (0–999).
- Panduan ukuran (modal tabel lingkar dada/panjang badan).
- Total pcs dihitung otomatis. **Minimal order: 12 pcs (dummy)**.
- Opsi "Nama per orang" (checkbox). Jika aktif, muncul daftar baris nama + ukuran yang jumlahnya sama dengan total pcs. Alternatifnya, unggah CSV.
- Pilihan bahan (dummy: American Drill, Nagata Drill; VEST: Taslan, Drill).
- Catatan untuk produksi (maks. 300 karakter).

### 8.5 Halaman Pesanan: data pemesan, pengiriman, pembayaran

**Data pemesan:** nama lengkap, nomor WhatsApp, email, nama organisasi/instansi (opsional).

**Pengiriman:**
- Opsi **Kirim ke alamat**: alamat lengkap, kota/kabupaten, kode pos.
- Opsi **Ambil di workshop**: gratis.

**Pembayaran:**
- Pilihan **Lunas** atau **DP 50%** **[KEPUTUSAN]**. Jika memakai DP, sisa tagihan dibayar sebelum status "Siap kirim" lewat tautan pembayaran kedua.

**Ringkasan:** subtotal, biaya bordir/sablon, ongkir, diskon (jika ada), dan total.

**Lainnya:**
- Checkbox persetujuan syarat produksi & revisi (wajib).
- Tombol "Bayar sekarang" (di ringkasan kanan, dan di bawah form pada mobile) membuat pesanan berstatus `menunggu_pembayaran`, mengunggah file desain, lalu membuka halaman/popup payment gateway.

### 8.6 Aturan harga (dummy, harus diganti)

```
harga_per_pcs  = harga_dasar[produk][kategori][bahan]
               + Σ biaya_dekorasi (per gambar: bordir Rp 15.000 / sablon Rp 10.000)
               + biaya_nama_per_orang (Rp 7.500/pcs jika aktif)
               + tambahan_ukuran (XXL +Rp 10.000, XXXL +Rp 15.000)
subtotal       = Σ (harga_per_pcs × jumlah per ukuran)
diskon_volume  = 5% jika total ≥ 50 pcs, 10% jika ≥ 100 pcs
ongkir         = tarif tetap per wilayah (Samarinda Rp 0 / Kaltim Rp 48.000 / luar Kaltim Rp 95.000)
total          = subtotal − diskon_volume + ongkir
```

- Harga dasar (dummy): PDH Organisasi Rp 185.000, PDH Instansi Rp 210.000, VEST Proyek Rp 95.000.
- Harga **selalu dihitung ulang di server** saat checkout. Angka di browser hanya estimasi.

### 8.7 Pembayaran

- Gateway: Midtrans / Xendit / Duitku **[KEPUTUSAN]**.
- Metode: QRIS, virtual account (BCA, BNI, BRI, Mandiri), e-wallet (OVO, DANA, GoPay, ShopeePay).
- Batas waktu bayar: 24 jam (dummy). Halaman pembayaran menampilkan hitung mundur.
- Status pembayaran **hanya** diubah oleh webhook server-ke-server yang diverifikasi signature-nya. Redirect browser tidak dipakai sebagai bukti bayar.
- Halaman hasil:
  - **Berhasil** → "Pesanan berhasil" berisi nomor pesanan (format `MLW-2611-0042`), tombol lacak, dan ringkasan.
  - **Pending** → instruksi pembayaran (nomor VA / QRIS) + hitung mundur.
  - **Gagal/kedaluwarsa** → tombol "Buat pembayaran ulang" (selama pesanan belum kedaluwarsa) atau "Ulangi pesanan" (desain dipulihkan dari data pesanan).

### 8.8 Lacak & status pesanan

- **Lacak pesanan**: formulir nomor pesanan + nomor WhatsApp yang dipakai saat checkout. Tanpa login. Tautan lacak di email dan WhatsApp langsung membuka halaman status.
- **Status pesanan**: nomor pesanan, tag status saat ini, dan timeline 8 tahap (menunggu pembayaran, dibayar, cek desain, produksi, QC & pengemasan, siap kirim, dikirim, selesai) dengan waktu WITA untuk tahap yang sudah lewat.
- **Perlu revisi**: Alert di atas halaman berisi alasan dari admin, dan tahap berjalan berganti menjadi "Perlu revisi".
- **Dikirim**: kurir dan nomor resi tampil di Alert dan di timeline.
- **Ringkasan**: gambar desain, rincian ukuran, total pcs, kota tujuan, dan pembayaran.
- **Bantuan**: tombol chat admin via WhatsApp dengan nomor pesanan terisi otomatis.
- Sisa tagihan DP (jika ada) dibayar dari halaman ini lewat tautan pembayaran kedua.

### 8.9 Panel admin (internal)

Tata letak: sidebar kiri (Dashboard, Pesanan, Produksi, Master data, Laporan, Pengaturan) dan area konten. Di mobile, sidebar menjadi menu yang dibuka dari tombol di navbar.

**Login admin**: email + kata sandi, kode 2FA diminta setelah kata sandi benar.

**Dashboard** (halaman pertama setelah login). Rentang waktu: 7 hari / 30 hari / bulan ini. Semua angka memakai rentang yang sama, kecuali yang ditandai.

| Blok | Bentuk | Isi | Sumber data |
|---|---|---|---|
| Pendapatan diterima | Kartu angka + pembanding periode sebelumnya | Jumlah pembayaran sukses (lunas + DP) | `payments` |
| Pesanan dibayar | Kartu angka | Jumlah pesanan dan total pcs | `orders`, `order_sizes` |
| Sedang diproduksi | Kartu angka | Pesanan dan pcs berstatus `produksi`, persen kapasitas | `orders` |
| Menunggu pembayaran | Kartu angka | Jumlah, nilai, dan yang kedaluwarsa < 3 jam | `orders` |
| Pendapatan per minggu | Grafik garis, 8 minggu terakhir (rentang tetap) | Pembayaran diterima per minggu | `payments` |
| Pesanan aktif per status | Batang horizontal | Jumlah pesanan per status saat ini. Merah = menunggu tindakan admin (`dibayar`, `cek_desain`, `siap_kirim`), abu = berjalan atau menunggu pelanggan | `orders` |
| Ukuran terlaris | Grafik kolom S–XXXL | Pcs per ukuran | `order_sizes` |
| Kategori terlaris | Batang berperingkat | Pcs per kategori desain | `order_items` |
| PDH vs VEST | Batang tersegmen | Bagian pcs per produk | `order_items` |
| Metode & skema bayar | Batang | Persen QRIS / VA / e-wallet, dan lunas / DP | `payments`, `orders` |
| Konversi alur pemesanan | Batang berurutan | Buka editor → halaman Pesanan → pesanan dibuat → dibayar, dengan persen lanjut | Pelacakan event **[KEPUTUSAN]** + `orders` |
| Warna kain terlaris | Batang dengan contoh warna kain | Persen pcs per warna badan, peringatan warna habis | `design_json`, `fabric_colors` |
| Kapasitas produksi | Meter | Pcs dalam produksi minggu ini dibanding kapasitas (dummy: 600 pcs/minggu) | `orders`, pengaturan |
| Perlu tindakan hari ini | Daftar | Pesanan yang menunggu cek desain, revisi, input resi, atau hampir kedaluwarsa | `orders` |
| Pesanan terbaru | Tabel (kartu di mobile) | 6 pesanan terakhir | `orders` |

Aturan visualisasi: satu sumbu per grafik; warna merek untuk besaran, abu untuk pembanding; status selalu disertai label teks, tidak hanya warna; angka di dashboard harus sama dengan hasil filter di daftar pesanan untuk rentang yang sama.

**Pesanan**: filter per status dengan jumlahnya, pencarian nomor pesanan atau nama pemesan, urut berdasarkan tanggal, ekspor CSV.

**Detail pesanan**: render desain depan/belakang, warna per bagian, file logo asli untuk diunduh beserta hasil cek resolusi, rincian ukuran & nama, data pemesan dan pengiriman, pembayaran, riwayat status dengan waktu dan pelaku.

**Ubah status**: hanya maju sesuai §7, kecuali `perlu_revisi` ↔ `cek_desain`. Catatan internal opsional. Pindah ke `produksi` meminta konfirmasi karena desain dikunci. Pindah ke `perlu_revisi` mewajibkan alasan yang dikirim ke pelanggan.

**Lembar produksi**: PDF berisi gambar desain, tabel ukuran, dan daftar nama.

**Master data** (v1 minimal): harga dasar, biaya dekorasi, palet warna kain & status stok, kategori/template, tarif ongkir.

## 9. Notifikasi

| Kejadian | Email | WhatsApp **[KEPUTUSAN]** |
|---|---|---|
| Pesanan dibuat (menunggu pembayaran) | ✓ instruksi bayar | ✓ |
| Pembayaran diterima | ✓ + tautan lacak | ✓ |
| Perlu revisi desain | ✓ | ✓ (admin menghubungi) |
| Produksi dimulai | ✓ | — |
| Dikirim (resi) | ✓ | ✓ |
| Pembayaran akan kedaluwarsa (3 jam sebelum) | ✓ | ✓ |

WhatsApp otomatis membutuhkan WhatsApp Business API (penyedia resmi, berbayar per pesan). Alternatif v1: tombol klik-ke-WA untuk admin.

## 10. Validasi Input

Prinsip umum:

- Validasi berjalan di **browser** (saat field kehilangan fokus dan saat submit) dan **diulang di server** (sumber kebenaran).
- Pesan error tampil di bawah field, diawali `[!]`, dengan garis field berwarna `status/danger`. Karena warna merek sudah merah, error **tidak boleh** hanya mengandalkan warna.
- Saat submit gagal, tampilkan Alert ringkasan di atas halaman Pesanan (mencakup semua blok) ("Ada 3 isian yang perlu diperbaiki"), lalu fokus pindah ke field error pertama.
- Tombol submit tidak dinonaktifkan sebelum diisi. Biarkan pengguna menekan, lalu tunjukkan apa yang kurang.
- Pesan error berbahasa Indonesia, menjelaskan masalahnya dan cara memperbaikinya.

### 10.1 Pilih kategori (di dalam editor)

| Field | Aturan | Pesan error |
|---|---|---|
| Kategori | Otomatis terpilih saat editor dibuka; hanya bisa kosong jika draf rusak | [!] Pilih satu kategori desain untuk melanjutkan |

### 10.2 Editor

| Field | Aturan | Pesan error |
|---|---|---|
| File logo — format | PNG, SVG, JPG/JPEG | [!] Format .webp belum didukung. Gunakan PNG, SVG, atau JPG |
| File logo — ukuran | ≤ 5 MB | [!] File 7,4 MB. Maksimal 5 MB |
| File logo — resolusi | Sisi terpendek ≥ 500 px (bitmap) | [!] Resolusi 320 px terlalu kecil. Minimal 500 px agar bordir tajam |
| Jumlah gambar | ≤ 4 per desain | [!] Maksimal 4 gambar per desain |
| Teks — isi | 1–40 karakter, tanpa emoji | [!] Teks maksimal 40 karakter |
| Teks/gambar — posisi | Seluruh objek di dalam area cetak aman | [!] Logo melewati area cetak. Geser ke dalam garis putus-putus |
| Warna | Hanya dari palet stok | (dicegah di UI: warna habis tampil abu dan tidak bisa diklik) |
| Lanjut ke ukuran | Minimal 1 bagian sudah diatur (otomatis terpenuhi oleh template) | — |

### 10.3 Halaman Pesanan: ukuran & jumlah

| Field | Aturan | Pesan error |
|---|---|---|
| Jumlah per ukuran | Bilangan bulat 0–999 | [!] Masukkan angka 0–999 |
| Total pcs | ≥ 12 (minimal order) | [!] Total 8 pcs. Minimal order 12 pcs, tambah 4 lagi |
| Nama per orang (jika aktif) | Jumlah baris = total pcs; setiap nama 1–20 karakter | [!] Ada 3 baris nama yang masih kosong |
| Ukuran per nama | Jumlah per ukuran di daftar nama = tabel ukuran | [!] Daftar nama berisi 5 ukuran L, tabel berisi 6 |
| CSV nama | Kolom `nama,ukuran`; ukuran valid | [!] Baris 7: ukuran "XS" tidak tersedia |
| Bahan | Wajib dipilih | [!] Pilih jenis bahan |
| Catatan | ≤ 300 karakter | [!] Maksimal 300 karakter (312/300) |

### 10.4 Halaman Pesanan: data pemesan, pengiriman, pembayaran

| Field | Aturan | Pesan error |
|---|---|---|
| Nama lengkap | Wajib, 3–60 karakter, huruf/spasi/titik/apostrof | [!] Masukkan nama lengkap (minimal 3 huruf) |
| Nomor WhatsApp | Wajib; diawali 08 atau +628 atau 628; total 10–14 digit; dinormalisasi ke `628…` | [!] Nomor belum lengkap. Contoh: 0812 5555 0199 |
| Email | Wajib, format email valid | [!] Format email belum benar. Contoh: nama@email.com |
| Organisasi | Opsional, ≤ 80 karakter | [!] Maksimal 80 karakter |
| Metode pengiriman | Wajib dipilih | [!] Pilih kirim ke alamat atau ambil di workshop |
| Alamat (jika kirim) | Wajib, 10–200 karakter | [!] Tulis alamat lengkap: jalan, nomor, RT/RW, kelurahan |
| Kota/kabupaten (jika kirim) | Wajib dari daftar | [!] Pilih kota tujuan |
| Kode pos (jika kirim) | 5 digit | [!] Kode pos harus 5 digit |
| Skema bayar | Wajib (Lunas / DP) | [!] Pilih lunas atau DP 50% |
| Persetujuan | Wajib dicentang | [!] Centang persetujuan syarat produksi untuk melanjutkan |
| Harga | Total di server = total di browser; jika beda, tampilkan harga baru | [i] Harga diperbarui menjadi Rp 2.410.000 karena perubahan stok. Periksa sebelum membayar |

### 10.5 Pembayaran

| Kondisi | Perilaku / pesan |
|---|---|
| Gateway gagal dimuat | [!] Halaman pembayaran gagal dibuka. Coba lagi atau pilih metode lain |
| Pembayaran kedaluwarsa | [!] Waktu pembayaran habis. Buat pembayaran ulang, desainmu tetap tersimpan |
| Pembayaran ditolak | [!] Pembayaran ditolak oleh penyedia. Coba metode lain |
| Webhook terlambat | Halaman menampilkan "Memeriksa pembayaran…" dan cek ulang otomatis tiap 5 detik selama 2 menit |

### 10.6 Lacak pesanan

| Field | Aturan | Pesan error |
|---|---|---|
| Nomor pesanan | Wajib, format `MLW-YYMM-NNNN` (tanpa membedakan huruf besar/kecil, spasi dibuang) | [!] Format nomor pesanan: MLW-2611-0042 |
| Nomor WhatsApp | Sama seperti checkout | [!] Nomor belum lengkap |
| Kombinasi tidak cocok | Pesan **sama** untuk "tidak ada" dan "WA salah" (mencegah tebak nomor) | [!] Pesanan tidak ditemukan. Periksa nomor pesanan dan nomor WhatsApp yang dipakai saat checkout |
| Terlalu banyak percobaan | > 5 gagal / 15 menit | [!] Terlalu banyak percobaan. Coba lagi dalam 15 menit |

### 10.7 Panel admin

| Field / kondisi | Aturan | Pesan |
|---|---|---|
| Login | Email dan kata sandi cocok | [!] Email atau kata sandi salah. Sisa 3 percobaan |
| Login — terlalu banyak gagal | 5 kali gagal | Akun dikunci 15 menit |
| Alasan revisi | Wajib saat status diubah ke `perlu_revisi`, 10–300 karakter | [!] Tulis alasan revisi agar pelanggan tahu apa yang perlu diperbaiki |
| Mulai produksi | Konfirmasi wajib | Dialog: "Setelah status menjadi Produksi, desain dikunci dan tidak bisa direvisi" |
| Harga (master data) | Bilangan bulat ≥ 0 | [!] Masukkan angka tanpa huruf. Contoh: 225000 |
| Urutan status | Tidak boleh mundur atau melompat | [!] Status hanya bisa maju satu tahap |

## 11. Desain & Design System

- **Arah gaya: neo-brutalism.** Latar merah muda sangat terang, kartu putih bergaris hitam 2 px, sudut membulat (8–24 px), dan bayangan keras tanpa blur. Latar pastel (biru, mint, kuning, peach) dipakai untuk ilustrasi dan kartu statistik. Footer memakai mode gelap sebagai penutup.
- **Warna primer:** `#C12822`, hanya untuk aksi utama, harga, penekanan, dan besaran di grafik. Kontras di atas putih ±5,8:1 (lolos AA untuk teks).
- **Error tidak hanya warna.** Karena warna merek sudah merah, setiap error memakai awalan `[!]`, teks penjelas, dan garis field yang lebih tebal.
- **Font:** Poppins untuk semua teks (gratis di Google Fonts).
- **Token:** `Primitives` (23 warna), `Color` (27 token semantik, mode Light & Dark), `Spacing & Radius`. 15 text style dan 5 effect style bayangan.
- **Mode warna:** Light untuk seluruh halaman; Dark per-frame untuk footer.
- **Komponen:**
  - **Umum:** Button, Tag, Icon Button, Section Title (desktop & mobile), Navbar (desktop & mobile), Footer (desktop & mobile), Alert
  - **Katalog:** Category Card, Product Card
  - **Form:** Input, Select, Textarea, Checkbox, Radio Card, Qty Stepper, Upload Dropzone
  - **Editor & pelacakan:** Color Swatch, Editor Tab, Status Step, Garment/PDH, Garment/VEST
- **Editor:** area pratinjau berlatar netral terang supaya warna kain tampil apa adanya; area cetak aman berupa garis putus-putus.
- **Responsif:** desktop 1440 px dan mobile 390 px. Di mobile, baris menjadi tumpukan, kanvas editor di atas panel alat, dan harga + tombol utama menempel di bawah layar.
- **Isi file desain** (`MULAWARMANESIA Website v1.figcraft`):

| Halaman FigCraft | Isi |
|---|---|
| Design System | Cover, Foundations, Components |
| Web — Desktop | 10 layar alur utama (01 Landing sampai 10 Status pesanan), 16 state validasi (V01–V16), catatan paralaks, tabel aturan validasi |
| Web — Mobile | 10 layar alur utama dan 16 state validasi yang sama |
| Admin — Desktop | A01 Login, A02 Dashboard, A03 Pesanan, A04 Detail pesanan, A05 Master data, 3 state (login gagal, minta revisi tanpa alasan, konfirmasi mulai produksi) |
| Admin — Mobile | A01 Login, A02 Dashboard, A03 Pesanan, A04 Detail pesanan, 3 state yang sama |

- **Belum didesain:** prototipe klik, halaman Produksi/Laporan/Pengaturan di admin, Master data versi mobile, menu navbar mobile dalam keadaan terbuka, daftar nama per orang.

## 12. Kebutuhan Non-fungsional

| Area | Kebutuhan |
|---|---|
| Performa | LCP landing < 2,5 detik di 4G; paralaks stabil 60 fps di laptop menengah; gambar format WebP/AVIF + lazy-load |
| Responsif | Desktop 1440, tablet 768, mobile 375. Editor di mobile: panel alat jadi bottom sheet |
| Aksesibilitas | WCAG 2.1 AA: kontras teks ≥ 4,5:1, fokus keyboard terlihat, label pada semua field, error terhubung via `aria-describedby`, `prefers-reduced-motion` dihormati |
| Keamanan | HTTPS; verifikasi signature webhook; harga dihitung di server; validasi tipe file di server (cek magic bytes, bukan hanya ekstensi); SVG disanitasi; rate limit di form lacak & checkout; data pribadi tidak muncul di URL |
| Privasi | Hanya data yang dibutuhkan untuk pesanan; kebijakan privasi tersedia; file desain pesanan kedaluwarsa dihapus setelah 30 hari |
| Keandalan | Webhook idempoten (pembayaran yang sama tidak diproses dua kali); log setiap perubahan status |
| SEO | Landing & katalog dirender di server (SSR/SSG), meta tag & Open Graph, sitemap |
| Analitik | Event: `view_landing`, `click_mulai_custom`, `select_category`, `editor_upload`, `editor_next`, `checkout_start`, `payment_success`, `track_order` |

## 13. Rekomendasi Teknis

| Lapisan | Pilihan | Alasan |
|---|---|---|
| Frontend | Next.js (React) + TypeScript | SSR untuk SEO landing, ekosistem luas |
| Editor | Fabric.js atau Konva di atas SVG garmen | Geser, ubah ukuran, dan ekspor PNG sudah tersedia |
| Paralaks | GSAP ScrollTrigger | Stabil, mudah dimatikan untuk reduced motion |
| Validasi | Zod (skema dipakai bersama browser & server) | Satu sumber aturan |
| Backend & DB | Supabase (Postgres, Storage, Auth untuk admin) | Satu layanan untuk data, file, dan login admin |
| Pembayaran | Midtrans / Xendit / Duitku | QRIS, VA, e-wallet + webhook |
| Email | Resend / Brevo | Email transaksional |
| Dashboard admin | View/kueri agregasi Postgres + pustaka grafik (Recharts atau sejenis) | Angka dihitung di database, sama dengan daftar pesanan |
| Hosting | Vercel | Integrasi Next.js, deploy cepat |

### Model data (ringkas)

- `orders`: `id`, `code` (MLW-YYMM-NNNN), `status`, `customer_name`, `whatsapp`, `email`, `organization`, `shipping_method`, `address`, `city`, `postal_code`, `payment_scheme`, `subtotal`, `discount`, `shipping_fee`, `total`, `amount_paid`, `tracking_token`, `courier`, `resi`, `created_at`, `expires_at`
- `order_items`: `order_id`, `product` (PDH/VEST), `category_id`, `material`, `design_json`, `render_front_url`, `render_back_url`, `notes`
- `order_sizes`: `order_item_id`, `size`, `qty`
- `order_names`: `order_item_id`, `name`, `size`
- `order_assets`: `order_item_id`, `file_url`, `type` (logo), `technique` (bordir/sablon), `position`
- `payments`: `order_id`, `gateway_ref`, `method`, `amount`, `status`, `paid_at`, `raw_payload`
- `order_status_logs`: `order_id`, `status`, `note`, `changed_by`, `changed_at`
- `categories`, `fabric_colors`, `price_rules`, `shipping_rates`: master data

`design_json` menyimpan warna per bagian serta setiap objek (tipe, isi, font, warna, x, y, skala, rotasi, sisi depan/belakang). Dengan data ini desain bisa dirender ulang persis.

## 14. Kriteria Penerimaan (contoh utama)

1. Pengunjung tanpa akun bisa memilih kategori, mengedit desain, dan sampai ke checkout.
2. Menutup tab di editor lalu membukanya kembali memulihkan draf terakhir.
3. Mengunggah file 7 MB menampilkan error ukuran, dan file tidak ditambahkan ke desain.
4. Total 8 pcs menahan pengguna di halaman Pesanan dengan pesan minimal order.
5. Submit halaman Pesanan kosong menampilkan Alert ringkasan + error di setiap field wajib, lalu fokus pindah ke field pertama.
6. Membayar dengan QRIS sandbox mengubah status menjadi `dibayar` lewat webhook dalam < 10 detik, tanpa tindakan admin.
7. Mengubah total di browser (devtools) tidak mengubah jumlah yang ditagihkan gateway.
8. Lacak dengan nomor pesanan benar + WA salah menampilkan pesan "Pesanan tidak ditemukan" yang sama dengan nomor pesanan yang tidak ada.
9. Paralaks berjalan di landing, mati total saat `prefers-reduced-motion` aktif, dan tidak ada di halaman lain.
10. Admin mengubah status ke `produksi` → pelanggan tidak bisa lagi meminta perubahan desain, dan timeline menampilkan status baru beserta waktunya.

11. Angka di dashboard admin sama dengan hasil filter di daftar pesanan untuk rentang tanggal yang sama.
12. Mengubah status ke `perlu_revisi` tanpa alasan ditolak dengan pesan error; mengubah ke `produksi` selalu meminta konfirmasi.
13. Semua halaman pelanggan dapat dipakai di lebar 390 px tanpa scroll horizontal (kecuali strip kategori yang memang digeser).

## 15. Rencana Rilis

| Fase | Isi | Estimasi (dummy) |
|---|---|---|
| 0. Desain | **Sebagian besar selesai:** design system, 52 frame web (desktop + mobile), 15 frame admin. Sisa: prototipe klik dan layar yang belum didesain (§11) | Beberapa hari |
| 1. Fondasi | Setup Next.js, Supabase, design tokens → CSS variables, komponen dasar | 1 minggu |
| 2. Landing | Semua section + paralaks + SEO | 1 minggu |
| 3. Editor | Template garmen, warna, unggah, teks, autosave | 2–3 minggu |
| 4. Pesanan & bayar | Halaman Pesanan, harga di server, integrasi gateway sandbox, webhook | 2 minggu |
| 5. Tracking & admin | Halaman lacak, panel admin, dashboard dengan agregasi data, notifikasi email | 2 minggu |
| 6. Uji & rilis | Uji pembayaran produksi, uji perangkat, aksesibilitas, soft launch ke 3–5 klien | 1 minggu |

## 16. Risiko

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Warna di layar beda dengan kain asli | Komplain, revisi | Disclaimer warna, swatch dari foto kain asli, opsi kirim sampel kain |
| Logo resolusi rendah | Bordir/sablon jelek | Validasi resolusi + status `perlu_revisi` |
| Verifikasi akun payment gateway butuh dokumen usaha | Rilis tertunda | Urus KYC gateway sejak fase 0 |
| Pesanan iseng / tidak dibayar | Data menumpuk | Kedaluwarsa otomatis 24 jam; file dihapus setelah 30 hari |
| Paralaks berat di HP murah | UX buruk, bounce | Batasi lapisan di mobile, hormati reduced motion, uji di perangkat kelas bawah |
| Halaman Pesanan panjang di layar kecil | Konversi mobile rendah | Ringkasan harga jadi bar bawah yang bisa dibuka; blok bisa dilipat |
| Editor kompleks di layar kecil | Konversi mobile rendah | Bottom sheet, posisi preset (bukan drag bebas) di mobile |

| Angka dashboard tidak cocok dengan daftar pesanan | Admin tidak percaya dashboard | Satu sumber kueri agregasi; uji banding otomatis dengan daftar pesanan |
| Konversi editor tidak bisa diukur | Blok konversi kosong | Putuskan alat pelacakan event sebelum fase 3 |

## 17. Keputusan Terbuka

1. **Skema pembayaran:** lunas saja, atau ada opsi DP 50%?
2. **Payment gateway:** Midtrans, Xendit, atau Duitku? Apakah sudah punya akun?
3. **Notifikasi WhatsApp otomatis** (berbayar via WhatsApp Business API) atau cukup email + tombol klik-ke-WA?
5. **Harga, minimal order, durasi produksi, palet kain, dan daftar kategori asli** untuk menggantikan data dummy.
6. **Pelanggan utama:** lebih banyak organisasi/instansi yang repeat order? Jika ya, fitur akun & riwayat pesanan naik prioritas ke v1.1.
7. **Pelacakan event untuk blok konversi di dashboard:** tabel event sendiri di Supabase, atau alat analitik (Plausible, PostHog, GA4)?
8. **Kapasitas produksi per minggu** yang dipakai meter di dashboard (dummy: 600 pcs).
