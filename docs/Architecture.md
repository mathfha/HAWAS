# HAWAS — Architecture

## 1. Tujuan dan status

Dokumen ini menetapkan rancangan teknis awal untuk web HAWAS. Repo dimulai sebagai dokumentasi dan scaffold, belum sebagai produk siap rilis. Keputusan di bawah adalah baseline implementasi; perubahan stack atau pemrosesan data harus memperbarui dokumen ini dan `Architecture-essentials.md`.

## 2. Sasaran arsitektur

- Berjalan sebagai web responsif yang mengutamakan ponsel dan jaringan lambat.
- Menjalankan fitur inti tanpa akun, backend aplikasi, atau panggilan ke layanan analisis.
- Memisahkan konten edukasi, logika domain, dan antarmuka agar konten bisa ditinjau tanpa mengubah aturan skor.
- Membuat status fitur jelas: tidak ada hasil simulasi palsu atau kontrol yang tampak aktif padahal belum bekerja.
- Menjaga bahasa hasil tidak absolut serta membuat SOS selalu mudah diakses.

## 3. Keputusan baseline

| Area | Keputusan |
|---|---|
| Aplikasi | SPA statis, satu dokumen HTML, navigasi hash sederhana pada MVP |
| Bahasa | TypeScript dengan `strict` aktif |
| Build/dev server | Vite |
| UI | DOM semantik dan CSS; tanpa framework UI pada scaffold awal |
| Backend | Tidak ada untuk MVP |
| Akun/progres | Tidak ada akun; skor hanya hidup dalam state sesi |
| Analisis Cek | Tahap lanjutan, aturan lokal yang eksplisit; tanpa API, fetch URL, atau AI |
| QRIS | Tahap lanjutan; adapter decoder lokal setelah format, library, lisensi, dan biaya bundle ditinjau |
| Pengujian | TypeScript check dan build; tambahkan unit/component/browser test saat fitur terkait dibuat |
| Deploy | Aset statis pada hosting HTTPS; header keamanan disetel oleh platform hosting |

Tidak ada dependensi runtime pada scaffold. Vite dan TypeScript adalah dependensi pengembangan. Jangan menambah framework atau library QR sebelum kebutuhan dan biaya bundle terukur.

## 4. Struktur repo

```text
.
├── docs/
│   ├── PRD.md
│   ├── Architecture.md
│   └── Architecture-essentials.md
├── src/
│   ├── app/
│   │   ├── app.ts
│   │   └── routes.ts
│   ├── content/
│   │   ├── scenarios.ts
│   │   └── sos.ts
│   ├── features/
│   │   ├── check/
│   │   ├── qris/
│   │   └── simulation/
│   ├── styles/
│   │   ├── global.css
│   │   └── tokens.css
│   └── main.ts
├── tests/
│   └── README.md
├── index.html
├── .gitignore
├── package.json
├── package-lock.json
├── tsconfig.json
├── vite.config.ts
├── AGENTS.md
└── CLAUDE.md
```

`features/check/` dan `features/qris/` adalah batas modul yang direncanakan, bukan bukti bahwa fiturnya sudah berfungsi. Jangan menerima data pengguna pada halaman yang belum implementasi.

## 5. Batas modul

### `app`

- Memilih route, menampilkan kerangka halaman, dan menangani navigasi.
- Tidak memuat aturan QR, kata kunci Cek, atau konten SOS langsung di komponen navigasi.
- Menjaga fokus keyboard dan judul halaman setelah route berubah.

### `content`

- Memuat skenario fiktif, copy edukasi, dan rujukan SOS.
- Kontak eksternal harus berisi label fungsi dan tanggal pemeriksaan.
- Konten tidak boleh mengandung kredensial, data korban, atau klaim kemitraan yang belum ada.

### `features/simulation`

- Memiliki model skenario dan state sesi: indeks skenario, pilihan pertama, percobaan ulang, skor, dan saldo fiktif.
- Fungsi domain murni menentukan konsekuensi; UI hanya menyajikan state.
- Skor pilihan pertama immutable setelah ditetapkan. Retry memperbarui tampilan feedback tetapi tidak metrik skor awal.
- Memulai sesi baru menginisialisasi ulang skor dan saldo.
- Saldo tidak merepresentasikan rekening, transaksi, atau nilai pemulihan nyata.

### `features/check` (tahap lanjutan)

