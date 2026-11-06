# Cek

Fitur Cek menerima teks pesan dan URL sampai 2.000 karakter. `model.ts` menolak input kosong, terlalu panjang, dan pola yang menyerupai OTP, PIN, kata sandi, atau nomor kartu. Aturan lokal menghasilkan sinyal, kutipan yang disamarkan, alasan, dan tindakan tanpa skor risiko atau vonis keamanan.

Input mentah hanya berada pada textarea sampai pemeriksaan dijalankan. State hasil menyimpan sinyal, kutipan, dan teks untuk AI yang sudah disamarkan selama route aktif. URL tidak dibuka atau diambil.

Jika `VITE_HAWAS_API_BASE_URL` tersedia, hasil rules menawarkan tombol penjelasan AI. Tidak ada request sebelum tombol ditekan. Backend mengulang validasi, penyamaran, dan rules, lalu memakai Vertex AI hanya untuk ringkasan, kategori konteks terkontrol, dan pertanyaan verifikasi. Tindakan aman tetap berasal dari konten HAWAS. Kegagalan AI tidak mengubah hasil rules lokal.

Tidak ada riwayat, database, analytics, atau penyimpanan browser. Backend tidak mencatat isi request dan respons AI.
