export const scenarios = [
  {
    id: "courier-apk",
    title: "Pesan kurir mengirim berkas aplikasi (.APK)",
    context: "Dalam contoh fiktif ini, Anda menerima pesan chat dari nomor tak dikenal yang mengaku sebagai kurir pengantar paket.",
    messages: [
      { sender: "Pengirim fiktif", text: "Paket Anda tertahan di gudang. Silakan buka foto tanda terima paket di bawah ini:" },
      { sender: "Lampiran pesan fiktif", text: "Foto_Paket.apk (Berkas aplikasi Android, bukan berkas foto)", kind: "file" },
    ],
    prompt: "Apa tindakan terbaik yang Anda ambil?",
    balanceLoss: 300_000,
    choices: [
      {
        id: "download",
        label: "Unduh APK",
        description:
          "Membuka berkas aplikasi yang dikirim oleh nomor tak dikenal.",
        feedbackImpact:
          "Aplikasi asing dapat membaca SMS dan data pribadi di ponsel.",
        feedbackAction:
          "Jangan buka APK dari chat. Periksa paket lewat aplikasi resmi.",
        safety: "risky",
        consequence: "Dalam simulasi ini, saldo latihan Anda berkurang Rp300.000.",
        reason:
          "Berkas dengan akhiran .apk adalah berkas pemasang aplikasi Android, bukan gambar atau foto. Jika dipasang dari pesan chat, aplikasi asing tersebut dapat membaca SMS dan mencuri data rekening perbankan Anda.",
        nextStep:
          "Jangan pernah membuka atau memasang berkas aplikasi dari pesan chat. Selalu periksa nomor resi paket langsung melalui aplikasi belanja atau situs resmi kurir yang Anda buka sendiri.",
      },
      {
        id: "decline",
        label: "Tolak & blokir",
        description:
          "Menghentikan interaksi dan tidak membuka berkas yang dikirim.",
        feedbackImpact:
          "Berkas tidak dibuka, sehingga data dan saldo latihan tetap terlindungi.",
        feedbackAction:
          "Periksa nomor resi lewat aplikasi belanja atau situs kurir resmi.",
        safety: "safe",
        consequence: "Saldo latihan Anda tetap aman (tidak ada saldo yang berkurang).",
        reason:
          "Anda memilih untuk tidak memasang berkas mencurigakan ke dalam ponsel Anda.",
        nextStep:
          "Jika Anda memang sedang menunggu paket, periksa nomor resi secara mandiri melalui aplikasi tempat Anda berbelanja.",
      },
    ],
  },
  {
    id: "merchant-name",
    title: "Periksa nama penerima saat bayar kode QR (QRIS)",
    context: "Dalam contoh fiktif ini, Anda sedang berbelanja di warung 'Kopi Berkah' dan hendak membayar dengan memindai kode QR (QRIS).",
    messages: [
      { sender: "Nama toko fiktif", text: "Kopi Berkah" },
      { sender: "Nama penerima fiktif di layar QRIS", text: "Resto Sukses Pribadi" },
    ],
    prompt: "Nama penerima pada layar ponsel berbeda dari nama toko. Apa yang Anda lakukan?",
    balanceLoss: 25_000,
    choices: [
      {
        id: "pay",
        label: "Langsung bayar",
        description:
          "Melanjutkan pembayaran saat nama penerima berbeda dari nama toko.",
        feedbackImpact:
          "Saldo latihan dapat terkirim ke nama penerima yang belum Anda kenali.",
        feedbackAction:
          "Hentikan pembayaran dan tanyakan nama penerima kepada kasir.",
        safety: "risky",
        consequence: "Dalam simulasi ini, saldo latihan Anda berkurang Rp25.000.",
        reason:
          "Nama penerima pembayaran (merchant) yang muncul di layar ponsel tidak sama dengan nama toko tempat Anda berbelanja.",
        nextStep:
          "Perbedaan nama penerima adalah alasan untuk bertanya kepada kasir, bukan bukti pasti adanya penipuan. Pastikan nama penerima sudah sesuai sebelum Anda menekan tombol bayar.",
      },
      {
        id: "ask",
        label: "Tanya kasir",
        description:
          "Memastikan nama penerima kepada kasir sebelum melanjutkan pembayaran.",
        feedbackImpact:
          "Anda memastikan tujuan pembayaran sebelum saldo latihan dikirim.",
        feedbackAction:
          "Bayar hanya setelah kasir mengonfirmasi nama penerimanya.",
        safety: "safe",
        consequence: "Saldo latihan Anda tetap aman (tidak ada saldo yang berkurang).",
        reason:
          "Anda berhenti sejenak untuk memastikan nama pemilik rekening tujuan sebelum uang terkirim.",
        nextStep:
          "Tanyakan kepada kasir atau pemilik toko mengapa nama penerima berbeda. Lanjutkan pembayaran hanya setelah kasir mengonfirmasi bahwa nama tersebut memang benar milik mereka.",
      },
    ],
  },
  {
    id: "otp-call",
    title: "Panggilan telepon meminta kode rahasia (OTP)",
    context: "Dalam contoh fiktif ini, ponsel Anda berdering dari nomor yang mengaku sebagai 'Pusat Bantuan Bank'.",
    messages: [
      { sender: "Penelepon fiktif", text: "Akun perbankan Anda sedang disusupi orang lain dan harus segera diamankan." },
      { sender: "Penelepon fiktif", text: "Kami baru saja mengirimkan 6 angka kode SMS (OTP). Tolong sebutkan kodenya sekarang agar kami bisa membantu." },
    ],
    prompt: "Penelepon mendesak Anda memberikan kode SMS tersebut. Apa yang Anda lakukan?",
    balanceLoss: 5_000_000,
    choices: [
      {
        id: "share-otp",
        label: "Kirim OTP",
        description:
          "Memberikan kode rahasia sekali pakai kepada penelepon.",
        feedbackImpact:
          "Kode OTP dapat dipakai untuk masuk atau menyetujui transaksi.",
        feedbackAction:
          "Tutup telepon. Jangan bagikan OTP, PIN, atau kata sandi.",
        safety: "risky",
        consequence: "Dalam simulasi ini, saldo latihan Anda berkurang Rp5.000.000.",
        reason:
          "Kode OTP (One-Time Password) adalah kode rahasia sekali pakai yang dikirim lewat SMS untuk menyetujui transaksi atau login. Siapa pun yang mengetahui kode ini dapat masuk ke rekening dan menguras saldo Anda.",
        nextStep:
          "Segera tutup telepon. Petugas bank resmi tidak akan pernah meminta kode OTP, PIN, atau kata sandi Anda melalui telepon maupun pesan chat.",
      },
      {
        id: "hang-up",
        label: "Tutup telepon",
        description:
          "Mengakhiri panggilan tanpa memberikan kode rahasia.",
        feedbackImpact:
          "Kode rahasia tetap tersimpan dan tidak diberikan kepada penelepon.",
        feedbackAction:
          "Jika khawatir, hubungi bank melalui nomor resmi yang Anda cari sendiri.",
        safety: "safe",
        consequence: "Saldo latihan Anda tetap aman (tidak ada saldo yang berkurang).",
        reason:
          "Anda berhasil menjaga kode rahasia perbankan Anda dari orang asing.",
        nextStep:
          "Jika Anda merasa cemas dengan keamanan rekening, hubungi nomor resmi bank yang tertera pada bagian belakang kartu ATM Anda atau buka aplikasi resmi bank secara mandiri.",
      },
    ],
  },
] as const;

export type Scenario = (typeof scenarios)[number];
export type ScenarioId = Scenario["id"];
export type ScenarioChoice = Scenario["choices"][number];
export type ChoiceSafety = ScenarioChoice["safety"];
