export const MAX_CHECK_INPUT_LENGTH = 2_000;

export type CheckSignalId =
  | "secret-request"
  | "apk-install"
  | "payment-request"
  | "urgency-threat"
  | "authority-claim"
  | "link-present"
  | "reward-offer";

export interface CheckSignal {
  id: CheckSignalId;
  excerpt: string;
}

export interface CheckAnalysis {
  signals: readonly CheckSignal[];
}

export type CheckAiState =
  | { stage: "available"; preparedText: string }
  | { stage: "loading"; preparedText: string }
  | {
      stage: "success";
      preparedText: string;
      explanation: import("./ai-contract.ts").CheckAiExplanation;
    }
  | { stage: "error"; preparedText: string; message: string };

export type CheckViewState =
  | { stage: "idle" }
  | { stage: "result"; analysis: CheckAnalysis; ai: CheckAiState };

export type CheckValidationResult =
  | { valid: true; value: string }
  | {
      valid: false;
      code: "empty" | "too-long" | "sensitive-data";
      message: string;
    };

interface CheckRule {
  id: CheckSignalId;
  patterns: readonly RegExp[];
}

const otpOrPinValuePattern =
  /\b(?:otp|pin|kode\s+(?:otp|verifikasi|rahasia))\s*(?:saya\s*)?(?:adalah|:|=|-)?\s*\d{4,8}\b/i;
const passwordValuePattern =
  /\b(?:password|kata\s+sandi)\s*(?:saya\s*)?(?:adalah|:|=|-)\s*[^\s,;]{4,}/i;
const cardNumberCandidatePattern = /(?:\d[ -]?){13,19}/g;
const urlPattern = /\b(?:https?:\/\/|www\.)[^\s<>()]+/i;
const urlPatternGlobal = /\b(?:https?:\/\/|www\.)[^\s<>()]+/gi;
const shortUrlPattern =
  /\b(?:bit\.ly|tinyurl\.com|s\.id|shorturl\.at)\/[^\s<>()]+/i;
const shortUrlPatternGlobal =
  /\b(?:bit\.ly|tinyurl\.com|s\.id|shorturl\.at)\/[^\s<>()]+/gi;
const emailPattern = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
const longNumberPattern = /(?:\d[\s.-]?){4,}/g;

const rules: readonly CheckRule[] = [
  {
    id: "secret-request",
    patterns: [
      /\b(?:minta|kirim|berikan|sebutkan|masukkan|bagikan|konfirmasi)\b.{0,48}\b(?:otp|pin|password|kata\s+sandi|kode\s+(?:sms|rahasia|verifikasi))\b/i,
      /\b(?:otp|pin|password|kata\s+sandi|kode\s+(?:sms|rahasia|verifikasi))\b.{0,48}\b(?:kirim|berikan|sebutkan|masukkan|bagikan|konfirmasi)\b/i,
    ],
  },
  {
    id: "apk-install",
    patterns: [
      /\.apk\b/i,
      /\b(?:instal|install|pasang|unduh|download)\b.{0,36}\b(?:aplikasi|app|berkas)\b/i,
    ],
  },
  {
    id: "payment-request",
    patterns: [
      /\b(?:transfer|bayar|kirim\s+uang|setor)\b.{0,60}\b(?:sekarang|segera|rekening|nomor|dompet\s+digital|dana|saldo)\b/i,
      /\b(?:rekening|dompet\s+digital)\b.{0,48}\b(?:transfer|bayar|kirim)\b/i,
    ],
  },
  {
    id: "urgency-threat",
    patterns: [
      /\b(?:segera|sekarang\s+juga|hari\s+ini\s+juga|jangan\s+ditunda|waktu\s+terbatas)\b/i,
      /\b(?:akun|rekening|kartu)\b.{0,48}\b(?:diblokir|dinonaktifkan|dibekukan|ditutup)\b/i,
      /\b(?:dalam|maksimal)\s+\d+\s+(?:menit|jam)\b/i,
    ],
  },
  {
    id: "authority-claim",
    patterns: [
      /\b(?:kami|saya)\s+(?:dari|petugas)\b.{0,48}\b(?:bank|kurir|polisi|ojk|bank\s+indonesia|kantor|layanan)\b/i,
      /\bmengaku\b.{0,48}\b(?:bank|kurir|polisi|ojk|bank\s+indonesia|petugas)\b/i,
    ],
  },
  {
    id: "link-present",
    patterns: [urlPattern, shortUrlPattern, /\[tautan:\s*[^\]]+\]/i],
  },
  {
    id: "reward-offer",
    patterns: [
      /\b(?:hadiah|menang|pemenang|bonus|cashback|refund|pengembalian\s+dana)\b/i,
    ],
  },
] as const;

