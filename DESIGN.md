# HAWAS Design Direction

> Dokumen arah desain visual dan karakter produk HAWAS (Hati-hati dan Awas Bertransaksi).
> Dial: ENERGY 1 / RHYTHM 2 / MOTION 1

---

## 1. Identitas dan Jiwa Desain

- **Konsep:** Buku Saku Waspada Transaksi Digital (Civic Security Field Manual).
- **Karakter:** Tenang, berwibawa, objektif, tidak menggurui, dan tidak menyalahkan korban penipuan.
- **Bukan:** Bukan dashboard SaaS komersial, bukan landing page startup AI bergradasi ungu-neon, bukan aplikasi perbankan palsu.
- **Prinsip Utama:** Setiap teknik visual memiliki tujuan eksplisit. Halaman terasa seperti dokumen resmi yang mudah dipahami warga, tajam, terstruktur, dan dapat diakses dengan cepat terutama pada situasi darurat (SOS).

---

## 2. Dials (Liveliness Settings)

| Dial | Nilai | Penjelasan |
|---|---|---|
| **ENERGY** | **1 (Calm)** | Nada pelayanan publik yang jernih dan tenang. Tidak berteriak, tidak ada ornamen mencolok, tidak ada gradien kosmetik. |
| **RHYTHM** | **2 (Balanced)** | Struktur modular yang konsisten dengan aksen kontras tegas pada bagian darurat (SOS) dan kartu simulasi kasus. |
| **MOTION** | **1 (Functional)** | Gerakan hanya untuk perubahan status penting (navigasi, dialog). Menghormati penuh `prefers-reduced-motion`. |

---

## 3. Palet Warna dan Kontras (WCAG AA Terverifikasi)

Palet menggabungkan ketenangan biru materi edukasi keuangan publik dengan warna Benang Bintik Kalimantan Tengah. Biru dan navy mendominasi antarmuka. Merah, hijau, kuning emas, hitam, dan putih menjadi aksen fungsional yang terukur. Dilarang menambahkan warna baru di luar sistem ini tanpa alasan tertulis.

| Token | Hex | Rasio Kontras pada `--paper` | Fungsi dan Tujuan |
|---|---|---|---|
| `--paper` | `#f6f4ec` | Dasar (Latar) | Latar kertas hangat yang mengurangi silau. |
| `--ink` | `#0d2a43` | 13.34:1 (Pass AA/AAA) | Navy utama untuk teks dan struktur. |
| `--muted` | `#506273` | 5.72:1 (Pass AA) | Teks pendukung dan keterangan. |
| `--blue` | `#0a5f91` | 6.23:1 (Pass AA) | Warna dominan navigasi, tautan, dan tombol primer. |
| `--teal` | `#007873` | 4.85:1 (Pass AA) | Aksen biru-hijau untuk detail pendukung. |
| `--vermilion` | `#a83b2b` | 5.73:1 (Pass AA) | Merah Kalteng untuk SOS dan risiko. |
| `--green` | `#2f6b46` | 5.76:1 (Pass AA) | Hijau Kalteng untuk tindakan aman. |
| `--gold` | `#c69318` | 2.51:1 (Nonteks) | Kuning emas Kalteng untuk garis dan aksen dekoratif, bukan teks kecil. |
| `--line` | `#d1d5d2` | Nonteks | Garis pembatas bidang datar. |

Aturan warna:
- Biru atau navy tetap menjadi warna dominan. Merah, hijau, dan emas dipakai sesuai fungsi, bukan sebagai dekorasi acak.
- Emas tidak digunakan untuk teks kecil karena kontrasnya tidak mencukupi.
- Dilarang memakai gradient glow, drop shadow besar mengambang, atau efek kaca (glassmorphism).

---

## 4. Tipografi

- **Display & Body Font:**
  `system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`
  Menghindari ketergantungan pada font AI default tanpa identitas. Teks tampil tajam di platform mobile mana pun.
- **Monospace (Data & Bukti):**
  `"SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace`
  Digunakan untuk kode skenario (`01`, `Foto_Paket.apk`), timestamp, dan tag SOS.
- **Skala Ukuran (Fluid clamp):**
  - H1: `clamp(2rem, 6vw, 3rem)` dengan line-height `1.1`
  - H2: `clamp(1.25rem, 4vw, 1.6rem)` dengan line-height `1.25`
  - Body: `1rem` (16px) dengan line-height `1.6`
  - Small / Monospace: `0.78rem` s.d. `0.85rem`

---

## 5. Tata Letak dan Responsivitas (Mobile-First)

- **Target Sentuh Minimum:** Semua elemen interaktif (tombol, tautan navigasi) memiliki area sentuh minimal `44px` x `44px`.
- **Tanpa Overflow Horizontal:** Grid dan kartu menyusut menjadi satu kolom di layar sempit (< 760px).
- **Rhythm Spacing:**
  - Jarak antar bagian menggunakan margin terukur (`1.5rem` hingga `3rem`), bukan spasi raksasa kosong.
  - Border bawah/atas tipis (`1px solid var(--line)`) memisahkan item daftar agar mudah dipindai mata.
- **Navigasi:**
  - Di layar mobile: deretan tab horizontal yang dapat digeser jika perlu, tautan SOS selalu menonjol.
  - Di layar desktop: navigasi samping (sticky sidebar) dengan lebar terukur (`12rem`) dan kolom konten utama maksimal `46rem` (65ch) agar nyaman dibaca.

---

## 6. Nada Penulisan (Copywriting) dan Inklusi Digital

- **Bahasa:** Bahasa Indonesia sehari-hari yang jernih, santun, dan dapat dipahami oleh orang yang jarang menggunakan aplikasi digital.
- **Larangan Tanda Pisah Em Dash:** Dilarang menggunakan karakter `—`. Gunakan titik dua `:`, koma `,`, titik `.`, atau tanda kurung `()`.
- **Anti-Victim Blaming:** Jangan menyalahkan korban penipuan (hindari "Anda salah", "Anda tertipu"). Jelaskan risiko dengan tenang dan berikan langkah pengamanan yang jelas.
- **Penjelasan Istilah Teknis:** Istilah teknologi wajib dijelaskan dengan bahasa sederhana saat pertama kali muncul:
  - *Merchant:* nama penerima pembayaran atau pemilik toko.
  - *OTP:* kode rahasia sekali pakai yang dikirim via SMS untuk menyetujui transaksi.
  - *APK:* berkas pemasang aplikasi untuk ponsel Android.
  - *QRIS:* kode bayar digital yang dipindai kamera ponsel.
  - *Simulasi:* contoh situasi latihan tanpa uang sungguhan.
- **Klaim Fakta Jujur:** Jangan memasang angka statistik buatan atau klaim kemitraan palsu. HAWAS adalah media edukasi independen.
- **Larangan Tombol Dekoratif:** Dilarang meletakkan panah tanpa fungsi (`→`, `↗`) pada tombol. Gunakan teks tindakan yang jelas.
- **Tidak Bergantung pada Warna/Ikon Saja:** Informasi keselamatan, peringatan risiko, dan langkah aman wajib menggunakan teks eksplisit (misalnya tag `[Langkah yang lebih aman]` atau `[Tindakan berisiko tinggi]`).

---

## 7. Status Komponen dan Fitur

- Fitur yang belum siap wajib ditandai "Tahap pengembangan" atau "Belum tersedia".
- Dilarang menampilkan form input palsu yang menerima masukan seolah berfungsi.
- Tombol aksi harus memiliki handler nyata atau tautan hash aktif (`href="#/..."`).
