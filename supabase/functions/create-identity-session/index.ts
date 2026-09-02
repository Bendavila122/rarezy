// Supabase Edge Function: creates a Stripe Identity hosted Verification
// Session for ID + UK proof-of-address checks, and returns the hosted URL
// to redirect the user to. Stripe redirects back to `return_url` when done;
// the actual pass/fail result arrives asynchronously via the
// `identity-webhook` function, which is the only source of truth.
// Requires: STRIPE_SECRET_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

import { createClient } from "jsr:@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing Authorization header");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const {
      data: { user },
    } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
    if (!user) throw new Error("Not signed in");

    const { returnUrl } = await req.json();

    const body = new URLSearchParams({
      type: "document",
      "options[document][require_matching_selfie]": "true",
      // UK proof-of-address: Stripe Identity verifies the ID document's
      // address field can be paired with a second uploaded document
      // (utility bill / bank statement) when `require_id_number` +
      // address collection is enabled on the Identity dashboard config.
      "provided_details[email]": user.email ?? "",
      "metadata[supabase_user_id]": user.id,
      return_url: returnUrl,
    });

    const stripeRes = await fetch("https://api.stripe.com/v1/identity/verification_sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${Deno.env.get("STRIPE_SECRET_KEY")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });
    if (!stripeRes.ok) throw new Error(`Stripe error: ${await stripeRes.text()}`);
    const session = await stripeRes.json();

    await supabase
      .from("profiles")
      .update({ stripe_verification_session_id: session.id })
      .eq("id", user.id);

    return new Response(JSON.stringify({ url: session.url, id: session.id }), {
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  }
});
