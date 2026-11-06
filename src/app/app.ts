import {
  getPracticeHref,
  resolvePracticeScenario,
  routes,
  resolveRoute,
  type RouteId,
} from "./routes.ts";
import {
  continueSimulation,
  createPracticeSimulationState,
  createSelectedSimulationState,
  createSimulationState,
  initialFictionalBalance,
  isScenarioId,
  recordChoice,
  restartSimulation,
  retryScenario,
  validateStartingBalance,
  type SimulationState,
} from "../features/simulation/model.ts";
import { renderSimulation } from "../features/simulation/view.ts";
import {
  analyzeCheckInput,
  createCheckResultState,
  createCheckState,
  prepareCheckAiInput,
  setCheckAiError,
  setCheckAiLoading,
  setCheckAiSuccess,
  validateCheckInput,
  type CheckViewState,
} from "../features/check/model.ts";
import { requestCheckAiExplanation } from "../features/check/client.ts";
import { renderCheck } from "../features/check/view.ts";
import { sosContent } from "../content/sos.ts";
import { mascotIllustrations } from "../content/illustrations.ts";
import { scenarios } from "../content/scenarios.ts";
import { decodeQrisImage } from "../features/qris/decoder.ts";
import {
  createDecodedQrisState,
  createQrisState,
  createReviewedQrisState,
  isQrisCheckAnswer,
  isQrisPressureAnswer,
  isQrisSource,
  QrisDomainError,
  validateQrisImageFile,
  type QrisContextAnswers,
  type QrisViewState,
} from "../features/qris/model.ts";
import { renderQris } from "../features/qris/view.ts";
import {
  isSosIncidentId,
  shouldShowSosIncident,
  toggleSosIncident,
  type SosIncidentId,
} from "../features/sos/model.ts";

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
    title: "Cek Pola Pesan",
    description:
      "Periksa pola dalam teks pesan dan URL melalui aturan lokal tanpa membuka tautan.",
  },
  qris: {
    title: "Panduan Sebelum Bayar QRIS",
    description:
      "Baca informasi QRIS dan periksa situasi pembayaran sebelum mengambil keputusan.",
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
    <section class="home-hero" aria-labelledby="page-title">
      <div class="mascot-intro-banner">
        ${mascotIllustrations.intro}
        <div class="mascot-intro-bubble">
          <strong>Halo! Saya Pemandu Edukasi Pembayaran Digital.</strong>
          <p>Saya akan membantu Anda belajar mengenali jebakan penipuan digital lewat latihan aman di ponsel sesuai panduan literasi transaksi.</p>
        </div>
      </div>

      <div class="home-hero__content">
        <p class="eyebrow">Panduan keamanan transaksi digital masyarakat</p>
        <h1 id="page-title" tabindex="-1">Hati-hati dan Awas Bertransaksi (HAWAS)</h1>
        <p class="lead">Media belajar mandiri untuk melatih kewaspadaan saat bertransaksi di ponsel. Tanpa memakai uang sungguhan, tanpa mendaftar akun, dan tanpa meminta data pribadi Anda.</p>

        <div class="actions">
          <a class="button home-hero__primary" href="#/simulasi">Mulai latihan simulasi (3 situasi)</a>
          <a class="button home-hero__sos" href="#/sos">Sedang mengalami masalah? Buka Bantuan SOS</a>
        </div>
      </div>
    </section>

    <section class="section home-section home-section--situations" aria-labelledby="scenarios-heading">
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

    <section class="section home-section home-section--principles" aria-labelledby="how-it-works-heading">
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

function renderSosChannelActions(incidentId: SosIncidentId): string {
  if (incidentId === "transfer") {
    return `
      <div class="sos-channel-actions">
        <a class="button sos-button--emergency" href="https://iasc.ojk.go.id" target="_blank" rel="noopener noreferrer" aria-label="Buka situs resmi IASC, membuka tab baru">Buka situs resmi IASC</a>
        <span>Situs resmi: <strong>iasc.ojk.go.id</strong></span>
      </div>
    `;
  }

  if (incidentId === "payment") {
    return `
      <div class="sos-channel-actions">
        <a class="button sos-button--emergency" href="tel:131">Telepon BI BICARA 131</a>
        <a class="button button--quiet" href="https://bicara131.bi.go.id" target="_blank" rel="noopener noreferrer" aria-label="Buka portal resmi BI BICARA, membuka tab baru">Buka portal BI BICARA</a>
        <span>Portal resmi: <strong>bicara131.bi.go.id</strong></span>
      </div>
    `;
  }

  return "";
}

export function renderSos(selectedIncidents: readonly SosIncidentId[] = []): string {
  const selectionStatus =
    selectedIncidents.length === 0
      ? "Semua panduan sedang ditampilkan."
      : `${selectedIncidents.length} panduan dipilih.`;

  return `
    <section class="sos-page" aria-labelledby="page-title">
      <header class="sos-intro">
        <h1 id="page-title" tabindex="-1">Panduan Darurat Transaksi</h1>
        <p class="lead">Jika Anda baru saja mengirim uang, membagikan kode rahasia, atau memasang aplikasi asing, ikuti tindakan berikut dengan tenang.</p>
      </header>

      <section class="sos-now" aria-labelledby="sos-now-title">
        <h2 id="sos-now-title">Lakukan sekarang</h2>
        <ol class="sos-now__list">
          ${sosContent.urgentActions
            .map((action) => `<li><span>${action}</span></li>`)
            .join("")}
        </ol>
      </section>

      <section class="sos-picker" aria-labelledby="sos-picker-title">
        <div class="sos-picker__heading">
          <div>
            <h2 id="sos-picker-title">Apa yang terjadi?</h2>
            <p>Pilih satu atau beberapa kejadian untuk menampilkan langkah yang sesuai.</p>
          </div>
          <button class="sos-show-all" type="button" data-sos-filter="all" aria-pressed="${selectedIncidents.length === 0}">Tampilkan semua langkah</button>
        </div>
        <div class="sos-filter-grid" role="group" aria-label="Pilih kejadian yang dialami">
          ${sosContent.incidents
            .map(
              (incident) => `
                <button
                  class="sos-filter"
                  type="button"
                  data-sos-filter="${incident.id}"
                  aria-pressed="${selectedIncidents.includes(incident.id)}"
                >${incident.label}</button>
              `,
            )
            .join("")}
        </div>
        <p class="sos-selection-status" aria-live="polite">${selectionStatus} Pilihan tidak disimpan.</p>
      </section>

      <section class="sos-guidance" aria-labelledby="sos-guidance-title">
        <h2 id="sos-guidance-title">Langkah penyelamatan</h2>
        <div class="sos-incident-list">
          ${sosContent.incidents
            .map(
              (incident) => `
                <article
                  class="sos-incident"
                  id="sos-${incident.id}"
                  data-sos-incident="${incident.id}"
                  ${shouldShowSosIncident(selectedIncidents, incident.id) ? "" : "hidden"}
                >
                  <header>
                    <h3>${incident.title}</h3>
                    <p>${incident.summary}</p>
                  </header>
                  <ol>
                    ${incident.steps.map((step) => `<li>${step}</li>`).join("")}
                  </ol>
                  ${renderSosChannelActions(incident.id)}
                </article>
              `,
            )
            .join("")}
        </div>
      </section>

      <details class="sos-evidence" id="sos-evidence">
        <summary>Bukti yang perlu disiapkan untuk laporan</summary>
        <p>Kumpulkan informasi yang tersedia. Jangan menunda tindakan darurat hanya karena bukti belum lengkap.</p>
        <ul>
          ${sosContent.evidence.map((item) => `<li>${item}</li>`).join("")}
        </ul>
      </details>

      <div class="sos-disclaimer" role="note">
        <strong>Peringatan:</strong>
        <p>${sosContent.disclaimer} Jangan unggah bukti, nomor rekening, atau data pribadi ke HAWAS.</p>
      </div>
      <p class="sos-source-note">Kanal resmi terakhir diperiksa ${sosContent.lastChecked}. Pastikan alamat yang dibuka adalah <strong>iasc.ojk.go.id</strong> atau <strong>bicara131.bi.go.id</strong>.</p>
    </section>
  `;
}

export function renderLearn(): string {
  return `
    <section class="learn-page" aria-labelledby="page-title">
      <header class="learn-intro">
        <h1 id="page-title" tabindex="-1">Tiga Kebiasaan Sederhana agar Aman Bertransaksi</h1>
        <p class="lead">Saat merasa panik atau diburu waktu, berhenti sebentar. Baca tiga pengingat singkat dari warga berikut.</p>
        <p class="learn-intro__hint">Baca pengingat singkatnya terlebih dahulu. Buka penjelasan hanya jika Anda ingin mengetahui alasannya.</p>
      </header>

      <div class="learn-stories">
        <article class="learn-story" aria-labelledby="learn-apk-title">
          <header class="learn-story__header">
            <span class="learn-story__number" aria-hidden="true">01</span>
            <div>
              <h2 id="learn-apk-title">Jangan pasang APK yang dikirim lewat chat</h2>
              <p class="learn-story__topic">Berkas aplikasi Android (APK)</p>
            </div>
          </header>
          <figure class="learn-story__scene">
            <div class="learn-story__image-frame">
              <img src="/img/learn-apk-guide.webp" alt="Pemandu warga menunjukkan berkas aplikasi mencurigakan di ponsel dan memberi isyarat berhenti" width="900" height="690" />
            </div>
            <figcaption class="learn-speech">
              <blockquote>“Ada berkas paket berakhiran <code>.apk</code> dari chat? Jangan dipasang. Cari aplikasinya di toko resmi.”</blockquote>
              <span>Ilustrasi pemandu warga</span>
            </figcaption>
          </figure>
          <div class="learn-story__takeaway">
            <strong>Ingat singkat:</strong>
            <p>APK adalah berkas pemasang aplikasi Android, bukan foto atau dokumen biasa.</p>
          </div>
          <details class="learn-story__details">
            <summary>Mengapa ini penting?</summary>
            <p>Berkas APK dapat disamarkan sebagai foto paket, undangan, atau surat tilang. Jika dipasang dari sumber tidak tepercaya, aplikasi tersebut dapat meminta akses berbahaya pada ponsel.</p>
            <p>Pasang aplikasi hanya dari toko aplikasi resmi. Jika ragu, jangan buka berkasnya.</p>
          </details>
          <a class="button button--primary learn-story__action" href="${getPracticeHref("courier-apk")}">Coba latihan kurir APK</a>
        </article>

        <article class="learn-story learn-story--reverse" aria-labelledby="learn-otp-title">
          <header class="learn-story__header">
            <span class="learn-story__number" aria-hidden="true">02</span>
            <div>
              <h2 id="learn-otp-title">Jangan berikan kode rahasia kepada siapa pun</h2>
              <p class="learn-story__topic">Kode rahasia OTP dan PIN</p>
            </div>
          </header>
          <figure class="learn-story__scene">
            <div class="learn-story__image-frame">
              <img src="/img/learn-otp-guide.webp" alt="Seorang warga dengan tenang menekan tombol untuk menutup panggilan mencurigakan" width="900" height="822" loading="lazy" decoding="async" />
            </div>
            <figcaption class="learn-speech">
              <blockquote>“Ada yang meminta OTP atau PIN? Saya tutup telepon. Kode rahasia hanya untuk saya.”</blockquote>
              <span>Ilustrasi warga yang waspada</span>
            </figcaption>
          </figure>
          <div class="learn-story__takeaway">
            <strong>Ingat singkat:</strong>
            <p>OTP adalah kode rahasia sekali pakai untuk menyetujui tindakan penting.</p>
          </div>
          <details class="learn-story__details">
            <summary>Mengapa ini penting?</summary>
            <p>OTP biasanya dikirim melalui SMS atau aplikasi untuk menyetujui transaksi. PIN juga bersifat rahasia. Jangan membacakan atau mengirimkannya melalui telepon maupun chat.</p>
            <p>Jika seseorang mendesak meminta kode tersebut, tutup komunikasi lalu hubungi layanan resmi melalui nomor yang Anda cari sendiri.</p>
          </details>
          <a class="button button--primary learn-story__action" href="${getPracticeHref("otp-call")}">Coba latihan telepon OTP</a>
        </article>

        <article class="learn-story" aria-labelledby="learn-qris-title">
          <header class="learn-story__header">
            <span class="learn-story__number" aria-hidden="true">03</span>
            <div>
              <h2 id="learn-qris-title">Periksa nama penerima sebelum membayar</h2>
              <p class="learn-story__topic">Pembayaran kode QRIS</p>
            </div>
          </header>
          <figure class="learn-story__scene">
            <div class="learn-story__image-frame learn-story__image-frame--wide">
              <img src="/img/learn-qris-guide.webp" alt="Pembeli dan kasir bersama-sama memeriksa nama penerima pembayaran pada layar ponsel" width="1000" height="667" loading="lazy" decoding="async" />
            </div>
            <figcaption class="learn-speech">
              <blockquote>“Sebelum bayar QRIS, lihat nama penerimanya. Jika terasa berbeda, tanyakan kepada kasir.”</blockquote>
              <span>Ilustrasi kasir dan pembeli</span>
            </figcaption>
          </figure>
          <div class="learn-story__takeaway">
            <strong>Ingat singkat:</strong>
            <p>Nama penerima yang berbeda adalah alasan untuk bertanya, bukan bukti penipuan.</p>
          </div>
          <details class="learn-story__details">
            <summary>Mengapa ini penting?</summary>
            <p>QRIS adalah kode bayar digital nasional. Setelah dipindai, aplikasi pembayaran menampilkan nama penerima pembayaran.</p>
            <p>Cocokkan nama tersebut dengan informasi dari kasir. Jika berbeda atau terasa asing, jangan buru-buru membayar.</p>
          </details>
          <a class="button button--primary learn-story__action" href="${getPracticeHref("merchant-name")}">Coba latihan periksa QRIS</a>
        </article>
      </div>

      <div class="learn-closing">
        <strong>Ingat tiga tindakan: jangan pasang, jangan bagikan, dan periksa sebelum bayar.</strong>
        <div class="actions">
          <a class="button button--primary" href="#/simulasi">Mulai simulasi lengkap</a>
          <a class="button button--quiet" href="#/sos">Buka panduan darurat SOS</a>
        </div>
      </div>
    </section>
  `;
}

function renderPage(
  routeId: RouteId,
  simulationState: SimulationState | null,
  simulationStartingBalance: number,
  checkState: CheckViewState,
  qrisState: QrisViewState,
  selectedSosIncidents: readonly SosIncidentId[],
  checkAiEnabled = false,
): string {
  if (routeId === "home") return renderHome();
  if (routeId === "sos") return renderSos(selectedSosIncidents);
  if (routeId === "learn") return renderLearn();
  if (routeId === "simulation") {
    return renderSimulation(simulationState, simulationStartingBalance);
  }
  if (routeId === "check") {
    return renderCheck(checkState, { aiEnabled: checkAiEnabled });
  }
  if (routeId === "qris") return renderQris(qrisState);

  return `
    <p class="eyebrow">404: Tidak ditemukan</p>
    <h1 id="page-title" tabindex="-1">${pageCopy[routeId].title}</h1>
    <p class="lead">${pageCopy[routeId].description}</p>
    <a class="button button--quiet" href="#/">Kembali ke Beranda</a>
  `;
}

export function mountApp(root: HTMLElement): void {
  let simulationState: SimulationState | null = null;
  let simulationStartingBalance = initialFictionalBalance;
  let checkState = createCheckState();
  let qrisState = createQrisState();
  let qrisRequestId = 0;
  let checkAiRequestId = 0;
  let checkAiAbortController: AbortController | null = null;
  let selectedSosIncidents: SosIncidentId[] = [];

  const checkAiApiBaseUrl = (
    import.meta.env?.VITE_HAWAS_API_BASE_URL ?? ""
  )
    .trim()
    .replace(/\/$/, "");

  const render = (focusTarget: string | null = null): void => {
    const activeRoute = resolveRoute(window.location.hash);
    const practiceScenarioId = resolvePracticeScenario(window.location.hash);

    if (activeRoute === "simulation") {
      if (
        practiceScenarioId &&
        (simulationState?.scope.kind !== "practice" ||
          simulationState.scope.scenarioId !== practiceScenarioId)
      ) {
        simulationState = createPracticeSimulationState(
          practiceScenarioId,
          simulationStartingBalance,
        );
      } else if (
        !practiceScenarioId &&
        simulationState?.scope.kind === "practice"
      ) {
        simulationState = null;
      }
    } else if (simulationState?.scope.kind === "practice") {
      simulationState = null;
    }

    if (activeRoute !== "qris" && qrisState.stage !== "idle") {
      qrisRequestId += 1;
      qrisState = createQrisState();
    }

    if (activeRoute !== "check" && checkState.stage !== "idle") {
      checkAiRequestId += 1;
      checkAiAbortController?.abort();
      checkAiAbortController = null;
      checkState = createCheckState();
    }

    const page = pageCopy[activeRoute];

    root.innerHTML = `
      <a class="skip-link" href="#main-content">Lewati langsung ke konten utama</a>
      <div class="app-shell">
        <header class="site-header">
          <div class="site-header__top">
            <a class="brand-logo-link" href="#/" aria-label="HAWAS, Beranda Utama">
              <img
                class="brand-logo"
                src="/img/hawas-logo.png"
                alt="HAWAS"
                width="720"
                height="240"
                fetchpriority="high"
              />
            </a>
          </div>
          <nav class="site-nav" aria-label="Navigasi menu utama">${renderNavigation(activeRoute)}</nav>
        </header>
        <div class="page-layout">
          <main id="main-content" class="main-content main-content--${activeRoute}" tabindex="-1">
            ${renderPage(activeRoute, simulationState, simulationStartingBalance, checkState, qrisState, selectedSosIncidents, checkAiApiBaseUrl.length > 0)}
          </main>
        </div>
        <footer class="site-footer">
          <span>HAWAS: Media edukasi keamanan transaksi digital masyarakat. Bukan layanan resmi bank, BI, atau OJK.</span>
          <span class="footer-label">Versi 0.1</span>
        </footer>
      </div>
    `;

    document.title = `${page.title} | HAWAS`;
    if (focusTarget) {
      root
        .querySelector<HTMLElement>(focusTarget)
        ?.focus({ preventScroll: true });
    }
  };

  root.addEventListener("input", (event) => {
    if (!(event.target instanceof HTMLTextAreaElement)) return;
    if (!event.target.matches('textarea[name="checkInput"]')) return;

    const counter = root.querySelector<HTMLElement>("[data-check-count]");
    if (counter) {
      counter.textContent = event.target.value.length.toLocaleString("id-ID");
    }
    const error = root.querySelector<HTMLElement>("#check-error");
    if (error) {
      error.textContent = "";
      error.hidden = true;
    }
  });

  root.addEventListener("change", (event) => {
    if (!(event.target instanceof HTMLInputElement)) return;
    if (!event.target.matches('input[name="qrisImage"]')) return;
    const fileName =
      event.target.files?.[0]?.name ?? "Belum ada gambar dipilih";
    const label = root.querySelector<HTMLElement>("[data-qris-file-name]");
    if (label) label.textContent = fileName;
  });

  root.addEventListener("submit", (event) => {
    if (!(event.target instanceof HTMLFormElement)) return;
    if (event.target.matches("[data-check-form]")) {
      event.preventDefault();
      const input = event.target.querySelector<HTMLTextAreaElement>(
        'textarea[name="checkInput"]',
      );
      const error = event.target.querySelector<HTMLElement>("#check-error");
      if (!input || !error) return;

      const validation = validateCheckInput(input.value);
      if (!validation.valid) {
        error.textContent = validation.message;
        error.hidden = false;
        error.focus();
        return;
      }

      checkState = createCheckResultState(
        analyzeCheckInput(validation.value),
        prepareCheckAiInput(validation.value),
      );
      input.value = "";
      render(".check-result");
      return;
    }

    if (event.target.matches("[data-qris-upload-form]")) {
      event.preventDefault();
      const form = event.target;
      const fileInput = form.querySelector<HTMLInputElement>(
        'input[name="qrisImage"]',
      );
      const file = fileInput?.files?.[0];
      if (!file) {
        qrisState = {
          stage: "error",
          code: "missing-file",
          message: "Pilih satu gambar QRIS untuk diperiksa.",
        };
        render(".qris-error");
        return;
      }

      const validationError = validateQrisImageFile(file);
      if (validationError) {
        qrisState = {
          stage: "error",
          code: validationError.code,
          message: validationError.message,
        };
        fileInput.value = "";
        render(".qris-error");
        return;
      }

      qrisState = { stage: "reading" };
      const requestId = ++qrisRequestId;
      fileInput.value = "";
      render(".qris-reading-status");

      void decodeQrisImage(file)
        .then((result) => {
          if (
            requestId !== qrisRequestId ||
            resolveRoute(window.location.hash) !== "qris"
          ) {
            return;
          }
          qrisState = createDecodedQrisState(result);
          render("#qris-result-title");
        })
        .catch((error: unknown) => {
          if (
            requestId !== qrisRequestId ||
            resolveRoute(window.location.hash) !== "qris"
          ) {
            return;
          }
          const domainError =
            error instanceof QrisDomainError
              ? error
              : new QrisDomainError(
                  "decode-failed",
                  "Gambar belum dapat diperiksa. Coba gunakan foto lain yang lebih jelas.",
                );
          qrisState = {
            stage: "error",
            code: domainError.code,
            message: domainError.message,
          };
          render(".qris-error");
        });
      return;
    }

    if (event.target.matches("[data-qris-context-form]")) {
      event.preventDefault();
      if (qrisState.stage !== "decoded" && qrisState.stage !== "reviewed") {
        return;
      }

      const formData = new FormData(event.target);
      const source = formData.get("qrisSource");
      const recipient = formData.get("qrisRecipient");
      const amount = formData.get("qrisAmount");
      const pressure = formData.get("qrisPressure");
      if (
        !isQrisSource(source) ||
        !isQrisCheckAnswer(recipient) ||
        !isQrisCheckAnswer(amount) ||
        !isQrisPressureAnswer(pressure)
      ) {
        return;
      }

      const answers: QrisContextAnswers = {
        source,
        recipient,
        amount,
        pressure,
      };
      qrisState = createReviewedQrisState(qrisState.result, answers);
      render(".qris-guidance");
      return;
    }

    if (!event.target.matches("[data-simulation-balance-form]")) return;

    event.preventDefault();
    const error = event.target.querySelector<HTMLElement>(
      "#simulation-balance-error",
    );
    if (!error) return;

    const selectedScenarios = Array.from(
      event.target.querySelectorAll<HTMLButtonElement>(
        '[data-simulation-toggle="scenario"][aria-pressed="true"]',
      ),
    )
      .map((button) => button.dataset.scenario ?? "")
      .filter(isScenarioId);
    if (selectedScenarios.length === 0) {
      error.textContent = "Pilih minimal satu simulasi yang ingin Anda coba.";
      error.hidden = false;
      event.target
        .querySelector<HTMLButtonElement>('[data-simulation-toggle="scenario"]')
        ?.focus();
      return;
    }

    const formData = new FormData(event.target);
    const selectedBalance = formData.get("startingBalance");
    const validation = validateStartingBalance(
      typeof selectedBalance === "string" ? selectedBalance : "",
    );
    if (!validation.valid) {
      error.textContent = validation.message;
      error.hidden = false;
      event.target
        .querySelector<HTMLInputElement>('input[name="startingBalance"]')
        ?.focus();
      return;
    }

    error.hidden = true;
    simulationStartingBalance = validation.value;
    if (selectedScenarios.length === scenarios.length) {
      simulationState = createSimulationState(validation.value);
      render("#page-title");
      return;
    }

    simulationState = createSelectedSimulationState(
      selectedScenarios,
      validation.value,
    );
    render("#page-title");
  });

  root.addEventListener("click", (event) => {
    if (!(event.target instanceof Element)) return;
    const checkAction = event.target.closest<HTMLButtonElement>(
      "[data-check-action]",
    );
    if (checkAction && resolveRoute(window.location.hash) === "check") {
      if (checkAction.dataset.checkAction === "reset") {
        checkAiRequestId += 1;
        checkAiAbortController?.abort();
        checkAiAbortController = null;
        checkState = createCheckState();
        render("#check-input");
        return;
      }

      if (
        checkAction.dataset.checkAction === "request-ai" &&
        checkState.stage === "result" &&
        checkAiApiBaseUrl.length > 0 &&
        checkState.ai.stage !== "loading"
      ) {
        const requestId = ++checkAiRequestId;
        checkAiAbortController?.abort();
        const controller = new AbortController();
        checkAiAbortController = controller;
        const preparedText = checkState.ai.preparedText;
        checkState = setCheckAiLoading(checkState);
        render("#check-ai-title");

        void requestCheckAiExplanation(
          checkAiApiBaseUrl,
          preparedText,
          controller.signal,
        )
          .then((explanation) => {
            if (
              requestId !== checkAiRequestId ||
              resolveRoute(window.location.hash) !== "check" ||
              checkState.stage !== "result"
            ) {
              return;
            }
            checkState = setCheckAiSuccess(checkState, explanation);
            checkAiAbortController = null;
            render("#check-ai-title");
          })
          .catch((error: unknown) => {
            if (
              controller.signal.aborted ||
              requestId !== checkAiRequestId ||
              resolveRoute(window.location.hash) !== "check" ||
              checkState.stage !== "result"
            ) {
              return;
            }
            checkState = setCheckAiError(
              checkState,
              error instanceof Error
                ? error.message
                : "Penjelasan AI belum dapat dimuat. Hasil aturan HAWAS tetap tersedia.",
            );
            checkAiAbortController = null;
            render("#check-ai-title");
          });
        return;
      }

      if (checkAction.dataset.checkAction === "clear") {
        const input = root.querySelector<HTMLTextAreaElement>("#check-input");
        const counter = root.querySelector<HTMLElement>("[data-check-count]");
        const error = root.querySelector<HTMLElement>("#check-error");
        if (input) {
          input.value = "";
          input.focus();
        }
        if (counter) counter.textContent = "0";
        if (error) {
          error.textContent = "";
          error.hidden = true;
        }
        return;
      }
    }

    const sosFilter = event.target.closest<HTMLButtonElement>(
      "[data-sos-filter]",
    );
    if (sosFilter && resolveRoute(window.location.hash) === "sos") {
      const filter = sosFilter.dataset.sosFilter ?? "";
      if (filter === "all") {
        selectedSosIncidents = [];
      } else if (isSosIncidentId(filter)) {
        selectedSosIncidents = toggleSosIncident(
          selectedSosIncidents,
          filter,
        );
      } else {
        return;
      }
      render(`[data-sos-filter="${filter}"]`);
      return;
    }

    const qrisAction = event.target.closest<HTMLButtonElement>(
      "[data-qris-action]",
    );
    if (qrisAction && resolveRoute(window.location.hash) === "qris") {
      if (qrisAction.dataset.qrisAction !== "reset") return;
      qrisRequestId += 1;
      qrisState = createQrisState();
      render("#qris-upload-title");
      return;
    }

    const toggle = event.target.closest<HTMLButtonElement>(
      "[data-simulation-toggle]",
    );
    if (toggle && resolveRoute(window.location.hash) === "simulation") {
      const form = toggle.closest<HTMLFormElement>(
        "[data-simulation-balance-form]",
      );
      if (!form) return;

      const scenarioButtons = Array.from(
        form.querySelectorAll<HTMLButtonElement>(
          '[data-simulation-toggle="scenario"]',
        ),
      );
      if (toggle.dataset.simulationToggle === "all") {
        for (const scenarioButton of scenarioButtons) {
          scenarioButton.setAttribute("aria-pressed", "true");
        }
      } else {
        toggle.setAttribute(
          "aria-pressed",
          toggle.getAttribute("aria-pressed") === "true" ? "false" : "true",
        );
      }

      const allSelected = scenarioButtons.every(
        (button) => button.getAttribute("aria-pressed") === "true",
      );
      form
        .querySelector<HTMLButtonElement>('[data-simulation-toggle="all"]')
        ?.setAttribute("aria-pressed", String(allSelected));
      const error = form.querySelector<HTMLElement>(
        "#simulation-balance-error",
      );
      if (error) error.hidden = true;
      return;
    }

    const button = event.target.closest<HTMLButtonElement>(
      "[data-simulation-action]",
    );
    if (!button || resolveRoute(window.location.hash) !== "simulation") return;

    const action = button.dataset.simulationAction;
    if (action === "change-selection") {
      simulationState = null;
    } else if (action === "restart" && simulationState) {
      simulationState = restartSimulation(simulationState);
    } else if (action === "choose" && simulationState) {
      const safety = button.dataset.safety;
      if (safety !== "safe" && safety !== "risky") return;
      simulationState = recordChoice(simulationState, safety);
    } else if (action === "retry" && simulationState) {
      simulationState = retryScenario(simulationState);
    } else if (action === "continue" && simulationState) {
      simulationState = continueSimulation(simulationState);
    } else if (action === "exit") {
      const destination =
        simulationState?.scope.kind === "practice" ? "#/belajar" : "#/";
      simulationState = null;
      window.location.hash = destination;
      return;
    } else {
      return;
    }

    render("#page-title");
  });

  window.addEventListener("hashchange", () => render("#page-title"));
  render("#page-title");
}
