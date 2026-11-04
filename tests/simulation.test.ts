import assert from "node:assert/strict";
import test from "node:test";
import {
  continueSimulation,
  createSimulationState,
  initialFictionalBalance,
  recordChoice,
  retryScenario,
} from "../src/features/simulation/model.ts";

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

test("transisi hanya berlaku pada tahap yang sesuai", () => {
  const initial = createSimulationState();

  assert.throws(() => continueSimulation(initial));
  assert.throws(() => retryScenario(initial));
});
