import { routes, resolveRoute, type RouteId } from "./routes";
import {
  continueSimulation,
  createSimulationState,
  recordChoice,
  retryScenario,
  type SimulationState,
} from "../features/simulation/model";
import { renderSimulation } from "../features/simulation/view";
import { sosContent } from "../content/sos";
import { mascotIllustrations } from "../content/illustrations";

const pageCopy: Record<RouteId, { title: string; description: string }> = {
  home: {
    title: "Hati-hati dan Awas Bertransaksi",
    description:
      "Panduan dan latihan praktis mengenali risiko transaksi digital tanpa menggunakan uang atau data pribadi nyata.",
  },
  simulation: {
    title: "Latihan Simulasi Transaksi",
    description:
      "Latihan menghadapi tiga contoh situasi transaksi digital yang sering terjadi sehari-hari menggunakan saldo dan data tiruan.",
  },
  check: {
    title: "Cek Pola Pesan (Tahap Pengembangan)",
    description:
      "Fitur pemeriksaan pola pesan mencurigakan ini belum tersedia. Jangan tempelkan pesan, nomor rekening, atau data pribadi apa pun di sini.",
  },
  qris: {
    title: "Periksa Kode QRIS (Tahap Pengembangan)",
    description:
      "Fitur pemeriksaan kode QR ini belum tersedia. HAWAS tidak sedang membaca, memeriksa, atau memproses kode pembayaran apa pun.",
  },
  sos: {
    title: "Panduan Darurat jika Mengalami Masalah (Bantuan SOS)",
    description:
      "Langkah-langkah penyelamatan yang perlu segera Anda ambil jika telanjur mengirim uang ke pihak mencurigakan, membagikan kode rahasia, atau memasang aplikasi asing.",
  },
  learn: {
    title: "Panduan Belajar: Tiga Kebiasaan Aman",
    description:
      "Tiga prinsip kebiasaan sederhana yang mudah diingat agar Anda dan keluarga terhindar dari jeratan penipuan transaksi digital.",
  },
  "not-found": {
    title: "Halaman Tidak Ditemukan",
    description: "Alamat yang Anda tuju tidak tersedia. Silakan kembali ke Beranda untuk melanjutkan.",
  },
};

const navIcons: Record<string, string> = {
  home: `<svg class="nav-icon" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 9.5L12 3l9 6.5V20a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9.5z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
  simulation: `<svg class="nav-icon" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="2" width="14" height="20" rx="2.5"/><line x1="12" y1="18" x2="12.01" y2="18" stroke-width="3"/></svg>`,
  check: `<svg class="nav-icon" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.5" y2="16.5"/></svg>`,
  qris: `<svg class="nav-icon" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="9" y="9" width="6" height="6" fill="currentColor"/></svg>`,
  learn: `<svg class="nav-icon" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 4h6a4 4 0 0 1 4 4v12a3 3 0 0 0-3-3H2z"/><path d="M22 4h-6a4 4 0 0 0-4 4v12a3 3 0 0 1 3-3h7z"/></svg>`,
  sos: `<svg class="nav-icon" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><circle cx="12" cy="17" r="0.75" fill="currentColor"/></svg>`,
};

function renderNavigation(activeRoute: RouteId): string {
  return routes
    .map(
      (route) => `
        <a
          class="nav-link${route.id === activeRoute ? " nav-link--active" : ""}${route.id === "sos" ? " nav-link--sos" : ""}"
          href="${route.href}"
          ${route.id === activeRoute ? 'aria-current="page"' : ""}
        >
          ${navIcons[route.id] || ""}
          <span class="nav-link__label">${route.label}</span>
        </a>
      `,
    )
    .join("");
}

