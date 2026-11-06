import { scenarios } from "../../content/scenarios.ts";
import {
  feedbackIllustrations,
  mascotIllustrations,
  scenarioImages,
  scenarioVisuals,
} from "../../content/illustrations.ts";
import {
  getSimulationScenarioIndexes,
  initialFictionalBalance,
  type SimulationState,
} from "./model.ts";

const rupiah = new Intl.NumberFormat("id-ID");

function formatRupiah(amount: number): string {
  return `Rp${rupiah.format(amount)}`;
}

const selectedCheckIcon = `
  <span class="simulation-mode-option__check" aria-hidden="true">
    <svg viewBox="0 0 20 20" width="20" height="20" fill="none" xmlns="http://www.w3.org/2000/svg" focusable="false">
      <path d="M4 10.5 8 14.5 16 5.5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  </span>
`;

function renderBalance(balance: number): string {
  return `
    <div class="simulation-balance" role="region" aria-label="Saldo latihan simulasi">
      <span class="simulation-stamp">SALDO SIMULASI</span>
      <span class="simulation-balance__label">Saldo tiruan (fiktif)</span>
      <strong>${formatRupiah(balance)}</strong>
    </div>
  `;
}

function renderIntro(startingBalance: number): string {
  return `
    <section class="simulation-intro" aria-labelledby="page-title">
      <div class="mascot-intro-banner">
        ${mascotIllustrations.intro}
        <div class="mascot-intro-bubble">
          <strong>Halo! Saya Pemandu Edukasi Pembayaran Digital.</strong>
          <p>Mari kita berlatih mengenali tanda-tanda jebakan penipuan di ponsel lewat simulasi layar nyata di bawah ini.</p>
        </div>
      </div>

      <p class="eyebrow">Simulasi transaksi digital / 3 contoh situasi</p>
      <h1 id="page-title" tabindex="-1">Latihan Mengenali Situasi Mencurigakan</h1>
      <p class="lead">Pelajari cara mengambil keputusan yang aman saat bertransaksi di dunia digital. Latihan ini menggunakan situasi tiruan agar Anda terbiasa memeriksa sebelum bertindak.</p>
      
      <div class="simulation-notice-box" role="note">
        <span class="simulation-stamp simulation-notice-box__stamp">SIMULASI FIKTIF</span>
        <h2 id="simulation-notice-title" class="simulation-notice-box__title">Penting dipahami sebelum mulai</h2>
        <ul class="simulation-notice-box__list">
          <li><strong>Semua data di sini adalah fiktif:</strong> Nama pengirim, isi pesan, toko, dan saldo hanyalah contoh latihan.</li>
          <li><strong>Uang Anda aman:</strong> Tidak ada uang sungguhan yang dipakai, berkurang, atau dipindahkan.</li>
          <li><strong>Privasi terlindungi:</strong> Pilihan Anda tidak disimpan di server dan tidak dibagikan kepada siapa pun.</li>
        </ul>
      </div>

      <form class="simulation-balance-setup" data-simulation-balance-form novalidate>
        <fieldset class="simulation-mode-picker">
          <legend>Pilih satu atau beberapa simulasi</legend>
          <p>Semua simulasi sudah dipilih. Tekan tombol untuk mengubah pilihan.</p>
          <div class="simulation-mode-options">
            <div class="simulation-mode-item simulation-mode-item--full">
              <button class="simulation-mode-option" type="button" data-simulation-toggle="all" aria-pressed="true" aria-describedby="simulation-desc-all">
                <strong>Semua Skenario</strong>
                ${selectedCheckIcon}
              </button>
              <p id="simulation-desc-all" class="simulation-mode-description">Jalankan ketiga situasi secara berurutan.</p>
            </div>
            <div class="simulation-mode-item">
              <button class="simulation-mode-option" type="button" data-simulation-toggle="scenario" data-scenario="courier-apk" aria-pressed="true" aria-describedby="simulation-desc-apk">
                <strong>Kurir APK</strong>
                ${selectedCheckIcon}
              </button>
              <p id="simulation-desc-apk" class="simulation-mode-description">Kenali berkas aplikasi yang dikirim melalui chat.</p>
            </div>
            <div class="simulation-mode-item">
              <button class="simulation-mode-option" type="button" data-simulation-toggle="scenario" data-scenario="merchant-name" aria-pressed="true" aria-describedby="simulation-desc-qr">
                <strong>Cek QR</strong>
                ${selectedCheckIcon}
              </button>
              <p id="simulation-desc-qr" class="simulation-mode-description">Pastikan nama penerima sebelum menyetujui pembayaran.</p>
            </div>
            <div class="simulation-mode-item">
              <button class="simulation-mode-option" type="button" data-simulation-toggle="scenario" data-scenario="otp-call" aria-pressed="true" aria-describedby="simulation-desc-otp">
                <strong>Telepon OTP</strong>
                ${selectedCheckIcon}
              </button>
              <p id="simulation-desc-otp" class="simulation-mode-description">Jaga kode rahasia saat menerima panggilan mendesak.</p>
            </div>
          </div>
        </fieldset>

        <fieldset class="simulation-balance-picker" aria-describedby="simulation-balance-hint">
          <legend>Pilih saldo latihan fiktif</legend>
          <p id="simulation-balance-hint">Pilih salah satu angka latihan. Ini bukan saldo rekening nyata dan tidak disimpan.</p>
          <div class="simulation-balance-options">
            ${[1_000_000, initialFictionalBalance, 10_000_000]
              .map(
                (balance) => `
                  <label class="simulation-balance-option">
                    <input
                      type="radio"
                      name="startingBalance"
                      value="${balance}"
                      ${balance === startingBalance || (startingBalance !== 1_000_000 && startingBalance !== 10_000_000 && balance === initialFictionalBalance) ? "checked" : ""}
                    />
                    <span>${formatRupiah(balance)}</span>
                  </label>
                `,
              )
              .join("")}
          </div>
        </fieldset>
        <p id="simulation-balance-error" class="simulation-balance-setup__error" role="alert" hidden></p>
        <button class="button button--primary" type="submit">Gunakan saldo dan mulai latihan</button>
      </form>

      <div class="actions">
        <a class="button button--quiet" href="#/sos">Perlu bantuan sekarang? Buka Bantuan SOS</a>
      </div>
    </section>
  `;
}

