export function createRegistrationNumber(counter: number) {
  return `TFZ-SIRA-2026-${counter.toString().padStart(5, "0")}`;
}
