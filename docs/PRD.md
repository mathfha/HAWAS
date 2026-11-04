# HAWAS — Product Requirements Document

## Ringkasan

HAWAS (Hati-hati dan Awas Bertransaksi) adalah web edukasi yang membantu masyarakat berlatih mengenali risiko transaksi digital, memahami alasan di balik tindakan aman, dan menemukan langkah awal ketika mengalami masalah.

HAWAS memakai simulasi dengan saldo dan identitas fiktif. Hasil pemeriksaan pesan atau QRIS hanya berupa petunjuk. HAWAS bukan layanan resmi bank, Bank Indonesia, atau OJK; tidak memproses pembayaran, menghubungi lembaga, atau menjamin dana kembali.

## Pengguna

- Masyarakat yang menggunakan pembayaran digital atau menerima pesan dan telepon terkait transaksi.
- Pembeli dan pedagang QRIS.
- Pelajar, mahasiswa, pengajar, pendamping, dan petugas edukasi konsumen.

Rancang untuk ponsel, bahasa Indonesia yang lugas, pengguna dengan tingkat literasi digital beragam, dan koneksi lambat.

## Tujuan

1. Melatih keputusan aman melalui tiga skenario tanpa risiko finansial nyata.
2. Menjelaskan tanda yang perlu diperiksa beserta langkah berikutnya.
3. Menyajikan panduan SOS dan rujukan kanal pengaduan.
4. Menjaga penggunaan inti tetap ringan, tanpa akun, dan tanpa memasukkan data transaksi nyata.

## Bukan tujuan

- Memastikan seseorang, pesan, tautan, QR, rekening, atau merchant adalah penipu atau pasti aman.
- Mengakses rekening, membayar, memblokir transaksi, atau mengirim laporan atas nama pengguna.
- Menjamin transaksi dibatalkan atau dana dapat dikembalikan.
- Menggantikan arahan bank, penyedia jasa pembayaran, aparat, BI, atau OJK.
- Menjadi antivirus, pemeriksa reputasi nomor/domain, atau layanan analisis berbasis AI.

## Prinsip produk

- Gunakan istilah “petunjuk”, “perlu diperiksa”, dan “verifikasi dahulu”. Hindari vonis.
- Nama merchant QRIS yang berbeda adalah alasan untuk bertanya, bukan bukti penipuan.
- Semua nomor, nama, pesan, saldo, dan transaksi di simulasi adalah fiktif.
- Jangan pernah meminta OTP, PIN, kata sandi, nomor kartu, atau data rekening.
- Jangan mengklaim input diproses lokal atau tidak disimpan sebelum perilaku aplikasi diuji.
- Nyatakan dengan jelas fitur yang belum tersedia.
- Jangan menampilkan logo atau bahasa yang menyiratkan afiliasi resmi.

## Navigasi

Enam tujuan utama:

1. **Beranda** — pengenalan singkat dan akses ke Simulasi serta SOS.
2. **Simulasi** — tiga skenario berurutan dan ringkasan hasil.
3. **Cek** — petunjuk pola pada teks atau URL yang ditempel.
4. **QRIS** — pemindaian/unggah QR dan perbandingan nama merchant.
5. **SOS** — langkah darurat, daftar bukti, dan kanal yang relevan.
6. **Belajar** — tiga pengingat “3 Jangan”.

SOS harus mudah dijangkau dari setiap layar utama. Cek dan QRIS yang belum berfungsi tidak boleh menerima input seolah-olah analisis tersedia.

## Ruang lingkup rilis

### MVP

- Beranda responsif.
- Simulasi tiga skenario, umpan balik, skor sesi, dan hasil akhir.
- Panduan SOS dengan tanggal pemeriksaan konten.
- Kartu Belajar “3 Jangan”.
- Tidak ada akun, server aplikasi, analitik, atau penyimpanan progres.

### Tahap lanjutan

- Cek teks/URL secara lokal dengan aturan transparan dan batas input.
- QRIS melalui kamera atau unggah gambar, pembacaan payload, pemeriksaan CRC bila didukung, dan perbandingan nama merchant.
- Uji keterpahaman dengan calon pengguna sebelum memperluas rilis.

