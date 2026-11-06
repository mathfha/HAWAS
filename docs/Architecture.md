# HAWAS — Architecture

## 1. Tujuan dan status

Dokumen ini menetapkan rancangan teknis awal untuk web HAWAS. Repo dimulai sebagai dokumentasi dan scaffold, belum sebagai produk siap rilis. Keputusan di bawah adalah baseline implementasi; perubahan stack atau pemrosesan data harus memperbarui dokumen ini dan `Architecture-essentials.md`.

## 2. Sasaran arsitektur

- Berjalan sebagai web responsif yang mengutamakan ponsel dan jaringan lambat.
- Menjalankan fitur inti tanpa akun atau backend. Backend hanya memperkaya hasil Cek saat pengguna meminta penjelasan AI.
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
| Backend | Cloud Run Node.js/TypeScript untuk penjelasan AI opsional; tanpa database |
| Akun/progres | Tidak ada akun; skor hanya hidup dalam state sesi |
| Analisis Cek | Rules lokal selalu aktif dan menjadi sumber keputusan. Vertex AI hanya memberi penjelasan opsional setelah persetujuan pengguna |
| QRIS | V2 unggah gambar lokal memakai `qr-scanner@1.4.2` (MIT), parser TLV/CRC internal, penyajian data penerima, dan checklist konteks sebelum bayar; kamera ditunda |
| Pengujian | TypeScript check dan build; tambahkan unit/component/browser test saat fitur terkait dibuat |
| Deploy | Frontend statis pada hosting HTTPS; backend Cloud Run di belakang HTTPS Load Balancer dan Cloud Armor |

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
│   │   ├── sos/
│   │   └── simulation/
│   ├── styles/
│   │   ├── global.css
│   │   └── tokens.css
│   └── main.ts
├── server/
│   ├── handler.ts
│   ├── index.ts
│   └── vertex.ts
├── infra/
│   └── terraform/
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

`features/check/` memiliki validasi, aturan sinyal, penyamaran kutipan, dan view hasil. `features/qris/` memiliki alur unggah dan checklist konteks V2. Status ketersediaan pada UI harus mengikuti kemampuan sebenarnya.

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

- Memiliki model skenario dan state sesi: cakupan simulasi lengkap, latihan tunggal, atau beberapa skenario terpilih; indeks skenario; pilihan pertama; percobaan ulang; skor; saldo fiktif awal; dan saldo fiktif berjalan.
- Fungsi domain murni menentukan konsekuensi; UI hanya menyajikan state.
- Skor pilihan pertama immutable setelah ditetapkan. Retry memperbarui tampilan feedback tetapi tidak metrik skor awal.
- Halaman Simulasi menawarkan tiga saldo latihan fiktif awal: Rp1.000.000, Rp5.325.000, dan Rp10.000.000. Nilai divalidasi oleh fungsi domain murni, hanya disimpan di memori, dan tidak mewakili saldo rekening nyata.
- Memulai ulang sesi mereset skor dan pilihan, lalu mengembalikan saldo berjalan ke saldo awal yang dipilih pengguna. Pengurangan saldo berhenti pada Rp0.
- Latihan tunggal dimulai dari route skenario yang dipilih, hanya menghitung satu pilihan pertama, dan menampilkan hasil satu situasi. Pengguna dapat kembali ke Belajar atau memulai simulasi lengkap.
- Saldo tidak merepresentasikan rekening, transaksi, atau nilai pemulihan nyata.

### `features/check`

- Normalisasi dan pemeriksaan aturan berjalan di browser dengan batas 2.000 karakter.
- Validasi menolak input kosong, terlalu panjang, atau pola yang menyerupai OTP, PIN, kata sandi, dan nomor kartu. Nilai yang terdeteksi tidak diulang pada error.
- Tidak mengunjungi URL atau menyimpan riwayat. Rules lokal selesai sebelum backend ditawarkan.
- Input mentah hanya hidup pada textarea. Setelah pemeriksaan berhasil, state hanya menyimpan sinyal dan kutipan yang telah menyamarkan angka panjang, email, serta path dan query URL.
- Hasil adalah daftar sinyal yang terdeteksi beserta keterbatasan dan langkah aman. Tidak ada skor risiko.
- “Tidak ditemukan pola” tidak sama dengan “aman”.
- `ai-contract.ts` menetapkan schema API, versi rules, kategori keluaran AI, dan validator respons. AI tidak dapat membuat kategori atau tindakan di luar daftar HAWAS.
- `client.ts` mengirim teks samaran hanya setelah tombol opsional ditekan. Timeout, rate limit, kegagalan jaringan, dan respons yang tidak valid tidak menghapus hasil lokal.