function renderProgress(state: SimulationState): string {
  const scenarioIndexes = getSimulationScenarioIndexes(state.scope);
  const visibleScenarios = scenarioIndexes.map((index) => ({
    scenario: scenarios[index],
    index,
  }));

  return `
    <nav class="simulation-progress-wrapper" aria-label="Tahapan latihan">
      <ol class="simulation-progress${state.scope.kind === "practice" ? " simulation-progress--practice" : ""}">
        ${visibleScenarios
          .map(({ scenario, index }, visibleIndex) => {
            const current = index === state.scenarioIndex;
            const currentPosition = scenarioIndexes.indexOf(
              state.scenarioIndex,
            );
            const completed = visibleIndex < currentPosition;
            const status = completed ? "Selesai" : current ? "Sedang aktif" : "Menunggu";
            return `
              <li
                ${current ? 'aria-current="step"' : ""}
                class="${completed ? "is-complete" : ""}"
                aria-label="Situasi ${visibleIndex + 1}: ${scenario.title}, ${status}"
              >
                <span class="step-number">${String(visibleIndex + 1).padStart(2, "0")}</span>
                <span class="simulation-progress__state">${status}</span>
              </li>
            `;
          })
          .join("")}
      </ol>
    </nav>
  `;
}

function renderPhone(state: SimulationState): string {
  const scenario = scenarios[state.scenarioIndex];

  if (scenario.id === "courier-apk") {
    return `
      <section class="fictional-phone whatsapp-mockup" aria-label="Contoh tampilan chat WhatsApp fiktif">
        <div class="whatsapp-mockup__notice">
          <span class="simulation-stamp">SIMULASI HAWAS</span>
          <span>Contoh tampilan WhatsApp fiktif.</span>
        </div>
        <div class="whatsapp-chat">
          <div class="whatsapp-statusbar" aria-hidden="true">
            <span>09.41</span>
            <span class="whatsapp-statusbar__icons">●●● 4G 98%</span>
          </div>
          <header class="whatsapp-header">
            <span class="whatsapp-header__back" aria-hidden="true">‹</span>
            <span class="whatsapp-avatar" aria-hidden="true">K</span>
            <span class="whatsapp-header__contact">
              <strong>Kurir Paket (nama fiktif)</strong>
              <small>Nomor tak dikenal, contoh fiktif</small>
            </span>
            <span class="whatsapp-header__actions" aria-hidden="true">⋮</span>
          </header>
          <div class="whatsapp-date"><span>HARI INI</span></div>
          <div class="whatsapp-thread">
            <p class="whatsapp-encryption">Pesan dan berkas di layar ini hanyalah simulasi edukasi.</p>
            <div class="whatsapp-bubble whatsapp-bubble--incoming">
              <p>Paket Anda tertahan di gudang. Silakan buka foto tanda terima paket di bawah ini:</p>
              <time>09.40</time>
            </div>
            <div class="whatsapp-bubble whatsapp-bubble--incoming whatsapp-bubble--attachment">
              <div class="whatsapp-file">
                <div class="whatsapp-file__icon-wrap">
                  ${scenarioVisuals.apkBadge}
                </div>
                <div class="whatsapp-file__details">
                  <strong>Foto_Paket.apk</strong>
                  <small>4.2 MB • Berkas Aplikasi Android</small>
                </div>
              </div>
              <time>09.40</time>
            </div>
            <div class="fictional-callout fictional-callout--hazard" role="note">
              <strong>Tanda Bahaya:</strong> Berkas berakhiran <code>.apk</code> adalah aplikasi ponsel, bukan berkas foto!
            </div>
          </div>
          <div class="scenario-illustration-hint">
            ${scenarioImages.ibuCermat}
            <p class="scenario-illustration-caption">Karakter fiktif Ibu Cermat memeriksa ponselnya sebelum bertindak.</p>
          </div>
          <div class="whatsapp-composer" aria-hidden="true">
            <span class="whatsapp-composer__field">Ketik pesan...</span>
            <span class="whatsapp-composer__mic">🎤</span>
          </div>
        </div>
      </section>
    `;
  }

  if (scenario.id === "merchant-name") {
    return `
      <section class="fictional-phone qris-mockup" aria-label="Contoh tampilan pemindaian kode QRIS fiktif">
        <div class="fictional-phone__header">
          <span class="simulation-stamp">SIMULASI HAWAS</span>
          <span class="fictional-phone__status">Contoh layar pemindai QRIS fiktif</span>
        </div>
        <div class="qris-screen">
          <div class="qris-statusbar" aria-hidden="true">
            <span>09.42</span>
            <span class="qris-statusbar__icons">●●● 4G 92%</span>
          </div>

          <div class="qris-physical-sign">
            <div class="qris-physical-sign__badge">Nama toko fiktif di depan kasir:</div>
            <strong class="qris-physical-sign__title">Kopi Berkah</strong>
          </div>

          <div class="qris-viewfinder-card">
            <div class="qris-viewfinder-lens">
              ${scenarioVisuals.qrisViewfinder}
            </div>
            <p class="qris-viewfinder-caption">Kode QR contoh berhasil dipindai</p>
          </div>

          <div class="qris-confirmation-card">
            <div class="qris-confirmation-row">
              <span class="qris-confirmation-label">Total tagihan fiktif:</span>
              <strong class="qris-confirmation-amount">Rp25.000</strong>
            </div>
            <div class="qris-confirmation-row qris-confirmation-row--highlight">
              <span class="qris-confirmation-label">Nama penerima fiktif (merchant):</span>
              <strong class="qris-confirmation-recipient">Resto Sukses Pribadi</strong>
            </div>
          </div>

          <div class="fictional-callout fictional-callout--warning" role="note">
            <strong>Perhatian:</strong> Nama penerima di layar (Resto Sukses Pribadi) berbeda dari nama toko (Kopi Berkah)!
          </div>
          <div class="scenario-illustration-hint scenario-illustration-hint--wide">
            ${scenarioImages.cekQris}
            <p class="scenario-illustration-caption">Selalu cocokkan nama merchant di layar ponsel dengan nama toko tempat Anda berdiri.</p>
          </div>
        </div>
      </section>
    `;
  }

  return `
    <section class="fictional-phone call-mockup" aria-label="Contoh tampilan panggilan telepon masuk fiktif">
      <div class="fictional-phone__header">
        <span class="simulation-stamp">SIMULASI HAWAS</span>
          <span class="fictional-phone__status">Contoh panggilan masuk fiktif</span>
      </div>
      <div class="call-screen">
        <div class="call-statusbar" aria-hidden="true">
          <span>09.43</span>
          <span class="call-statusbar__icons">●●● 4G 85%</span>
        </div>

        <div class="call-ringing-wrapper">
          <div class="call-avatar-ring">
            ${scenarioVisuals.callRinging}
          </div>
          <span class="call-status-badge">Panggilan Telepon Masuk...</span>
          <h2 class="call-caller-name">Pusat Bantuan Bank (nama fiktif)</h2>
          <span class="call-caller-number">+62 821-4455-8899 (nomor fiktif)</span>
          <small class="call-caller-note">Contoh nomor ponsel biasa, bukan nomor hotline resmi bank.</small>
        </div>

        <div class="call-speech-bubble" role="note">
          <strong>Contoh ucapan penelepon fiktif:</strong>
          <p>"Akun rekening Anda sedang dibobol! Segera bacakan 6 digit kode rahasia (OTP) dari SMS yang baru saja kami kirimkan agar saldo Anda selamat!"</p>
        </div>

        <div class="call-button-preview" aria-hidden="true">
          <div class="call-fake-btn call-fake-btn--decline">
            <span>✕</span>
            <small>Tolak</small>
          </div>
          <div class="call-fake-btn call-fake-btn--answer">
            <span>✆</span>
            <small>Terima</small>
          </div>
        </div>
        <div class="scenario-illustration-hint">
          ${scenarioImages.tolakTelepon}
          <p class="scenario-illustration-caption">Tekan tombol merah untuk menolak panggilan dari nomor tak dikenal.</p>
        </div>
      </div>
    </section>
  `;
}