### Di luar cakupan

- Login, sinkronisasi cloud, laporan otomatis, pembayaran nyata, akses rekening, basis data reputasi, API analisis eksternal, dan klasifikasi AI.

## Persyaratan fungsional

### Beranda dan navigasi

- **HOME-01:** Beranda menjelaskan HAWAS sebagai media edukasi, bukan layanan resmi.
- **HOME-02:** Aksi utama “Mulai simulasi” dan aksi “Butuh bantuan? Buka SOS” terlihat jelas.
- **HOME-03:** Beranda memberi pratinjau tiga skenario tanpa statistik atau klaim dampak yang tidak teruji.
- **HOME-04:** Konten dapat dibaca pada ponsel tanpa gulir horizontal.
- **NAV-01:** Keenam tujuan dapat dijangkau dengan navigasi yang sesuai ukuran layar.
- **NAV-02:** SOS dapat dibuka dari semua alur utama.

### Simulasi

- **SIM-01:** Pengguna memulai dari skenario pertama dan melihat progres serta saldo yang bertanda “SIMULASI”.
- **SIM-02:** Skenario pertama menampilkan chat kurir fiktif dengan lampiran `Foto_Paket.apk`; pilihan: “Unduh APK” atau “Tolak & blokir”.
- **SIM-03:** Skenario kedua menampilkan toko “Kopi Berkah” dan nama merchant “Resto Sukses Pribadi”; pilihan: “Langsung bayar” atau “Tanya kasir”.
- **SIM-04:** Skenario ketiga menampilkan penelepon fiktif “Pusat Bantuan Bank” yang meminta OTP; pilihan: “Kirim OTP” atau “Tutup telepon”.
- **SIM-05:** Tidak ada berkas yang diunduh/dijalankan, OTP yang diketik, atau pembayaran nyata.
- **SIM-06:** Umpan balik menjelaskan konsekuensi fiktif dan alasan pilihan dengan bahasa yang tidak menyalahkan.
- **SIM-07:** Pilihan pertama tiap skenario menentukan skor belajar: tindakan aman memberi satu poin; tindakan berisiko tidak memberi poin.
- **SIM-08:** Pengguna boleh mencoba ulang sebelum melanjutkan. Ulangan tidak mengubah skor pilihan pertama.
- **SIM-09:** Simulasi baru mereset saldo dan skor sesi.
- **SIM-10:** Hasil akhir menampilkan skor, tindakan aman yang dipelajari, serta akses ke simulasi ulang, SOS, dan Belajar.
- **SIM-11:** Jelaskan bahwa skor hanya untuk belajar dan tidak disimpan atau dibagikan secara default.

### Cek

- **CHECK-01:** Peringatkan pengguna agar tidak memasukkan OTP, PIN, kata sandi, atau data kartu sebelum kolom input.
- **CHECK-02:** Input kosong dan input yang melewati batas ukuran menghasilkan pesan yang jelas.
- **CHECK-03:** MVP lanjutan memeriksa pola lokal; jangan membuka atau mengambil URL yang ditempel.
- **CHECK-04:** Hasil menunjukkan pola, alasan, dan langkah praktis, bukan vonis.
- **CHECK-05:** Hasil tanpa pola menyebut bahwa tidak ditemukannya pola bukan jaminan aman.
- **CHECK-06:** Input tidak disimpan secara default. Klaim pemrosesan lokal dan tidak adanya pengiriman harus diverifikasi secara teknis.

### QRIS

- **QR-01:** Berikan pilihan kamera dan unggah gambar, dengan penjelasan sebelum meminta izin kamera.
- **QR-02:** Kamera ditolak/tidak tersedia menyediakan jalur unggah atau panduan manual.
- **QR-03:** Tampilkan hanya data yang benar-benar terbaca; jangan menebak data yang hilang.
- **QR-04:** Bandingkan nama merchant dengan nama toko yang diharapkan dan tampilkan “Nama sesuai”, “Nama berbeda — verifikasi dahulu”, atau “Informasi belum cukup”.
- **QR-05:** Nama atau CRC tidak menjadi dasar untuk menyatakan merchant pasti aman atau penipu.
- **QR-06:** Jika ditampilkan, CRC dijelaskan sebagai pemeriksaan konsistensi data QR, bukan keaslian merchant atau keamanan pembayaran.
- **QR-07:** Gambar dan payload tidak diunggah atau disimpan setelah implementasi lokal diverifikasi.
- **QR-08:** QR rusak, tak terbaca, atau berformat tak didukung memberi pesan dan pilihan mencoba lagi.

