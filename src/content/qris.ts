import type {
  QrisGuidanceLevel,
  QrisGuidanceReason,
} from "../features/qris/model.ts";

export const qrisGuidanceContent: Record<
  QrisGuidanceLevel,
  { title: string; summary: string; action: string }
> = {
  pause: {
    title: "Berhenti sebelum membayar",
    summary:
      "Ada informasi yang perlu diselesaikan lebih dahulu. Jangan menekan tombol bayar sampai nama penerima, nominal, dan pihak yang meminta pembayaran sudah jelas.",
    action:
      "Tanyakan kepada kasir atau penerima melalui kanal yang Anda cari sendiri. Jika sudah telanjur membayar dan merasa ada masalah, buka Bantuan SOS.",
  },
  verify: {
    title: "Periksa satu hal lagi",
    summary:
      "Informasi yang tersedia belum cukup untuk mengambil keputusan. Selesaikan pemeriksaan yang ditandai sebelum melanjutkan.",
    action:
      "Buka aplikasi pembayaran resmi, cocokkan kembali nama dan nominal, lalu tanyakan jika ada informasi yang belum jelas.",
  },
  "review-complete": {
    title: "Pemeriksaan awal selesai",
    summary:
      "Jawaban Anda tidak menunjukkan perbedaan pada pemeriksaan awal. Ini bukan jaminan transaksi pasti aman.",
    action:
      "Periksa sekali lagi nama penerima dan nominal di aplikasi pembayaran resmi sebelum menekan tombol bayar.",
  },
};

export const qrisReasonContent: Record<
  QrisGuidanceReason,
  { label: string; action: string }
> = {
  "crc-invalid": {
    label: "Susunan data QR tidak konsisten.",
    action: "Minta kode QRIS lain dan jangan memakai hasil pembacaan ini.",
  },
  "crc-missing": {
    label: "Pemeriksaan konsistensi data tidak tersedia.",
    action: "Andalkan informasi yang tampil di aplikasi pembayaran resmi.",
  },
  "source-message": {
    label: "Kode QR diterima melalui chat atau pesan.",
    action: "Pastikan permintaan berasal dari orang atau usaha yang Anda kenal.",
  },
  "source-other": {
    label: "Asal kode QR belum jelas.",
    action: "Cari tahu siapa yang meminta pembayaran sebelum melanjutkan.",
  },
  "recipient-different": {
    label: "Nama penerima berbeda dari informasi toko atau penerima.",
    action: "Tanyakan perbedaan nama dan tunggu penjelasan yang dapat diperiksa.",
  },
  "recipient-not-checked": {
    label: "Nama penerima belum dikonfirmasi.",
    action: "Cocokkan nama di aplikasi pembayaran dengan papan toko atau kasir.",
  },
  "amount-different": {
    label: "Nominal pembayaran berbeda.",
    action: "Jangan membayar sebelum nominal diperbaiki dan dikonfirmasi.",
  },
  "amount-not-checked": {
    label: "Nominal belum diperiksa.",
    action: "Periksa jumlah pembayaran sebelum menekan tombol bayar.",
  },
  "payment-pressure": {
    label: "Ada desakan untuk segera membayar.",
    action: "Berhenti sejenak. Desakan bukan alasan untuk melewati pemeriksaan.",
  },
};
