export const routes = [
  { id: "home", label: "Beranda", href: "#/" },
  { id: "simulation", label: "Simulasi", href: "#/simulasi" },
  { id: "check", label: "Cek", href: "#/cek" },
  { id: "qris", label: "QRIS", href: "#/qris" },
  { id: "learn", label: "Belajar", href: "#/belajar" },
  { id: "sos", label: "SOS", href: "#/sos" },
] as const;

export type RouteId = (typeof routes)[number]["id"] | "not-found";

export function resolveRoute(hash: string): RouteId {
  const path = hash.replace(/^#/, "") || "/";
  const route = routes.find((candidate) => candidate.href === `#${path}`);
  return route?.id ?? "not-found";
}
