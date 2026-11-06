export const MAX_QRIS_IMAGE_SIZE = 10 * 1024 * 1024;

const supportedImageTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const supportedQrisIdentifiers = new Set([
  "ID.OR.GPNQR.WWW",
  "ID.CO.QRIS.WWW",
]);

export type QrisErrorCode =
  | "missing-file"
  | "unsupported-file"
  | "file-too-large"
  | "decode-failed"
  | "malformed-payload"
  | "unsupported-qr";

export class QrisDomainError extends Error {
  readonly code: QrisErrorCode;

  constructor(code: QrisErrorCode, message: string) {
    super(message);
    this.name = "QrisDomainError";
    this.code = code;
  }
}

export type CrcStatus = "valid" | "invalid" | "missing";
export type QrisKind = "static" | "dynamic" | "unknown";
export type QrisSource = "merchant-location" | "message" | "other";
export type QrisCheckAnswer = "matches" | "different" | "not-checked";
export type QrisPressureAnswer = "yes" | "no";
export type QrisGuidanceLevel = "pause" | "verify" | "review-complete";
export type QrisGuidanceReason =
  | "crc-invalid"
  | "crc-missing"
  | "source-message"
  | "source-other"
  | "recipient-different"
  | "recipient-not-checked"
  | "amount-different"
  | "amount-not-checked"
  | "payment-pressure";

export interface QrisContextAnswers {
  source: QrisSource;
  recipient: QrisCheckAnswer;
  amount: QrisCheckAnswer;
  pressure: QrisPressureAnswer;
}

export interface QrisContextAssessment {
  level: QrisGuidanceLevel;
  reasons: readonly QrisGuidanceReason[];
}

export interface QrisPayloadResult {
  merchantName: string | null;
  merchantCity: string | null;
  amount: number | null;
  kind: QrisKind;
  crcStatus: CrcStatus;
}

export type QrisViewState =
  | { stage: "idle" }
  | { stage: "reading" }
  | { stage: "decoded"; result: QrisPayloadResult }
  | {
      stage: "reviewed";
      result: QrisPayloadResult;
      answers: QrisContextAnswers;
      assessment: QrisContextAssessment;
    }
  | { stage: "error"; code: QrisErrorCode; message: string };

interface TlvField {
  id: string;
  value: string;
}

function parseTlv(payload: string): TlvField[] {
  const fields: TlvField[] = [];
  let cursor = 0;

  while (cursor < payload.length) {
    if (cursor + 4 > payload.length) {
      throw new QrisDomainError(
        "malformed-payload",
        "Data QR terpotong dan tidak dapat dibaca lengkap.",
      );
    }

    const id = payload.slice(cursor, cursor + 2);
    const lengthText = payload.slice(cursor + 2, cursor + 4);
    if (!/^\d{2}$/.test(id) || !/^\d{2}$/.test(lengthText)) {
      throw new QrisDomainError(
        "malformed-payload",
        "Susunan data QR tidak dikenali.",
      );
    }

    const length = Number(lengthText);
    const valueStart = cursor + 4;
    const valueEnd = valueStart + length;
    if (valueEnd > payload.length) {
      throw new QrisDomainError(
        "malformed-payload",
        "Panjang data QR tidak sesuai dengan isinya.",
      );
    }

    fields.push({ id, value: payload.slice(valueStart, valueEnd) });
    cursor = valueEnd;
  }

  return fields;
}

function findField(fields: readonly TlvField[], id: string): string | null {
  return fields.find((field) => field.id === id)?.value ?? null;
}

function hasQrisIdentifier(fields: readonly TlvField[]): boolean {
  return fields
    .filter((field) => {
      const numericId = Number(field.id);
      return numericId >= 26 && numericId <= 51;
    })
    .some((field) => {
      try {
        const identifier = findField(parseTlv(field.value), "00");
        return identifier !== null && supportedQrisIdentifiers.has(identifier);
      } catch {
        return false;
      }
    });
}

export function computeCrc16(input: string): string {
  let crc = 0xffff;

  for (const byte of new TextEncoder().encode(input)) {
    crc ^= byte << 8;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc & 0x8000) !== 0 ? (crc << 1) ^ 0x1021 : crc << 1;
      crc &= 0xffff;
    }
  }

  return crc.toString(16).toUpperCase().padStart(4, "0");
}