### `server`

- `handler.ts` menjadi batas HTTP murni: memeriksa origin, method, content type, ukuran body, schema, versi rules, data rahasia, dan teks samaran.
- Backend menghitung ulang rules dari teks yang diterima. Backend tidak mempercayai hasil rules dari browser.
- `vertex.ts` memakai Application Default Credentials dan `@google/genai` untuk Vertex AI. Tidak ada API key pada bundle frontend.
- Model tidak diberi Search, URL Context, function calling, code execution, atau tool lain. Structured output divalidasi sebelum dikirim ke browser.
- Backend tidak memiliki database dan tidak mencatat isi request, teks samaran, prompt, atau respons AI. Log operasional hanya memuat method, path, status, dan durasi.

### `features/qris`

- V2 menerima unggahan JPEG, PNG, atau WebP maksimal 10 MiB. Kamera belum meminta izin dan belum ditampilkan sebagai kontrol aktif.
- `decoder.ts` memuat `qr-scanner@1.4.2` secara dinamis. Library berlisensi MIT, memakai `BarcodeDetector` bila tersedia, dan fallback worker lokal bila tidak tersedia. Dokumentasi library menyatakan ukuran penuh sekitar 16,3 kB gzip.
- `model.ts` memisahkan parser TLV, CRC-16/CCITT-FALSE, validasi berkas, dan state bertipe. `view.ts` tidak menentukan aturan hasil.
- QRIS dikenali melalui struktur EMV Merchant Presented Mode dan identifier nasional `ID.OR.GPNQR.WWW` atau `ID.CO.QRIS.WWW`. Data yang tidak terbaca tidak ditebak.
- Nama penerima ditampilkan secara menonjol agar pengguna dapat memverifikasinya kepada kasir tanpa memasukkan nama toko ke HAWAS.
- CRC hanya menunjukkan konsistensi payload. CRC salah atau tidak tersedia harus menghasilkan peringatan eksplisit.
- Setelah QRIS terbaca, fungsi domain murni menilai empat jawaban konteks: asal QR, konfirmasi nama, kecocokan nominal, dan adanya desakan. Fungsi hanya mengembalikan tingkat panduan dan kode alasan.
- Tingkat panduan adalah `pause`, `verify`, atau `review-complete`. Tidak ada tingkat `safe` atau `fraud`.
- Gambar dan payload mentah tidak masuk state aplikasi setelah pembacaan. Hasil terstruktur dan jawaban checklist hanya hidup dalam memori route, lalu dibuang saat route ditinggalkan atau pengguna mereset pemeriksaan.

### `features/sos`

- `model.ts` mendefinisikan empat jenis kejadian SOS dan fungsi murni untuk menambah atau menghapus pilihan filter.
- Tidak ada formulir pelaporan. Pilihan hanya mengatur panduan yang terlihat, hidup di memori halaman, dan tidak dikirim atau disimpan.
- Pilihan kosong berarti semua panduan ditampilkan sehingga informasi darurat tidak tersembunyi pada kunjungan pertama.

## 6. Routing dan state UI

Gunakan route eksplisit untuk `/`, `#/simulasi`, `#/cek`, `#/qris`, `#/sos`, dan `#/belajar` (format hash dapat diganti sebelum rilis bila hosting mendukung fallback SPA). Latihan tunggal dari Belajar memakai `#/simulasi/kurir-apk`, `#/simulasi/nama-penerima`, dan `#/simulasi/otp`. Route tak dikenal, termasuk slug skenario yang tidak didukung, menuju halaman tidak ditemukan yang memiliki tautan kembali.

State global minimal:

- route aktif;
- sesi simulasi di memori, termasuk cakupan simulasi lengkap atau latihan tunggal;
- hasil Cek yang telah disamarkan selama route Cek aktif;
- pilihan filter kejadian SOS di memori, dengan pilihan kosong berarti tampilkan semua;
- preferensi tampilan hanya bila memang diperlukan.

Jangan persist skor, input Cek, gambar QR, atau data sensitif ke `localStorage`, `sessionStorage`, IndexedDB, URL, atau analytics. Bila progres lokal kelak dibutuhkan, lakukan keputusan privasi terpisah, simpan hanya data minim, berikan penjelasan dan aksi hapus.

