import type { SosIncidentId } from "../features/sos/model.ts";

type SosIncident = {
  id: SosIncidentId;
  label: string;
  title: string;
  summary: string;
  steps: readonly string[];
};

export const sosContent = {
  lastChecked: "6 November 2026",
  urgentActions: [
    "Hentikan komunikasi dengan penelepon atau pengirim pesan.",
    "Jangan berikan OTP, PIN, kata sandi, atau kode rahasia lainnya.",
    "Jika Anda memasang APK dari chat, aktifkan Mode Pesawat sekarang.",
    "Hubungi bank atau dompet digital melalui kanal resmi yang Anda cari sendiri.",
  ],
  incidents: [
    {
      id: "transfer",
      label: "Uang sudah terkirim",
      title: "Jika uang sudah terkirim",
      summary:
        "Hubungi penyedia layanan dan mulai pelaporan secepat mungkin.",
      steps: [
        "Hubungi bank atau dompet digital melalui nomor di belakang kartu, aplikasi resmi, atau situs resminya.",
        "Minta petugas memeriksa transaksi dan mengamankan rekening atau kartu sesuai prosedur mereka.",
        "Laporkan transaksi ke Indonesia Anti-Scam Centre (IASC) melalui situs resmi OJK.",
        "Buat laporan polisi di kantor kepolisian terdekat untuk proses hukum.",
        "Simpan nomor laporan dari setiap pihak yang Anda hubungi.",
      ],
    },
    {
      id: "secret",
      label: "OTP atau PIN dibagikan",
      title: "Jika OTP atau PIN sudah dibagikan",
      summary:
        "Kode rahasia yang terlanjur dibagikan perlu segera ditangani bersama penyedia layanan.",
      steps: [
        "Tutup telepon atau percakapan. Jangan berikan kode tambahan apa pun.",
        "Hubungi bank atau dompet digital melalui kanal resmi dari perangkat yang aman.",
        "Minta petugas mengamankan akun dan kartu sesuai prosedur mereka.",
        "Ganti PIN atau kata sandi hanya melalui aplikasi atau situs resmi, dan ikuti arahan penyedia layanan.",
        "Periksa riwayat transaksi dan laporkan transaksi yang tidak Anda kenali.",
      ],
    },
    {
      id: "apk",
      label: "APK sudah dipasang",
      title: "Jika APK dari chat sudah dipasang",
      summary:
        "Pisahkan ponsel dari internet dan gunakan perangkat lain yang aman untuk meminta bantuan.",
      steps: [
        "Aktifkan Mode Pesawat, lalu pastikan Wi-Fi dan data seluler mati.",
        "Jangan membuka aplikasi bank atau dompet digital di ponsel tersebut.",
        "Gunakan ponsel atau komputer lain yang aman untuk menghubungi bank dan mengganti kata sandi akun penting.",
        "Jangan menyambungkan kembali ponsel ke internet sebelum mendapat bantuan yang dapat dipercaya.",
        "Simpan bukti percakapan yang masih tersedia. Jangan mengirimkan bukti itu ke HAWAS.",
      ],
    },
    {
      id: "payment",
      label: "Pembayaran bermasalah",
      title: "Jika pembayaran QRIS atau transfer bermasalah",
      summary:
        "Sampaikan pengaduan kepada bank atau penyedia pembayaran terlebih dahulu.",
      steps: [
        "Hubungi bank, dompet digital, atau penyedia pembayaran melalui kanal resminya.",
        "Catat nomor pengaduan dan jawaban yang diberikan oleh penyedia layanan.",
        "Jika masalah layanan sistem pembayaran belum terselesaikan, sampaikan pengaduan kepada Bank Indonesia melalui BI BICARA.",
        "BI BICARA menangani pengaduan layanan sistem pembayaran, bukan laporan tindak pidana penipuan.",
      ],
    },
  ] satisfies readonly SosIncident[],
  disclaimer:
    "Pelaporan resmi ke instansi tidak menjamin uang dapat kembali atau rekening pelaku berhasil diblokir. HAWAS adalah media belajar dan tidak menerima pelaporan atau data pribadi.",
  evidence: [
    "Tangkapan layar (screenshot) isi pesan percakapan atau tautan yang dikirimkan",
    "Bukti transfer atau resi pengiriman uang",
    "Nomor rekening bank atau nomor dompet digital tujuan transfer",
    "Waktu dan tanggal lengkap kejadian",
    "Nomor telepon atau nama akun media sosial yang digunakan pelaku",
  ],
  channels: [
    {
      label: "IASC (Indonesia Anti-Scam Centre)",
      purpose: "Pusat pelaporan resmi untuk kasus penipuan transaksi keuangan (dikelola OJK bersama perbankan)",
      href: "https://iasc.ojk.go.id",
    },
    {
      label: "BI BICARA (Bank Indonesia)",
      purpose: "Kanal pengaduan dan keluhan terkait masalah layanan sistem pembayaran",
      href: "https://bicara131.bi.go.id",
      phone: "131",
    },
  ],
} as const;
