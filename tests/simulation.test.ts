import assert from "node:assert/strict";
import test from "node:test";
import {
  continueSimulation,
  createPracticeSimulationState,
  createSelectedSimulationState,
  createSimulationState,
  initialFictionalBalance,
  maximumFictionalBalance,
  recordChoice,
  restartSimulation,
  retryScenario,
  validateStartingBalance,
  type SimulationState,
} from "../src/features/simulation/model.ts";

function completeSimulation(
  choices: ReadonlyArray<"safe" | "risky">,
): SimulationState {
  let state = createSimulationState();

  for (const choice of choices) {
    state = recordChoice(state, choice);
    state = continueSimulation(state);
  }

  return state;
}

test("pilihan pertama aman menambah skor satu kali", () => {
  const initial = createSimulationState();
  const feedback = recordChoice(initial, "safe");

  assert.equal(feedback.score, 1);
  assert.equal(feedback.fictionalBalance, initialFictionalBalance);
  assert.equal(feedback.firstChoices.get(0), "safe");
  assert.equal(feedback.feedbackIsRetry, false);
});

test("pilihan berisiko mengurangi saldo hanya sekali, retry tidak mengubah hasil awal", () => {
  const initial = createSimulationState();
  const firstFeedback = recordChoice(initial, "risky");
  const retryState = retryScenario(firstFeedback);
  const retryFeedback = recordChoice(retryState, "safe");

  assert.equal(firstFeedback.score, 0);
  assert.equal(firstFeedback.fictionalBalance, initialFictionalBalance - 300_000);
  assert.equal(retryFeedback.score, firstFeedback.score);
  assert.equal(retryFeedback.fictionalBalance, firstFeedback.fictionalBalance);
  assert.equal(retryFeedback.firstChoices.get(0), "risky");
  assert.equal(retryFeedback.feedbackSafety, "safe");
  assert.equal(retryFeedback.feedbackIsRetry, true);
});

test("retry berisiko tidak mengurangi saldo setelah pilihan pertama aman", () => {
  const firstFeedback = recordChoice(createSimulationState(), "safe");
  const retryFeedback = recordChoice(retryScenario(firstFeedback), "risky");

  assert.equal(retryFeedback.score, 1);
  assert.equal(retryFeedback.fictionalBalance, initialFictionalBalance);
  assert.equal(retryFeedback.firstChoices.get(0), "safe");
  assert.equal(retryFeedback.feedbackSafety, "risky");
});

test("retry berulang mempertahankan pilihan, skor, dan saldo pertama", () => {
  const firstFeedback = recordChoice(createSimulationState(), "risky");
  const secondFeedback = recordChoice(retryScenario(firstFeedback), "safe");
  const thirdFeedback = recordChoice(retryScenario(secondFeedback), "risky");

  assert.equal(thirdFeedback.score, 0);
  assert.equal(
    thirdFeedback.fictionalBalance,
    initialFictionalBalance - 300_000,
  );
  assert.equal(thirdFeedback.firstChoices.size, 1);
  assert.equal(thirdFeedback.firstChoices.get(0), "risky");
  assert.equal(thirdFeedback.feedbackSafety, "risky");
  assert.equal(thirdFeedback.feedbackIsRetry, true);
});

test("seluruh skenario mengarah ke hasil dengan saldo fiktif tidak negatif", () => {
  let state = createSimulationState();
  state = recordChoice(state, "risky");
  state = continueSimulation(state);
  state = recordChoice(state, "risky");
  state = continueSimulation(state);
  state = recordChoice(state, "risky");
  state = continueSimulation(state);

  assert.equal(state.stage, "result");
  assert.equal(state.score, 0);
  assert.equal(state.fictionalBalance, 0);
});

test("sesi baru mengatur ulang skor, saldo, dan pilihan", () => {
  let state = recordChoice(createSimulationState(), "safe");
  state = continueSimulation(state);
  const fresh = createSimulationState();

  assert.equal(fresh.stage, "question");
  assert.equal(fresh.scenarioIndex, 0);
  assert.equal(fresh.score, 0);
  assert.equal(fresh.fictionalBalance, initialFictionalBalance);
  assert.equal(fresh.firstChoices.size, 0);
});

test("restart setelah hasil akhir mengembalikan simulasi lengkap ke awal", () => {
  const completed = completeSimulation(["safe", "risky", "safe"]);
  const restarted = restartSimulation(completed);

  assert.equal(completed.stage, "result");
  assert.deepEqual(restarted.scope, { kind: "full" });
  assert.equal(restarted.stage, "question");
  assert.equal(restarted.scenarioIndex, 0);
  assert.equal(restarted.score, 0);
  assert.equal(restarted.fictionalBalance, initialFictionalBalance);
  assert.equal(restarted.firstChoices.size, 0);
});

