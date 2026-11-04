import { scenarios } from "../../content/scenarios";
import {
  initialFictionalBalance,
  type SimulationState,
} from "./model";

const rupiah = new Intl.NumberFormat("id-ID");

function formatRupiah(amount: number): string {
  return `Rp${rupiah.format(amount)}`;
}

function renderBalance(balance: number): string {
  return `
    <div class="simulation-balance" role="region" aria-label="Saldo latihan simulasi">
      <span class="simulation-stamp">CONTOH LATIHAN</span>
      <span class="simulation-balance__label">Saldo tiruan (fiktif)</span>
      <strong>${formatRupiah(balance)}</strong>
    </div>
  `;
}

function renderIntro(): string {
  return `
    <section class="simulation-intro" aria-labelledby="page-title">
      <p class="eyebrow">Simulasi transaksi digital / 3 contoh situasi</p>
      <h1 id="page-title" tabindex="-1">Latihan Mengenali Situasi Mencurigakan</h1>
      <p class="lead">Pelajari cara mengambil keputusan yang aman saat bertransaksi di dunia digital. Latihan ini menggunakan situasi tiruan agar Anda terbiasa memeriksa sebelum bertindak.</p>
      
      <div class="simulation-notice-box" role="note">
        <h2 class="simulation-notice-box__title">Penting dipahami sebelum mulai:</h2>
        <ul class="simulation-notice-box__list">
          <li><strong>Semua data di sini adalah fiktif:</strong> Nama pengirim, isi pesan, toko, dan saldo hanyalah contoh latihan.</li>
          <li><strong>Uang Anda aman:</strong> Tidak ada uang sungguhan yang dipakai, berkurang, atau dipindahkan.</li>
          <li><strong>Privasi terlindungi:</strong> Pilihan Anda tidak disimpan di server dan tidak dibagikan kepada siapa pun.</li>
        </ul>
      </div>

      <div class="simulation-intro__balance-preview">
        <p class="simulation-intro__balance-caption">Saldo awal yang disediakan untuk latihan ini:</p>
        ${renderBalance(initialFictionalBalance)}
      </div>

      <div class="section" aria-labelledby="outline-heading">
        <p class="eyebrow">Daftar kasus</p>
        <h2 id="outline-heading">Tiga situasi yang akan Anda hadapi:</h2>
        <ol class="simulation-outline">
          ${scenarios
            .map(
              (scenario, index) => `
                <li>
                  <span class="step-number">${String(index + 1).padStart(2, "0")}</span>
                  <span>${scenario.title}</span>
                </li>
              `,
            )
            .join("")}
        </ol>
      </div>

      <div class="actions">
        <button class="button button--primary" type="button" data-simulation-action="begin">Mulai latihan simulasi</button>
        <a class="button button--quiet" href="#/sos">Perlu bantuan sekarang? Buka Bantuan SOS</a>
      </div>
    </section>
  `;
}

function renderProgress(state: SimulationState): string {
  return `
    <nav class="simulation-progress-wrapper" aria-label="Tahapan latihan">
      <ol class="simulation-progress">
        ${scenarios
          .map((scenario, index) => {
            const current = index === state.scenarioIndex;
            const completed = index < state.scenarioIndex;
            return `
              <li ${current ? 'aria-current="step"' : ""} class="${completed ? "is-complete" : ""}">
                <span class="step-number">${String(index + 1).padStart(2, "0")}</span>
                <span class="simulation-progress__title">${scenario.title}</span>
                <span class="simulation-progress__state">${completed ? "Selesai" : current ? "Sedang aktif" : "Menunggu"}</span>
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

  return `
    <section class="fictional-phone" aria-label="Contoh tampilan layar ponsel fiktif">
      <header class="fictional-phone__header">
        <span class="simulation-stamp">CONTOH SIMULASI</span>
        <span class="fictional-phone__status">Ini adalah contoh tampilan, bukan aplikasi asli</span>
      </header>
      <div class="fictional-phone__content">
        <p class="fictional-phone__context">${scenario.context}</p>
        <div class="fictional-messages">
          ${scenario.messages
            .map(
              (message) => `
                <div class="fictional-message${"kind" in message ? " fictional-message--file" : ""}">
                  <span class="fictional-message__sender">${message.sender}</span>
                  <span class="fictional-message__body">${message.text}</span>
                </div>
              `,
            )
            .join("")}
        </div>
      </div>
    </section>
  `;
}

