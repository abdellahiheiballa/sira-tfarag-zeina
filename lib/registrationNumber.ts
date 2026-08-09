export function createRegistrationNumber(id: string) {
  const suffix = id.replace(/[^A-Za-z0-9]/g, "").slice(-5).toUpperCase().padStart(5, "0");
  return `TFZ-SIRA-2026-${suffix}`;
}
