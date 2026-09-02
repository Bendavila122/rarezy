// Supabase Edge Function: generates a 6-digit code, stores it against the
// email with a 10-minute expiry, and sends it via Resend. Deploy with:
//   supabase functions deploy send-verification-code
// Requires these secrets (supabase secrets set NAME=value):
//   RESEND_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

import { createClient } from "jsr:@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  try {
    const { email } = await req.json();
    if (!email || typeof email !== "string") {
      return new Response(JSON.stringify({ error: "email is required" }), {
        status: 400,
        headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { error: dbError } = await supabase
      .from("email_verifications")
      .insert({ email: email.toLowerCase().trim(), code, expires_at: expiresAt });
    if (dbError) throw dbError;

    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        // TODO: switch back to "Rarezy <verify@rarezy.app>" once that domain is verified
        // at resend.com/domains — Resend's shared test domain only delivers to the
        // email address on your own Resend account.
        from: "Rarezy <onboarding@resend.dev>",
        to: [email],
        subject: `${code} is your Rarezy verification code`,
        html: `<p>Your Rarezy verification code is:</p><h2 style="letter-spacing:0.3em">${code}</h2><p>This code expires in 10 minutes.</p>`,
      }),
    });
    if (!resendRes.ok) throw new Error(`Resend error: ${await resendRes.text()}`);

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
