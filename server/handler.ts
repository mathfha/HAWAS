import {
  CHECK_API_SCHEMA_VERSION,
  CHECK_RULES_VERSION,
  type CheckAiRequest,
  type CheckAiResponse,
  type CheckApiErrorCode,
  type CheckApiErrorResponse,
} from "../src/features/check/ai-contract.ts";
import {
  analyzeCheckInput,
  prepareCheckAiInput,
  validateCheckInput,
} from "../src/features/check/model.ts";
import { AiServiceError, type AiExplainer } from "./vertex.ts";

export const MAX_API_BODY_BYTES = 8_192;

export interface ApiRequest {
  method: string;
  path: string;
  headers: Readonly<Record<string, string | undefined>>;
  body: string;
}

export interface ApiResponse {
  status: number;
  headers: Readonly<Record<string, string>>;
  body: string;
}

export interface HandlerDependencies {
  allowedOrigins: readonly string[];
  ai: AiExplainer;
}

function json(
  status: number,
  value: CheckAiResponse | CheckApiErrorResponse | { status: "ok" },
  origin?: string,
): ApiResponse {
  return {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
      ...(origin
        ? {
            "access-control-allow-origin": origin,
            vary: "Origin",
          }
        : {}),
    },
    body: JSON.stringify(value),
  };
}

function failure(
  status: number,
  code: CheckApiErrorCode,
  message: string,
  origin?: string,
): ApiResponse {
  return json(status, { error: { code, message } }, origin);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseRequestBody(body: string): CheckAiRequest | null {
  try {
    const value: unknown = JSON.parse(body);
    if (
      !isRecord(value) ||
      value.schemaVersion !== CHECK_API_SCHEMA_VERSION ||
      typeof value.rulesVersion !== "string" ||
      typeof value.text !== "string"
    ) {
      return null;
    }
    return {
      schemaVersion: CHECK_API_SCHEMA_VERSION,
      rulesVersion: value.rulesVersion as typeof CHECK_RULES_VERSION,
      text: value.text,
    };
  } catch {
    return null;
  }
}

function allowedOrigin(
  request: ApiRequest,
  allowedOrigins: readonly string[],
): string | null {
  const origin = request.headers.origin?.replace(/\/$/, "");
  return origin && allowedOrigins.includes(origin) ? origin : null;
}

export async function handleApiRequest(
  request: ApiRequest,
  dependencies: HandlerDependencies,
): Promise<ApiResponse> {
  if (request.path === "/healthz" && request.method === "GET") {
    return json(200, { status: "ok" });
  }

  if (request.path !== "/api/v1/check/explain") {
    return failure(404, "invalid-request", "Endpoint tidak ditemukan.");
  }

  const origin = allowedOrigin(request, dependencies.allowedOrigins);
  if (!origin) {
    return failure(403, "invalid-request", "Asal permintaan tidak diizinkan.");
  }

  if (request.method === "OPTIONS") {
    return {
      status: 204,
      headers: {
        "access-control-allow-origin": origin,
        "access-control-allow-methods": "POST, OPTIONS",
        "access-control-allow-headers": "content-type",
        "access-control-max-age": "600",
        vary: "Origin",
      },
      body: "",
    };
  }

  if (request.method !== "POST") {
    return failure(405, "invalid-request", "Gunakan metode POST.", origin);
  }

  if (!request.headers["content-type"]?.toLowerCase().startsWith("application/json")) {
    return failure(
      415,
      "invalid-request",
      "Gunakan format JSON untuk permintaan ini.",
      origin,
    );
  }

  if (Buffer.byteLength(request.body, "utf8") > MAX_API_BODY_BYTES) {
    return failure(
      413,
      "payload-too-large",
      "Teks terlalu panjang untuk diperiksa.",
      origin,
    );
  }

  const payload = parseRequestBody(request.body);
  if (!payload) {
    return failure(400, "invalid-request", "Format permintaan tidak sesuai.", origin);
  }
  if (payload.rulesVersion !== CHECK_RULES_VERSION) {
    return failure(
      409,
      "rules-version-mismatch",
      "Aturan HAWAS telah diperbarui. Muat ulang halaman lalu coba lagi.",
      origin,
    );
  }

  const validation = validateCheckInput(payload.text);
  if (!validation.valid) {
    return failure(
      400,
      validation.code === "sensitive-data" ? "sensitive-data" : "invalid-request",
      validation.message,
      origin,
    );
  }

  const preparedText = prepareCheckAiInput(validation.value);
  const analysis = analyzeCheckInput(preparedText);

  try {
    const ai = await dependencies.ai.explain(
      preparedText,
      analysis.signals.map((signal) => signal.id),
    );
    return json(
      200,
      {
        schemaVersion: CHECK_API_SCHEMA_VERSION,
        rulesVersion: CHECK_RULES_VERSION,
        ruleSignalIds: analysis.signals.map((signal) => signal.id),
        ai,
      },
      origin,
    );
  } catch (error) {
    const serviceCode =
      error instanceof AiServiceError ? error.code : "unavailable";
    const status =
      serviceCode === "timeout"
        ? 504
        : serviceCode === "rate-limited"
          ? 429
          : serviceCode === "unavailable"
            ? 503
            : 502;
    const code =
      serviceCode === "timeout"
        ? "ai-timeout"
        : serviceCode === "rate-limited"
          ? "rate-limited"
          : serviceCode === "unavailable"
            ? "ai-unavailable"
            : "invalid-ai-response";
    return failure(
      status,
      code,
      serviceCode === "timeout"
        ? "Penjelasan AI membutuhkan waktu terlalu lama. Hasil aturan HAWAS tetap dapat digunakan."
        : serviceCode === "rate-limited"
          ? "Batas permintaan AI sedang tercapai. Coba lagi beberapa saat nanti."
        : "Penjelasan AI belum dapat diperiksa. Hasil aturan HAWAS tetap dapat digunakan.",
      origin,
    );
  }
}