test("hasil aman, berisiko, dan campuran dihitung dari pilihan pertama", () => {
  const safe = completeSimulation(["safe", "safe", "safe"]);
  const risky = completeSimulation(["risky", "risky", "risky"]);
  const mixed = completeSimulation(["safe", "risky", "safe"]);

  assert.equal(safe.stage, "result");
  assert.equal(safe.score, 3);
  assert.equal(safe.fictionalBalance, initialFictionalBalance);

  assert.equal(risky.stage, "result");
  assert.equal(risky.score, 0);
  assert.equal(risky.fictionalBalance, 0);

  assert.equal(mixed.stage, "result");
  assert.equal(mixed.score, 2);
  assert.equal(mixed.fictionalBalance, initialFictionalBalance - 25_000);
});

test("latihan satu situasi hanya mencatat skenario yang dipilih", () => {
  let state = createPracticeSimulationState("merchant-name");
  state = recordChoice(state, "safe");
  state = continueSimulation(state);

  assert.deepEqual(state.scope, {
    kind: "practice",
    scenarioId: "merchant-name",
  });
  assert.equal(state.stage, "result");
  assert.equal(state.scenarioIndex, 1);
  assert.equal(state.score, 1);
  assert.equal(state.firstChoices.size, 1);
  assert.equal(state.firstChoices.get(1), "safe");
});

test("restart latihan satu situasi mempertahankan target dan mereset hasil", () => {
  let state = createPracticeSimulationState("otp-call");
  state = recordChoice(state, "risky");
  state = continueSimulation(state);

  const restarted = restartSimulation(state);

  assert.deepEqual(restarted.scope, {
    kind: "practice",
    scenarioId: "otp-call",
  });
  assert.equal(restarted.stage, "question");
  assert.equal(restarted.scenarioIndex, 2);
  assert.equal(restarted.score, 0);
  assert.equal(restarted.fictionalBalance, initialFictionalBalance);
  assert.equal(restarted.firstChoices.size, 0);
});

test("transisi hanya berlaku pada tahap yang sesuai", () => {
  const initial = createSimulationState();

  assert.throws(() => continueSimulation(initial));
  assert.throws(() => retryScenario(initial));
});

test("saldo awal latihan dapat diatur dan tidak pernah menjadi negatif", () => {
  const initial = createSimulationState(100_000);
  const feedback = recordChoice(initial, "risky");

  assert.equal(initial.startingFictionalBalance, 100_000);
  assert.equal(initial.fictionalBalance, 100_000);
  assert.equal(feedback.fictionalBalance, 0);
});

test("restart mempertahankan saldo awal yang dipilih pengguna", () => {
  let state = createSimulationState(8_000_000);
  state = recordChoice(state, "risky");
  state = continueSimulation(state);
  state = recordChoice(state, "safe");
  state = continueSimulation(state);
  state = recordChoice(state, "safe");
  state = continueSimulation(state);

  const restarted = restartSimulation(state);

  assert.equal(restarted.startingFictionalBalance, 8_000_000);
  assert.equal(restarted.fictionalBalance, 8_000_000);
  assert.equal(restarted.score, 0);
  assert.equal(restarted.firstChoices.size, 0);
});

test("validasi saldo awal menolak nilai kosong, pecahan, dan di luar batas", () => {
  assert.deepEqual(validateStartingBalance(""), {
    valid: false,
    message: "Masukkan saldo latihan fiktif sebelum memulai.",
  });
  assert.equal(validateStartingBalance("1000.5").valid, false);
  assert.equal(validateStartingBalance("-1").valid, false);
  assert.equal(
    validateStartingBalance(String(maximumFictionalBalance + 1)).valid,
    false,
  );
  assert.deepEqual(validateStartingBalance("7500000"), {
    valid: true,
    value: 7_500_000,
  });
});

test("pilihan beberapa skenario hanya menjalankan skenario terpilih", () => {
  let state = createSelectedSimulationState(
    ["courier-apk", "otp-call"],
    10_000_000,
  );

  assert.deepEqual(state.scope, {
    kind: "selection",
    scenarioIds: ["courier-apk", "otp-call"],
  });
  assert.equal(state.scenarioIndex, 0);

  state = recordChoice(state, "safe");
  state = continueSimulation(state);
  assert.equal(state.scenarioIndex, 2);
  assert.equal(state.stage, "question");

  state = recordChoice(state, "risky");
  state = continueSimulation(state);
  assert.equal(state.stage, "result");
  assert.equal(state.score, 1);
  assert.equal(state.firstChoices.size, 2);
  assert.equal(state.fictionalBalance, 5_000_000);
});

test("restart mempertahankan daftar skenario yang dipilih", () => {
  let state = createSelectedSimulationState(["merchant-name", "otp-call"]);
  state = recordChoice(state, "safe");
  state = continueSimulation(state);
  state = recordChoice(state, "safe");
  state = continueSimulation(state);

  const restarted = restartSimulation(state);

  assert.deepEqual(restarted.scope, {
    kind: "selection",
    scenarioIds: ["merchant-name", "otp-call"],
  });
  assert.equal(restarted.scenarioIndex, 1);
  assert.equal(restarted.score, 0);
  assert.equal(restarted.firstChoices.size, 0);
});

test("pilihan skenario kosong ditolak", () => {
  assert.throws(
    () => createSelectedSimulationState([]),
    /Pilih minimal satu skenario latihan/,
  );
});
