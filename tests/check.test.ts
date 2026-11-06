import assert from "node:assert/strict";
import test from "node:test";
import {
  MAX_CHECK_INPUT_LENGTH,
  analyzeCheckInput,
  createCheckResultState,
  createCheckState,
  sanitizeCheckExcerpt,
  validateCheckInput,
} from "../src/features/check/model.ts";
import { renderCheck } from "../src/features/check/view.ts";

test("validasi Cek menolak input kosong dan input yang melewati batas", () => {
  assert.equal(validateCheckInput("   ").valid, false);
  assert.equal(validateCheckInput("a".repeat(MAX_CHECK_INPUT_LENGTH)).valid, true);
  const tooLong = validateCheckInput("a".repeat(MAX_CHECK_INPUT_LENGTH + 1));
  assert.equal(tooLong.valid, false);
  if (!tooLong.valid) assert.equal(tooLong.code, "too-long");
});

test("validasi menolak nilai rahasia tanpa memantulkan nilainya", () => {
  const inputs = [
    "Kode OTP saya 123456",
    "PIN: 1234",
    "password saya: RahasiaSekali",
    "Nomor kartu 4111 1111 1111 1111",
  ];

  for (const input of inputs) {
    const result = validateCheckInput(input);
    assert.equal(result.valid, false);
    if (result.valid) continue;
    assert.equal(result.code, "sensitive-data");
    assert.doesNotMatch(result.message, /123456|1234|RahasiaSekali|4111/);
  }

  assert.equal(validateCheckInput("Jangan berikan OTP kepada siapa pun").valid, true);
  assert.equal(validateCheckInput("Nomor resi 123456").valid, true);
});

test("analisis menemukan sinyal unik dalam urutan prioritas", () => {
  const analysis = analyzeCheckInput(
    "Kami dari bank. Segera transfer ke rekening ini dan sebutkan kode OTP. Unduh Foto_Paket.apk melalui https://bit.ly/contoh untuk menerima hadiah.",
  );

  assert.deepEqual(
    analysis.signals.map((signal) => signal.id),
    [
      "secret-request",
      "apk-install",
      "payment-request",
      "urgency-threat",
      "authority-claim",
      "link-present",
      "reward-offer",
    ],
  );
});

test("analisis tanpa pola tidak menghasilkan sinyal", () => {
  const analysis = analyzeCheckInput(
    "Terima kasih. Pesanan sudah diterima dan tidak ada tindakan tambahan.",
  );

  assert.deepEqual(analysis, { signals: [] });
});

test("pemendek URL tanpa protokol tetap diperiksa sebagai teks", () => {
  const analysis = analyzeCheckInput("Silakan buka s.id/contoh-rahasia");

  assert.deepEqual(analysis.signals.map((signal) => signal.id), [
    "link-present",
  ]);
  assert.match(analysis.signals[0]?.excerpt ?? "", /\[tautan: s\.id\]/);
  assert.doesNotMatch(analysis.signals[0]?.excerpt ?? "", /contoh-rahasia/);
});

test("kutipan menyamarkan angka panjang, email, serta path dan query URL", () => {
  const sanitized = sanitizeCheckExcerpt(
    "Hubungi orang@example.com, nomor 0812-3456-7890, lalu buka https://contoh.id/rahasia?token=abc.",
  );

  assert.match(sanitized, /\[alamat email disamarkan\]/);
  assert.match(sanitized, /\[angka disamarkan\]/);
  assert.match(sanitized, /\[tautan: contoh\.id\]/);
  assert.doesNotMatch(sanitized, /orang@example\.com|0812|rahasia|token/);
});

test("tampilan awal menyediakan peringatan, batas input, dan tidak membuka URL", () => {
  const html = renderCheck(createCheckState());

  assert.match(html, /Cek Pola Pesan/);
  assert.match(html, /Jangan masukkan OTP, PIN, kata sandi, atau nomor kartu/);
  assert.match(html, /name="checkInput"/);
  assert.match(html, /maxlength="2000"/);
  assert.match(html, /Periksa pola pesan/);
  assert.doesNotMatch(html, /type="url"|type="password"|target="_blank"/);
});

test("hasil menampilkan alasan dan tindakan tanpa skor atau vonis", () => {
  const analysis = analyzeCheckInput(
    "Segera pasang Paket.apk dari https://contoh.invalid/path?kode=1",
  );
  const html = renderCheck(createCheckResultState(analysis));

  assert.match(html, /Ada pola yang perlu diperiksa/);
  assert.match(html, /Mengapa perlu diperiksa/);
  assert.match(html, /Tindakan yang disarankan/);
  assert.match(html, /petunjuk, bukan vonis/);
  assert.match(html, /\[tautan: contoh\.invalid\]/);
  assert.doesNotMatch(html, /href="https:\/\/contoh\.invalid|\d+%|pasti penipuan/);
});

test("hasil tanpa sinyal menyebut keterbatasan pemeriksaan", () => {
  const html = renderCheck(
    createCheckResultState(analyzeCheckInput("Pesan biasa tanpa permintaan.")),
  );

  assert.match(html, /Tidak ditemukan pola pada aturan HAWAS/);
  assert.match(html, /bukan jaminan.*pasti aman/i);
  assert.match(html, /Periksa pesan lain/);
});

test("kutipan hasil selalu melalui HTML escaping", () => {
  const html = renderCheck(
    createCheckResultState({
      signals: [{ id: "urgency-threat", excerpt: "<img src=x> segera" }],
    }),
  );

  assert.match(html, /&lt;img src=x&gt;/);
  assert.doesNotMatch(html, /<img src=x>/);
});
