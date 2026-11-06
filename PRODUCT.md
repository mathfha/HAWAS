# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

HAWAS digunakan masyarakat yang bertransaksi secara digital, pembeli dan pedagang QRIS, serta pendamping edukasi dengan tingkat literasi digital yang beragam. Penggunaan utama berlangsung di ponsel, termasuk pada koneksi lambat.

## Product Purpose

HAWAS adalah media edukasi mandiri untuk melatih keputusan aman, menjelaskan petunjuk risiko tanpa memberi vonis, dan membantu pengguna menemukan langkah awal ketika mengalami masalah transaksi digital.

## Positioning

HAWAS menggunakan latihan fiktif dan pemeriksaan lokal yang transparan. HAWAS bukan layanan resmi bank, Bank Indonesia, atau OJK serta tidak melakukan pembayaran, membuka rekening, atau menentukan suatu pihak pasti aman atau melakukan penipuan.

## Operating Context

Pengguna berlatih menghadapi kiriman APK, perbedaan nama penerima QRIS, dan permintaan OTP. Pengguna juga dapat memeriksa pola pada teks pesan atau URL, serta mengunggah gambar QRIS untuk membaca informasi sebelum memutuskan tindakan.

## Capabilities and Constraints

- SPA statis dengan TypeScript strict, tanpa akun, analytics, atau penyimpanan progres. Backend Cloud Run hanya dipakai untuk penjelasan AI opsional pada Cek.
- Simulasi memakai saldo dan identitas fiktif yang hanya hidup dalam memori sesi.
- Cek menerima teks pesan dan URL sampai 2.000 karakter, menjalankan rules lokal, lalu menampilkan sinyal, alasan, dan tindakan tanpa membuka URL. Setelah hasil lokal tersedia, pengguna dapat meminta penjelasan AI menggunakan teks yang sudah disamarkan.
- QRIS V2 menerima unggahan JPEG, PNG, atau WebP, membaca payload di browser, memeriksa CRC, menampilkan data penerima, dan memberi checklist konteks sebelum bayar.
- Kamera QRIS belum aktif. HAWAS tidak memproses pembayaran atau membuka URL dari input pengguna.
- Input sensitif, gambar QR, payload, dan skor tidak disimpan secara default.

## Brand Commitments

Nama produk adalah HAWAS (Hati-hati dan Awas Bertransaksi). Nada bahasa tenang, objektif, mudah dipahami, dan tidak menyalahkan pengguna. Logo HAWAS serta arah desain Civic Security Field Manual dipertahankan.

## Evidence on Hand

- Persyaratan produk: `docs/PRD.md`.
- Keputusan teknis: `docs/Architecture.md` dan `docs/Architecture-essentials.md`.
- Sistem visual: `DESIGN.md`.
- Tidak ada klaim kemitraan, statistik dampak, atau hasil riset pengguna yang dapat dipublikasikan.

## Product Principles

- Berikan petunjuk dan langkah verifikasi, bukan vonis keamanan.
- Minta data seminimal mungkin dan jangan menyimpannya secara default.
- Jelaskan status fiktif, keterbatasan, dan kegagalan dengan teks eksplisit.
- Utamakan ponsel, aksesibilitas, performa, dan bahasa Indonesia sederhana.

## Accessibility & Inclusion

Alur inti menargetkan WCAG 2.2 AA, navigasi keyboard, fokus terlihat, target sentuh memadai, dukungan reduced motion, dan informasi yang tidak bergantung pada warna atau ikon saja.
