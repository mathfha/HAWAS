import assert from "node:assert/strict";
import test from "node:test";
import {
  continueSimulation,
  createPracticeSimulationState,
  createSelectedSimulationState,
  createSimulationState,
  recordChoice,
  type SimulationState,
} from "../src/features/simulation/model.ts";
import { renderSimulation } from "../src/features/simulation/view.ts";

function completeFullSimulation(): SimulationState {
  let state = createSimulationState();

  for (const choice of ["safe", "risky", "safe"] as const) {
    state = recordChoice(state, choice);
    state = continueSimulation(state);
  }

  return state;
}

test("hasil simulasi lengkap menampilkan ringkasan dan tindakan lanjutan", () => {
  const html = renderSimulation(completeFullSimulation());

  assert.match(html, /Tiga Situasi Telah Selesai Dipelajari/);
  assert.match(html, /2<\/strong><span> dari 3 situasi/);
  assert.match(html, /Sisa saldo latihan Anda/);
  assert.match(html, /ANGKA LATIHAN FIKTIF/);
  assert.match(html, /Ulangi latihan dari awal/);
  assert.match(html, /Buka Bantuan SOS/);
  assert.match(html, /Baca ringkasan keamanan di Belajar/);
});

test("hasil latihan tunggal tidak mengklaim tiga situasi selesai", () => {
  let state = createPracticeSimulationState("otp-call");
  state = recordChoice(state, "safe");
  state = continueSimulation(state);
  const html = renderSimulation(state);

  assert.match(html, /Satu Situasi Selesai Dipelajari/);
  assert.match(html, /1<\/strong><span> dari 1 situasi/);
  assert.match(html, /Ulangi situasi ini/);
  assert.match(html, /Pilih simulasi lain/);
  assert.match(html, /Kembali ke Belajar/);
  assert.doesNotMatch(html, /Tiga Situasi Telah Selesai Dipelajari/);
  assert.doesNotMatch(html, /Tiga kebiasaan yang Anda latih/);
});

test("setiap tampilan skenario menandai saldo dan identitas sebagai fiktif", () => {
  const courier = renderSimulation(createPracticeSimulationState("courier-apk"));
  const merchant = renderSimulation(
    createPracticeSimulationState("merchant-name"),
  );
  const otp = renderSimulation(createPracticeSimulationState("otp-call"));

  for (const html of [courier, merchant, otp]) {
    assert.match(html, /SALDO SIMULASI/);
    assert.match(html, /Saldo tiruan \(fiktif\)/);
  }

  assert.match(courier, /nama fiktif/);
  assert.match(courier, /contoh fiktif/);
  assert.match(merchant, /Nama toko fiktif/);
  assert.match(merchant, /Nama penerima fiktif/);
  assert.match(otp, /nama fiktif/);
  assert.match(otp, /nomor fiktif/);
});

test("intro menyediakan pengaturan saldo latihan fiktif", () => {
  const html = renderSimulation(null);

  assert.match(html, /Pilih saldo latihan fiktif/);
  assert.match(html, /name="startingBalance"/);
  assert.match(html, /value="1000000"/);
  assert.match(html, /value="5325000"[\s\S]*?checked/);
  assert.match(html, /value="10000000"/);
  assert.match(html, /bukan saldo rekening nyata/);
  assert.match(html, /tidak disimpan/);
  assert.match(html, /Gunakan saldo dan mulai latihan/);
});

test("intro menonjolkan bahwa seluruh simulasi bersifat fiktif", () => {
  const html = renderSimulation(null);

  assert.match(html, /SIMULASI FIKTIF/);
  assert.match(html, /Semua data di sini adalah fiktif/);
  assert.match(html, /Tidak ada uang sungguhan/);
  assert.match(html, /tidak disimpan di server/);
});

