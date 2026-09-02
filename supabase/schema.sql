-- More4Me auth schema — run this once against your Supabase project
-- (SQL editor, or `supabase db push` if you keep it as a migration).

-- One row per account, keyed to the built-in auth.users row created by
-- supabase.auth.signUp(). Username is the only thing shown publicly
-- (leaderboards, winners wall) — never the email.
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null unique,
  email text not null,
  id_verified boolean not null default false,
  stripe_verification_session_id text,
  created_at timestamptz not null default now()
);

-- Case-insensitive username uniqueness (so "SteelAndGold" blocks "steelandgold").
create unique index if not exists profiles_username_lower_idx on public.profiles (lower(username));

alter table public.profiles enable row level security;

-- Anyone (including anon, pre-login) can check whether a username is taken —
-- needed for the live-availability check in the signup wizard. Only exposes
-- the username column, never email.
create policy "Usernames are publicly readable" on public.profiles
  for select using (true);

create policy "Users can update their own profile" on public.profiles
  for update using (auth.uid() = id);

create policy "Users can insert their own profile" on public.profiles
  for insert with check (auth.uid() = id);

-- Six-digit email verification codes, issued during signup step 2 and
-- consumed by the verify-code edge function. Short-lived by design.
create table if not exists public.email_verifications (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  code text not null,
  expires_at timestamptz not null,
  consumed_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.email_verifications enable row level security;
-- No public policies: only the service-role key (used inside edge functions)
-- may read or write this table.

create index if not exists email_verifications_email_idx on public.email_verifications (email);
