# Laporan Audit QA — MULAWARMANESIA

| | |
|---|---|
| Tanggal | 21 November 2026 |
| Target | `http://localhost:3000` (Next.js 16.4.6 dev server, Turbopack) |
| Environment | DEVELOPMENT (lokal), MySQL 8.0.30 Laragon, `ENABLE_PAYMENT_SIMULATOR` aktif |
| Akun | Superadmin dan Admin dari `.env` (kredensial tidak dicantumkan) |
| Alat | Google Chrome & Microsoft Edge (headless, dikendalikan Playwright), `fetch` Node.js untuk uji API |
| Kode project | **Tidak diubah** selama audit |

---

## A. EXECUTIVE SUMMARY

Alur utama pelanggan (desain → pesanan → bayar → lacak) dan panel admin **berjalan** di browser. Validasi server, mesin status, aturan DP, dan pembagian peran admin/superadmin umumnya solid. Namun ada **satu celah kritis**: siapa pun bisa menandai pesanan milik orang lain sebagai "dibayar" hanya dengan mengetahui nomor pesanan (nomornya berurutan). Ada juga beberapa masalah keamanan dan UX tingkat menengah.

| Metrik | Jumlah |
|---|---|
| Halaman diperiksa | 19 (11 publik + 8 admin) |
| Fitur diuji | 22 |
| Test case dijalankan | 162 |
| PASS | 113 |
| FAIL | 49 |
| BLOCKED / NOT TESTED | 9 (lihat bagian C) |

| Severity | Jumlah bug |
|---|---|
| Critical | 1 |
| High | 3 |
| Medium | 14 |
| Low | 16 |
| Cosmetic | 3 |
| **Total** | **37** |

**Verdict: NEEDS MAJOR FIXES** (detail di bagian K).

---

## B. WEBSITE INVENTORY

### Halaman publik
| URL | Fungsi |
|---|---|
| `/` | Landing (hero paralaks, katalog, kategori, cara pesan, portofolio, testimoni, CTA WA) |
| `/editor` (`?kategori=N`) | Editor desain: Model, Warna, Gambar (unggah logo), Teks, depan/belakang, undo/redo, zoom, autosave draf |
| `/pesanan` | Form ukuran & jumlah, bahan, nama per orang, catatan, data pemesan, pengiriman, skema bayar |
| `/pembayaran/[code]?token=` | QRIS / VA / e-wallet, hitung mundur, polling status, unduh QR |
| `/gateway/[ref]` | Simulator payment gateway (sukses / tolak / kedaluwarsa) |
| `/pesanan-berhasil/[code]?token=` | Konfirmasi, salin nomor, unduh bukti |
| `/status/[code]?token=` | Timeline status + ringkasan desain |
| `/lacak` | Lacak pakai nomor pesanan + WhatsApp |
| `/panduan-ukuran` | Tabel ukuran |
| 404 | Halaman bawaan Next.js |

### Halaman admin
| URL | Role |
|---|---|
| `/admin/login` | publik |
| `/admin` (dashboard) | Admin, Superadmin |
| `/admin/pesanan`, `/admin/pesanan/[code]`, `/admin/pesanan/[code]/lembar` | Admin, Superadmin |
| `/admin/produksi` | Admin, Superadmin |
| `/admin/master-data`, `/admin/akun`, `/admin/pengaturan`, `/admin/log` | Superadmin saja |

### API
`POST /api/orders`, `GET /api/orders/[code]`, `POST /api/orders/[code]/pay`, `POST /api/payments/simulate`, `POST /api/payments/webhook`, `POST /api/track`, `POST/GET /api/uploads`, `GET /api/catalog`, `POST|DELETE /api/admin/login`, `PATCH /api/admin/orders/[code]/status`, `GET /api/admin/orders/export`, `PATCH /api/admin/master-data`, `PATCH /api/admin/pengaturan`, `POST /api/admin/akun`, `PATCH /api/admin/akun/[id]`

### Role
Pelanggan (tanpa akun, akses lewat token), Admin, Superadmin.

---

## C. TEST COVERAGE

| Area | Status |
|---|---|
| Recon semua halaman publik dan admin | ✅ Diuji |
| Responsif 10 viewport (1920→360), 6 halaman publik + 8 halaman admin | ✅ Diuji (140 kombinasi) |
| Editor: tab, unggah logo (7 jenis file), teks (7 input), undo/redo, draf | ✅ Diuji |
| Form Pesanan: kosong, tidak valid, batas, double-submit | ✅ Diuji |
| Pembayaran: QRIS/VA/e-wallet, tolak, sukses, DP + pelunasan, kedaluwarsa | ✅ Diuji |
| Lacak pesanan, halaman status, token salah | ✅ Diuji |
| Login: kosong, salah, tidak terdaftar, lockout, logout, back, replay cookie | ✅ Diuji |
| RBAC admin vs superadmin (halaman + API) | ✅ Diuji |
| Detail pesanan, transisi status (14 skenario), lembar produksi, ekspor CSV, filter | ✅ Diuji |
| Master data, pengaturan, akun (tambah, duplikat, nonaktif, self-deactivate) | ✅ Diuji |
| Keamanan dasar: XSS, SQLi string, IDOR, header, upload, webhook, traversal | ✅ Diuji |
| Keyboard Tab, kontras, label, heading | ✅ Diuji (sampel) |
| Chrome vs Edge | ✅ Diuji (sampel mobile menu, keyboard, kontras: identik) |
| Firefox / Safari | ⛔ NOT TESTED — tidak terpasang |
| Perangkat mobile fisik, virtual keyboard, orientasi | ⛔ NOT TESTED — hanya emulasi |
| Lighthouse, INP, build produksi | ⛔ NOT TESTED — hanya dev server; angka di bagian H dari Performance API |
| Koneksi terputus / API lambat | ⛔ NOT TESTED |
| Sesi berakhir 8 jam | ⛔ NOT TESTED (tidak menunggu 8 jam; dicek dari kode) |
| Multi-tab bersamaan | ⛔ NOT TESTED |
| Reset sandi akun lain, aktifkan kembali akun | ⛔ NOT TESTED (menghindari perubahan akun asli) |
| Tambah warna kain baru (`color_add`) | ⛔ NOT TESTED (menghindari data master permanen) |
| Pagination tabel admin dengan data besar | ⛔ NOT TESTED (data hanya ±25 pesanan) |

### Ringkasan test case (162)

| Kelompok | Total | Pass | Fail |
|---|---|---|---|
| Recon / render halaman | 12 | 9 | 3 |
| Responsif publik (6 hal × 10 vp, overflow) | 10* | 10 | 0 |
| Responsif admin (8 hal × 10 vp, overflow) | 10* | 7 | 3 |
| Editor (unggah, teks, undo/redo, draf) | 17 | 11 | 6 |
| Form Pesanan (validasi + submit) | 16 | 13 | 3 |
| Pembayaran & gateway | 9 | 7 | 2 |
| Lacak & status | 8 | 4 | 4 |
| Auth & sesi | 10 | 7 | 3 |
| RBAC | 9 | 9 | 0 |
| Status pesanan & CSV & filter | 18 | 15 | 3 |
| Superadmin (master, pengaturan, akun) | 14 | 9 | 5 |
| Keamanan API (selain di atas) | 21 | 10 | 11 |
| Aksesibilitas / keyboard / cross-browser | 8 | 2 | 6 |