function renderHome(): string {
  return `
    <div class="mascot-intro-banner">
      ${mascotIllustrations.intro}
      <div class="mascot-intro-bubble">
        <strong>Halo! Saya Pak RT, pemandu warga.</strong>
        <p>Saya akan membantu Anda belajar mengenali jebakan penipuan digital lewat latihan aman di ponsel.</p>
      </div>
    </div>

    <p class="eyebrow">Panduan keamanan transaksi digital masyarakat</p>
    <h1 id="page-title" tabindex="-1">Hati-hati dan Awas Bertransaksi (HAWAS)</h1>
    <p class="lead">Media belajar mandiri untuk melatih kewaspadaan saat bertransaksi di ponsel. Tanpa memakai uang sungguhan, tanpa mendaftar akun, dan tanpa meminta data pribadi Anda.</p>
    
    <div class="actions">
      <a class="button button--primary" href="#/simulasi">Mulai latihan simulasi (3 situasi)</a>
      <a class="button button--quiet" href="#/sos">Sedang mengalami masalah? Buka Bantuan SOS</a>
    </div>

    <section class="section" aria-labelledby="scenarios-heading">
      <p class="eyebrow">Tiga contoh situasi latihan</p>
      <h2 id="scenarios-heading">Kenali tanda-tandanya sebelum mengambil tindakan</h2>
      <ol class="scenario-list">
        <li>
          <span class="step-number">01</span>
          <div>
            <strong>Pesan kurir mengirim berkas aplikasi Android (.APK)</strong>
            <p class="scenario-list__desc">Waspada jika ada orang asing di chat yang mengirimkan berkas berakhiran <code>.apk</code> dengan alasan foto paket atau surat.</p>
          </div>
        </li>
        <li>
          <span class="step-number">02</span>
          <div>
            <strong>Perbedaan nama penerima saat bayar dengan kode QR (QRIS)</strong>
            <p class="scenario-list__desc">Waspada jika nama penerima yang muncul di layar ponsel tidak sama dengan nama toko fisik tempat Anda berbelanja.</p>
          </div>
        </li>
        <li>
          <span class="step-number">03</span>
          <div>
            <strong>Panggilan telepon mendesak meminta kode rahasia sekali pakai (OTP)</strong>
            <p class="scenario-list__desc">Waspada jika ada penelepon yang mengaku dari bank atau layanan resmi dan meminta Anda membacakan kode rahasia SMS.</p>
          </div>
        </li>
      </ol>
    </section>

    <section class="section" aria-labelledby="how-it-works-heading">
      <p class="eyebrow">Prinsip penggunaan</p>
      <h2 id="how-it-works-heading">Cara kerja situs edukasi ini</h2>
      <ol class="scenario-list">
        <li>
          <span class="step-number">A</span>
          <div>
            <strong>Latihan mandiri tanpa risiko uang:</strong>
            <p class="scenario-list__desc">Anda diberikan saldo tiruan untuk mencoba mengambil keputusan pada contoh kasus sehari-hari.</p>
          </div>
        </li>
        <li>
          <span class="step-number">B</span>
          <div>
            <strong>Penjelasan yang membangun:</strong>
            <p class="scenario-list__desc">Setiap pilihan disertai penjelasan alasan mengapa berisiko atau lebih aman, tanpa menyalahkan Anda.</p>
          </div>
        </li>
        <li>
          <span class="step-number">C</span>
          <div>
            <strong>Bantuan darurat selalu siap:</strong>
            <p class="scenario-list__desc">Menu Bantuan SOS selalu tersedia di bagian atas untuk memandu langkah penyelamatan jika Anda menghadapi masalah nyata.</p>
          </div>
        </li>
      </ol>
    </section>

    <div class="trust-note" role="note">
      <strong>Catatan penting:</strong> HAWAS adalah media edukasi publik independen, bukan layanan resmi bank, Bank Indonesia (BI), atau Otoritas Jasa Keuangan (OJK). HAWAS tidak pernah meminta PIN, kata sandi, kode OTP, atau nomor rekening Anda.
    </div>
  `;
}

