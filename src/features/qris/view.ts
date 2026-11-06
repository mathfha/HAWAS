import type {
  CrcStatus,
  QrisContextAnswers,
  QrisKind,
  QrisViewState,
} from "./model.ts";
import {
  qrisGuidanceContent,
  qrisReasonContent,
} from "../../content/qris.ts";

const rupiah = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 2,
});

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function renderUpload(state: QrisViewState): string {
  const reading = state.stage === "reading";
  const error = state.stage === "error" ? state.message : null;

  return `
    <section class="qris-step" aria-labelledby="qris-upload-title">
      <h2 id="qris-upload-title" tabindex="-1">Pilih gambar kode QRIS</h2>
      <p>Gunakan foto yang terang, tidak terpotong, dan hanya memuat satu kode QR.</p>
      ${error ? `<div class="qris-error" role="alert" tabindex="-1"><strong>Gambar belum dapat diperiksa</strong><p>${escapeHtml(error)}</p></div>` : ""}
      <form class="qris-upload" data-qris-upload-form novalidate>
        <div class="qris-file-control">
          <span class="qris-file-control__label">Gambar QRIS</span>
          <input
            id="qris-image"
            class="qris-file-control__input"
            type="file"
            name="qrisImage"
            accept="image/jpeg,image/png,image/webp"
            ${reading ? "disabled" : ""}
            required
          />
          <label class="qris-file-control__button" for="qris-image">Pilih gambar QRIS</label>
          <span class="qris-file-control__name" data-qris-file-name aria-live="polite">Belum ada gambar dipilih</span>
          <small>Format JPEG, PNG, atau WebP. Ukuran maksimal 10 MiB.</small>
        </div>
        <button class="button button--primary" type="submit" ${reading ? "disabled" : ""}>
          ${reading ? "Sedang membaca gambar..." : "Periksa gambar QRIS"}
        </button>
      </form>
      <p class="qris-reading-status" role="status" aria-live="polite" tabindex="-1">${reading ? "HAWAS sedang mencari kode QR dan membaca informasi yang tersedia." : ""}</p>
    </section>
  `;
}

function getResultCopy(
  crcStatus: CrcStatus,
  merchantName: string | null,
): { title: string; body: string; modifier: string } {
  if (crcStatus === "invalid") {
    return {
      title: "Data QR tidak konsisten",
      body: "Pemeriksaan konsistensi susunan data menemukan perubahan atau data yang tidak lengkap. Jangan gunakan hasil ini sebagai dasar pembayaran. Minta kode QRIS lain kepada kasir.",
      modifier: "qris-result--warning",
    };
  }

  if (crcStatus === "missing") {
    return {
      title: "Informasi belum cukup",
      body: "Pemeriksaan konsistensi data tidak tersedia. Verifikasi nama penerima melalui aplikasi pembayaran resmi sebelum melanjutkan.",
      modifier: "qris-result--neutral",
    };
  }

  if (!merchantName) {
    return {
      title: "Informasi belum cukup",
      body: "Nama penerima tidak tersedia pada data yang terbaca. Gunakan aplikasi pembayaran resmi dan tanyakan kepada kasir sebelum melanjutkan.",
      modifier: "qris-result--neutral",
    };
  }

  return {
    title: "Nama penerima berhasil dibaca",
    body: "Cocokkan nama ini dengan informasi dari kasir sebelum membayar. Jika nama terasa asing atau berbeda, tanyakan kepada kasir. Nama yang terbaca bukan jaminan pembayaran pasti aman.",
    modifier: "qris-result--neutral",
  };
}

function getKindLabel(kind: QrisKind): string {
  if (kind === "static") return "Statis, nominal dimasukkan saat pembayaran";
  if (kind === "dynamic") return "Dinamis, dapat memuat nominal transaksi";
  return "Jenis belum dapat ditentukan";
}