function passesLuhn(value: string): boolean {
  let sum = 0;
  let doubleDigit = false;

  for (let index = value.length - 1; index >= 0; index -= 1) {
    let digit = Number(value[index]);
    if (doubleDigit) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    doubleDigit = !doubleDigit;
  }

  return sum % 10 === 0;
}

function containsPossibleCardNumber(value: string): boolean {
  for (const match of value.matchAll(cardNumberCandidatePattern)) {
    const digits = match[0].replace(/\D/g, "");
    if (digits.length >= 13 && digits.length <= 19 && passesLuhn(digits)) {
      return true;
    }
  }
  return false;
}

function containsSensitiveValue(value: string): boolean {
  return (
    otpOrPinValuePattern.test(value) ||
    passwordValuePattern.test(value) ||
    containsPossibleCardNumber(value)
  );
}

function hostnameFromUrl(value: string): string {
  try {
    const url = new URL(
      /^https?:\/\//i.test(value) ? value : `https://${value}`,
    );
    return url.hostname;
  } catch {
    return "alamat tidak lengkap";
  }
}

export function sanitizeCheckExcerpt(value: string): string {
  return value
    .replace(urlPatternGlobal, (url) => `[tautan: ${hostnameFromUrl(url)}]`)
    .replace(shortUrlPatternGlobal, (url) =>
      `[tautan: ${hostnameFromUrl(url)}]`,
    )
    .replace(emailPattern, "[alamat email disamarkan]")
    .replace(longNumberPattern, "[angka disamarkan]")
    .replace(/\s+/g, " ")
    .trim();
}

export function prepareCheckAiInput(value: string): string {
  return sanitizeCheckExcerpt(value);
}

function excerptAroundMatch(value: string, match: RegExpExecArray): string {
  const padding = 56;
  const start = Math.max(0, match.index - padding);
  const end = Math.min(value.length, match.index + match[0].length + padding);
  const excerpt = sanitizeCheckExcerpt(value.slice(start, end));
  return `${start > 0 ? "…" : ""}${excerpt}${end < value.length ? "…" : ""}`;
}

function findRuleMatch(value: string, rule: CheckRule): RegExpExecArray | null {
  for (const pattern of rule.patterns) {
    const match = pattern.exec(value);
    if (match) return match;
  }
  return null;
}

export function validateCheckInput(value: string): CheckValidationResult {
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return {
      valid: false,
      code: "empty",
      message: "Tempel isi pesan atau URL yang ingin diperiksa.",
    };
  }

  if (trimmed.length > MAX_CHECK_INPUT_LENGTH) {
    return {
      valid: false,
      code: "too-long",
      message: `Teks melebihi ${MAX_CHECK_INPUT_LENGTH.toLocaleString("id-ID")} karakter. Pendekkan pesan lalu coba lagi.`,
    };
  }

  if (containsSensitiveValue(trimmed)) {
    return {
      valid: false,
      code: "sensitive-data",
      message:
        "HAWAS menemukan pola yang menyerupai data rahasia. Hapus OTP, PIN, kata sandi, atau nomor kartu sebelum melanjutkan.",
    };
  }

  return { valid: true, value: trimmed };
}

export function analyzeCheckInput(value: string): CheckAnalysis {
  const signals: CheckSignal[] = [];

  for (const rule of rules) {
    const match = findRuleMatch(value, rule);
    if (!match) continue;
    signals.push({ id: rule.id, excerpt: excerptAroundMatch(value, match) });
  }

  return { signals };
}

export function createCheckState(): CheckViewState {
  return { stage: "idle" };
}

export function createCheckResultState(
  analysis: CheckAnalysis,
  preparedText = "",
): CheckViewState {
  return {
    stage: "result",
    analysis,
    ai: { stage: "available", preparedText },
  };
}

export function setCheckAiLoading(
  state: Extract<CheckViewState, { stage: "result" }>,
): CheckViewState {
  return {
    ...state,
    ai: { stage: "loading", preparedText: state.ai.preparedText },
  };
}

export function setCheckAiSuccess(
  state: Extract<CheckViewState, { stage: "result" }>,
  explanation: import("./ai-contract.ts").CheckAiExplanation,
): CheckViewState {
  return {
    ...state,
    ai: { stage: "success", preparedText: state.ai.preparedText, explanation },
  };
}

export function setCheckAiError(
  state: Extract<CheckViewState, { stage: "result" }>,
  message: string,
): CheckViewState {
  return {
    ...state,
    ai: { stage: "error", preparedText: state.ai.preparedText, message },
  };
}