- Normalisasi dan pemeriksaan aturan berjalan di browser.
- Input mempunyai batas panjang dan validasi eksplisit.
- Tidak mengunjungi URL, mengirim teks ke server, menyimpan riwayat, atau mencatat input dalam log.
- Hasil adalah daftar sinyal yang terdeteksi beserta keterbatasan dan langkah aman.
- “Tidak ditemukan pola” tidak sama dengan “aman”.

### `features/qris` (tahap lanjutan)

- Meminta kamera hanya setelah tindakan pengguna dan lewat izin browser.
- Memisahkan sumber gambar (kamera/unggah), decoder, parser payload, pemeriksaan CRC, dan perbandingan nama.
- Decoder menghasilkan data terbaca atau error bertipe; tidak boleh membuat nilai tebakan.
- CRC hanya menunjukkan konsistensi payload terhadap CRC, tidak membuktikan merchant asli.
- Gambar diproses di perangkat dan dibuang setelah pemrosesan; klaim ini wajib diuji lewat inspeksi jaringan dan storage.
- Jika library decoder ditambahkan, catat lisensi, ukuran terkompresi, format yang didukung, dan fallback.

## 6. Routing dan state UI

Gunakan route eksplisit untuk `/`, `#/simulasi`, `#/cek`, `#/qris`, `#/sos`, dan `#/belajar` (format hash dapat diganti sebelum rilis bila hosting mendukung fallback SPA). Route tak dikenal menuju halaman tidak ditemukan yang memiliki tautan kembali.

State global minimal:

- route aktif;
- sesi simulasi di memori;
- preferensi tampilan hanya bila memang diperlukan.

Jangan persist skor, input Cek, gambar QR, atau data sensitif ke `localStorage`, `sessionStorage`, IndexedDB, URL, atau analytics. Bila progres lokal kelak dibutuhkan, lakukan keputusan privasi terpisah, simpan hanya data minim, berikan penjelasan dan aksi hapus.

## 7. Alur fitur

### Simulasi

```text
Beranda → Level 1 → feedback → Level 2 → feedback → Level 3 → hasil
                               ↘ retry tanpa mengubah skor pilihan pertama
```

Tindakan berisiko dapat mengurangi saldo fiktif; tindakan aman memberi poin belajar. Tidak ada pembayaran atau efek di luar state sesi.

### Cek

```text
Peringatan data sensitif → input teks → validasi batas → aturan lokal → petunjuk + alasan + saran
```

Jangan melakukan request jaringan untuk nilai input atau URL. Jika input salah, pertahankan atau kosongkan sesuai pesan validasi yang jelas; jangan diam-diam menampilkan hasil contoh.

### QRIS

```text
Pilih kamera/unggah → izin/validasi file → decode lokal → parse field → CRC bila didukung
→ masukkan nama toko → bandingkan → petunjuk dengan keterbatasan
```

Kamera ditolak, perangkat tanpa kamera, file tidak valid, QR buram, dan format tak didukung harus punya state pemulihan. Tidak ada tombol “bayar”.

### SOS

Konten statis, ringan, dapat dibuka dari semua route, dan tidak menunggu API. Tautan hanya menuju kanal yang telah diverifikasi. Jangan mengirim data atau bukti dari halaman HAWAS.

## 8. Data dan privasi

### Klasifikasi

- Data contoh dan saldo simulasi: fiktif, hanya dalam bundle atau state sesi.
- Input Cek, gambar, dan payload QR: data pengguna berpotensi sensitif; fitur lanjutan harus memproses lokal dan membuang setelah selesai.
- Data analitik dan identitas: tidak dikumpulkan dalam baseline.

### Jaminan yang dapat dibuat

Hanya klaim yang dapat dibuktikan dari implementasi dan konfigurasi hosting boleh ditampilkan. “Tidak dikirim” harus diverifikasi dengan pemeriksaan network requests. “Tidak disimpan” harus diperiksa pada storage, cache, error reporting, dan log hosting. Jangan menyebut pemrosesan browser sebagai jaminan privasi menyeluruh.

### Pengamanan

