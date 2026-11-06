import assert from "node:assert/strict";
import test from "node:test";
import {
  CHECK_API_SCHEMA_VERSION,
  CHECK_RULES_VERSION,
  parseCheckAiExplanation,
  parseCheckAiResponse,
  type CheckAiExplanation,
} from "../src/features/check/ai-contract.ts";
import {
  analyzeCheckInput,
  createCheckResultState,
  prepareCheckAiInput,
  setCheckAiError,
  setCheckAiLoading,
  setCheckAiSuccess,
} from "../src/features/check/model.ts";
import { renderCheck } from "../src/features/check/view.ts";
import {
  handleApiRequest,
  type ApiRequest,
} from "../server/handler.ts";
import { AiServiceError, type AiExplainer } from "../server/vertex.ts";

const allowedOrigin = "https://hawas.example";

const explanation: CheckAiExplanation = {
  summary: "Pesan memakai desakan agar penerima segera bertindak.",
  contextSignals: [
    {
      category: "authority-claim",
      reason: "Nama lembaga dalam pesan belum membuktikan identitas pengirim.",
    },
  ],
  verificationQuestions: [
    "Apakah permintaan ini dapat diperiksa melalui kanal resmi?",
  ],
};

class FakeAi implements AiExplainer {
  calls: Array<{ text: string; signalIds: readonly string[] }> = [];
  private readonly result: CheckAiExplanation;

  constructor(result: CheckAiExplanation = explanation) {
    this.result = result;
  }

  async explain(
    text: string,
    signalIds: readonly import("../src/features/check/model.ts").CheckSignalId[],
  ): Promise<CheckAiExplanation> {
    this.calls.push({ text, signalIds });
    return this.result;
  }
}

