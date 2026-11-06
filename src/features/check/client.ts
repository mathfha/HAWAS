import {
  CHECK_API_SCHEMA_VERSION,
  CHECK_RULES_VERSION,
  parseCheckAiResponse,
  type CheckAiExplanation,
  type CheckAiRequest,
  type CheckApiErrorResponse,
} from "./ai-contract.ts";

export class CheckAiClientError extends Error {
  readonly code: "rate-limited" | "unavailable" | "timeout" | "invalid-response";

  constructor(
    code: "rate-limited" | "unavailable" | "timeout" | "invalid-response",
    message: string,
  ) {
    super(message);
    this.name = "CheckAiClientError";
    this.code = code;
  }
}

function messageForStatus(status: number): CheckAiClientError {
  if (status === 429) {
    return new CheckAiClientError(
      "rate-limited",
      "Batas permintaan AI sedang tercapai. Hasil aturan HAWAS tetap dapat digunakan. Coba lagi beberapa saat nanti.",
    );
  }
  if (status === 504) {
    return new CheckAiClientError(
      "timeout",
      "Penjelasan AI membutuhkan waktu terlalu lama. Hasil aturan HAWAS tetap tersedia.",
    );
  }
  return new CheckAiClientError(
    "unavailable",
    "Penjelasan AI belum dapat dimuat. Hasil aturan HAWAS tetap tersedia dan tidak berubah.",
  );
}

export async function requestCheckAiExplanation(
  apiBaseUrl: string,
  text: string,
  signal: AbortSignal,
): Promise<CheckAiExplanation> {
  const payload: CheckAiRequest = {
    schemaVersion: CHECK_API_SCHEMA_VERSION,
    rulesVersion: CHECK_RULES_VERSION,
    text,
  };

  let response: Response;
  try {
    response = await fetch(`${apiBaseUrl}/api/v1/check/explain`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
      credentials: "omit",
      cache: "no-store",
      signal,
    });
  } catch (error) {
    if (signal.aborted) throw error;
    throw new CheckAiClientError(
      "unavailable",
      "Penjelasan AI belum dapat dihubungi. Hasil aturan HAWAS tetap tersedia.",
    );
  }

  if (!response.ok) {
    try {
      const body = (await response.json()) as CheckApiErrorResponse;
      if (body.error?.message && response.status < 500) {
        throw new CheckAiClientError(
          response.status === 429 ? "rate-limited" : "unavailable",
          body.error.message,
        );
      }
    } catch (error) {
      if (error instanceof CheckAiClientError) throw error;
    }
    throw messageForStatus(response.status);
  }

  try {
    return parseCheckAiResponse(await response.json()).ai;
  } catch {
    throw new CheckAiClientError(
      "invalid-response",
      "Respons AI tidak dapat diperiksa. Hasil aturan HAWAS tetap tersedia.",
    );
  }
}