function renderQuestion(state: SimulationState): string {
  const scenario = scenarios[state.scenarioIndex];
  const scenarioIndexes = getSimulationScenarioIndexes(state.scope);
  const displayedIndex = scenarioIndexes.indexOf(state.scenarioIndex) + 1;
  const displayedTotal = scenarioIndexes.length;

  return `
    ${renderProgress(state)}
    <div class="simulation-heading">
      <p class="eyebrow">Situasi ${displayedIndex} dari ${displayedTotal}</p>
      <h1 id="page-title" tabindex="-1">${scenario.title}</h1>
    </div>
    <div class="simulation-case">
      ${renderPhone(state)}
      <section class="simulation-decision" aria-labelledby="simulation-question">
        <h2 id="simulation-question">${scenario.prompt}</h2>
        <p class="simulation-decision__guide">Pilih salah satu tindakan di bawah ini untuk melihat akibat dan langkah pengamanannya:</p>
        <div class="simulation-choices">
          ${scenario.choices
            .map(
              (choice) => `
                <div
                  class="simulation-choice ${choice.safety === "safe" ? "simulation-choice--safe" : "simulation-choice--risky"}"
                >
                  <div class="simulation-choice__header">
                    <span class="simulation-choice__tag ${choice.safety === "safe" ? "simulation-choice__tag--safe" : "simulation-choice__tag--risky"}">
                      ${choice.safety === "safe" ? "Langkah yang lebih aman" : "Tindakan berisiko tinggi"}
                    </span>
                  </div>
                  <span class="simulation-choice__label">${choice.label}</span>
                  <p class="simulation-choice__description">${choice.description}</p>
                  <div class="simulation-choice__footer">
                    <button
                      class="simulation-choice__cta"
                      type="button"
                      data-simulation-action="choose"
                      data-safety="${choice.safety}"
                    >
                      Pilih: ${choice.label}
                    </button>
                  </div>
                </div>
              `,
            )
            .join("")}
        </div>
      </section>
    </div>
  `;
}

