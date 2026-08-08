import type { SupabaseClient } from "@supabase/supabase-js";

export function createRegistrationNumber(counter: number) {
  return `TFZ-SIRA-2026-${counter.toString().padStart(5, "0")}`;
}

export async function reserveRegistrationCounter(supabase: SupabaseClient) {
  const result = await supabase
    .from("registration_number_sequences")
    .insert({})
    .select("id")
    .single();

  if (result.error || !result.data?.id) {
    throw new Error("Unable to reserve registration counter.");
  }

  const counter = Number(result.data.id);
  if (!Number.isFinite(counter)) {
    throw new Error("Invalid registration counter.");
  }

  return counter;
}
