# Wiring up real accounts

The app works today in **demo mode** with no setup — signup/login just
updates local state, no real email or ID check happens. To make it real:

## 1. Create a Supabase project

1. supabase.com → New project.
2. Project Settings → API → copy the **Project URL** and **anon public** key.
3. Copy `.env.example` to `.env.local` in the repo root and paste those in
   as `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`. Restart `npm run dev`.

## 2. Apply the schema

Paste `supabase/schema.sql` into the Supabase SQL editor and run it. This
creates `profiles` (username/email/verification status) and
`email_verifications` (short-lived codes), with row-level security so only
usernames — never emails — are publicly readable.

## 3. Deploy the edge functions

```
supabase login
supabase link --project-ref <your-project-ref>
supabase functions deploy send-verification-code
supabase functions deploy verify-code
supabase functions deploy check-username
supabase functions deploy create-identity-session
supabase functions deploy identity-webhook --no-verify-jwt
```

Then set the secrets each function needs:

```
supabase secrets set RESEND_API_KEY=re_xxx
supabase secrets set STRIPE_SECRET_KEY=sk_test_xxx
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_xxx
```

(`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are injected automatically
into every edge function — no need to set those yourself.)

## 4. Resend

Verify a sending domain (or use their sandbox for testing) at resend.com,
then use that API key above. The `from` address in
`send-verification-code` and `identity-webhook` is `verify@rarezy.co.uk` —
change it to match your verified domain.

## 5. Stripe Identity

1. In the Stripe dashboard, enable **Identity** and configure the
   verification check to require a document + proof-of-address upload.
2. Developers → Webhooks → add an endpoint pointing at your deployed
   `identity-webhook` function's URL, subscribed to
   `identity.verification_session.verified`. Copy its signing secret into
   `STRIPE_WEBHOOK_SECRET` above.

Once all of this is in place, `AUTH_DEMO_MODE` in `src/lib/auth.ts` flips
to `false` automatically (it's just `!isSupabaseConfigured`) and the exact
same UI starts talking to the real backend — no screens change.