function renderFeedback(state: SimulationState): string {
  const scenario = scenarios[state.scenarioIndex];
  const choice = scenario.choices.find(
    (candidate) => candidate.safety === state.feedbackSafety,
  );
  const firstChoice = state.firstChoices.get(state.scenarioIndex);

  if (!choice || !firstChoice) {
    throw new Error("Umpan balik simulasi tidak memiliki pilihan yang valid.");
  }

  const isSafe = choice.safety === "safe";
  const firstAttempt = !state.feedbackIsRetry;
  const feedbackIllustration =
    feedbackIllustrations[scenario.id][choice.safety];

  let consequenceText: string;
  if (firstAttempt) {
    consequenceText = choice.consequence;
  } else {
    consequenceText = isSafe
      ? "Langkah ini aman. Saldo dan skor pada sesi latihan ini tetap dihitung dari pilihan pertama Anda."
      : `Jika ini dipilih pada kesempatan pertama, saldo latihan Anda akan berkurang ${formatRupiah(scenario.balanceLoss)}.`;
  }

  const retryExplanation = state.feedbackIsRetry
    ? `<div class="simulation-retry-box" role="status">
        <strong>Anda sedang mencoba pilihan lain untuk belajar:</strong> Skor dan sisa saldo latihan Anda tetap mengikuti pilihan pertama yang Anda ambil.
       </div>`
    : "";

  const scenarioIndexes = getSimulationScenarioIndexes(state.scope);
  const displayedIndex = scenarioIndexes.indexOf(state.scenarioIndex) + 1;
  const displayedTotal = scenarioIndexes.length;
  const completesFlow = displayedIndex === displayedTotal;

  return `
    ${renderProgress(state)}
    <div class="simulation-heading">
      <p class="eyebrow">Situasi ${displayedIndex} dari ${displayedTotal}: Penjelasan tindakan</p>
      <h1 id="page-title" tabindex="-1">${scenario.title}</h1>
    </div>

    <section
      class="simulation-feedback ${isSafe ? "simulation-feedback--safe" : "simulation-feedback--risky"}"
      role="region"
      aria-labelledby="feedback-heading"
    >
      <div class="simulation-feedback__header">
        <span class="simulation-stamp simulation-stamp--animated ${isSafe ? "simulation-stamp--safe" : "simulation-stamp--risky"}">
          ${isSafe ? "LEBIH AMAN" : "BERISIKO TINGGI"}
        </span>
        <h2 id="feedback-heading">${choice.label}</h2>
      </div>

      <figure class="simulation-feedback__visual">
        <div class="simulation-feedback__image-frame">
          ${feedbackIllustration}
        </div>
        <figcaption>
          <span class="simulation-feedback__visual-label">${isSafe ? "Dampak pilihan yang lebih aman" : "Risiko yang mungkin terjadi"}</span>
          <strong>${choice.feedbackImpact}</strong>
        </figcaption>
      </figure>

      <div class="simulation-feedback__outcome" role="status">
        <p class="simulation-feedback__label">Saldo latihan fiktif</p>
        <p class="simulation-feedback__consequence">${consequenceText}</p>
      </div>

      <div class="simulation-feedback__action">
        <p class="simulation-feedback__label">Yang perlu dilakukan</p>
        <p>${choice.feedbackAction}</p>
      </div>

      <details class="simulation-feedback__details">
        <summary>Baca alasan lengkap</summary>
        <p>${choice.reason}</p>
        ${
          scenario.id === "merchant-name"
            ? "<p>Perbedaan nama penerima adalah alasan untuk bertanya kepada kasir, bukan bukti pasti penipuan.</p>"
            : ""
        }
      </details>

      ${retryExplanation}
    </section>

    <div class="simulation-feedback-actions">
      <button class="button button--quiet" type="button" data-simulation-action="retry">Coba pilihan lain (untuk belajar)</button>
      <button class="button button--primary" type="button" data-simulation-action="continue">
        ${completesFlow ? "Lihat hasil latihan" : "Lanjut ke situasi berikutnya"}
      </button>
    </div>
  `;
}