## 7. Alur fitur

### Simulasi

```text
Beranda → Level 1 → feedback → Level 2 → feedback → Level 3 → hasil
                               ↘ retry tanpa mengubah skor pilihan pertama

Belajar → latihan satu skenario → feedback → hasil satu situasi
                                      ↘ retry tanpa mengubah skor pilihan pertama

Simulasi → pilih satu, dua, atau tiga situasi → pilih saldo latihan fiktif → mulai
```

Pada halaman awal Simulasi, tiga skenario ditampilkan sebagai tombol pilihan jamak. Tombol Simulasi lengkap memilih ketiganya sekaligus. Minimal satu skenario harus dipilih. Jika satu atau dua skenario dipilih, progress, skor, hasil, dan restart hanya memakai daftar tersebut. Memilih ketiganya menjalankan alur lengkap.

Tindakan berisiko dapat mengurangi saldo fiktif; tindakan aman memberi poin belajar. Mode latihan tunggal memakai aturan yang sama, tetapi hasil dan penyebut skor hanya mencakup skenario terpilih. Tidak ada pembayaran atau efek di luar state sesi.

### Cek

```text
Peringatan data sensitif → input teks atau URL → validasi batas dan data rahasia
→ aturan lokal → kutipan disamarkan → petunjuk + alasan + tindakan
→ pengguna memilih penjelasan AI → backend mengulang validasi dan rules
→ Vertex AI menghasilkan JSON terbatas → validator backend → penjelasan tambahan
```

Jangan melakukan request jaringan sebelum pengguna meminta penjelasan AI. URL tetap diperlakukan sebagai teks dan tidak pernah dibuka. Jika input salah, pertahankan isi textarea agar dapat diperbaiki. Setelah analisis berhasil, kosongkan textarea dan simpan hanya hasil serta teks AI yang sudah disamarkan. Reset atau perpindahan route membuang hasil dan membatalkan request aktif.

### QRIS

```text
Pilih gambar → validasi jenis/ukuran → decode lokal → parse TLV → periksa CRC
→ tampilkan data yang terbaca → jawab checklist konteks
→ panduan berhenti, verifikasi lagi, atau pemeriksaan awal selesai
```

File tidak valid, gambar tanpa QR, payload rusak, format non-QRIS, serta CRC tidak konsisten memiliki error atau status eksplisit dan tindakan mencoba lagi. Perbedaan nama, nominal, atau desakan menghasilkan panduan untuk berhenti sebelum membayar. Hasil yang tidak menemukan perbedaan tetap menyebut bahwa pemeriksaan awal bukan jaminan transaksi aman. Tidak ada tombol “bayar”. Kamera merupakan tahap terpisah setelah alur unggah diuji lintas browser.

### SOS

```text
Buka SOS → lakukan tindakan segera → pilih nol, satu, atau beberapa kejadian
→ tampilkan checklist terkait → buka kanal resmi atas tindakan pengguna
```

Konten tetap ringan, dapat dibuka dari semua route, dan tidak menunggu API. Semua panduan tampil secara bawaan. Filter kejadian hanya mengubah visibilitas checklist dan tidak dipersist. Tautan hanya menuju kanal yang telah diverifikasi. Jangan menerima, mengirim, atau menyimpan data dan bukti dari halaman HAWAS.

## 8. Data dan privasi

### Klasifikasi

- Data contoh dan saldo simulasi: fiktif, hanya dalam bundle atau state sesi.
- Input Cek, gambar, dan payload QR: data pengguna berpotensi sensitif. Cek mempertahankan input mentah hanya pada textarea dan menyimpan hasil serta teks AI yang sudah disamarkan selama route aktif. Teks samaran dikirim ke backend dan Vertex hanya setelah tindakan eksplisit pengguna. QRIS V2 mempertahankan hasil terstruktur serta jawaban checklist selama route aktif. Tidak ada input yang dipersist oleh aplikasi.
- Data analitik dan identitas: tidak dikumpulkan dalam baseline.

### Jaminan yang dapat dibuat

Hanya klaim yang dapat dibuktikan dari implementasi dan konfigurasi hosting boleh ditampilkan. “Tidak dikirim” harus diverifikasi dengan pemeriksaan network requests. “Tidak disimpan” harus diperiksa pada storage, cache, error reporting, dan log hosting. Jangan menyebut pemrosesan browser sebagai jaminan privasi menyeluruh.

