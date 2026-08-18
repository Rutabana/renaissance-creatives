import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Configured from .env (see .env.example). If the keys aren't present the
// client is null and callers fall back gracefully (e.g. localStorage), so the
// app never crashes in an unconfigured environment.
const env = (import.meta as any).env ?? {};
const url = env.VITE_SUPABASE_URL as string | undefined;
const anonKey = env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const supabase: SupabaseClient | null =
  url && anonKey ? createClient(url, anonKey) : null;