function request(
  body: unknown,
  overrides: Partial<ApiRequest> = {},
): ApiRequest {
  return {
    method: "POST",
    path: "/api/v1/check/explain",
    headers: {
      origin: allowedOrigin,
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
    ...overrides,
  };
}

test("teks untuk AI menyamarkan email, angka panjang, dan bagian URL", () => {
  const prepared = prepareCheckAiInput(
    "Hubungi nama@example.com di 0812-3456-7890 lalu buka https://contoh.id/path?token=rahasia.",
  );

  assert.match(prepared, /\[alamat email disamarkan\]/);
  assert.match(prepared, /\[angka disamarkan\]/);
  assert.match(prepared, /\[tautan: contoh\.id\]/);
  assert.doesNotMatch(prepared, /nama@example|0812|token|rahasia/);
});

test("panel AI hanya muncul saat fitur aktif dan teks samaran tersedia", () => {
  const state = createCheckResultState(
    analyzeCheckInput("Segera hubungi petugas bank."),
    "Segera hubungi petugas bank.",
  );

  assert.doesNotMatch(renderCheck(state), /Minta penjelasan tambahan dari AI/);
  const enabled = renderCheck(state, { aiEnabled: true });
  assert.match(enabled, /Minta penjelasan tambahan dari AI/);
  assert.match(enabled, /hanya dikirim.*jika Anda meminta/i);
});

test("panel AI memiliki state loading, error, dan sukses tanpa menghapus hasil lokal", () => {
  const initial = createCheckResultState(
    analyzeCheckInput("Kami dari bank, segera bertindak."),
    "Kami dari bank, segera bertindak.",
  );
  if (initial.stage !== "result") assert.fail("state hasil diharapkan");

  const loading = renderCheck(setCheckAiLoading(initial), { aiEnabled: true });
  assert.match(loading, /Menyiapkan penjelasan AI/);
  assert.match(loading, /Hasil pemeriksaan aturan lokal/);

  const failedState = setCheckAiError(initial, "Layanan sedang sibuk.");
  const failed = renderCheck(failedState, { aiEnabled: true });
  assert.match(failed, /Coba penjelasan AI lagi/);
  assert.match(failed, /Hasil pemeriksaan aturan lokal/);

  const success = renderCheck(setCheckAiSuccess(initial, explanation), {
    aiEnabled: true,
  });
  assert.match(success, /Penjelasan tambahan dari AI/);
  assert.match(success, /Pertanyaan untuk verifikasi/);
  assert.match(success, /dapat keliru/);
  assert.match(success, /Hasil pemeriksaan aturan lokal/);
});

test("validator respons AI menolak vonis, URL aktif, dan kategori liar", () => {
  assert.throws(() =>
    parseCheckAiExplanation({
      ...explanation,
      summary: "Pesan ini pasti penipuan.",
    }),
  );
  assert.throws(() =>
    parseCheckAiExplanation({
      ...explanation,
      verificationQuestions: ["Buka https://contoh.test"],
    }),
  );
  assert.throws(() =>
    parseCheckAiExplanation({
      ...explanation,
      contextSignals: [{ category: "aman", reason: "Tidak ada masalah." }],
    }),
  );
});

test("kontrak API memerlukan versi dan struktur yang tepat", () => {
  const parsed = parseCheckAiResponse({
    schemaVersion: CHECK_API_SCHEMA_VERSION,
    rulesVersion: CHECK_RULES_VERSION,
    ruleSignalIds: ["urgency-threat"],
    ai: explanation,
  });
  assert.deepEqual(parsed.ai, explanation);
  assert.throws(() =>
    parseCheckAiResponse({
      schemaVersion: 2,
      rulesVersion: CHECK_RULES_VERSION,
      ruleSignalIds: [],
      ai: explanation,
    }),
  );
});

test("backend memvalidasi ulang rules dan hanya mengirim teks samaran ke AI", async () => {
  const ai = new FakeAi();
  const response = await handleApiRequest(
    request({
      schemaVersion: CHECK_API_SCHEMA_VERSION,
      rulesVersion: CHECK_RULES_VERSION,
      text: "Kami dari bank. Segera hubungi 0812-3456-7890 melalui https://contoh.id/path.",
    }),
    { allowedOrigins: [allowedOrigin], ai },
  );

  assert.equal(response.status, 200);
  assert.equal(ai.calls.length, 1);
  assert.match(ai.calls[0]?.text ?? "", /\[angka disamarkan\]/);
  assert.match(ai.calls[0]?.text ?? "", /\[tautan: contoh\.id\]/);
  assert.doesNotMatch(ai.calls[0]?.text ?? "", /0812|\/path/);

  const body = JSON.parse(response.body) as {
    ruleSignalIds: string[];
  };
  assert.deepEqual(body.ruleSignalIds, ["urgency-threat", "authority-claim", "link-present"]);
});

test("backend menolak origin, versi rules, content type, dan data rahasia", async () => {
  const ai = new FakeAi();
  const dependencies = { allowedOrigins: [allowedOrigin], ai };
  const validBody = {
    schemaVersion: CHECK_API_SCHEMA_VERSION,
    rulesVersion: CHECK_RULES_VERSION,
    text: "Segera hubungi petugas.",
  };

  assert.equal(
    (
      await handleApiRequest(
        request(validBody, { headers: { origin: "https://asing.example" } }),
        dependencies,
      )
    ).status,
    403,
  );
  assert.equal(
    (
      await handleApiRequest(
        request({ ...validBody, rulesVersion: "lama" }),
        dependencies,
      )
    ).status,
    409,
  );
  assert.equal(
    (
      await handleApiRequest(
        request(validBody, {
          headers: { origin: allowedOrigin, "content-type": "text/plain" },
        }),
        dependencies,
      )
    ).status,
    415,
  );
  const sensitive = await handleApiRequest(
    request({ ...validBody, text: "Kode OTP saya 123456" }),
    dependencies,
  );
  assert.equal(sensitive.status, 400);
  assert.doesNotMatch(sensitive.body, /123456/);
  assert.equal(ai.calls.length, 0);
});

test("preflight hanya mengizinkan origin dan header yang ditentukan", async () => {
  const response = await handleApiRequest(
    request(null, { method: "OPTIONS", body: "" }),
    { allowedOrigins: [allowedOrigin], ai: new FakeAi() },
  );

  assert.equal(response.status, 204);
  assert.equal(response.headers["access-control-allow-origin"], allowedOrigin);
  assert.equal(response.headers["access-control-allow-methods"], "POST, OPTIONS");
});

test("backend menerjemahkan timeout dan rate limit tanpa mengubah hasil lokal", async () => {
  const validBody = {
    schemaVersion: CHECK_API_SCHEMA_VERSION,
    rulesVersion: CHECK_RULES_VERSION,
    text: "Segera hubungi petugas.",
  };
  const failingAi = (code: "timeout" | "rate-limited"): AiExplainer => ({
    async explain() {
      throw new AiServiceError(code);
    },
  });

  const timeout = await handleApiRequest(request(validBody), {
    allowedOrigins: [allowedOrigin],
    ai: failingAi("timeout"),
  });
  assert.equal(timeout.status, 504);
  assert.match(timeout.body, /hasil aturan HAWAS tetap/i);

  const limited = await handleApiRequest(request(validBody), {
    allowedOrigins: [allowedOrigin],
    ai: failingAi("rate-limited"),
  });
  assert.equal(limited.status, 429);
});
