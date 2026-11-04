# HAWAS — Architecture Essentials

Ringkasan ini untuk dibaca cepat. Jika ada konflik, ikuti [Architecture.md](./Architecture.md) dan [PRD.md](./PRD.md).

## Produk

- HAWAS adalah media edukasi, bukan layanan resmi bank, BI, atau OJK.
- Tidak ada pembayaran nyata, akses rekening, laporan otomatis, atau jaminan dana kembali.
- Jangan memberi vonis pasti “penipuan” atau “aman”; QR dengan nama berbeda perlu diverifikasi, bukan langsung dituduh.
- Semua data simulasi fiktif. Jangan minta OTP, PIN, kata sandi, data kartu, atau rekening.

## Baseline teknis

- Vite + TypeScript strict; DOM semantik dan CSS; tanpa framework UI untuk scaffold awal.
- SPA statis; backend dan runtime dependencies nihil pada MVP.
- Simulasi, SOS, Belajar di MVP; Cek dan QRIS tahap lanjut dan nonaktif sampai benar-benar diimplementasikan.
- Tidak ada akun, analytics, penyimpanan progres, atau input pengguna yang dikirim keluar.
- Cek tidak boleh fetch URL. QR diproses lokal setelah decoder/lisensi dipilih dan diuji.

## Batas penting

- Skor ditentukan pilihan pertama; retry tidak mengubah skor. Sesi baru mereset state.
- Teks hasil selalu menyertakan pola, alasan, dan langkah; “tidak ditemukan” bukan jaminan aman.
- CRC hanya memeriksa konsistensi payload QR, bukan merchant atau keamanan pembayaran.
- Jangan menebak field yang tidak terbaca, mengarang kontak, atau menampilkan hasil contoh sebagai hasil scan.
- Klaim “lokal/tidak disimpan” perlu inspeksi network, browser storage, cache, error log, dan hosting.

## UX dan aksesibilitas

- Ponsel dulu; SOS tersedia dari semua route; desktop memakai navigasi samping dan lebar baca terukur.
- Bahasa Indonesia yang pendek, jelas, dan tidak menyalahkan.
- Keyboard, fokus terlihat, label semantik, kontras WCAG 2.2 AA, dan reduced motion.
- Risiko tidak dibedakan dengan warna saja. Jaga bundle ringan dan jalur SOS tanpa dependensi eksternal.

## Struktur dan perintah

- Konten: `src/content/`; fitur: `src/features/`; route/shell: `src/app/`; gaya: `src/styles/`.
- `npm run dev`, `npm test` (Node.js 22.6+), `npm run typecheck`, `npm run build`.
- Test domain memakai `node:test`, tanpa dependency tambahan; uji UI masih manual.
- Setelah mengubah arsitektur, perbarui dokumen ini dan `Architecture.md`.
