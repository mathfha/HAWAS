import type { ScenarioId } from "../content/scenarios.ts";

export const routes = [
  { id: "home", label: "Beranda", href: "#/" },
  { id: "simulation", label: "Simulasi", href: "#/simulasi" },
  { id: "check", label: "Cek", href: "#/cek" },
  { id: "qris", label: "QRIS", href: "#/qris" },
  { id: "learn", label: "Belajar", href: "#/belajar" },
  { id: "sos", label: "SOS", href: "#/sos" },
] as const;

export const practiceRoutes = [
  {
    scenarioId: "courier-apk",
    href: "#/simulasi/kurir-apk",
  },
  {
    scenarioId: "merchant-name",
    href: "#/simulasi/nama-penerima",
  },
  {
    scenarioId: "otp-call",
    href: "#/simulasi/otp",
  },
] as const satisfies ReadonlyArray<{
  scenarioId: ScenarioId;
  href: `#/simulasi/${string}`;
}>;

export type RouteId = (typeof routes)[number]["id"] | "not-found";

function normalizeHash(hash: string): string {
  const path = hash.replace(/^#/, "") || "/";
  return `#${path}`;
}

export function resolveRoute(hash: string): RouteId {
  const normalizedHash = normalizeHash(hash);
  const route = routes.find((candidate) => candidate.href === normalizedHash);

  if (
    route?.id === "simulation" ||
    practiceRoutes.some((candidate) => candidate.href === normalizedHash)
  ) {
    return "simulation";
  }

  return route?.id ?? "not-found";
}

export function resolvePracticeScenario(hash: string): ScenarioId | null {
  const normalizedHash = normalizeHash(hash);
  return (
    practiceRoutes.find((candidate) => candidate.href === normalizedHash)
      ?.scenarioId ?? null
  );
}

export function getPracticeHref(scenarioId: ScenarioId): string {
  const route = practiceRoutes.find(
    (candidate) => candidate.scenarioId === scenarioId,
  );

  if (!route) {
    throw new Error("Route latihan untuk skenario tidak ditemukan.");
  }

  return route.href;
}
