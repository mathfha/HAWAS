export const sosIncidentIds = [
  "transfer",
  "secret",
  "apk",
  "payment",
] as const;

export type SosIncidentId = (typeof sosIncidentIds)[number];

export function isSosIncidentId(value: string): value is SosIncidentId {
  return sosIncidentIds.includes(value as SosIncidentId);
}

export function toggleSosIncident(
  selected: readonly SosIncidentId[],
  incidentId: SosIncidentId,
): SosIncidentId[] {
  const next = new Set(selected);

  if (next.has(incidentId)) {
    next.delete(incidentId);
  } else {
    next.add(incidentId);
  }

  return sosIncidentIds.filter((id) => next.has(id));
}

export function shouldShowSosIncident(
  selected: readonly SosIncidentId[],
  incidentId: SosIncidentId,
): boolean {
  return selected.length === 0 || selected.includes(incidentId);
}