function getCrcLabel(status: CrcStatus): string {
  if (status === "valid") return "Data konsisten";
  if (status === "invalid") return "Data tidak konsisten";
  return "Pemeriksaan tidak tersedia";
}

function isChecked(
  answers: QrisContextAnswers | null,
  field: keyof QrisContextAnswers,
  value: string,
): string {
  return answers?.[field] === value ? " checked" : "";
}

function renderContextForm(answers: QrisContextAnswers | null): string {
  return `
    <section class="qris-context" aria-labelledby="qris-context-title">
      <div class="qris-context__intro">
        <h2 id="qris-context-title">Periksa situasi sebelum membayar</h2>
        <p>QRIS yang terbaca dengan benar belum cukup untuk menilai transaksi. Jawab empat pertanyaan berdasarkan situasi Anda.</p>
      </div>
      <form class="qris-context-form" data-qris-context-form>
        <fieldset>
          <legend>Dari mana Anda mendapatkan kode QR ini?</legend>
          <label><input type="radio" name="qrisSource" value="merchant-location"${isChecked(answers, "source", "merchant-location")} required /> Di tempat usaha atau dari kasir</label>
          <label><input type="radio" name="qrisSource" value="message"${isChecked(answers, "source", "message")} /> Dikirim lewat chat atau pesan</label>
          <label><input type="radio" name="qrisSource" value="other"${isChecked(answers, "source", "other")} /> Asalnya belum jelas</label>
        </fieldset>

        <fieldset>
          <legend>Apakah nama penerima sudah dicocokkan?</legend>
          <label><input type="radio" name="qrisRecipient" value="matches"${isChecked(answers, "recipient", "matches")} required /> Sesuai atau sudah dikonfirmasi</label>
          <label><input type="radio" name="qrisRecipient" value="different"${isChecked(answers, "recipient", "different")} /> Berbeda dari nama yang diharapkan</label>
          <label><input type="radio" name="qrisRecipient" value="not-checked"${isChecked(answers, "recipient", "not-checked")} /> Belum diperiksa</label>
        </fieldset>

        <fieldset>
          <legend>Apakah nominal pembayaran sudah diperiksa?</legend>
          <label><input type="radio" name="qrisAmount" value="matches"${isChecked(answers, "amount", "matches")} required /> Nominal sudah sesuai</label>
          <label><input type="radio" name="qrisAmount" value="different"${isChecked(answers, "amount", "different")} /> Nominal berbeda</label>
          <label><input type="radio" name="qrisAmount" value="not-checked"${isChecked(answers, "amount", "not-checked")} /> Belum diperiksa</label>
        </fieldset>

        <fieldset>
          <legend>Apakah ada yang mendesak Anda segera membayar?</legend>
          <label><input type="radio" name="qrisPressure" value="no"${isChecked(answers, "pressure", "no")} required /> Tidak ada desakan</label>
          <label><input type="radio" name="qrisPressure" value="yes"${isChecked(answers, "pressure", "yes")} /> Ada yang mendesak</label>
        </fieldset>

        <p class="qris-context-form__privacy">Jawaban hanya dipakai untuk menampilkan panduan pada halaman ini dan tidak disimpan sebagai riwayat.</p>
        <button class="button button--primary" type="submit">${answers ? "Perbarui panduan" : "Lihat panduan tindakan"}</button>
      </form>
    </section>
  `;
}

function renderAssessment(
  state: Extract<QrisViewState, { stage: "reviewed" }>,
): string {
  const content = qrisGuidanceContent[state.assessment.level];
  const reasons = state.assessment.reasons
    .map((reason) => {
      const item = qrisReasonContent[reason];
      return `<li><strong>${item.label}</strong><span>${item.action}</span></li>`;
    })
    .join("");

  return `
    <section class="qris-guidance qris-guidance--${state.assessment.level}" aria-labelledby="qris-guidance-title" tabindex="-1">
      <p class="qris-guidance__status">Panduan berdasarkan jawaban Anda</p>
      <h2 id="qris-guidance-title">${content.title}</h2>
      <p>${content.summary}</p>
      ${reasons ? `<ul class="qris-guidance__reasons">${reasons}</ul>` : ""}
      <div class="qris-guidance__action"><strong>Tindakan berikutnya</strong><p>${content.action}</p></div>
    </section>
  `;
}

