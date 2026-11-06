import type { CheckSignalId } from "../features/check/model.ts";

export interface CheckSignalContent {
  title: string;
  reason: string;
  action: string;
  practiceHref?: string;
  practiceLabel?: string;
}

export const checkSignalContent: Record<CheckSignalId, CheckSignalContent> = {
  "secret-request": {
    title: "Permintaan kode atau kata sandi rahasia",
    reason:
      "OTP, PIN, dan kata sandi dapat dipakai untuk masuk atau menyetujui tindakan penting.",
    action:
      "Jangan berikan kode apa pun. Tutup percakapan dan hubungi layanan resmi melalui nomor yang Anda cari sendiri.",
    practiceHref: "#/simulasi/otp",
    practiceLabel: "Coba latihan telepon OTP",
  },
  "apk-install": {
    title: "Permintaan memasang aplikasi atau APK",
    reason:
      "APK adalah berkas pemasang aplikasi Android. Berkas dari chat dapat memasang aplikasi yang tidak Anda kenal.",
    action:
      "Jangan pasang berkas tersebut. Cari aplikasi hanya melalui toko aplikasi resmi.",
    practiceHref: "#/simulasi/kurir-apk",
    practiceLabel: "Coba latihan kurir APK",
  },
  "payment-request": {
    title: "Permintaan mengirim uang atau membayar",
    reason:
      "Permintaan pembayaran perlu diperiksa kepada penerima melalui kanal yang Anda cari sendiri.",
    action:
      "Jangan terburu-buru. Periksa nama penerima, nominal, dan alasan pembayaran sebelum melanjutkan.",
  },
  "urgency-threat": {
    title: "Desakan atau ancaman batas waktu",
    reason:
      "Desakan dapat membuat seseorang melewati pemeriksaan yang biasanya dilakukan.",
    action:
      "Berhenti sejenak. Jangan mengambil keputusan hanya karena pesan meminta tindakan segera.",
  },
  "authority-claim": {
    title: "Pengirim mengaku sebagai lembaga atau petugas",
    reason:
      "Nama lembaga dalam pesan belum membuktikan identitas pengirim.",
    action:
      "Hubungi lembaga tersebut melalui aplikasi, situs, atau nomor resmi yang Anda cari sendiri.",
  },
  "link-present": {
    title: "Pesan memuat tautan",
    reason:
      "HAWAS hanya melihat bentuk teks tautan dan tidak dapat memastikan tujuan atau keamanannya.",
    action:
      "Jangan buka tautan dari pesan yang belum Anda pastikan. Ketik sendiri alamat layanan resmi bila perlu.",
  },
  "reward-offer": {
    title: "Hadiah atau pengembalian dana",
    reason:
      "Hadiah, bonus, atau refund sering disertai syarat yang meminta data atau pembayaran.",
    action:
      "Periksa penawaran melalui kanal resmi. Jangan membayar atau memberikan data untuk mengambil hadiah.",
  },
};
