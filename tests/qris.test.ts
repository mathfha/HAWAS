import assert from "node:assert/strict";
import test from "node:test";
import {
  assessQrisContext,
  computeCrc16,
  createDecodedQrisState,
  createQrisState,
  createReviewedQrisState,
  parseQrisPayload,
  QrisDomainError,
  validateQrisImageFile,
} from "../src/features/qris/model.ts";
import { renderQris } from "../src/features/qris/view.ts";

function tlv(id: string, value: string): string {
  return `${id}${String(value.length).padStart(2, "0")}${value}`;
}

function createFictionalQris(options?: {
  dynamic?: boolean;
  amount?: string;
  merchantName?: string;
  city?: string;
  nationalIdentifier?: string;
}): string {
  const qrisAccount = tlv(
    "00",
    options?.nationalIdentifier ?? "ID.CO.QRIS.WWW",
  );
  const fields = [
    tlv("00", "01"),
    tlv("01", options?.dynamic ? "12" : "11"),
    tlv("51", qrisAccount),
    tlv("52", "5812"),
    tlv("53", "360"),
    ...(options?.amount ? [tlv("54", options.amount)] : []),
    tlv("58", "ID"),
    tlv("59", options?.merchantName ?? "TOKO CONTOH"),
    tlv("60", options?.city ?? "DENPASAR"),
  ].join("");
  const payloadWithCrcHeader = `${fields}6304`;
  return `${payloadWithCrcHeader}${computeCrc16(payloadWithCrcHeader)}`;
}

test("parser membaca field QRIS fiktif dan CRC yang valid", () => {
  const result = parseQrisPayload(createFictionalQris());

  assert.deepEqual(result, {
    merchantName: "TOKO CONTOH",
    merchantCity: "DENPASAR",
    amount: null,
    kind: "static",
    crcStatus: "valid",
  });
});

test("CRC cocok dengan contoh EMV Merchant-Presented Mode", () => {
  const emvExampleWithoutCrcValue =
    "00020101021229300012D156000000000510A93FO3230Q31280012D15600000001030812345678520441115802CN5914BEST TRANSPORT6007BEIJING64200002ZH0104最佳运输0202北京540523.7253031565502016233030412340603***0708A60086670902ME91320016A0112233449988770708123456786304";

  assert.equal(computeCrc16(emvExampleWithoutCrcValue), "A13A");
});

test("parser membaca QRIS dinamis dan nominal yang tersedia", () => {
  const result = parseQrisPayload(
    createFictionalQris({ dynamic: true, amount: "25000" }),
  );

  assert.equal(result.kind, "dynamic");
  assert.equal(result.amount, 25_000);
});

test("parser mengenali identifier GPN QR yang dipakai QRIS nyata", () => {
  const result = parseQrisPayload(
    createFictionalQris({ nationalIdentifier: "ID.OR.GPNQR.WWW" }),
  );

  assert.equal(result.merchantName, "TOKO CONTOH");
  assert.equal(result.crcStatus, "valid");
});

test("parser menandai CRC yang tidak konsisten tanpa memberi hasil aman", () => {
  const payload = createFictionalQris();
  const result = parseQrisPayload(`${payload.slice(0, -4)}0000`);

  assert.equal(result.crcStatus, "invalid");
});

test("parser menolak susunan rusak dan QR non-QRIS dengan error bertipe", () => {
  assert.throws(
    () => parseQrisPayload("00020"),
    (error: unknown) =>
      error instanceof QrisDomainError && error.code === "malformed-payload",
  );
  assert.throws(
    () => parseQrisPayload(tlv("00", "01")),
    (error: unknown) =>
      error instanceof QrisDomainError && error.code === "unsupported-qr",
  );
});

test("validasi berkas membatasi format dan ukuran gambar", () => {
  assert.equal(
    validateQrisImageFile({ type: "image/jpeg", size: 2_000_000 }),
    null,
  );
  assert.equal(
    validateQrisImageFile({ type: "image/svg+xml", size: 1_000 })?.code,
    "unsupported-file",
  );
  assert.equal(
    validateQrisImageFile({ type: "image/png", size: 11 * 1024 * 1024 })
      ?.code,
    "file-too-large",
  );
});

test("state hasil hanya menyimpan informasi QRIS terstruktur", () => {
  const result = parseQrisPayload(createFictionalQris());
  const state = createDecodedQrisState(result);

  assert.deepEqual(state, { stage: "decoded", result });
});

