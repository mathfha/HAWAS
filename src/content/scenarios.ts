export const scenarios = [
  {
    id: "courier-apk",
    title: "Pesan kurir mengirim berkas aplikasi (.APK)",
    context: "Anda menerima pesan chat dari nomor tak dikenal yang mengaku sebagai kurir pengantar paket.",
    messages: [
      { sender: "Pengirim pesan", text: "Paket Anda tertahan di gudang. Silakan buka foto tanda terima paket di bawah ini:" },
      { sender: "Lampiran pesan", text: "Foto_Paket.apk (Berkas aplikasi Android, bukan berkas foto)", kind: "file" },
    ],
    prompt: "Apa tindakan terbaik yang Anda ambil?",
    balanceLoss: 300_000,
    choices: [
      {
        id: "download",
        label: "Pasang aplikasi dari pesan tersebut",
        safety: "risky",
        consequence: "Dalam simulasi ini, saldo latihan Anda berkurang Rp300.000.",
        reason:
          "Berkas dengan akhiran .apk adalah berkas pemasang aplikasi Android, bukan gambar atau foto. Jika dipasang dari pesan chat, aplikasi asing tersebut dapat membaca SMS dan mencuri data rekening perbankan Anda.",
        nextStep:
          "Jangan pernah membuka atau memasang berkas aplikasi dari pesan chat. Selalu periksa nomor resi paket langsung melalui aplikasi belanja atau situs resmi kurir yang Anda buka sendiri.",
      },
      {
        id: "decline",
        label: "Abaikan dan jangan pasang berkas",
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
    context: "Anda sedang berbelanja di warung 'Kopi Berkah' dan hendak membayar dengan memindai kode QR (QRIS).",
    messages: [
      { sender: "Nama toko fisik", text: "Kopi Berkah" },
      { sender: "Nama penerima di layar QRIS", text: "Resto Sukses Pribadi" },
    ],
    prompt: "Nama penerima pada layar ponsel berbeda dari nama toko. Apa yang Anda lakukan?",
    balanceLoss: 25_000,
    choices: [
      {
        id: "pay",
        label: "Langsung bayar tanpa bertanya",
        safety: "risky",
        consequence: "Dalam simulasi ini, saldo latihan Anda berkurang Rp25.000.",
        reason:
          "Nama penerima pembayaran (merchant) yang muncul di layar ponsel tidak sama dengan nama toko tempat Anda berbelanja.",
        nextStep:
          "Perbedaan nama penerima adalah alasan untuk bertanya kepada kasir, bukan bukti pasti adanya penipuan. Pastikan nama penerima sudah sesuai sebelum Anda menekan tombol bayar.",
      },
      {
        id: "ask",
        label: "Tanyakan ke kasir sebelum membayar",
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
    context: "Ponsel Anda berdering dari nomor yang mengaku sebagai 'Pusat Bantuan Bank'.",
    messages: [
      { sender: "Penelepon", text: "Akun perbankan Anda sedang disusupi orang lain dan harus segera diamankan." },
      { sender: "Penelepon", text: "Kami baru saja mengirimkan 6 angka kode SMS (OTP). Tolong sebutkan kodenya sekarang agar kami bisa membantu." },
    ],
    prompt: "Penelepon mendesak Anda memberikan kode SMS tersebut. Apa yang Anda lakukan?",
    balanceLoss: 5_000_000,
    choices: [
      {
        id: "share-otp",
        label: "Sebutkan kode rahasia tersebut kepada penelepon",
        safety: "risky",
        consequence: "Dalam simulasi ini, saldo latihan Anda berkurang Rp5.000.000.",
        reason:
          "Kode OTP (One-Time Password) adalah kode rahasia sekali pakai yang dikirim lewat SMS untuk menyetujui transaksi atau login. Siapa pun yang mengetahui kode ini dapat masuk ke rekening dan menguras saldo Anda.",
        nextStep:
          "Segera tutup telepon. Petugas bank resmi tidak akan pernah meminta kode OTP, PIN, atau kata sandi Anda melalui telepon maupun pesan chat.",
      },
      {
        id: "hang-up",
        label: "Tutup telepon dan jangan berikan kode apa pun",
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
export type ScenarioChoice = Scenario["choices"][number];
export type ChoiceSafety = ScenarioChoice["safety"];