type QrisResultState = Extract<
  QrisViewState,
  { stage: "decoded" | "reviewed" }
>;

function renderDecoded(state: QrisResultState): string {
  const { result } = state;
  const resultCopy = getResultCopy(result.crcStatus, result.merchantName);
  const answers = state.stage === "reviewed" ? state.answers : null;

  return `
    <section class="qris-result ${resultCopy.modifier}" aria-labelledby="qris-result-title">
      <h2 id="qris-result-title" tabindex="-1">${resultCopy.title}</h2>
      <p>${resultCopy.body}</p>
      <div class="qris-merchant-name">
        <span>Nama penerima yang terbaca</span>
        <strong>${result.merchantName ? escapeHtml(result.merchantName) : "Tidak tersedia"}</strong>
      </div>
    </section>

    <details class="qris-details">
      <summary>Lihat informasi QRIS yang terbaca</summary>
      <dl>
        <div><dt>Kota penerima pembayaran</dt><dd>${result.merchantCity ? escapeHtml(result.merchantCity) : "Tidak tersedia"}</dd></div>
        <div><dt>Nominal dalam QRIS</dt><dd>${result.amount === null ? "Tidak tersedia" : rupiah.format(result.amount)}</dd></div>
        <div><dt>Jenis QRIS</dt><dd>${getKindLabel(result.kind)}</dd></div>
        <div><dt>Konsistensi data (CRC)</dt><dd>${getCrcLabel(result.crcStatus)}</dd></div>
      </dl>
      <p>CRC adalah pemeriksaan konsistensi susunan data. Pemeriksaan ini tidak membuktikan identitas penerima atau keamanan pembayaran.</p>
    </details>

    ${renderContextForm(answers)}
    ${state.stage === "reviewed" ? renderAssessment(state) : ""}

    <div class="qris-actions">
      <button class="button button--quiet" type="button" data-qris-action="reset">Periksa gambar lain</button>
      <a class="button button--quiet" href="#/simulasi/nama-penerima">Coba latihan pemeriksaan nama</a>
      <a class="text-link" href="#/sos">Buka Bantuan SOS jika sudah terjadi masalah</a>
    </div>
  `;
}

export function renderQris(state: QrisViewState): string {
  return `
    <section class="qris-page" aria-labelledby="page-title">
      <h1 id="page-title" tabindex="-1">Panduan Sebelum Bayar QRIS</h1>
      <p class="lead">QRIS adalah kode bayar digital nasional. Unggah fotonya untuk membaca informasi yang tersedia, lalu periksa situasi sebelum mengambil keputusan.</p>

      ${state.stage === "decoded" || state.stage === "reviewed" ? renderDecoded(state) : renderUpload(state)}

      <div class="qris-safety-note" role="note">
        <h2>Privasi dan batas pemeriksaan</h2>
        <ul>
          <li><strong>Jangan unggah data rahasia:</strong> HAWAS tidak memerlukan OTP, PIN, kata sandi, nomor kartu, atau data rekening.</li>
          <li><strong>Pemeriksaan berlangsung di browser:</strong> Gambar tidak dikirim ke layanan pemeriksaan atau disimpan dalam riwayat HAWAS.</li>
          <li><strong>Hasil adalah petunjuk:</strong> Nama dan pemeriksaan konsistensi susunan data tidak dapat memastikan penerima pembayaran pasti aman atau melakukan penipuan.</li>
        </ul>
      </div>
    </section>
  `;
}
