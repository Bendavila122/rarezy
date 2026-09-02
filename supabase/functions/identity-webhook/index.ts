// Supabase Edge Function: Stripe webhook endpoint. Point a Stripe webhook
// at this function's URL, subscribed to `identity.verification_session.verified`
// and `identity.verification_session.requires_input`. On success, marks the
// profile verified and sends a confirmation email via Resend so the user
// knows they can log in.
// Requires: STRIPE_WEBHOOK_SECRET, RESEND_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

import { createClient } from "jsr:@supabase/supabase-js@2";
import Stripe from "npm:stripe@17";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2024-06-20" });

Deno.serve(async (req) => {
  const signature = req.headers.get("stripe-signature");
  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature!,
      Deno.env.get("STRIPE_WEBHOOK_SECRET")!,
    );
  } catch (err) {
    return new Response(`Webhook signature verification failed: ${err}`, { status: 400 });
  }

  if (event.type === "identity.verification_session.verified") {
    const session = event.data.object as Stripe.Identity.VerificationSession;
    const userId = session.metadata?.supabase_user_id;
    if (userId) {
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      );

      const { data: profile } = await supabase
        .from("profiles")
        .update({ id_verified: true })
        .eq("id", userId)
        .select("email, username")
        .single();

      if (profile?.email) {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "Rarezy <verify@rarezy.co.uk>",
            to: [profile.email],
            subject: "You're verified — welcome to Rarezy",
            html: `<p>Hi ${profile.username},</p><p>Your ID has been verified. You can now log in and start entering competitions.</p>`,
          }),
        });
      }
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { "Content-Type": "application/json" },
  });
});