test("intro menawarkan tombol CTA simulasi lengkap dan pilihan jamak", () => {
  const html = renderSimulation(null);

  assert.match(html, /Pilih satu atau beberapa simulasi/);
  assert.match(html, /<button[^>]*data-simulation-toggle="all"[^>]*aria-pressed="true"/);
  assert.match(html, /data-scenario="courier-apk" aria-pressed="true"/);
  assert.match(html, /data-scenario="merchant-name" aria-pressed="true"/);
  assert.match(html, /data-scenario="otp-call" aria-pressed="true"/);
  assert.match(html, /Semua Skenario/);
  assert.match(html, /Kurir APK/);
  assert.match(html, /Cek QR/);
  assert.match(html, /Telepon OTP/);
  assert.equal(html.match(/simulation-mode-option__check/g)?.length, 4);
  assert.doesNotMatch(html, />Pilih</);
  assert.doesNotMatch(html, />Dipilih</);
  assert.doesNotMatch(html, /Pilih semua|Semua dipilih/);
  assert.match(
    html,
    /data-scenario="courier-apk"[\s\S]*?<\/button>\s*<p id="simulation-desc-apk" class="simulation-mode-description">Kenali berkas aplikasi/,
  );
});

test("hasil dua simulasi hanya merangkum dua situasi terpilih", () => {
  let state = createSelectedSimulationState([
    "courier-apk",
    "merchant-name",
  ]);
  state = recordChoice(state, "safe");
  state = continueSimulation(state);
  state = recordChoice(state, "risky");
  state = continueSimulation(state);
  const html = renderSimulation(state);

  assert.match(html, /Dua Situasi Selesai Dipelajari/);
  assert.match(html, /1<\/strong><span> dari 2 situasi/);
  assert.match(html, /Ulangi latihan terpilih/);
  assert.match(html, /Pilih simulasi lain/);
  assert.doesNotMatch(html, /Tiga Situasi Telah Selesai Dipelajari/);
});

test("pilihan tindakan memakai label yang ditetapkan PRD", () => {
  const courier = renderSimulation(createPracticeSimulationState("courier-apk"));
  const merchant = renderSimulation(
    createPracticeSimulationState("merchant-name"),
  );
  const otp = renderSimulation(createPracticeSimulationState("otp-call"));

  assert.match(courier, />Unduh APK</);
  assert.match(courier, />Tolak &amp; blokir|>Tolak & blokir/);
  assert.match(merchant, />Langsung bayar</);
  assert.match(merchant, />Tanya kasir</);
  assert.match(otp, />Kirim OTP</);
  assert.match(otp, />Tutup telepon</);
});

test("setiap pilihan memakai CTA button yang menjalankan aksi", () => {
  const html = renderSimulation(createPracticeSimulationState("courier-apk"));
  const ctaButtons = html.match(
    /<button[\s\S]*?data-simulation-action="choose"[\s\S]*?<\/button>/g,
  );

  assert.equal(ctaButtons?.length, 2);
  assert.match(ctaButtons?.[0] ?? "", /Pilih: Unduh APK/);
  assert.match(ctaButtons?.[1] ?? "", /Pilih: Tolak & blokir/);
});

test("setiap pilihan menjelaskan tindakan sebelum dipilih", () => {
  const courier = renderSimulation(createSimulationState());

  assert.match(
    courier,
    /Membuka berkas aplikasi yang dikirim oleh nomor tak dikenal\./,
  );
  assert.match(
    courier,
    /Menghentikan interaksi dan tidak membuka berkas yang dikirim\./,
  );
});

test("umpan balik memakai ilustrasi dan ringkasan singkat sesuai pilihan", () => {
  const cases = [
    ["courier-apk", "risky", "feedback-apk-risky.webp"],
    ["courier-apk", "safe", "feedback-apk-safe.webp"],
    ["merchant-name", "risky", "feedback-qris-risky.webp"],
    ["merchant-name", "safe", "feedback-qris-safe.webp"],
    ["otp-call", "risky", "feedback-otp-risky.webp"],
    ["otp-call", "safe", "feedback-otp-safe.webp"],
  ] as const;

  for (const [scenarioId, safety, imageName] of cases) {
    let state = createPracticeSimulationState(scenarioId);
    state = recordChoice(state, safety);
    const html = renderSimulation(state);

    assert.match(html, new RegExp(imageName.replace(".", "\\.")));
    assert.match(
      html,
      safety === "safe"
        ? /Dampak pilihan yang lebih aman/
        : /Risiko yang mungkin terjadi/,
    );
    assert.match(html, /Baca alasan lengkap/);
  }
});