### Pengamanan

- Tidak ada token rahasia atau kredensial dalam frontend.
- Jangan interpolasi teks pengguna ke HTML sebagai markup; gunakan text nodes/escaping.
- Panggilan network untuk input Cek hanya menuju backend HAWAS setelah pengguna meminta penjelasan AI. Backend tidak menerima wildcard CORS.
- Cloud Run memakai service account khusus untuk Vertex AI, ingress load balancer, maksimum lima instance, dan timeout terbatas. Cloud Armor membatasi permintaan per IP.
- Vertex memakai endpoint global PayGo. Copy privasi harus menjelaskan bahwa pemrosesan AI tidak dibatasi ke Indonesia dan tidak mengklaim zero retention.
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

Gunakan tipe error/domain yang eksplisit untuk input Cek kosong, terlalu panjang, atau menyerupai data rahasia; kamera ditolak/tidak tersedia; file tak valid; QR tak terbaca; format tak didukung; serta kegagalan decoder. Tampilkan bahasa sederhana dan aksi pemulihan. Jangan menangkap error secara luas lalu memberi hasil sukses palsu.

Konten penting, SOS, simulasi, Cek, dan Belajar harus dapat dimuat tanpa layanan analitik atau decoder QR. Fitur yang belum siap harus menampilkan status tahap pengembangan dan tidak membuka input yang tidak diproses.

## 11. Build, kualitas, dan pengujian

Perintah awal:

- `npm run dev` — server pengembangan.
- `npm run dev:api` — backend pengembangan setelah Application Default Credentials tersedia.
- `npm test` — unit test model dengan test runner bawaan Node.js (Node.js 22.6+).
- `npm run typecheck` — pemeriksaan TypeScript.
- `npm run build` — build produksi.

Pengujian yang wajib sebelum rilis:

1. Unit test aturan skor pilihan pertama, retry, reset, dan state simulasi.
2. Uji kasus batas input Cek dan hasil bahasa non-absolut.
3. Uji kontrak API Cek, origin, version skew, penyamaran ulang, timeout, rate limit, respons model tak valid, dan fallback rules lokal.
4. Uji parser QR untuk input valid, invalid, CRC salah, format tak didukung, identifier QRIS yang didukung, serta semua tingkat panduan checklist. Uji decoder gambar secara manual di Safari iPhone dan Chrome Android.
5. Uji route dan navigasi keyboard pada ponsel/desktop.
6. Pemeriksaan aksesibilitas otomatis dan manual.
7. Network/storage/log inspection untuk membuktikan klaim privasi lokal dan AI opsional.
8. Uji slow network, kegagalan kamera, kegagalan AI, dan tautan SOS.

Test model memakai `node:test` tanpa dependency tambahan. Jangan menandai fitur selesai hanya karena build lulus.

## 12. Pengiriman dan operasi

- Rilis frontend sebagai aset statis melalui hosting HTTPS dengan fallback route bila memakai history routing.
- Rilis backend sebagai container Cloud Run melalui Terraform dan GitHub Actions Workload Identity Federation. Tidak ada service-account key di GitHub.
- URL publik backend boleh berada pada bundle melalui `VITE_HAWAS_API_BASE_URL`. Kredensial, project secret, dan endpoint internal tidak boleh masuk bundle.
- Perubahan konten kanal SOS harus meninjau sumber, fungsi kontak, tanggal verifikasi, dan penanggung jawab.
- Belum ada analytics, database, atau proses laporan otomatis. Backend hanya melayani endpoint Cek AI dan health check.
- Jika komponen teknis berubah, perbarui diagram alur, batas privasi, dependency/license, dan ringkasan essentials.

## 13. Keputusan terbuka

- Evaluasi ulang dukungan kamera, aksesibilitas izin, dan kompatibilitas `qr-scanner` sebelum mengaktifkan kamera.
- Tetapkan pemilik dan jadwal pemeriksaan kanal SOS sebelum rilis publik.
- Lakukan uji formatif untuk menetapkan target metrik, bukan mengarang baseline.
- Evaluasi kebutuhan router/library setelah prototipe navigasi berjalan; jangan menambah dependency tanpa kebutuhan.

## Referensi

- [PRD](./PRD.md)
- [Architecture essentials](./Architecture-essentials.md)
- [Konsep HAWAS](../hawas.md)
- [PRD sumber](../prd-hawas.md)
- [Prototipe HAWAS](../prototipe-hawas.md)
