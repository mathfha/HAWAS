# HAWAS: Hati-hati dan Awas Bertransaksi

Platform edukasi publik berbasis web untuk melatih kewaspadaan dan mengambil keputusan aman saat menghadapi potensi penipuan transaksi digital di ponsel.

## Fitur Utama

1. **Latihan Simulasi Transaksi**: Tiga contoh skenario praktis (berkas APK kurir, verifikasi nama penerima QRIS, dan panggilan telepon meminta OTP) menggunakan saldo dan data tiruan.
2. **Panduan Darurat (SOS)**: Urutan langkah penyelamatan cepat saat mengalami kendala atau penipuan, dilengkapi kontak resmi instansi berwenang (IASC OJK dan BI BICARA 131).
3. **Panduan Belajar**: Tiga kebiasaan mendasar agar terhindar dari modus kejahatan transaksi digital.
4. **Cek Pola Pesan**: Rules lokal yang transparan dengan penjelasan AI opsional melalui backend HAWAS.

## Batasan Produk

- HAWAS adalah media edukasi publik independen, bukan layanan perbankan resmi, Bank Indonesia (BI), atau Otoritas Jasa Keuangan (OJK).
- HAWAS tidak pernah meminta nomor PIN, kata sandi, kode OTP, atau nomor rekening riil.
- Semua skenario dan saldo latihan bersifat fiktif. Tidak ada pemrosesan uang atau transaksi nyata.

## Menjalankan Proyek

Prasyarat: Node.js versi 22.6 atau lebih baru.

```bash
# Pasang dependensi
npm install

# Jalankan server pengembangan
npm run dev

# Jalankan backend AI lokal setelah menyiapkan Application Default Credentials
npm run dev:api

# Jalankan pengujian unit
npm test

# Periksa tipe TypeScript
npm run typecheck

# Bangun versi produksi
npm run build
```

## Panduan Desain dan Arsitektur

- Petunjuk desain dan visual: [DESIGN.md](./DESIGN.md)
- Panduan agen dan kontributor: [AGENTS.md](./AGENTS.md)
- Dokumen kebutuhan produk: [docs/PRD.md](./docs/PRD.md)
- Ringkasan arsitektur: [docs/Architecture-essentials.md](./docs/Architecture-essentials.md)