function renderQuestion(state: SimulationState): string {
  const scenario = scenarios[state.scenarioIndex];

  return `
    ${renderProgress(state)}
    <div class="simulation-heading">
      <p class="eyebrow">Situasi ${state.scenarioIndex + 1} dari ${scenarios.length}</p>
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
                <button
                  class="simulation-choice ${choice.safety === "safe" ? "simulation-choice--safe" : "simulation-choice--risky"}"
                  type="button"
                  data-simulation-action="choose"
                  data-safety="${choice.safety}"
                >
                  <span class="simulation-choice__tag ${choice.safety === "safe" ? "simulation-choice__tag--safe" : "simulation-choice__tag--risky"}">
                    ${choice.safety === "safe" ? "Langkah yang lebih aman" : "Tindakan berisiko tinggi"}
                  </span>
                  <span class="simulation-choice__label">${choice.label}</span>
                </button>
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

  const isLastScenario = state.scenarioIndex === scenarios.length - 1;

  return `
    ${renderProgress(state)}
    <div class="simulation-heading">
      <p class="eyebrow">Situasi ${state.scenarioIndex + 1} dari ${scenarios.length}: Penjelasan tindakan</p>
      <h1 id="page-title" tabindex="-1">${scenario.title}</h1>
    </div>

    <section
      class="simulation-feedback ${isSafe ? "simulation-feedback--safe" : "simulation-feedback--risky"}"
      role="region"
      aria-labelledby="feedback-heading"
    >
      <div class="simulation-feedback__header">
        <span class="simulation-choice__tag ${isSafe ? "simulation-choice__tag--safe" : "simulation-choice__tag--risky"}">
          ${isSafe ? "Pilihan Anda: Langkah yang lebih aman" : "Pilihan Anda: Tindakan berisiko tinggi"}
        </span>
        <h2 id="feedback-heading">${choice.label}</h2>
      </div>

      <div class="simulation-feedback__block">
        <p class="simulation-feedback__label">Akibat pada saldo latihan:</p>
        <p class="simulation-feedback__consequence">${consequenceText}</p>
      </div>

      <div class="simulation-feedback__block">
        <p class="simulation-feedback__label">Mengapa hal ini terjadi?</p>
        <p class="simulation-feedback__text">${choice.reason}</p>
      </div>

      <div class="simulation-feedback__block simulation-feedback__block--action">
        <p class="simulation-feedback__label">Langkah aman jika Anda menghadapi situasi nyata:</p>
        <p class="simulation-feedback__text"><strong>${choice.nextStep}</strong></p>
      </div>

      ${
        scenario.id === "merchant-name"
          ? `<div class="simulation-caution-box" role="note">
              <strong>Catatan penting seputar kode QR (QRIS):</strong> Perbedaan nama penerima adalah alasan untuk bertanya kepada kasir, bukan bukti pasti penipuan. Jangan menuduh, cukup tanyakan nama yang benar sebelum membayar.
            </div>`
          : ""
      }

      ${retryExplanation}
    </section>

    <div class="simulation-feedback-actions">
      <button class="button button--quiet" type="button" data-simulation-action="retry">Coba pilihan lain (untuk belajar)</button>
      <button class="button button--primary" type="button" data-simulation-action="continue">
        ${isLastScenario ? "Lihat hasil akhir latihan" : "Lanjut ke situasi berikutnya"}
      </button>
    </div>
  `;
}

function renderResult(state: SimulationState): string {
  const learnedActions = scenarios
    .map((scenario, index) => ({
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

  return `
    <section class="simulation-result-wrapper" aria-labelledby="page-title">
      <p class="eyebrow">Latihan selesai</p>
      <h1 id="page-title" tabindex="-1">Tiga Situasi Telah Selesai Dipelajari</h1>
      <p class="lead">Kunci keamanan bertransaksi bukanlah kecepatan, melainkan membiasakan diri untuk selalu berhenti sejenak dan memeriksa sebelum mengambil keputusan.</p>

      <section class="simulation-result" aria-label="Ringkasan hasil latihan">
        <p class="simulation-result__label">Hasil pilihan pertama Anda:</p>
        <p class="simulation-result__score"><strong>${state.score}</strong><span> dari ${scenarios.length} situasi dijawab dengan langkah aman</span></p>
        <div class="simulation-result__balance-card">
          <p class="simulation-balance__label">Sisa saldo latihan Anda:</p>
          <strong class="simulation-result__balance-value">${formatRupiah(state.fictionalBalance)}</strong>
          <span class="simulation-stamp">ANGKA LATIHAN FIKTIF</span>
        </div>
        <p class="simulation-privacy">Skor ini murni untuk sarana belajar pribadi Anda. Tidak ada data yang dicatat atau dikirimkan ke pihak lain.</p>
      </section>

      <section class="section" aria-labelledby="learned-heading">
        <p class="eyebrow">Ringkasan kebiasaan aman</p>
        <h2 id="learned-heading">Tiga kebiasaan yang Anda latih hari ini:</h2>
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
        <button class="button button--primary" type="button" data-simulation-action="restart">Ulangi latihan dari awal</button>
        <a class="button button--quiet" href="#/sos">Buka Bantuan SOS jika butuh bantuan nyata</a>
        <a class="text-link" href="#/belajar">Baca ringkasan keamanan di Belajar</a>
      </div>
    </section>
  `;
}

export function renderSimulation(state: SimulationState | null): string {
  if (!state) return renderIntro();

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
              <button class="simulation-exit" type="button" data-simulation-action="exit">Keluar dan kembali ke Beranda</button>
             </div>`
          : ""
      }
    </section>
  `;
}