function getCrcStatus(payload: string, fields: readonly TlvField[]): CrcStatus {
  const crc = findField(fields, "63");
  if (!crc || !payload.endsWith(`6304${crc}`) || !/^[0-9A-Fa-f]{4}$/.test(crc)) {
    return "missing";
  }

  const expected = computeCrc16(payload.slice(0, -4));
  return expected === crc.toUpperCase() ? "valid" : "invalid";
}

function parseAmount(value: string | null): number | null {
  if (!value || !/^\d{1,13}(?:\.\d{1,2})?$/.test(value)) return null;
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : null;
}

export function parseQrisPayload(payload: string): QrisPayloadResult {
  if (payload.length === 0 || payload.length > 4096) {
    throw new QrisDomainError(
      "unsupported-qr",
      "Kode yang dipilih bukan QRIS yang didukung HAWAS.",
    );
  }

  const fields = parseTlv(payload);
  if (findField(fields, "00") !== "01" || !hasQrisIdentifier(fields)) {
    throw new QrisDomainError(
      "unsupported-qr",
      "Kode terbaca, tetapi formatnya bukan QRIS yang didukung HAWAS.",
    );
  }

  const initiationMethod = findField(fields, "01");
  const kind: QrisKind =
    initiationMethod === "11"
      ? "static"
      : initiationMethod === "12"
        ? "dynamic"
        : "unknown";

  return {
    merchantName: findField(fields, "59"),
    merchantCity: findField(fields, "60"),
    amount: parseAmount(findField(fields, "54")),
    kind,
    crcStatus: getCrcStatus(payload, fields),
  };
}

export function validateQrisImageFile(file: {
  type: string;
  size: number;
}): QrisDomainError | null {
  if (!supportedImageTypes.has(file.type)) {
    return new QrisDomainError(
      "unsupported-file",
      "Gunakan gambar berformat JPEG, PNG, atau WebP.",
    );
  }

  if (file.size > MAX_QRIS_IMAGE_SIZE) {
    return new QrisDomainError(
      "file-too-large",
      "Ukuran gambar melebihi 10 MiB. Pilih gambar yang lebih kecil.",
    );
  }

  return null;
}

export function createQrisState(): QrisViewState {
  return { stage: "idle" };
}

export function createDecodedQrisState(
  result: QrisPayloadResult,
): QrisViewState {
  return { stage: "decoded", result };
}

export function isQrisSource(value: unknown): value is QrisSource {
  return (
    value === "merchant-location" || value === "message" || value === "other"
  );
}

export function isQrisCheckAnswer(value: unknown): value is QrisCheckAnswer {
  return value === "matches" || value === "different" || value === "not-checked";
}

export function isQrisPressureAnswer(
  value: unknown,
): value is QrisPressureAnswer {
  return value === "yes" || value === "no";
}

export function assessQrisContext(
  result: QrisPayloadResult,
  answers: QrisContextAnswers,
): QrisContextAssessment {
  const reasons: QrisGuidanceReason[] = [];

  if (result.crcStatus === "invalid") reasons.push("crc-invalid");
  if (result.crcStatus === "missing") reasons.push("crc-missing");
  if (answers.source === "message") reasons.push("source-message");
  if (answers.source === "other") reasons.push("source-other");
  if (answers.recipient === "different") reasons.push("recipient-different");
  if (answers.recipient === "not-checked") reasons.push("recipient-not-checked");
  if (answers.amount === "different") reasons.push("amount-different");
  if (answers.amount === "not-checked") reasons.push("amount-not-checked");
  if (answers.pressure === "yes") reasons.push("payment-pressure");

  const shouldPause = reasons.some((reason) =>
    [
      "crc-invalid",
      "recipient-different",
      "amount-different",
      "payment-pressure",
    ].includes(reason),
  );

  return {
    level: shouldPause
      ? "pause"
      : reasons.length > 0
        ? "verify"
        : "review-complete",
    reasons,
  };
}

export function createReviewedQrisState(
  result: QrisPayloadResult,
  answers: QrisContextAnswers,
): QrisViewState {
  return {
    stage: "reviewed",
    result,
    answers,
    assessment: assessQrisContext(result, answers),
  };
}