- Tidak ada token rahasia atau kredensial dalam frontend.
- Jangan interpolasi teks pengguna ke HTML sebagai markup; gunakan text nodes/escaping.
- Panggilan network hanya untuk aset aplikasi dan navigasi kanal keluar yang dipilih pengguna.
- Terapkan CSP, HTTPS, `X-Content-Type-Options`, `Referrer-Policy`, serta kebijakan frame sesuai kemampuan hosting.
- Buka tautan eksternal dengan atribut rel yang aman bila dibuka tab baru.
- Jangan memasukkan input pengguna ke URL, log, error message telemetry, atau laporan bug.

## 9. Aksesibilitas dan desain

- HTML semantik, heading berurutan, label untuk semua input, `button` untuk aksi dan `a` untuk navigasi.
- Navigasi keyboard penuh; fokus terlihat dan dikembalikan secara masuk akal setelah route berubah.
- Pengumuman hasil dinamis melalui live region yang tidak membanjiri pembaca layar.
- Informasi risiko menyertakan teks dan ikon, bukan warna saja.
- Hormati `prefers-reduced-motion`; tidak ada getar/suara sebagai satu-satunya feedback.
- Target kontras WCAG 2.2 AA dan target sentuh yang memadai.
- Desain mobile-first dengan layout desktop berupa navigasi samping dan kolom baca terukur.
- Palet awal: kertas `#F7F4EC`, tinta `#172A3A`, biru `#315C8C`, hijau `#39715B`, vermilion `#C35B3E`; tes kontras sebelum penggunaan teks kecil.
- Hindari gambar besar, font remote wajib, dan dekorasi yang menunda SOS.

## 10. Ketahanan dan kesalahan

Gunakan tipe error/domain yang eksplisit untuk input tak valid, kamera ditolak/tidak tersedia, file tak valid, QR tak terbaca, format tak didukung, serta kegagalan decoder. Tampilkan bahasa sederhana dan aksi pemulihan. Jangan menangkap error secara luas lalu memberi hasil sukses palsu.

Konten penting, SOS, simulasi, dan Belajar harus dapat dimuat tanpa layanan analitik atau decoder QR. Cek dan QRIS yang belum siap menampilkan status tahap pengembangan dan tidak membuka input yang tidak diproses.

## 11. Build, kualitas, dan pengujian

Perintah awal:

- `npm run dev` — server pengembangan.
- `npm test` — unit test model dengan test runner bawaan Node.js (Node.js 22.6+).
- `npm run typecheck` — pemeriksaan TypeScript.
- `npm run build` — build produksi.

Pengujian yang wajib sebelum rilis:

1. Unit test aturan skor pilihan pertama, retry, reset, dan state simulasi.
2. Uji kasus batas input Cek dan hasil bahasa non-absolut.
3. Uji decoder/parser QR untuk input valid, invalid, CRC salah, dan format tak didukung.
4. Uji route dan navigasi keyboard pada ponsel/desktop.
5. Pemeriksaan aksesibilitas otomatis dan manual.
6. Network/storage inspection untuk membuktikan klaim privasi.
7. Uji slow network, kegagalan kamera, dan tautan SOS.

Test model memakai `node:test` tanpa dependency tambahan. Jangan menandai fitur selesai hanya karena build lulus.

## 12. Pengiriman dan operasi

- Rilis sebagai aset statis melalui hosting HTTPS dengan fallback route bila memakai history routing.
- Jangan menaruh URL layanan internal atau rahasia pada bundle.
- Perubahan konten kanal SOS harus meninjau sumber, fungsi kontak, tanggal verifikasi, dan penanggung jawab.
- Belum ada analytics, backend, database, atau proses laporan otomatis.
- Jika komponen teknis berubah, perbarui diagram alur, batas privasi, dependency/license, dan ringkasan essentials.

## 13. Keputusan terbuka

- Pilih library decoder QR setelah mengevaluasi lisensi, format payload, dukungan kamera, aksesibilitas, dan ukuran bundle.
- Tetapkan pemilik dan jadwal pemeriksaan kanal SOS sebelum rilis publik.
- Lakukan uji formatif untuk menetapkan target metrik, bukan mengarang baseline.
- Evaluasi kebutuhan router/library setelah prototipe navigasi berjalan; jangan menambah dependency tanpa kebutuhan.

## Referensi

- [PRD](./PRD.md)
- [Architecture essentials](./Architecture-essentials.md)
- [Konsep HAWAS](../hawas.md)
- [PRD sumber](../prd-hawas.md)
- [Prototipe HAWAS](../prototipe-hawas.md)