function renderSos(): string {
  return `
    <p class="eyebrow">Panduan darurat transaksi</p>
    <h1 id="page-title" tabindex="-1">Langkah Penyelamatan jika Anda Mengalami Masalah</h1>
    <p class="lead">Jika Anda baru saja mengirim uang ke pihak yang mencurigakan, membagikan kode rahasia, atau memasang aplikasi asing, segera lakukan langkah penyelamatan berikut secara berurutan:</p>

    <ol class="sos-list">
      <li>
        <div>
          <strong>Langkah 1: Hentikan komunikasi dan amankan ponsel Anda sekarang juga</strong>
          <p class="sos-list__desc">Jangan berikan kode rahasia (OTP atau PIN) apa pun lagi kepada penelepon atau pengirim pesan.</p>
          <div class="sos-highlight-box">
            <strong>Jika Anda sempat memasang berkas aplikasi (.APK) dari chat:</strong>
            <p class="sos-highlight-box__desc">Segera putuskan koneksi internet di ponsel tersebut (aktifkan Mode Pesawat atau matikan Wi-Fi dan data seluler). Jangan membuka aplikasi perbankan di ponsel itu. Ganti kata sandi akun penting Anda dari ponsel atau komputer lain yang aman.</p>
          </div>
        </div>
      </li>
      <li>
        <div>
          <strong>Langkah 2: Segera hubungi pihak bank atau penyedia dompet digital Anda</strong>
          <p class="sos-list__desc">Buka nomor resmi yang Anda cari sendiri (misalnya nomor telepon di belakang kartu ATM atau aplikasi resmi bank). Minta petugas bank untuk memblokir rekening atau kartu Anda sementara waktu agar saldo tidak terkuras lebih lanjut.</p>
        </div>
      </li>
      <li>
        <div>
          <strong>Langkah 3: Laporkan penipuan transaksi keuangan ke IASC (OJK)</strong>
          <p class="sos-list__desc">Kanal resmi pelaporan penipuan keuangan: <strong>Indonesia Anti-Scam Centre (IASC)</strong> di situs <a href="https://iasc.ojk.go.id" target="_blank" rel="noreferrer">iasc.ojk.go.id</a>. Kanal ini dikelola bersama oleh Otoritas Jasa Keuangan (OJK) dan asosiasi perbankan. Jika Anda mengalami kerugian uang nyata, buat pula laporan ke kantor kepolisian setempat.</p>
        </div>
      </li>
      <li>
        <div>
          <strong>Langkah 4: Untuk masalah atau keluhan sistem pembayaran, hubungi BI BICARA (Bank Indonesia)</strong>
          <p class="sos-list__desc">Jika Anda mengalami kendala teknis pada layanan sistem pembayaran antarbank, hubungi BI BICARA melalui telepon <strong>131</strong> atau situs <a href="https://bicara131.bi.go.id" target="_blank" rel="noreferrer">bicara131.bi.go.id</a>. Catatan: Kanal ini ditujukan untuk keluhan sistem pembayaran resmi, bukan untuk laporan tindak pidana penipuan.</p>
        </div>
      </li>
    </ol>

    <section class="section" aria-labelledby="evidence-heading">
      <p class="eyebrow">Persiapan pelaporan</p>
      <h2 id="evidence-heading">Bukti yang perlu Anda siapkan sebelum melapor</h2>
      <p class="evidence-lead">Kumpulkan informasi berikut agar mempermudah petugas saat memproses laporan Anda:</p>
      <ul class="evidence-list">
        ${sosContent.evidence.map((item) => `<li>${item}</li>`).join("")}
      </ul>
    </section>

    <div class="disclaimer" role="note">
      <strong>Peringatan penting:</strong> ${sosContent.disclaimer} Jangan pernah mengunggah bukti, nomor rekening, atau data pribadi Anda ke dalam situs web HAWAS ini.
    </div>
    <p class="source-note">Informasi kontak dicatat dan diperiksa berkala (terakhir diperiksa November 2026). Selalu pastikan Anda membuka alamat resmi yang tepercaya.</p>
  `;
}

function renderLearn(): string {
  return `
    <p class="eyebrow">Panduan belajar mandiri</p>
    <h1 id="page-title" tabindex="-1">Tiga Kebiasaan Sederhana agar Aman Bertransaksi</h1>
    <p class="lead">Sebagian besar modus kejahatan digital memanfaatkan kepanikan atau rasa terburu-buru. Terapkan tiga kebiasaan ini untuk melindungi diri dan keluarga:</p>

    <ol class="scenario-list">
      <li>
        <span class="step-number">01</span>
        <div>
          <strong>Kebiasaan 1: Jangan pasang berkas aplikasi (.APK) yang dikirim lewat chat</strong>
          <p class="scenario-list__desc">
            <strong>Penjelasan sederhana:</strong> Berkas dengan nama berakhiran <code>.apk</code> adalah berkas pemasang aplikasi di ponsel Android. Penipu sering menyamarkannya sebagai foto paket kurir, surat undangan pernikahan, atau surat tilang. Jika berkas ini dipasang, ponsel Anda bisa disusupi sehingga pelaku dapat membaca SMS dan menguras rekening Anda.
          </p>
          <p class="scenario-list__desc"><strong>Langkah aman:</strong> Pasang aplikasi hanya dari toko resmi Google Play Store. <a href="#/simulasi">Coba latihan skenario kurir APK</a></p>
        </div>
      </li>
      <li>
        <span class="step-number">02</span>
        <div>
          <strong>Kebiasaan 2: Jangan pernah membagikan kode rahasia (OTP) atau PIN kepada siapa pun</strong>
          <p class="scenario-list__desc">
            <strong>Penjelasan sederhana:</strong> Kode OTP (One-Time Password) adalah 6 angka rahasia sekali pakai yang dikirimkan bank lewat SMS untuk menyetujui transaksi penting. Petugas bank atau kurir resmi tidak akan pernah meminta kode rahasia ini lewat telepon atau chat. Siapa pun yang memintanya patut dicurigai.
          </p>
          <p class="scenario-list__desc"><strong>Langkah aman:</strong> Tutup telepon jika ada yang meminta kode SMS rahasia Anda. <a href="#/simulasi">Coba latihan skenario panggilan telepon</a></p>
        </div>
      </li>
      <li>
        <span class="step-number">03</span>
        <div>
          <strong>Kebiasaan 3: Selalu periksa nama penerima sebelum menyetujui pembayaran kode QR (QRIS)</strong>
          <p class="scenario-list__desc">
            <strong>Penjelasan sederhana:</strong> Saat Anda memindai kode QRIS di warung atau toko, layar ponsel Anda akan menampilkan nama penerima pembayaran (merchant). Selalu cocokkan nama yang tertera di layar dengan nama toko tempat Anda berdiri. Jika nama yang tertera berbeda, jangan langsung bayar.
          </p>
          <p class="scenario-list__desc"><strong>Langkah aman:</strong> Tanyakan kepada kasir sebelum konfirmasi pembayaran. Perbedaan nama adalah alasan untuk bertanya, bukan vonis penipuan. <a href="#/simulasi">Coba latihan skenario kode QR (QRIS)</a></p>
        </div>
      </li>
    </ol>

    <div class="actions">
      <a class="button button--primary" href="#/simulasi">Mulai latihan simulasi sekarang</a>
      <a class="button button--quiet" href="#/sos">Lihat panduan darurat SOS</a>
    </div>
  `;
}

