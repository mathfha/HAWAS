import type { CheckSignalId } from "./model.ts";

export const CHECK_API_SCHEMA_VERSION = 1 as const;
export const CHECK_RULES_VERSION = "1" as const;

export const checkAiCategories = [
  "secret-request",
  "apk-install",
  "payment-request",
  "urgency-threat",
  "authority-claim",
  "link-present",
  "reward-offer",
] as const satisfies readonly CheckSignalId[];

export interface CheckAiContextSignal {
  category: CheckSignalId;
  reason: string;
}

export interface CheckAiExplanation {
  summary: string;
  contextSignals: readonly CheckAiContextSignal[];
  verificationQuestions: readonly string[];
}

export interface CheckAiRequest {
  schemaVersion: typeof CHECK_API_SCHEMA_VERSION;
  rulesVersion: typeof CHECK_RULES_VERSION;
  text: string;
}

export interface CheckAiResponse {
  schemaVersion: typeof CHECK_API_SCHEMA_VERSION;
  rulesVersion: typeof CHECK_RULES_VERSION;
  ruleSignalIds: readonly CheckSignalId[];
  ai: CheckAiExplanation;
}

export type CheckApiErrorCode =
  | "invalid-request"
  | "sensitive-data"
  | "rules-version-mismatch"
  | "payload-too-large"
  | "rate-limited"
  | "ai-unavailable"
  | "ai-timeout"
  | "invalid-ai-response";

export interface CheckApiErrorResponse {
  error: {
    code: CheckApiErrorCode;
    message: string;
  };
}

const forbiddenVerdictPattern = /\b(?:aman|penipuan|menipu)\b/i;
const activeUrlPattern = /\b(?:https?:\/\/|www\.)/i;
const personalDataPattern =
  /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b|(?:\d[\s.-]?){4,}/i;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isCheckSignalId(value: unknown): value is CheckSignalId {
  return (
    typeof value === "string" &&
    (checkAiCategories as readonly string[]).includes(value)
  );
}

function cleanAiText(
  value: unknown,
  maximumLength: number,
): string | null {
  if (typeof value !== "string") return null;
  const normalized = value.replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim();
  if (
    normalized.length === 0 ||
    normalized.length > maximumLength ||
    forbiddenVerdictPattern.test(normalized) ||
    activeUrlPattern.test(normalized) ||
    personalDataPattern.test(normalized)
  ) {
    return null;
  }
  return normalized;
}

export function parseCheckAiExplanation(value: unknown): CheckAiExplanation {
  if (!isRecord(value)) throw new Error("invalid-ai-response");

  const summary = cleanAiText(value.summary, 500);
  if (!summary) throw new Error("invalid-ai-response");

  if (!Array.isArray(value.contextSignals) || value.contextSignals.length > 3) {
    throw new Error("invalid-ai-response");
  }
  const contextSignals: CheckAiContextSignal[] = value.contextSignals.map(
    (item) => {
      if (!isRecord(item) || !isCheckSignalId(item.category)) {
        throw new Error("invalid-ai-response");
      }
      const reason = cleanAiText(item.reason, 240);
      if (!reason) throw new Error("invalid-ai-response");
      return { category: item.category, reason };
    },
  );

  if (
    !Array.isArray(value.verificationQuestions) ||
    value.verificationQuestions.length > 3
  ) {
    throw new Error("invalid-ai-response");
  }
  const verificationQuestions = value.verificationQuestions.map((question) => {
    const cleaned = cleanAiText(question, 180);
    if (!cleaned) throw new Error("invalid-ai-response");
    return cleaned;
  });

  return { summary, contextSignals, verificationQuestions };
}

export function parseCheckAiResponse(value: unknown): CheckAiResponse {
  if (
    !isRecord(value) ||
    value.schemaVersion !== CHECK_API_SCHEMA_VERSION ||
    value.rulesVersion !== CHECK_RULES_VERSION ||
    !Array.isArray(value.ruleSignalIds) ||
    !value.ruleSignalIds.every(isCheckSignalId)
  ) {
    throw new Error("invalid-api-response");
  }

  return {
    schemaVersion: CHECK_API_SCHEMA_VERSION,
    rulesVersion: CHECK_RULES_VERSION,
    ruleSignalIds: value.ruleSignalIds,
    ai: parseCheckAiExplanation(value.ai),
  };
}
