import { checkSignalContent } from "../../content/check.ts";
import {
  MAX_CHECK_INPUT_LENGTH,
  type CheckSignal,
  type CheckViewState,
} from "./model.ts";

export interface CheckViewOptions {
  aiEnabled?: boolean;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function renderForm(): string {
  return `
    <div class="check-warning" role="note">
      <h2>Sebelum menempel pesan</h2>
      <ul>
        <li>Hapus nama, nomor telepon, nomor rekening, dan alamat pribadi.</li>
        <li>Jangan masukkan OTP, PIN, kata sandi, atau nomor kartu.</li>
        <li>URL hanya dibaca sebagai teks. HAWAS tidak membuka alamat tersebut.</li>
      </ul>
    </div>

    <form class="check-form" data-check-form novalidate>
      <label for="check-input">Isi pesan atau URL</label>
      <p id="check-input-help">Tempel pesan yang ingin diperiksa setelah data pribadi dihapus.</p>
      <textarea
        id="check-input"
        name="checkInput"
        rows="9"
        maxlength="${MAX_CHECK_INPUT_LENGTH}"
        aria-describedby="check-input-help check-counter check-error"
        placeholder="Tempel isi pesan di sini. Hapus data pribadi terlebih dahulu."
        required
      ></textarea>
      <div class="check-form__meta">
        <span id="check-counter" aria-live="polite"><span data-check-count>0</span> / ${MAX_CHECK_INPUT_LENGTH.toLocaleString("id-ID")}</span>
        <span>Maksimal ${MAX_CHECK_INPUT_LENGTH.toLocaleString("id-ID")} karakter</span>
      </div>
      <div id="check-error" class="check-error" role="alert" tabindex="-1" hidden></div>
      <div class="check-form__actions">
        <button class="button button--primary" type="submit">Periksa pola pesan</button>
        <button class="button button--quiet" type="button" data-check-action="clear">Hapus isi</button>
      </div>
    </form>
  `;
}

function renderSignal(signal: CheckSignal): string {
  const content = checkSignalContent[signal.id];
  return `
    <li class="check-signal">
      <h3>${content.title}</h3>
      <p class="check-signal__excerpt"><span>Bagian yang terdeteksi:</span> “${escapeHtml(signal.excerpt)}”</p>
      <dl>
        <div><dt>Mengapa perlu diperiksa</dt><dd>${content.reason}</dd></div>
        <div><dt>Tindakan yang disarankan</dt><dd>${content.action}</dd></div>
      </dl>
      ${content.practiceHref && content.practiceLabel ? `<a class="check-signal__practice" href="${content.practiceHref}">${content.practiceLabel}</a>` : ""}
    </li>
  `;
}

function renderResult(state: Extract<CheckViewState, { stage: "result" }>): string {
  const hasSignals = state.analysis.signals.length > 0;
  return `
    <section class="check-result check-result--${hasSignals ? "signals" : "clear"}" aria-labelledby="check-result-title" tabindex="-1">
      <p class="check-result__status">Hasil pemeriksaan aturan lokal</p>
      <h2 id="check-result-title">${hasSignals ? "Ada pola yang perlu diperiksa" : "Tidak ditemukan pola pada aturan HAWAS"}</h2>
      <p>${hasSignals ? "Baca alasan dan tindakan untuk setiap pola. Temuan ini adalah petunjuk, bukan vonis bahwa pesan pasti melakukan penipuan." : "HAWAS tidak menemukan pola yang dikenal pada teks tersebut. Hasil ini bukan jaminan bahwa pesan atau tautan pasti aman."}</p>
      ${hasSignals ? `<ol class="check-signal-list">${state.analysis.signals.map(renderSignal).join("")}</ol>` : ""}
    </section>

    <div class="check-result-actions">
      <button class="button button--primary" type="button" data-check-action="reset">Periksa pesan lain</button>
      <a class="button button--quiet" href="#/belajar">Buka Panduan Belajar</a>
      <a class="button button--quiet" href="#/sos">Buka Bantuan SOS</a>
    </div>
  `;
}

function renderAiPanel(
  state: Extract<CheckViewState, { stage: "result" }>,
  aiEnabled: boolean,
): string {
  if (!aiEnabled || state.ai.preparedText.length === 0) return "";

  if (state.ai.stage === "loading") {
    return `
      <section class="check-ai check-ai--loading" aria-labelledby="check-ai-title" aria-busy="true">
        <p class="check-ai__label">Fitur tambahan opsional</p>
        <h2 id="check-ai-title">Menyiapkan penjelasan AI</h2>
        <p role="status" aria-live="polite">HAWAS sedang meminta penjelasan dari Google Cloud. Hasil aturan lokal di atas tetap dapat digunakan.</p>
      </section>
    `;
  }

  if (state.ai.stage === "error") {
    return `
      <section class="check-ai check-ai--error" aria-labelledby="check-ai-title" tabindex="-1">
        <p class="check-ai__label">Penjelasan AI tidak tersedia</p>
        <h2 id="check-ai-title">Gunakan hasil aturan HAWAS</h2>
        <p>${escapeHtml(state.ai.message)}</p>
        <button class="button button--quiet" type="button" data-check-action="request-ai">Coba penjelasan AI lagi</button>
      </section>
    `;
  }

  if (state.ai.stage === "success") {
    const explanation = state.ai.explanation;
    return `
      <section class="check-ai check-ai--success" aria-labelledby="check-ai-title" tabindex="-1">
        <p class="check-ai__label">Penjelasan tambahan dari AI</p>
        <h2 id="check-ai-title">Konteks yang dapat diperiksa lagi</h2>
        <p>${escapeHtml(explanation.summary)}</p>
        ${
          explanation.contextSignals.length > 0
            ? `<div class="check-ai__observations">
                <h3>Konteks tambahan</h3>
                <ul>
                  ${explanation.contextSignals
                    .map((signal) => {
                      const content = checkSignalContent[signal.category];
                      return `<li>
                        <strong>${content.title}</strong>
                        <p>${escapeHtml(signal.reason)}</p>
                        <p><span>Tindakan yang disarankan:</span> ${content.action}</p>
                      </li>`;
                    })
                    .join("")}
                </ul>
              </div>`
            : ""
        }
        ${
          explanation.verificationQuestions.length > 0
            ? `<div class="check-ai__questions">
                <h3>Pertanyaan untuk verifikasi</h3>
                <ul>${explanation.verificationQuestions.map((question) => `<li>${escapeHtml(question)}</li>`).join("")}</ul>
              </div>`
            : ""
        }
        <p class="check-ai__limit"><strong>Batas AI:</strong> Penjelasan ini dapat keliru. Jangan gunakan hasil AI sebagai keputusan bahwa pesan pasti aman atau pasti melakukan penipuan.</p>
      </section>
    `;
  }

  return `
    <section class="check-ai" aria-labelledby="check-ai-title">
      <p class="check-ai__label">Fitur tambahan opsional</p>
      <h2 id="check-ai-title">Perlu penjelasan dengan AI?</h2>
      <p>Hasil aturan HAWAS di atas sudah selesai. Jika Anda memilih tindakan berikut, versi teks yang sudah menyamarkan angka panjang, email, dan bagian alamat web akan dikirim ke Google Cloud untuk satu kali analisis.</p>
      <div class="check-ai__notice" role="note">
        <strong>Periksa sebelum mengirim</strong>
        <p>Penyamaran otomatis tidak selalu mengenali nama, alamat rumah, atau data pribadi lain. Jangan lanjutkan jika informasi pribadi masih terlihat pada pesan asli.</p>
      </div>
      <button class="button button--primary" type="button" data-check-action="request-ai">Minta penjelasan tambahan dari AI</button>
    </section>
  `;
}

export function renderCheck(
  state: CheckViewState,
  options: CheckViewOptions = {},
): string {
  const aiEnabled = options.aiEnabled ?? false;
  return `
    <section class="check-page" aria-labelledby="page-title">
      <header class="check-intro">
        <h1 id="page-title" tabindex="-1">Cek Pola Pesan</h1>
        <p class="lead">Tempel isi pesan atau URL untuk melihat pola yang perlu diperiksa. HAWAS memakai aturan lokal dan tidak menentukan pesan pasti aman atau melakukan penipuan.</p>
      </header>

      ${state.stage === "idle" ? renderForm() : `${renderResult(state)}${renderAiPanel(state, aiEnabled)}`}

      <div class="check-privacy" role="note">
        <h2>Privasi dan batas pemeriksaan</h2>
        <p>${aiEnabled ? "Pemeriksaan aturan berjalan di perangkat Anda. Teks hanya dikirim ke Google Cloud jika Anda meminta penjelasan AI. HAWAS tidak menyimpan riwayat, memasukkan input ke URL, atau membuka alamat web yang ditempel." : "HAWAS tidak menyimpan riwayat pemeriksaan. Input tidak dimasukkan ke URL dan tidak dikirim ke layanan analisis. URL yang ditempel tidak pernah dibuka."}</p>
      </div>
    </section>
  `;
}
