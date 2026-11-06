import {
  scenarios,
  type ChoiceSafety,
  type ScenarioId,
} from "../../content/scenarios.ts";

export type SimulationStage = "question" | "feedback" | "result";
export type SimulationScope =
  | { kind: "full" }
  | { kind: "practice"; scenarioId: ScenarioId }
  | { kind: "selection"; scenarioIds: ReadonlyArray<ScenarioId> };

export interface SimulationState {
  scope: SimulationScope;
  scenarioIndex: number;
  stage: SimulationStage;
  score: number;
  startingFictionalBalance: number;
  fictionalBalance: number;
  firstChoices: Map<number, ChoiceSafety>;
  feedbackSafety: ChoiceSafety | null;
  feedbackIsRetry: boolean;
}

export const initialFictionalBalance = 5_325_000;
export const maximumFictionalBalance = 100_000_000;

export type StartingBalanceValidation =
  | { valid: true; value: number }
  | { valid: false; message: string };

export function isScenarioId(value: string): value is ScenarioId {
  return scenarios.some((scenario) => scenario.id === value);
}

export function validateStartingBalance(
  rawValue: string,
): StartingBalanceValidation {
  const value = rawValue.trim();

  if (value === "") {
    return {
      valid: false,
      message: "Masukkan saldo latihan fiktif sebelum memulai.",
    };
  }

  const amount = Number(value);
  if (!Number.isSafeInteger(amount)) {
    return {
      valid: false,
      message: "Gunakan angka rupiah bulat tanpa titik, koma, atau huruf.",
    };
  }

  if (amount < 0 || amount > maximumFictionalBalance) {
    return {
      valid: false,
      message: "Masukkan saldo latihan dari Rp0 sampai Rp100.000.000.",
    };
  }

  return { valid: true, value: amount };
}

function createInitialState(
  scope: SimulationScope,
  scenarioIndex: number,
  startingBalance: number,
): SimulationState {
  const validation = validateStartingBalance(String(startingBalance));
  if (!validation.valid) {
    throw new Error(validation.message);
  }

  return {
    scope,
    scenarioIndex,
    stage: "question",
    score: 0,
    startingFictionalBalance: validation.value,
    fictionalBalance: validation.value,
    firstChoices: new Map(),
    feedbackSafety: null,
    feedbackIsRetry: false,
  };
}

export function createSimulationState(
  startingBalance = initialFictionalBalance,
): SimulationState {
  return createInitialState({ kind: "full" }, 0, startingBalance);
}

export function createPracticeSimulationState(
  scenarioId: ScenarioId,
  startingBalance = initialFictionalBalance,
): SimulationState {
  const scenarioIndex = scenarios.findIndex(
    (scenario) => scenario.id === scenarioId,
  );

  if (scenarioIndex < 0) {
    throw new Error("Skenario latihan tidak ditemukan.");
  }

  return createInitialState(
    { kind: "practice", scenarioId },
    scenarioIndex,
    startingBalance,
  );
}

export function createSelectedSimulationState(
  scenarioIds: ReadonlyArray<ScenarioId>,
  startingBalance = initialFictionalBalance,
): SimulationState {
  const selectedIds = scenarios
    .map((scenario) => scenario.id)
    .filter((scenarioId) => scenarioIds.includes(scenarioId));

  if (selectedIds.length === 0) {
    throw new Error("Pilih minimal satu skenario latihan.");
  }

  const firstScenarioIndex = scenarios.findIndex(
    (scenario) => scenario.id === selectedIds[0],
  );

  return createInitialState(
    { kind: "selection", scenarioIds: selectedIds },
    firstScenarioIndex,
    startingBalance,
  );
}

export function getSimulationScenarioIndexes(
  scope: SimulationScope,
): ReadonlyArray<number> {
  if (scope.kind === "full") {
    return scenarios.map((_, index) => index);
  }

  const scenarioIds =
    scope.kind === "practice" ? [scope.scenarioId] : scope.scenarioIds;
  return scenarioIds.map((scenarioId) => {
    const scenarioIndex = scenarios.findIndex(
      (scenario) => scenario.id === scenarioId,
    );
    if (scenarioIndex < 0) {
      throw new Error("Skenario simulasi tidak ditemukan.");
    }
    return scenarioIndex;
  });
}

export function recordChoice(
  state: SimulationState,
  safety: ChoiceSafety,
): SimulationState {
  if (state.stage !== "question" || !scenarios[state.scenarioIndex]) {
    throw new Error("Pilihan hanya dapat dicatat pada skenario yang sedang aktif.");
  }

  const isFirstChoice = !state.firstChoices.has(state.scenarioIndex);
  const firstChoices = new Map(state.firstChoices);

  if (isFirstChoice) {
    firstChoices.set(state.scenarioIndex, safety);
  }

  const scenario = scenarios[state.scenarioIndex];

  return {
    ...state,
    stage: "feedback",
    score:
      state.score + (isFirstChoice && safety === "safe" ? 1 : 0),
    fictionalBalance:
      isFirstChoice && safety === "risky"
        ? Math.max(0, state.fictionalBalance - scenario.balanceLoss)
        : state.fictionalBalance,
    firstChoices,
    feedbackSafety: safety,
    feedbackIsRetry: !isFirstChoice,
  };
}

export function retryScenario(state: SimulationState): SimulationState {
  if (state.stage !== "feedback") {
    throw new Error("Skenario hanya dapat dicoba lagi setelah melihat umpan balik.");
  }

  return {
    ...state,
    stage: "question",
    feedbackSafety: null,
    feedbackIsRetry: false,
  };
}

export function continueSimulation(state: SimulationState): SimulationState {
  if (state.stage !== "feedback") {
    throw new Error("Simulasi hanya dapat dilanjutkan setelah memilih tindakan.");
  }

  const scenarioIndexes = getSimulationScenarioIndexes(state.scope);
  const currentPosition = scenarioIndexes.indexOf(state.scenarioIndex);
  const nextScenarioIndex = scenarioIndexes[currentPosition + 1];
  return {
    ...state,
    scenarioIndex: nextScenarioIndex ?? state.scenarioIndex,
    stage: nextScenarioIndex === undefined ? "result" : "question",
    feedbackSafety: null,
    feedbackIsRetry: false,
  };
}

export function restartSimulation(state: SimulationState): SimulationState {
  if (state.scope.kind === "practice") {
    return createPracticeSimulationState(
        state.scope.scenarioId,
        state.startingFictionalBalance,
      );
  }

  if (state.scope.kind === "selection") {
    return createSelectedSimulationState(
      state.scope.scenarioIds,
      state.startingFictionalBalance,
    );
  }

  return createSimulationState(state.startingFictionalBalance);
}
