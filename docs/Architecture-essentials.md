# HAWAS — Architecture Essentials

Ringkasan ini untuk dibaca cepat. Jika ada konflik, ikuti [Architecture.md](./Architecture.md) dan [PRD.md](./PRD.md).

## Produk

- HAWAS adalah media edukasi, bukan layanan resmi bank, BI, atau OJK.
- Tidak ada pembayaran nyata, akses rekening, laporan otomatis, atau jaminan dana kembali.
- Jangan memberi vonis pasti “penipuan” atau “aman”; QR dengan nama berbeda perlu diverifikasi, bukan langsung dituduh.
- Semua data simulasi fiktif. Jangan minta OTP, PIN, kata sandi, data kartu, atau rekening.

## Baseline teknis

- Vite + TypeScript strict; DOM semantik dan CSS; tanpa framework UI untuk scaffold awal.
- Frontend tetap berupa SPA statis. Backend Cloud Run hanya melayani penjelasan AI opsional pada Cek dan tidak diperlukan untuk fitur inti.
- Simulasi, Cek, SOS, dan Belajar tersedia. QRIS V2 menerima unggahan gambar, membaca data QRIS secara lokal, lalu memberi checklist konteks sebelum bayar tanpa melakukan pembayaran.
- Tidak ada akun, analytics, penyimpanan progres, atau database input. Teks samaran hanya dikirim ke Vertex AI setelah pengguna meminta penjelasan tambahan.
- Cek memakai rules lokal sebagai sumber keputusan dan tidak boleh fetch URL. Backend mengulang validasi serta rules sebelum memakai Vertex AI. QRIS memakai `qr-scanner@1.4.2` berlisensi MIT yang dimuat dinamis; kamera belum diaktifkan.

## Batas penting

- Skor ditentukan pilihan pertama; retry tidak mengubah skor. Sesi baru mereset state.
- Halaman Simulasi menyediakan tiga saldo latihan fiktif awal: Rp1.000.000, Rp5.325.000, dan Rp10.000.000. Nilai hanya hidup di memori, restart mengembalikan saldo ke pilihan tersebut, dan saldo tidak pernah menjadi negatif.
- Halaman awal Simulasi memakai tiga tombol pilihan jamak dan satu tombol Simulasi lengkap untuk memilih semuanya. Pengguna dapat menjalankan satu, dua, atau tiga skenario, dan hasil hanya menilai skenario terpilih. Tautan latihan tunggal dari Belajar tetap memakai route hash eksplisit.
- Tautan Belajar memakai route latihan tunggal yang eksplisit. Mode ini hanya menilai satu skenario dan tidak mengklaim simulasi lengkap telah selesai.
- Halaman SOS menampilkan semua panduan secara bawaan. Filter kejadian dapat memilih lebih dari satu panduan, hanya hidup di memori, dan tidak menerima atau mengirim bukti pengguna.
- Teks hasil selalu menyertakan pola, alasan, dan langkah; “tidak ditemukan” bukan jaminan aman.
- Cek menerima maksimal 2.000 karakter dan menolak pola yang menyerupai data rahasia. State hasil hanya memuat sinyal serta kutipan yang sudah disamarkan.
- Penjelasan AI bersifat opsional. Hasil rules tampil lebih dahulu, tetap tersedia saat AI gagal, dan tidak dapat diturunkan oleh keluaran model.
- API Cek hanya menerima origin frontend yang ditentukan, memakai schema dan versi rules eksplisit, tidak membuka URL, serta tidak mencatat isi request atau respons AI.
- CRC hanya memeriksa konsistensi payload QR, bukan merchant atau keamanan pembayaran.
- QRIS V2 menerima JPEG, PNG, dan WebP maksimal 10 MiB. Payload mentah dan gambar tidak disimpan atau dimasukkan ke URL.
- Nama penerima ditampilkan sebagai petunjuk untuk diverifikasi kepada kasir. CRC tidak valid tidak boleh menghasilkan kesan bahwa informasi telah terverifikasi.
- Checklist QRIS memeriksa asal QR, konfirmasi nama, kecocokan nominal, dan adanya desakan. Hasil hanya berupa panduan berhenti, verifikasi, atau pemeriksaan awal selesai, bukan vonis aman.
- Jawaban checklist QRIS hanya hidup di memori route dan dibuang saat reset atau pindah halaman.
- Jangan menebak field yang tidak terbaca, mengarang kontak, atau menampilkan hasil contoh sebagai hasil scan.
- Klaim “lokal/tidak disimpan” perlu inspeksi network, browser storage, cache, error log, backend, Vertex, dan hosting. Jangan menyebut AI sebagai pemrosesan lokal.

## UX dan aksesibilitas

- Ponsel dulu; SOS tersedia dari semua route; desktop memakai navigasi samping dan lebar baca terukur.
- Bahasa Indonesia yang pendek, jelas, dan tidak menyalahkan.
- Keyboard, fokus terlihat, label semantik, kontras WCAG 2.2 AA, dan reduced motion.
- Risiko tidak dibedakan dengan warna saja. Jaga bundle ringan dan jalur SOS tanpa dependensi eksternal.

## Struktur dan perintah

- Konten: `src/content/`; fitur dan aturan pilihan SOS: `src/features/`; route/shell: `src/app/`; gaya: `src/styles/`.
- Route simulasi lengkap adalah `#/simulasi`; latihan tunggal memakai `#/simulasi/kurir-apk`, `#/simulasi/nama-penerima`, dan `#/simulasi/otp`.
- `npm run dev`, `npm run dev:api`, `npm test` (Node.js 22.6+), `npm run typecheck`, `npm run build`.
- Test domain memakai `node:test`, tanpa dependency tambahan; uji UI masih manual.
- Setelah mengubah arsitektur, perbarui dokumen ini dan `Architecture.md`.
