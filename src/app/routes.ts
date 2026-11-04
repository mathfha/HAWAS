export const routes = [
  { id: "home", label: "Beranda", href: "#/" },
  { id: "simulation", label: "Latihan Simulasi", href: "#/simulasi" },
  { id: "check", label: "Cek Pesan", href: "#/cek" },
  { id: "qris", label: "Periksa QRIS", href: "#/qris" },
  { id: "sos", label: "Bantuan SOS", href: "#/sos" },
  { id: "learn", label: "Panduan Belajar", href: "#/belajar" },
] as const;

export type RouteId = (typeof routes)[number]["id"] | "not-found";

export function resolveRoute(hash: string): RouteId {
  const path = hash.replace(/^#/, "") || "/";
  const route = routes.find((candidate) => candidate.href === `#${path}`);
  return route?.id ?? "not-found";
}
