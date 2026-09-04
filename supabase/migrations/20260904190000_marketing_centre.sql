-- The AI Marketing Centre. One campaign groups a set of generated assets
-- for a competition; assets are one row per channel-piece so the seller's
-- asset library (preview/regenerate/duplicate/delete per item) has
-- something concrete to operate on. `content` is a per-channel JSON shape
-- (see the generate-marketing-text edge function for exactly what each
-- channel produces) rather than a rigid column set, since every channel's
-- fields are genuinely different (a WhatsApp message vs a 5-frame Story vs
-- a TikTok script). Image generation is async (AtlasCloud takes ~a minute),
-- so an asset can sit in `status = 'generating'` with a provider job id
-- until a follow-up call resolves it.

create table public.marketing_campaigns (
  id uuid primary key default gen_random_uuid(),
  competition_id uuid not null references public.competitions (id) on delete cascade,
  seller_id uuid not null references public.sellers (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.marketing_campaigns enable row level security;

create policy "Sellers can manage their own campaigns" on public.marketing_campaigns
  for all using (exists (select 1 from public.sellers s where s.id = seller_id and s.owner_id = auth.uid()));
create policy "Admins can read all campaigns" on public.marketing_campaigns
  for select using (public.is_admin_actor());

create table public.marketing_assets (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.marketing_campaigns (id) on delete cascade,
  seller_id uuid not null references public.sellers (id) on delete cascade,
  channel text not null check (
    channel in ('instagram_feed', 'instagram_story', 'tiktok', 'meta_ad', 'google_ad', 'email', 'whatsapp')
  ),
  angle text,
  variant text,
  content jsonb,
  image_url text,
  status text not null default 'ready' check (status in ('generating', 'ready', 'failed')),
  provider_job_id text,
  created_at timestamptz not null default now()
);

alter table public.marketing_assets enable row level security;

create policy "Sellers can manage their own assets" on public.marketing_assets
  for all using (exists (select 1 from public.sellers s where s.id = seller_id and s.owner_id = auth.uid()));
create policy "Admins can read all assets" on public.marketing_assets
  for select using (public.is_admin_actor());

create index marketing_assets_campaign_idx on public.marketing_assets (campaign_id);
