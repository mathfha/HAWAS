# QRIS

Rilis kedua menerima unggahan JPEG, PNG, atau WebP sampai 10 MiB. `decoder.ts` membaca gambar dengan `qr-scanner` yang dimuat dinamis. `model.ts` memvalidasi payload QRIS dan CRC, lalu menilai checklist konteks melalui fungsi domain murni. `view.ts` menampilkan data penerima, empat pertanyaan sebelum bayar, alasan, dan tindakan berikutnya.

Gambar, payload mentah, hasil, dan jawaban checklist tidak dipersist. Kamera, pembayaran, pemeriksaan reputasi, dan vonis keamanan tetap di luar cakupan.
