import { scenarios, type ChoiceSafety } from "../../content/scenarios.ts";

export type SimulationStage = "question" | "feedback" | "result";

export interface SimulationState {
  scenarioIndex: number;
  stage: SimulationStage;
  score: number;
  fictionalBalance: number;
  firstChoices: Map<number, ChoiceSafety>;
  feedbackSafety: ChoiceSafety | null;
  feedbackIsRetry: boolean;
}

export const initialFictionalBalance = 5_325_000;

export function createSimulationState(): SimulationState {
  return {
    scenarioIndex: 0,
    stage: "question",
    score: 0,
    fictionalBalance: initialFictionalBalance,
    firstChoices: new Map(),
    feedbackSafety: null,
    feedbackIsRetry: false,
  };
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
      state.fictionalBalance +
      (isFirstChoice && safety === "risky" ? -scenario.balanceLoss : 0),
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

  const nextScenarioIndex = state.scenarioIndex + 1;
  return {
    ...state,
    scenarioIndex: nextScenarioIndex,
    stage: nextScenarioIndex === scenarios.length ? "result" : "question",
    feedbackSafety: null,
    feedbackIsRetry: false,
  };
}