\* satu test case per viewport.

> Jumlah PASS/FAIL per kelompok tidak selalu sama dengan jumlah bug, karena satu bug bisa menggagalkan beberapa test case dan sebaliknya.

---

## D. BUG REPORT

Lingkungan default untuk semua bug kecuali disebutkan lain: **Windows 11, Chrome (headless), 1366×900, dev server lokal**.

Bukti screenshot tersimpan di folder sementara:
`C:\Users\Aspire5\AppData\Local\Temp\claude\07e2b38e7eb72c53\bb6f0ac4-d4c3-46e1-8a06-52cb7874c42e\scratchpad\qa\shots\`
(folder ini bisa hilang setelah restart; salin bila perlu).

---

### BUG-01: Siapa pun bisa menandai pesanan orang lain sebagai "dibayar" tanpa login dan tanpa token

**Severity:** Critical
**Category:** Security / Logic

**Environment:** API, tanpa sesi, role: anonim

**Steps to Reproduce:**
1. Ambil nomor pesanan siapa saja (berurutan: `MLW-2611-0257`, `-0258`, …).
2. `POST /api/orders/MLW-2611-0258/pay` body `{"method":"va"}` **tanpa token**. Respons 200 berisi `gatewayRef`.
3. `POST /api/payments/simulate` body `{"gatewayRef":"<ref>","status":"sukses"}` tanpa autentikasi.

**Expected Result:** Langkah 2 ditolak (butuh `trackingToken`); simulator tidak bisa dipanggil publik.

**Actual Result:** Langkah 2 → `200 {"gatewayRef":"SIM-1795249145355-5b16e8ed","amount":1200000,…}`. Langkah 3 → `200 {"duplicate":false}`. Pesanan berubah menjadi `dibayar / dp_dibayar, amountPaid 1.200.000`. Tidak ada uang yang masuk.

**Evidence:** Output `api.js` (pesanan uji MLW-2611-0258). Kode: `app/api/orders/[code]/pay/route.ts` tidak memeriksa token; `app/api/payments/simulate/route.ts` hanya mati bila `NODE_ENV=production` **dan** `ENABLE_PAYMENT_SIMULATOR !== "true"`, padahal README menyuruh `"true"` untuk demo.

**Impact:** Produksi pesanan bisa dimulai tanpa pembayaran, pendapatan di dashboard salah, dan penyerang bisa menyabotase atau menghabiskan kapasitas produksi. Nomor pesanan berurutan, jadi semua pesanan bisa dienumerasi.

**Root Cause:** Endpoint `pay` tidak mewajibkan token. Endpoint simulator terbuka di dev dan di "produksi demo".

**Recommended Fix:**
- `pay`: wajibkan `token` dan cocokkan dengan `trackingToken` (bandingkan dengan `timingSafeEqual`).
- `simulate`: wajibkan token pesanan yang sama, atau batasi ke `NODE_ENV !== "production"` saja. Jangan aktifkan simulator di deploy yang bisa diakses publik.
- Pertimbangkan nomor pesanan yang tidak berurutan untuk tampilan publik.

**Reproducibility:** Always

---

### BUG-02: Pembatasan percobaan Lacak Pesanan bisa dilewati (header `X-Forwarded-For` dan request paralel)

**Severity:** High
**Category:** Security

**Steps to Reproduce:**
1. Kirim `POST /api/track` 5× dengan data salah dan header `X-Forwarded-For: 10.0.0.1` → percobaan ke-6 dan ke-7 dapat **429**.
2. Ganti header menjadi `X-Forwarded-For: 10.0.0.2` → kembali **404** (bisa mencoba lagi).
3. Kirim 6 request salah **secara paralel** tanpa header → semuanya **404**, tidak ada yang 429.

**Expected Result:** Batas 5 gagal per 15 menit tidak bisa dilewati.

**Actual Result:** Batas bisa direset dengan IP palsu, dan request paralel lolos karena hitungan dibaca sebelum kegagalan dicatat (race).

**Evidence:** Output `api.js`: `track 7 fails same XFF: 404,404,404,404,404,429,429`, `track with new XFF after lock: 404`, `track no XFF x6: 404,404,404,404,404,404`.

**Impact:** Membuka jalan brute-force kombinasi nomor pesanan + WhatsApp. Kalau berhasil, penyerang mendapat token dan melihat nama, WA, email, alamat, dan desain pelanggan.

**Root Cause:** `clientKey = request.headers.get("x-forwarded-for")` dipercaya mentah; pengecekan dan pencatatan tidak atomik.

**Recommended Fix:** Ambil IP dari proxy tepercaya saja (hop terakhir, atau `request.ip` platform). Catat percobaan secara atomik sebelum query, atau pakai rate limiter dengan penyimpanan bersama (Redis/DB). Tambahkan juga limit per nomor pesanan.

**Reproducibility:** Always

---

### BUG-03: Editor membolehkan lebih dari 10 teks, lalu checkout gagal tanpa petunjuk field

**Severity:** High
**Category:** Validation / UX

**Steps to Reproduce:**
1. `/editor` → tab Teks → tambahkan 12 teks (tombol "Tambah teks" tidak pernah dinonaktifkan).
2. Lanjut ke `/pesanan`, isi semua data dengan benar → "Bayar sekarang".

**Expected Result:** Editor membatasi teks di 10 (sama dengan server) atau memberi pesan jelas.

**Actual Result:** Muncul banner "Ada 1 isian yang perlu diperbaiki — Periksa kolom yang diberi tanda [!]", tetapi **tidak ada field yang ditandai**. Request ke `/api/orders` tidak pernah terkirim, dan pengguna buntu. Lewat API, server menjawab `"design.texts":"Too big: expected array to have <=10 items"` (bahasa Inggris, tanpa `[!]`).

**Evidence:** `shots/pay_1366_manytexts.png`; draf menyimpan 16 teks (output `text_and_order.js`).

**Impact:** Pelanggan tidak bisa menyelesaikan pesanan dan tidak tahu sebabnya, sehingga transaksi hilang.

**Root Cause:** `TextPanel` tidak mengecek `texts.length >= 10`; pesan di `designSchema.texts.max(10)` tidak dikustomisasi; form Pesanan tidak menampilkan error `design.*`.

**Recommended Fix:** Nonaktifkan "Tambah teks" dan tampilkan "Maksimal 10 teks" di editor. Beri pesan `[!]` pada skema. Di form Pesanan, tampilkan error `design.*` sebagai alert dengan tautan "Kembali ke editor".

**Reproducibility:** Always

---

### BUG-37: Kolom di dalam dialog (modal) hanya bisa diisi satu huruf; fokus lompat keluar setiap ketikan

> ✅ **SUDAH DIPERBAIKI (21 Nov 2026)** di `components/ui/Modal.tsx`. Uji ulang: Reset sandi dan Tambah warna kain terisi `abcdefgh` utuh; fokus awal ke dialog, Esc, dan klik latar tetap berfungsi pada modal Reset sandi, Keluar, dan Panduan ukuran.

**Severity:** High
**Category:** Functional
**Environment:** Superadmin, Chrome 1366×900. Dilaporkan pengguna setelah audit, lalu dikonfirmasi.

**Steps to Reproduce:**
1. Akun admin → "Reset sandi" → ketik `abcdefgh` di kolom sandi baru.
2. Master data → Palet warna → "Tambah warna" → ketik di "Nama warna".

**Expected Result:** Isi kolom = `abcdefgh`.

**Actual Result:** Isi kolom = `a`. Setelah huruf pertama, fokus pindah ke kotak dialog, sehingga pengguna harus mengklik kolom lagi setiap huruf.

**Evidence:** Output `modal.js`: `Reset sandi … isi field = "a", fokus akhir di: dialog`; `Tambah warna kain … = "a"`. Pembanding form "Tambah akun" (bukan modal) = `abcdefgh`.

**Root Cause:** `components/ui/Modal.tsx`: `useEffect(() => { dialogRef.current?.focus(); … }, [open, onClose])`. Semua pemanggil mengirim `onClose` sebagai arrow function baru setiap render, jadi effect berjalan ulang di tiap ketikan dan memanggil `focus()` ke dialog.

**Cakupan:** Hanya 2 modal yang punya kolom ketik (Reset sandi, Tambah warna kain). 4 modal lain (Keluar, Mulai produksi, Ganti kategori, Panduan ukuran) tidak punya input sehingga tidak terdampak. Uji ketik per huruf di 52 kolom non-modal lain (lacak, login, editor, pesanan, admin) semuanya normal.

**Recommended Fix:** Pisahkan effect fokus agar hanya bergantung pada `open`, dan simpan `onClose` di ref:
```tsx
const closeRef = useRef(onClose);
useEffect(() => { closeRef.current = onClose; });
useEffect(() => { if (open) dialogRef.current?.focus(); }, [open]);
useEffect(() => {
  if (!open) return;
  const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeRef.current();
  window.addEventListener("keydown", onKey);
  return () => window.removeEventListener("keydown", onKey);
}, [open]);
```

**Reproducibility:** Always

---

### BUG-04: Membuka editor lewat kartu katalog menghapus draf desain yang tersimpan tanpa peringatan

**Severity:** Medium
**Category:** Functional / Data loss

**Steps to Reproduce:**
1. Di `/editor`, tambahkan logo dan beberapa teks (draf tersimpan otomatis).
2. Kembali ke beranda, klik kartu katalog mana pun (`/editor?kategori=1`).

**Expected Result:** Draf dipertahankan, atau pengguna ditanya "Lanjutkan draf / mulai baru?".

**Actual Result:** Draf langsung diganti desain kosong (16 teks → 0). Autosave menimpa `localStorage`, jadi draf lama hilang permanen.

**Evidence:** Output `text_and_order.js`: `after VEST … texts 16` → `goto ?kategori=1 … texts 0`.

**Root Cause:** `EditorApp.tsx:54` melewati pemulihan draf bila `initialCategoryId` ada; autosave lalu menimpa.

**Recommended Fix:** Bila ada draf yang sudah dimodifikasi, tampilkan modal pilihan, atau pulihkan draf lalu panggil `selectCategory()` (yang sudah punya dialog konfirmasi).

**Reproducibility:** Always

---

### BUG-05: Logout tidak mencabut sesi; cookie lama tetap berlaku sampai 8 jam

**Severity:** Medium
**Category:** Security

**Steps to Reproduce:**
1. Login superadmin, salin cookie `mlw_admin`.
2. Klik Keluar → konfirmasi (diarahkan ke `/admin/login`).
3. Pasang kembali cookie lama → buka `/admin/pesanan`.

**Expected Result:** Ditolak, diarahkan ke login.

**Actual Result:** Halaman admin terbuka (`replayed old cookie: /admin/pesanan`).

**Evidence:** Output `logout.js`. Token berbentuk `email|expires|hmac` tanpa penyimpanan di server. Email admin juga terbaca jelas di cookie.

**Impact:** Cookie yang bocor (komputer bersama, malware, log proxy) tetap bisa dipakai walau admin sudah logout. Tidak ada cara mencabut sesi.

**Recommended Fix:** Simpan ID sesi di DB (tabel `Session`) dan hapus saat logout, atau tambahkan `sessionVersion` per admin yang dinaikkan saat logout/reset sandi lalu dicek di `readToken`.

**Reproducibility:** Always

---

### BUG-06: Security header tidak ada (CSP, X-Frame-Options, HSTS, Referrer-Policy); `X-Powered-By` bocor

**Severity:** Medium
**Category:** Security

**Steps to Reproduce:** `GET /` dan lihat header respons.

**Actual Result:** `content-security-policy=- ; x-frame-options=- ; x-content-type-options=- ; strict-transport-security=- ; referrer-policy=- ; permissions-policy=- ; x-powered-by=Next.js`

**Impact:** Panel admin bisa di-iframe (clickjacking pada tombol "Ubah status" atau "Nonaktifkan"), dan tidak ada lapisan pertahanan XSS. Token pelacakan ada di URL (`?token=`) tanpa Referrer-Policy, sehingga bisa bocor lewat header Referer ke situs eksternal (mis. wa.me).

**Recommended Fix:** Tambahkan `headers()` di `next.config.ts`: `X-Frame-Options: DENY` (atau CSP `frame-ancestors 'none'`), `X-Content-Type-Options: nosniff`, `Referrer-Policy: no-referrer` (penting untuk URL ber-token), HSTS di produksi, dan CSP dasar. Matikan `poweredByHeader`.

**Reproducibility:** Always

---

### BUG-07: Filter SVG berbahaya bisa dilewati

**Severity:** Medium
**Category:** Security

**Steps to Reproduce:** `POST /api/uploads` (tanpa login) dengan file:
1. `<svg xmlns=… /onload=alert(1)>` → **200 diterima**
2. `<a xlink:href="javascript&#58;alert(1)">` → **200 diterima**
3. `<foreignObject><iframe src=…>` → **200 diterima**
4. `<svg><script>` → 400 ditolak (hanya kasus paling sederhana yang tertangkap)

**Expected Result:** Semua SVG aktif ditolak atau disanitasi.

**Actual Result:** Lihat di atas. File juga tampil rusak di editor (`shots/ed_gambar.png`, ikon gambar pecah untuk `evil2.svg`).

**Impact:** Saat dibuka lewat `/api/uploads/…`, ada `CSP: sandbox` sehingga browser aman. Tetapi admin dan tim produksi akan mengunduh file logo lalu membukanya di browser lokal atau aplikasi desain, dan pada saat itu skrip bisa berjalan.

**Root Cause:** `assertSafeSvg` memakai regex `\son\w+\s*=` (butuh spasi; `/onload` lolos), tidak menangani entity, dan tidak memblokir `foreignObject`.

**Recommended Fix:** Sanitasi dengan DOMPurify (`USE_PROFILES: {svg: true}`) di server, atau rasterisasi SVG menjadi PNG untuk pratinjau dan simpan aslinya sebagai unduhan dengan `Content-Disposition: attachment`.

**Reproducibility:** Always

---

### BUG-08: SVG berisi skrip lolos di editor dan baru ditolak saat "Bayar sekarang"; logo lain ikut terunggah berulang

**Severity:** Medium
**Category:** UX / Validation

**Steps to Reproduce:**
1. Editor → Gambar → unggah `logo600.png` lalu `evil.svg` (berisi `<script>`). Keduanya diterima tanpa pesan.
2. Isi seluruh form Pesanan → Bayar sekarang.

**Actual Result:** Baru di langkah terakhir muncul "[!] File SVG berisi skrip dan tidak diizinkan". PNG sudah terunggah (`200 /api/uploads`), lalu SVG gagal (400). Setiap percobaan ulang mengunggah PNG lagi dan meninggalkan file yatim di `storage/uploads`.

**Evidence:** Output `flow.js desktop badsvg`.

**Recommended Fix:** Jalankan validasi yang sama di klien saat file dipilih (atau unggah langsung saat dipilih dan simpan `fileName`), lalu tampilkan error di panel Gambar.

**Reproducibility:** Always

---

### BUG-09: Endpoint unggah publik tanpa batas laju dan tanpa kuota; file yatim tidak pernah dibersihkan

**Severity:** Medium
**Category:** Security / Performance

**Steps:** 5 `POST /api/uploads` paralel tanpa autentikasi → semuanya `200`. Tidak ada keterkaitan file ke pesanan sampai checkout.

**Impact:** Penyerang bisa memenuhi disk server (5 MB per request, tanpa batas). Polyglot PNG+HTML juga diterima (hanya magic bytes yang dicek), walau `nosniff` mengurangi risikonya.

**Recommended Fix:** Rate limit per IP, kuota total, cron untuk menghapus file yang tidak terhubung ke `OrderAsset` setelah 24 jam, dan decode ulang gambar raster (mis. `sharp`) untuk membuang data sisipan.

**Reproducibility:** Always

---

### BUG-10: Server menerima data desain yang tidak valid (teks hanya spasi, font/warna/posisi bebas, warna kosong, file logo tidak ada)

**Severity:** Medium
**Category:** Validation / Data integrity

**Steps to Reproduce:** `POST /api/orders` dengan modifikasi pada payload valid:

| Payload | Hasil |
|---|---|
| `texts:[{content:"   "}]` | 200, pesanan dibuat (juga bisa **lewat UI**: MLW-2611-0268) |
| `font:"<b>Comic</b>", color:"Ungu Neon", position:"dimana-saja"` | 200 |
| `colors:{}` | 200 |
| `colors:{"<x>":"Navy"}` | 200 |
| `images:[{fileName:"../../.env"}]` | 200 (tersimpan sebagai aset pesanan) |

**Expected Result:** 400 dengan pesan field.

**Impact:** Admin menerima instruksi produksi yang tidak mungkin dikerjakan (font atau warna benang yang tidak ada, teks kosong, bagian garmen tanpa warna). Logo milik pelanggan lain juga bisa dirujuk lewat nama file.

**Root Cause:** `designTextSchema` memakai `.min(1)` tanpa `.trim()`; `font/color/position` hanya `z.string()`; `colors` adalah `record` bebas; `fileName` tidak dicek keberadaan atau kepemilikannya.

**Recommended Fix:** `content: z.string().trim().min(1)`; `z.enum()` dari `FONTS / THREAD_COLORS / POSITION_KEYS`; validasi kunci `colors` terhadap bagian garmen produk dan wajibkan semuanya; regex `^[a-f0-9]{32}\.(png|jpg|svg)$` plus cek file ada.

**Reproducibility:** Always

---

### BUG-11: Ukuran di daftar "nama per orang" tidak dicocokkan dengan jumlah per ukuran

**Severity:** Medium
**Category:** Logic

**Steps:** `POST /api/orders` dengan `quantities:{M:12}`, `namePerPerson:true`, `names` = 12 × `{size:"XXXL"}`.

**Actual Result:** 200 (MLW-2611-0267), total Rp 2.310.000 tanpa tambahan XXXL.

**Expected Result:** Ditolak: jumlah nama per ukuran harus sama dengan `quantities`.

**Impact:** Lembar produksi kontradiktif (12 M vs 12 XXXL), dan harga bisa dimanipulasi (ukuran besar tanpa biaya tambahan).

**Recommended Fix:** Di `superRefine`, hitung `names` per `size` dan bandingkan dengan `quantities[size]`.

**Reproducibility:** Always

---

### BUG-12: Semua pengunjung berbagi satu kunci rate-limit ("lokal") bila tanpa proxy, sehingga satu orang bisa mengunci Lacak untuk semua

**Severity:** Medium
**Category:** Security / Availability

**Steps to Reproduce:**
1. Kirim 5 percobaan lacak yang salah tanpa header `X-Forwarded-For`.
2. Dari browser lain, lacak dengan nomor + WA **yang benar** (MLW-2611-0258 / 0812 5555 0199).

**Actual Result:** Pengguna sah mendapat "[!] Terlalu banyak percobaan. Coba lagi dalam 15 menit".

**Evidence:** Output `post.js`: `lacak [mlw-2611-0258|0812 5555 0199] -> [!] Terlalu banyak percobaan…`

**Recommended Fix:** Sama seperti BUG-02. Jangan fallback ke kunci global.

**Reproducibility:** Always (tanpa reverse proxy)

---

### BUG-13: Lockout login berbasis email saja, sehingga siapa pun bisa mengunci akun admin selama 15 menit

**Severity:** Medium
**Category:** Security

**Steps:** 5× `POST /api/admin/login` dengan email admin dan sandi acak → percobaan ke-6: `429 Akun dikunci 15 menit`, **termasuk untuk pemilik akun yang memasukkan sandi benar**. Diuji pada email dummy `lock-test@example.com` agar akun asli tidak terkunci.

**Impact:** Admin bisa dikunci dari panel terus-menerus (DoS). Pesan "Sisa N percobaan" juga muncul untuk email yang tidak terdaftar. Penghitung ada di memori, sehingga hilang saat server restart dan tidak berlaku lintas instance.

**Recommended Fix:** Limit berbasis kombinasi IP + email, backoff progresif alih-alih kunci keras, dan simpan penghitung di DB/Redis.

**Reproducibility:** Always

---

### BUG-14: `/admin/pesanan?status=a&status=b` membuat halaman crash (500)

**Severity:** Medium
**Category:** Functional

**Steps:** Login admin → buka `/admin/pesanan?status=dibayar&status=selesai`.

**Actual Result:** HTTP 500, "This page couldn't load". Console: `(status ?? "").split is not a function`.

**Root Cause:** `searchParams.status` berupa array bila parameternya berulang.

**Recommended Fix:** `const raw = Array.isArray(s) ? s.join(",") : s ?? ""`.

**Reproducibility:** Always

---

### BUG-15: Halaman Pengaturan admin rusak di layar ≤375 px

**Severity:** Medium
**Category:** Responsive

**Environment:** 375×812 dan 360×800, Superadmin

**Actual Result:** Label terjepit menjadi satu kata per baris, input menutupi teks deskripsi, tombol "Simpan" keluar dari kartu dan terpotong, dan ada scroll horizontal (`scrollWidth 381 > 360`).

**Evidence:** `shots/vp_360_admin_pengaturan.png`

**Recommended Fix:** Di bawah `sm`, ubah baris menjadi `flex-col`: label dan deskripsi di atas, lalu input + satuan + tombol di bawahnya dengan `w-full`.

**Reproducibility:** Always

---

### BUG-16: Halaman status pesanan yang belum dibayar tidak punya tombol "Lanjutkan pembayaran"

**Severity:** Medium
**Category:** UX

**Steps:** Buat pesanan, tutup tab pembayaran, buka `/status/MLW-…?token=…` (atau lewat Lacak).

**Actual Result:** Status "Menunggu pembayaran" tanpa tombol bayar, tanpa batas waktu, dan tanpa info skema DP. Satu-satunya aksi adalah "Chat admin via WhatsApp". Pesanan DP yang perlu pelunasan juga tidak punya tautan pelunasan.

**Evidence:** `shots/status.png`

**Recommended Fix:** Bila `status=menunggu_pembayaran` atau `paymentState=dp_dibayar`, tampilkan tombol ke `/pembayaran/{code}?token=…` beserta sisa tagihan dan tenggat.

**Reproducibility:** Always

---

### BUG-17: Kebijakan kata sandi admin lemah ("12345678" diterima)

**Severity:** Medium
**Category:** Security

**Steps:** Superadmin → Akun admin → Tambah akun dengan sandi `12345678` → akun dibuat (`qa.temp.…@example.com`, sudah dinonaktifkan).

**Recommended Fix:** Minimal 12 karakter atau cek terhadap daftar sandi umum (zxcvbn), dan wajibkan ganti sandi saat login pertama.

**Reproducibility:** Always

---

### BUG-18: Body JSON rusak menghasilkan 500, bukan 400

**Severity:** Low
**Category:** Functional

**Steps:** `POST /api/track` atau `/api/orders` dengan body `{bad`.
**Actual:** `500 "Terjadi kesalahan di server"` dan stack trace tercatat di log server.
**Fix:** Tangkap `SyntaxError` di `handle()` lalu kembalikan 400.
**Reproducibility:** Always

---

### BUG-19: Detail pesanan admin melebar horizontal di mobile bila catatan pelanggan berisi teks panjang tanpa spasi

**Severity:** Low
**Category:** Responsive
**Environment:** 390/375/360 px, `/admin/pesanan/MLW-2611-0269`
**Actual:** `scrollWidth 405 > 360`; nilai catatan keluar dari kartu.
**Evidence:** `shots/vp_375_admin_pesanan_MLW-2611-0269.png`
**Fix:** `break-words` / `overflow-wrap:anywhere` dan `min-w-0` pada kolom nilai.
**Reproducibility:** Always

---

### BUG-20: Menu mobile tidak menutup setelah mengetuk tautan anchor

**Severity:** Low
**Category:** Responsive / UX
**Environment:** 375×812, Chrome dan Edge
**Steps:** Beranda → ☰ → "Cara Pesan".
**Actual:** Halaman menggulir ke bagian tujuan, tetapi menu tetap terbuka dan menutupi judul bagian (`aria-expanded=true`). Scroll body juga tidak dikunci saat menu terbuka.
**Evidence:** `shots/menu_after_anchor.png`
**Fix:** Tutup menu pada `onClick` setiap tautan (atau saat `hashchange`).
**Reproducibility:** Always

---

### BUG-21: Halaman 404 memakai bawaan Next.js (bahasa Inggris, tanpa navigasi)

**Severity:** Low
**Category:** UX
**Steps:** Buka `/halaman-tidak-ada`, atau `/status/…` atau `/pembayaran/…` dengan token salah.
**Actual:** "404 This page could not be found." tanpa navbar dan tanpa tautan ke beranda atau Lacak.
**Evidence:** `shots/recon_halaman-tidak-ada.png`
**Fix:** Buat `app/not-found.tsx` berbahasa Indonesia dengan tautan Beranda dan Lacak pesanan. Untuk token salah, sarankan pemakaian form Lacak.
**Reproducibility:** Always

---

### BUG-22: Master data: perubahan yang belum disimpan hilang tanpa peringatan saat pindah halaman

**Severity:** Low
**Category:** UX
**Steps:** Ubah harga → klik "Dashboard" di sidebar.
**Actual:** Langsung berpindah halaman tanpa dialog; perubahan hilang.
**Fix:** Pasang `beforeunload` dan intercept navigasi bila ada perubahan (atau tampilkan banner "Ada perubahan belum disimpan").
**Reproducibility:** Always

---

### BUG-23: Pesan validasi salah konteks atau berbahasa Inggris

**Severity:** Low
**Category:** Validation

| Input | Pesan yang muncul | Seharusnya |
|---|---|---|
| Master data harga `-1000` | "Masukkan angka tanpa huruf" + toast "belum berupa angka" | "Harga tidak boleh negatif" |
| Master data `12.5` | "belum berupa angka" | "Harus bilangan bulat" |
| Pengaturan batas bayar `-5` | "Masukkan angka jam" | "Minimal 1 jam" |
| API status `dibatalkan` | `Invalid option: expected one of …` | Pesan `[!]` berbahasa Indonesia |
| API >10 teks | `Too big: expected array…` | `[!] Maksimal 10 teks` |

**Fix:** Parsing `"-1000"` dengan `Number()` sebelum validasi agar aturan `min(0)` yang terpicu, dan set pesan kustom pada semua `enum/max` Zod.
**Reproducibility:** Always

---

### BUG-24: Cookie sesi admin tidak diberi flag `Secure`

**Severity:** Low
**Category:** Security
**Evidence:** Cookie teramati `secure:false`. `server/auth/session.ts` tidak menyetel `secure`, jadi di produksi HTTPS pun cookie bisa terkirim lewat HTTP.
**Fix:** `secure: process.env.NODE_ENV === "production"` dan prefiks `__Host-`.
**Reproducibility:** Always (kode)

---

### BUG-25: Tombol "Nonaktifkan" tampil untuk akun sendiri; menonaktifkan akun lain tanpa konfirmasi

**Severity:** Low
**Category:** UX
**Steps:** Akun admin → baris "(kamu)" → Nonaktifkan → toast error "[!] Kamu tidak bisa menonaktifkan akunmu sendiri". Pada akun lain, satu klik langsung menonaktifkan tanpa dialog.
**Fix:** Sembunyikan atau nonaktifkan tombol untuk akun sendiri, dan tambahkan dialog konfirmasi untuk aksi nonaktifkan.
**Reproducibility:** Always

---

### BUG-26: Input jumlah ukuran mengubah nilai diam-diam

**Severity:** Low
**Category:** Validation
**Steps:** Ketik di kolom S: `1.5` → menjadi **15**; `-5` → **5**; `1000` → **999**.
**Impact:** Salah ketik desimal menjadi pesanan 10× lipat tanpa peringatan.
**Fix:** Tolak karakter non-digit dengan pesan, atau tampilkan hint "Maksimal 999" saat nilai dipotong.
**Reproducibility:** Always

---

### BUG-27: Lacak menolak nomor pesanan dengan spasi sebagai pemisah

**Severity:** Low
**Category:** Validation
**Steps:** Lacak dengan `MLW 2611 0258`.
**Actual:** "[!] Format nomor pesanan: MLW-2611-0042", karena spasi dibuang menjadi `MLW26110258`. Huruf kecil sudah diterima.
**Fix:** Normalisasi: hapus semua non-alfanumerik, lalu sisipkan tanda hubung pada posisi 3 dan 7.
**Reproducibility:** Always

---

### BUG-28: Judul halaman generik dan struktur heading tidak lengkap

**Severity:** Low
**Category:** Accessibility / SEO
**Actual:**
- `/editor`, `/pesanan`, `/lacak`, `/gateway/*`, `/admin/*`, dan halaman 404 memakai judul sama "MULAWARMANESIA | Seragam PDH & VEST Custom Samarinda".
- `/editor` tidak punya `<h1>`.
- `/panduan-ukuran` dimulai dari `<h2>` tanpa `<h1>`.
**Fix:** `export const metadata = { title: "…" }` per halaman, dan satu `<h1>` per halaman.
**Reproducibility:** Always

---

### BUG-29: Target sentuh di bawah 24 px (WCAG 2.5.8)

**Severity:** Low
**Category:** Accessibility
**Environment:** 360–768 px
**Actual:**
- Link footer tingginya 20 px
- Tombol zoom "100%" di editor 40×16
- "Panduan ukuran →" 20 px
- Link nomor pesanan di tabel admin 17 px
- Checkbox "nama per orang" 15×16
**Fix:** `min-h-[44px]` / `py-2` pada link dan tombol kecil di mobile.
**Reproducibility:** Always

---

### BUG-30: Tombol Back setelah pembayaran sukses kembali ke simulator gateway yang masih menampilkan tombol bayar

**Severity:** Low
**Category:** UX
**Steps:** Bayar sukses → halaman "Pesanan berhasil" → tekan Back.
**Actual:** Halaman simulator muncul lagi dengan tombol "Bayar sukses / Tolak / Kedaluwarsakan". Klik ulang tidak berbahaya (idempoten, langsung ke halaman berhasil), tetapi membingungkan.
**Fix:** `router.replace()` saat redirect dari gateway, dan tampilkan "Pembayaran ini sudah diproses" bila `gatewayRef` bukan `pending`.
**Reproducibility:** Always

---

### BUG-31: Aksesibilitas editor dan navigasi keyboard

**Severity:** Low
**Category:** Accessibility
**Actual:** Pratinjau baju (SVG) tidak punya `role="img"`, `aria-label`, atau `<title>`. Tidak ada skip link ke konten utama. Pengguna pembaca layar tidak tahu desain yang sedang dibuat.
**Fix:** `role="img" aria-label="Pratinjau PDH Organisasi tampak depan, badan Navy, logo dada kiri"`, dan skip link di layout.
**Reproducibility:** Always

---

### BUG-32: Kontak di footer tidak bisa diklik

**Severity:** Low
**Category:** UX
**Actual:** "WA 0812 5555 0199", "halo@mulawarmanesia.id", dan alamat berupa teks biasa. Di header checkout, "Bantuan: WA 0812 5555 0199" juga bukan tautan.
**Fix:** `wa.me/…`, `mailto:`, dan tautan Google Maps.
**Reproducibility:** Always

---

### BUG-33: Admin tidak bisa membatalkan pesanan; teks status menyesatkan

**Severity:** Low
**Category:** UX / Missing feature
**Actual:** Detail pesanan yang belum dibayar menampilkan "Status menunggu pembayaran tidak bisa diubah lagi.", padahal status itu akan berubah setelah dibayar. Status `dibatalkan` ada di enum dan filter, tetapi tidak ada UI atau API untuk membatalkan.
**Fix:** Ubah teks menjadi "Menunggu pelanggan membayar". Tambahkan aksi "Batalkan pesanan" dengan alasan (dan tangani refund untuk yang sudah membayar).
**Reproducibility:** Always

---

### BUG-34: Kontras teks catatan ringkasan di bawah 4.5:1

**Severity:** Cosmetic
**Category:** Accessibility
**Actual:** "Belum termasuk tambahan ukuran besar…" `rgb(107,107,107)` di atas `rgb(252,225,223)` = **4.31:1** (teks kecil).
**Fix:** Gelapkan ke ±`#555`.

---

### BUG-35: Teks dropdown posisi/teknik logo terpotong di desktop

**Severity:** Cosmetic
**Category:** UI
**Environment:** 1366×768, Editor → Gambar
**Actual:** "Dada k…", "Bordir …".
**Evidence:** `shots/ed_gambar.png`
**Fix:** Susun dropdown vertikal di panel 340 px, atau perlebar panel.

---

### BUG-36: Toast error menumpuk dan menduplikasi pesan inline

**Severity:** Cosmetic
**Category:** UI
**Steps:** Pengaturan / Akun → simpan input salah beberapa kali.
**Actual:** Setiap klik menambah toast baru yang isinya sama dengan error di bawah field (3–5 toast bertumpuk).
**Fix:** Untuk error validasi, cukup tampilkan inline. Bila tetap memakai toast, dedupe berdasarkan pesan.

---

## E. UI/UX REVIEW

**Kekuatan**
- Gaya neo-brutalism konsisten di publik maupun admin (border tebal, shadow keras, satu warna aksen merah).
- Stepper checkout 1–4 jelas. Ringkasan harga sticky di desktop dan bar sticky di mobile.
- Pesan error berbahasa Indonesia, diawali `[!]` (tidak hanya mengandalkan warna), dan muncul di bawah field yang tepat. Fokus dipindah ke field error pertama.
- Dialog konfirmasi ada untuk logout dan ganti kategori, dan bisa ditutup dengan Esc.
- Fokus keyboard terlihat (outline 3 px) di navbar.

**Masalah dan rekomendasi**
1. **Alur pemulihan pembayaran** (BUG-16): pelanggan yang menutup tab tidak punya jalan kembali untuk membayar.
2. **Kesalahan baru muncul di langkah terakhir** (BUG-03, BUG-08): validasi desain sebaiknya dilakukan di editor, bukan di form Pesanan.
3. **Draf hilang** (BUG-04) mengurangi kepercayaan pada fitur autosave.
4. Ringkasan di form Pesanan tidak menampilkan teks yang ditambahkan (hanya "1 gambar"). Tampilkan daftar dekorasi lengkap.
5. Label "Total dibayar Rp 1.200.000" di halaman pembayaran DP rancu. Gunakan "Dibayar sekarang (DP 50%)" + "Total pesanan".
6. ~~Halaman `/pesanan` bisa dibuka langsung tanpa pernah mendesain.~~ **Koreksi:** keliru. Tanpa draf, `/pesanan` menampilkan "Belum ada desain" + tombol "Buka editor". Saat recon, draf sudah terbentuk dari kunjungan ke `/editor` sebelumnya. ✅ PASS.
7. Ekspor CSV hanya berisi 8 kolom (tanpa WA, email, organisasi, alamat). Kurang berguna untuk operasional.
8. Judul tab browser yang sama di semua halaman menyulitkan pengguna dengan banyak tab (BUG-28).

---

## F. DESKTOP VS MOBILE COMPARISON

| Halaman | 1920–1024 | 768 (tablet) | 412–360 (ponsel) |
|---|---|---|---|
| Beranda | OK | OK | OK; menu tidak menutup (BUG-20); target sentuh footer kecil |
| Editor | OK; dropdown terpotong (BUG-35) | OK, panel menumpuk | OK; tombol zoom 40×16 |
| Pesanan | OK | OK | OK; bar sticky "Bayar →" berfungsi |
| Lacak / Status / Panduan | OK | OK | OK |
| Admin dashboard, pesanan, produksi, master, akun, log | OK | Sidebar menjadi hamburger, OK | OK; tabel bisa di-scroll |
| Admin detail pesanan | OK | OK | **Overflow** ≤390 (BUG-19) |
| Admin pengaturan | OK | OK | **Layout rusak** ≤375 (BUG-15) |

Tidak ada horizontal overflow pada **semua halaman publik di 10 viewport**. Chrome dan Edge (Chromium) berperilaku identik pada sampel yang diuji.

---

## G. VALIDATION & BUSINESS LOGIC

### Form Pesanan (UI)
| Field | Uji | Hasil |
|---|---|---|
| Semua kosong | Submit | ✅ 6 pesan error per field, fokus ke field pertama |
| Jumlah 0 pcs | Submit | ✅ "Total 0 pcs. Minimal order 12 pcs, tambah 12 lagi" |
| Jumlah | `-5`, `abc`, `1.5`, `1000`, `007` | ⚠️ diubah diam-diam (BUG-26) |
| Nama | `A`, `Budi123`, `<script>`, spasi, 61 char | ✅ ditolak dengan pesan tepat |
| Nama | `O'Neil Jr.`, `Ñandú Ålesund` | ✅ diterima |
| WhatsApp | `123`, `08123`, `+1…`, 15 digit, huruf | ✅ ditolak |
| WhatsApp | `0812-5555-0199`, `+62 812…` | ✅ diterima dan dinormalisasi `62…` |
| Email | `x@` (API) | ✅ ditolak; spasi di tepi di-trim |
| Catatan | 400 karakter | ✅ error "Maksimal 300 karakter" (tanpa `maxlength`, input tidak dipotong) |
| Kirim ke alamat | alamat/kota/kode pos kosong | ✅ 3 error |
| Persetujuan, skema | kosong | ✅ |
| Double-click "Bayar sekarang" | | ✅ hanya 1 pesanan dibuat |

### Editor
| Uji | Hasil |
|---|---|
| Unggah teks berekstensi .png | ✅ "File gambar rusak" |
| PDF | ✅ "Format .pdf belum didukung" |
| 6 MB | ✅ "File 6,0 MB. Maksimal 5 MB" |
| PNG 1×1 | ✅ "Resolusi 1 px terlalu kecil" |
| PNG 600×600 | ✅ diterima |
| SVG berisi skrip | ❌ diterima di editor (BUG-08) |
| Teks kosong / emoji / 41 char | ✅ ditolak |
| Teks hanya spasi | ❌ diterima (BUG-10) |
| > 10 teks | ❌ (BUG-03) |
| Undo / Redo / Ctrl+Z | ✅ |
| Ganti kategori setelah modifikasi | ✅ dialog konfirmasi |
| `?kategori=999` / `?kategori=<x>` | ✅ jatuh ke kategori default, tidak error |

### Harga dan pembayaran
| Uji | Hasil |
|---|---|
| 12 pcs PDH Organisasi + 1 bordir | ✅ (185.000 + 15.000) × 12 = **Rp 2.400.000**, DP 1.200.000 |
| Tanpa logo | ✅ 185.000 × 12 = 2.220.000 |
| Kirim `total:1, unitPrice:1` dari klien | ✅ diabaikan, harga dihitung server |
| Kategori/bahan tidak cocok | ✅ 400 |
| Kota tidak dikenal | ✅ 400 |
| Tolak pembayaran → coba lagi | ✅ ref baru dibuat, banner "Pembayaran ditolak" |
| Webhook dikirim ulang | ✅ idempoten (`duplicate:true`) |
| Webhook tanda tangan salah | ✅ 401 |
| DP dibayar → maju ke `siap_kirim` | ✅ ditolak "Sisa tagihan DP belum dibayar" |
| Draf dihapus setelah pembayaran sukses | ✅ |
| Kedaluwarsakan pembayaran → bayar lagi | ✅ ref baru, pesanan masih bisa dibayar |

### Mesin status (admin)
Maju satu tahap ✅ · lompat tahap ❌ ditolak 409 ✅ · mundur ditolak ✅ · status sama ditolak ✅ · `perlu_revisi` tanpa alasan atau alasan hanya spasi ditolak ✅ · `dikirim` tanpa kurir/resi ditolak ✅ · pesanan belum dibayar tidak bisa diubah ✅ · riwayat status mencatat admin dan waktu ✅.

### Superadmin
| Uji | Hasil |
|---|---|
| Pengaturan `0`, `-5`, `abc`, `1.5`, `999999`, kosong | ✅ ditolak (pesan kadang kurang tepat, BUG-23); nilai asli tidak berubah |
| Master harga negatif, huruf, kosong, 999.999.999, desimal | ✅ ditolak, tidak tersimpan |
| Akun: kosong, email salah, sandi 7 char, email duplikat, nama spasi | ✅ ditolak |
| Akun sandi `12345678` | ⚠️ diterima (BUG-17) |
| Nonaktifkan akun sendiri | ✅ ditolak server (BUG-25 untuk UI) |
| Login akun nonaktif | ✅ ditolak |

---

## H. SECURITY & PERFORMANCE

### Keamanan — hasil
| Uji | Hasil |
|---|---|
| Bayar pesanan orang lain tanpa token | ❌ **Critical** (BUG-01) |
| `GET /api/orders/{code}` tanpa token / token salah | ✅ 404 |
| `/status`, `/pembayaran` token salah | ✅ 404 |
| Rate limit lacak | ❌ (BUG-02, BUG-12) |
| XSS di teks desain `<img src=x onerror=…>` di admin detail dan lembar produksi | ✅ di-escape, tidak ada dialog |
| SQLi string `MLW-2611-0258' OR 1=1--` di Lacak | ✅ ditolak format; Prisma memakai query berparameter |
| Path traversal `/api/uploads/..%2F..%2F.env`, `/admin/pesanan/../../etc` | ✅ 404 |
| Admin API tanpa login | ✅ 401/405 |
| Admin (bukan super) ke halaman superadmin | ✅ dialihkan ke `/admin` |
| Admin (bukan super) ke API superadmin | ✅ 403 |
| Akun dinonaktifkan → sesi langsung tidak berlaku | ✅ (peran dicek dari DB tiap request) |
| Logout → back | ✅ kembali ke login |
| Replay cookie setelah logout | ❌ (BUG-05) |
| Cookie `HttpOnly`, `SameSite=Lax` | ✅ / `Secure` ❌ (BUG-24) |
| CSRF | ✅ cukup: `SameSite=Lax` + body JSON; tidak ada endpoint GET yang mengubah data |
| Security header | ❌ (BUG-06) |
| Upload SVG/polyglot, kuota | ❌ (BUG-07, BUG-09) |
| CSV formula injection | ✅ kolom CSV tidak memuat field teks bebas (nama sudah di-regex) |
| Error 500 tidak membocorkan stack ke klien | ✅ pesan generik |
| Lockout login | ⚠️ ada, tetapi bisa disalahgunakan (BUG-13) |

### Performa (dev server, cache hangat, 1366×768, diukur dengan Performance API, **bukan** Lighthouse)

| Halaman | TTFB | FCP | LCP | CLS | Load |
|---|---|---|---|---|---|
| `/` | 381 ms | 436 ms | 436 ms | 0 | 464 ms |
| `/editor` | 147 | 196 | 196 | 0 | 277 |
| `/pesanan` | 110 | 168 | 388 | 0 | 211 |
| `/lacak` | 71 | 120 | 120 | 0 | 154 |
| `/panduan-ukuran` | 152 | 208 | 208 | 0 | 214 |
| `/admin/login` | 64 | 112 | 112 | 0 | 123 |
| `/admin` (dashboard) | 61 | 124 | 644 | 0 | 188 |

- CLS 0 di semua halaman yang diukur.
- Kompilasi pertama di dev (cold) memakan beberapa detik. Ini wajar untuk dev dan bukan angka produksi.
- **INP tidak diukur**, dan Lighthouse tidak dijalankan. Untuk penilaian lomba, jalankan `npm run build && npm start` lalu Lighthouse di Chrome DevTools.
- Console: tidak ada JS error di alur normal. Satu warning berulang dari Next.js: `scroll-behavior: smooth` pada `<html>` (tambahkan `data-scroll-behavior="smooth"`).
- Network: tidak ada request gagal atau duplikat di alur normal. Halaman pembayaran melakukan polling status (wajar).

---

## I. MISSING FEATURES & IMPROVEMENTS

**Bug yang terbukti:** BUG-01 s.d. BUG-36 di atas.

**Potensi masalah (belum dibuktikan):**
- Rate-limit dan lockout disimpan di memori, sehingga tidak bekerja di deployment multi-instance atau serverless.
- `expireOverdueOrders()` dipanggil di jalur baca (lazy). Bila tidak ada traffic, status kedaluwarsa tidak tercatat tepat waktu di dashboard.
- Token pelacakan ada di query string, jadi bisa tercatat di log server/proxy dan history browser.
- Kode admin tidak memvalidasi bahwa file aset pesanan benar-benar ada saat lembar produksi dicetak.

**Rekomendasi pengembangan:**
1. Notifikasi email/WhatsApp otomatis saat status berubah (sekarang "Invoice dan tautan lacak dikirim ke sini" tetapi tidak ada pengiriman email yang teramati).
2. Pembatalan dan refund pesanan oleh admin.
3. Pencarian pesanan berdasarkan nama/nomor/WA di admin (saat ini hanya filter status).
4. Revisi desain oleh pelanggan setelah status `perlu_revisi` (alur unggah ulang).
5. Hapus/arsip akun admin dan reset sandi mandiri (lupa sandi).
6. Halaman 404/500 bermerek.
7. Pembersihan file unggahan yatim dan backup `storage/uploads`.

**Belum bisa diverifikasi:** Firefox/Safari, perangkat fisik, virtual keyboard, orientasi landscape, koneksi putus, performa build produksi, sesi kedaluwarsa 8 jam.

---

## J. PRIORITY FIX BACKLOG

| ID | Deskripsi | Severity | Dampak | Rekomendasi | Kompleksitas |
|---|---|---|---|---|---|
| **P0-1** | BUG-01 bayar tanpa token + simulator publik | Critical | Pesanan "lunas" palsu | Wajibkan token di `/pay` dan `/simulate`; matikan simulator di deploy publik | S |
| **P0-3** | BUG-37 kolom di modal hanya terisi 1 huruf (reset sandi, tambah warna) | High | Superadmin tidak bisa reset sandi / tambah warna dengan normal | Fokus modal hanya saat `open` berubah | S |
| **P0-2** | BUG-02 / BUG-12 rate-limit lacak | High | Enumerasi data pribadi pelanggan / DoS | IP tepercaya + pencatatan atomik + limit per nomor | M |
| **P1-1** | BUG-03 >10 teks buntu | High | Pesanan gagal | Batasi di editor + tampilkan error `design.*` | S |
| **P1-2** | BUG-06 security headers + Referrer-Policy | Medium | Clickjacking, token bocor via Referer | `headers()` di next.config | S |
| **P1-3** | BUG-05 sesi tidak dicabut, BUG-24 Secure | Medium | Pengambilalihan sesi | Session version / tabel sesi, cookie `Secure` | M |
| **P1-4** | BUG-07 / BUG-08 / BUG-09 upload | Medium | File berbahaya ke tim produksi, disk penuh | DOMPurify SVG, validasi di klien, rate-limit + cleanup | M |
| **P1-5** | BUG-10 / BUG-11 validasi desain & nama | Medium | Instruksi produksi salah, harga dimanipulasi | Enum Zod + rekonsiliasi ukuran | S |
| **P1-6** | BUG-16 tidak ada tombol lanjut bayar | Medium | Pesanan tertinggal tak terbayar | Tombol bayar/pelunasan di halaman status | S |
| **P1-7** | BUG-04 draf tertimpa | Medium | Kehilangan pekerjaan pelanggan | Dialog "lanjutkan draf" | S |
| **P2-1** | BUG-13 lockout login, BUG-17 sandi lemah | Medium | DoS admin / akun mudah ditebak | IP+email backoff, aturan sandi | M |
| **P2-2** | BUG-14 crash filter, BUG-18 JSON 500 | Medium/Low | Halaman error | Normalisasi parameter, tangkap SyntaxError | S |
| **P2-3** | BUG-15 / BUG-19 / BUG-20 responsif | Medium/Low | Admin mobile tidak bisa dipakai | Layout kolom di mobile, wrap teks, tutup menu | S |
| **P2-4** | BUG-21 / BUG-22 / BUG-23 / BUG-25 / BUG-26 / BUG-30 / BUG-33 UX | Low | Kebingungan pengguna | Lihat masing-masing | S |
| **P3-1** | BUG-27 / BUG-28 / BUG-29 / BUG-31 / BUG-32 / BUG-34 / BUG-35 / BUG-36 a11y & kosmetik | Low/Cosmetic | Aksesibilitas, kerapian | Lihat masing-masing | S |
| **P3-2** | Fitur bagian I (notifikasi, pencarian, pembatalan) | — | Operasional | Roadmap | L |

---

## K. FINAL VERDICT

### **NEEDS MAJOR FIXES**

Alasan:
- Ada **1 Critical** (BUG-01) yang merusak integritas pembayaran, dan ini inti bisnis aplikasi.
- Ada **2 High** (rate-limit lacak dapat dilewati; pesanan buntu karena >10 teks).
- Beberapa pengujian penting belum dilakukan: build produksi + Lighthouse, Firefox/Safari, perangkat fisik.

Setelah P0 dan P1 diperbaiki, aplikasi kemungkinan bisa naik ke **NEEDS MINOR FIXES / RELEASE CANDIDATE**. Fondasinya baik: validasi Zod dipakai bersama klien dan server, transaksi ACID, webhook idempoten, mesin status ketat, dan RBAC dicek di server.

---

## Lampiran — Data uji yang ditinggalkan di database lokal

| Data | Keterangan |
|---|---|
| Pesanan `MLW-2611-0258` s.d. `MLW-2611-0269` (12 pesanan) | Nama pemesan "Tester QA" / "QA Tester" / "Csv Inject". `0258` dan `0268` sudah DP; `0268` di status QC; `0269` selesai; `0267` punya 1 pembayaran kedaluwarsa |
| Akun `qa.temp.<angka>@example.com` | Admin, **dinonaktifkan** |
| ±20 file di `storage/uploads/` | Hasil uji unggah (termasuk SVG uji) |
| Pengaturan | Diubah saat uji lalu **dikembalikan** (777 pcs / 12 jam) |
| Master data | Tidak ada perubahan tersimpan |
| Lockout di memori | Email `lock-test@example.com` dan kunci lacak "lokal"; hilang saat dev server di-restart |

Hapus data di atas sebelum demo, atau jalankan ulang seed.
