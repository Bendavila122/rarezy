// Supabase Edge Function: checks a 6-digit code against the most recent
// unconsumed, unexpired row for that email, and marks it consumed.
// Requires: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

import { createClient } from "jsr:@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  try {
    const { email, code } = await req.json();
    if (!email || !code) {
      return new Response(JSON.stringify({ error: "email and code are required" }), {
        status: 400,
        headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: row, error } = await supabase
      .from("email_verifications")
      .select("id, code, expires_at, consumed_at")
      .eq("email", email.toLowerCase().trim())
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw error;

    const valid =
      row && !row.consumed_at && row.code === code && new Date(row.expires_at) > new Date();

    if (!valid) {
      return new Response(JSON.stringify({ ok: false, error: "Invalid or expired code" }), {
        status: 400,
        headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    await supabase
      .from("email_verifications")
      .update({ consumed_at: new Date().toISOString() })
      .eq("id", row.id);

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  }
});
