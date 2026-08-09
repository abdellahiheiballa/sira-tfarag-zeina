import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export function createSupabaseAdmin(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;

  const secretKeyType = secretKey?.startsWith("sb_secret_") ? "service_role" : "unknown";
  console.error("Supabase admin env check", {
    hasUrl: Boolean(url),
    hasSecretKey: Boolean(secretKey),
    secretKeyType,
    hasAnonKey: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
  });

  if (!url || !secretKey) {
    throw new Error("Missing Supabase environment variables.");
  }

  return createClient(url, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch },
  });
}
