import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/**
 * True once real Supabase project keys are set in `.env.local`. Until then,
 * the login/signup flow runs in a local demo mode so the UI stays fully
 * clickable — see `AUTH_DEMO_MODE` usages in Login.tsx / Signup.tsx.
 */
export const isSupabaseConfigured = Boolean(url && anonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url!, anonKey!)
  : null;

/** Name of the Supabase Edge Functions this app expects to be deployed. */
export const EDGE_FUNCTIONS = {
  sendVerificationCode: "send-verification-code",
  verifyCode: "verify-code",
  checkUsername: "check-username",
  createIdentitySession: "create-identity-session",
} as const;