test("tampilan awal menjelaskan batas privasi dan menerima gambar saja", () => {
  const html = renderQris(createQrisState());

  assert.match(html, /Panduan Sebelum Bayar QRIS/);
  assert.match(html, /accept="image\/jpeg,image\/png,image\/webp"/);
  assert.match(html, /OTP, PIN, kata sandi/);
  assert.match(html, /Hasil adalah petunjuk/);
  assert.doesNotMatch(html, /type="url"|type="password"|capture=/);
});

test("hasil menampilkan ringkasan, detail, dan meloloskan teks melalui escaping", () => {
  const result = parseQrisPayload(
    createFictionalQris({ merchantName: "TOKO <CONTOH>" }),
  );
  const state = createDecodedQrisState(result);
  const html = renderQris(state);

  assert.match(html, /Nama penerima berhasil dibaca/);
  assert.match(html, /Cocokkan nama ini dengan informasi dari kasir/);
  assert.match(html, /TOKO &lt;CONTOH&gt;/);
  assert.match(html, /Lihat informasi QRIS yang terbaca/);
  assert.match(html, /CRC adalah pemeriksaan konsistensi susunan data/);
  assert.match(html, /Periksa gambar lain/);
  assert.doesNotMatch(html, /Bandingkan nama|expectedMerchantName/);
  assert.doesNotMatch(html, /TOKO <CONTOH>/);
});

test("pemeriksaan konteks tidak memberi vonis aman setelah semua jawaban sesuai", () => {
  const result = parseQrisPayload(createFictionalQris());
  const assessment = assessQrisContext(result, {
    source: "merchant-location",
    recipient: "matches",
    amount: "matches",
    pressure: "no",
  });

  assert.deepEqual(assessment, {
    level: "review-complete",
    reasons: [],
  });
});

test("perbedaan nama, nominal, atau desakan meminta pengguna berhenti", () => {
  const result = parseQrisPayload(createFictionalQris());
  const assessment = assessQrisContext(result, {
    source: "merchant-location",
    recipient: "different",
    amount: "different",
    pressure: "yes",
  });

  assert.equal(assessment.level, "pause");
  assert.deepEqual(assessment.reasons, [
    "recipient-different",
    "amount-different",
    "payment-pressure",
  ]);
});

test("QR dari pesan dan informasi yang belum diperiksa menghasilkan panduan verifikasi", () => {
  const result = parseQrisPayload(createFictionalQris());
  const assessment = assessQrisContext(result, {
    source: "message",
    recipient: "not-checked",
    amount: "not-checked",
    pressure: "no",
  });

  assert.equal(assessment.level, "verify");
  assert.deepEqual(assessment.reasons, [
    "source-message",
    "recipient-not-checked",
    "amount-not-checked",
  ]);
});

test("status CRC tetap memengaruhi panduan meskipun jawaban pengguna sesuai", () => {
  const payload = createFictionalQris();
  const matchingAnswers = {
    source: "merchant-location" as const,
    recipient: "matches" as const,
    amount: "matches" as const,
    pressure: "no" as const,
  };
  const invalidResult = parseQrisPayload(`${payload.slice(0, -4)}0000`);
  const missingResult = parseQrisPayload(payload.slice(0, -8));

  assert.deepEqual(assessQrisContext(invalidResult, matchingAnswers), {
    level: "pause",
    reasons: ["crc-invalid"],
  });
  assert.deepEqual(assessQrisContext(missingResult, matchingAnswers), {
    level: "verify",
    reasons: ["crc-missing"],
  });
});

test("tampilan hasil menyediakan checklist konteks dan tindakan yang tidak memproses pembayaran", () => {
  const result = parseQrisPayload(createFictionalQris());
  const decodedHtml = renderQris(createDecodedQrisState(result));
  const reviewedHtml = renderQris(
    createReviewedQrisState(result, {
      source: "merchant-location",
      recipient: "different",
      amount: "matches",
      pressure: "no",
    }),
  );

  assert.match(decodedHtml, /Periksa situasi sebelum membayar/);
  assert.match(decodedHtml, /data-qris-context-form/);
  assert.match(decodedHtml, /name="qrisSource"/);
  assert.match(decodedHtml, /name="qrisRecipient"/);
  assert.match(decodedHtml, /name="qrisAmount"/);
  assert.match(decodedHtml, /name="qrisPressure"/);
  assert.match(reviewedHtml, /Berhenti sebelum membayar/);
  assert.match(reviewedHtml, /Nama penerima berbeda/);
  assert.match(reviewedHtml, /bukan jaminan pembayaran pasti aman/i);
  assert.doesNotMatch(reviewedHtml, />Bayar</);
});