### SOS dan Belajar

- **SOS-01:** Urutkan tindakan: hentikan komunikasi; amankan perangkat jika APK mencurigakan dipasang; hubungi bank/PJP melalui kanal resmi; lapor ke IASC; hubungi polisi bila perlu; gunakan BI BICARA untuk keluhan layanan sistem pembayaran.
- **SOS-02:** Cantumkan bukti yang dapat disiapkan: tangkapan layar, bukti transaksi, rekening/dompet tujuan, waktu kejadian, dan nomor pelaku bila tersedia.
- **SOS-03:** Jangan meminta pengguna mengunggah bukti ke HAWAS.
- **SOS-04:** Cantumkan bahwa pelaporan tidak menjamin dana kembali atau pemblokiran berhasil.
- **SOS-05:** Setiap detail kontak harus bersumber dari dokumen produk, diberi fungsi dan tanggal pemeriksaan; verifikasi ulang sebelum rilis.
- **LEARN-01:** Tampilkan tiga prinsip: jangan instal APK dari chat/sumber tak tepercaya; jangan bagikan OTP/PIN; jangan bayar sebelum memeriksa nama merchant.
- **LEARN-02:** Tiap prinsip memberi alasan, alternatif aman, dan tautan ke skenario terkait.

## Persyaratan nonfungsional

- **Aksesibilitas:** target WCAG 2.2 AA untuk alur inti; keyboard, fokus terlihat, nama kontrol yang jelas, kontras cukup, dan informasi tidak dibedakan oleh warna saja.
- **Gerak:** hormati `prefers-reduced-motion`; animasi bukan satu-satunya media umpan balik.
- **Responsif:** ponsel menjadi prioritas; desktop memakai kolom baca yang terukur, bukan memperlebar konten.
- **Performa:** aset ringan; SOS dan simulasi tidak bergantung pada aset besar atau layanan pihak ketiga.
- **Privasi:** tanpa akun dan tanpa penyimpanan input sensitif. Jangan tambahkan analitik tanpa keputusan privasi terpisah.
- **Bahasa:** bahasa Indonesia yang singkat, spesifik, tidak menghakimi, dan tidak alarmistis.

## Pengukuran

Uji dengan peserta, bukan data identitas atau pelacakan lintas situs. Ukur pilihan aman pada percobaan pertama, pemahaman alasannya, kemampuan menyebut langkah SOS, dan penyelesaian tugas. Tetapkan target setelah uji awal; jangan mengarang baseline.

## Kriteria penerimaan MVP

- Tiga skenario berjalan dari awal sampai hasil akhir dengan skor pilihan pertama yang benar.
- Saldo dan identitas simulasi selalu bertanda fiktif.
- Tidak ada aksi unduh APK, input OTP, pembayaran, atau akses rekening nyata.
- SOS dapat dibuka dari alur utama dan seluruh informasi kontaknya telah diperiksa.
- Beranda, Simulasi, SOS, dan Belajar dapat digunakan pada ponsel tanpa akun.
- Tidak ada input sensitif yang dikirim atau disimpan.
- Uji keyboard, kontras, reduced motion, ukuran layar ponsel, dan jaringan lambat lulus.
- Fitur tahap lanjut tidak tampak aktif sebelum benar-benar tersedia.

## Sumber produk

- [Konsep HAWAS](../hawas.md)
- [PRD sumber](../prd-hawas.md)
- [Prototipe HAWAS](../prototipe-hawas.md)

Kontak SOS dan klaim kontekstual pada sumber tersebut harus diverifikasi kembali sebelum publikasi.