function renderPage(
  routeId: RouteId,
  simulationState: SimulationState | null,
): string {
  if (routeId === "home") return renderHome();
  if (routeId === "sos") return renderSos();
  if (routeId === "learn") return renderLearn();
  if (routeId === "simulation") return renderSimulation(simulationState);

  if (routeId === "not-found") {
    return `
      <p class="eyebrow">404: Tidak ditemukan</p>
      <h1 id="page-title" tabindex="-1">${pageCopy[routeId].title}</h1>
      <p class="lead">${pageCopy[routeId].description}</p>
      <a class="button button--quiet" href="#/">Kembali ke Beranda</a>
    `;
  }

  const copy = pageCopy[routeId];
  return `
    <p class="eyebrow">Tahap pengembangan</p>
    <h1 id="page-title" tabindex="-1">${copy.title}</h1>
    <p class="lead">${copy.description}</p>
    <div class="simulation-notice-box" role="note">
      <h2 class="simulation-notice-box__title">Keterangan ketersediaan:</h2>
      <p class="simulation-notice-box__list">Halaman ini belum aktif dan sengaja tidak menerima input teks atau berkas apa pun dari pengguna. Halaman ini akan dibuka pada tahap rilis berikutnya.</p>
    </div>
    <a class="button button--quiet" href="#/">Kembali ke Beranda</a>
  `;
}

export function mountApp(root: HTMLElement): void {
  let simulationState: SimulationState | null = null;

  const render = (): void => {
    const activeRoute = resolveRoute(window.location.hash);
    const page = pageCopy[activeRoute];

    root.innerHTML = `
      <a class="skip-link" href="#main-content">Lewati langsung ke konten utama</a>
      <div class="app-shell">
        <header class="site-header">
          <div class="site-header__top">
            <a class="wordmark" href="#/" aria-label="HAWAS, Beranda Utama">HAWAS</a>
            <span class="header-caption">Hati-hati dan Awas Bertransaksi</span>
          </div>
          <nav class="site-nav" aria-label="Navigasi menu utama">${renderNavigation(activeRoute)}</nav>
        </header>
        <div class="page-layout">
          <main id="main-content" class="main-content" tabindex="-1">
            ${renderPage(activeRoute, simulationState)}
          </main>
        </div>
        <footer class="site-footer">
          <span>HAWAS: Media edukasi keamanan transaksi digital masyarakat. Bukan layanan resmi bank, BI, atau OJK.</span>
          <span class="footer-label">Versi 0.1</span>
        </footer>
      </div>
    `;

    document.title = `${page.title} | HAWAS`;
    const heading = root.querySelector<HTMLElement>("#page-title");
    heading?.focus({ preventScroll: true });
  };

  root.addEventListener("click", (event) => {
    if (!(event.target instanceof Element)) return;
    const button = event.target.closest<HTMLButtonElement>(
      "[data-simulation-action]",
    );
    if (!button || resolveRoute(window.location.hash) !== "simulation") return;

    const action = button.dataset.simulationAction;
    if (action === "begin" || action === "restart") {
      simulationState = createSimulationState();
    } else if (action === "choose" && simulationState) {
      const safety = button.dataset.safety;
      if (safety !== "safe" && safety !== "risky") return;
      simulationState = recordChoice(simulationState, safety);
    } else if (action === "retry" && simulationState) {
      simulationState = retryScenario(simulationState);
    } else if (action === "continue" && simulationState) {
      simulationState = continueSimulation(simulationState);
    } else if (action === "exit") {
      simulationState = null;
      window.location.hash = "#/";
      return;
    } else {
      return;
    }

    render();
  });

  window.addEventListener("hashchange", render);
  render();
}