function renderResult(state: SimulationState): string {
  const isPractice = state.scope.kind === "practice";
  const resultScenarioIndexes = getSimulationScenarioIndexes(state.scope);
  const learnedActions = resultScenarioIndexes
    .map((index) => ({
      index,
      scenario: scenarios[index],
    }))
    .map(({ scenario, index }) => ({
      scenario,
      safeChoice: scenario.choices.find((choice) => choice.safety === "safe"),
      chosenSafely: state.firstChoices.get(index) === "safe",
    }))
    .filter(
      (
        item,
      ): item is typeof item & {
        safeChoice: NonNullable<typeof item.safeChoice>;
      } => item.safeChoice !== undefined,
    );
  const resultTotal = resultScenarioIndexes.length;
  const isSingleScenario = resultTotal === 1;
  const resultHeading =
    resultTotal === 1
      ? "Satu Situasi Selesai Dipelajari"
      : resultTotal === 2
        ? "Dua Situasi Selesai Dipelajari"
        : "Tiga Situasi Telah Selesai Dipelajari";

  return `
    <section class="simulation-result-wrapper" aria-labelledby="page-title">
      <div class="mascot-intro-banner">
        ${mascotIllustrations.safe}
        <div class="mascot-intro-bubble">
          <strong>${isSingleScenario ? "Latihan Situasi Selesai" : "Latihan Selesai! Terima Kasih Telah Belajar Bersama."}</strong>
          <p>${isSingleScenario ? "Anda sudah mencoba satu situasi. Anda dapat mengulanginya atau memilih simulasi lain." : "Kunci keamanan bertransaksi bukanlah kecepatan, melainkan membiasakan diri untuk selalu berhenti sejenak dan memeriksa sebelum mengambil keputusan."}</p>
        </div>
      </div>

      <p class="eyebrow">${isSingleScenario ? "Hasil latihan situasi" : "Hasil simulasi"}</p>
      <h1 id="page-title" tabindex="-1">${resultHeading}</h1>

      <section class="simulation-result" aria-label="Ringkasan hasil latihan">
        <p class="simulation-result__label">Hasil pilihan pertama Anda:</p>
        <p class="simulation-result__score"><strong>${state.score}</strong><span> dari ${resultTotal} situasi dijawab dengan langkah aman</span></p>
        <div class="simulation-result__balance-card">
          <p class="simulation-balance__label">Sisa saldo latihan Anda:</p>
          <strong class="simulation-result__balance-value">${formatRupiah(state.fictionalBalance)}</strong>
          <span class="simulation-stamp">ANGKA LATIHAN FIKTIF</span>
        </div>
        <p class="simulation-privacy">Skor ini murni untuk sarana belajar pribadi Anda. Tidak ada data yang dicatat atau dikirimkan ke pihak lain.</p>
      </section>

      <section class="section" aria-labelledby="learned-heading">
        <p class="eyebrow">Ringkasan kebiasaan aman</p>
        <h2 id="learned-heading">${resultTotal === 3 ? "Tiga kebiasaan yang Anda latih hari ini:" : "Kebiasaan yang Anda latih:"}</h2>
        <ol class="simulation-learned">
          ${learnedActions
            .map(
              ({ scenario, safeChoice, chosenSafely }, index) => `
                <li>
                  <span class="step-number">${String(index + 1).padStart(2, "0")}</span>
                  <div class="simulation-learned__item">
                    <strong>${safeChoice.label}</strong>
                    <span class="simulation-learned__status ${chosenSafely ? "is-safe" : "is-review"}">
                      ${chosenSafely ? "Terpilih aman pada kesempatan pertama" : "Dipelajari lewat kesempatan kedua"}
                    </span>
                    <small class="simulation-learned__scenario">${scenario.title}</small>
                  </div>
                </li>
              `,
            )
            .join("")}
        </ol>
      </section>

      <div class="simulation-result-actions">
        <button class="button button--primary" type="button" data-simulation-action="restart">${state.scope.kind === "full" ? "Ulangi latihan dari awal" : isSingleScenario ? "Ulangi situasi ini" : "Ulangi latihan terpilih"}</button>
        ${isPractice ? '<a class="button button--quiet" href="#/simulasi">Pilih simulasi lain</a>' : state.scope.kind === "selection" ? '<button class="button button--quiet" type="button" data-simulation-action="change-selection">Pilih simulasi lain</button>' : ""}
        <a class="button button--quiet" href="#/sos">Buka Bantuan SOS jika butuh bantuan nyata</a>
        <a class="text-link" href="#/belajar">${isPractice ? "Kembali ke Belajar" : "Baca ringkasan keamanan di Belajar"}</a>
      </div>
    </section>
  `;
}

export function renderSimulation(
  state: SimulationState | null,
  startingBalance = initialFictionalBalance,
): string {
  if (!state) return renderIntro(startingBalance);

  return `
    <section class="simulation-flow" aria-label="Alur simulasi HAWAS">
      <div class="simulation-topline">
        <a class="simulation-sos-link" href="#/sos">Butuh bantuan darurat? Buka SOS</a>
        ${state.stage !== "result" ? renderBalance(state.fictionalBalance) : ""}
      </div>
      ${
        state.stage === "result"
          ? renderResult(state)
          : state.stage === "feedback"
            ? renderFeedback(state)
            : renderQuestion(state)
      }
      ${
        state.stage !== "result"
          ? `<div class="simulation-exit-wrapper">
              <button class="button button--quiet simulation-exit" type="button" data-simulation-action="${state.scope.kind === "selection" ? "change-selection" : "exit"}">
                ${state.scope.kind === "practice" ? "Kembali ke Belajar" : state.scope.kind === "selection" ? "Ubah pilihan simulasi" : "Kembali ke Beranda"}
              </button>
             </div>`
          : ""
      }
    </section>
  `;
}
