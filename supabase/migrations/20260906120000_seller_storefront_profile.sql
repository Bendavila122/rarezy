-- Gives every seller a real, customisable public storefront: a logo, a
-- cover photo, a description of their store, a location (geocoded once on
-- save so the public page can embed a map), and links to their socials.
-- All additive/nullable — no backfill needed for existing seller rows.
-- Self-editable: the existing "Owners can update their own seller row"
-- policy and protect_seller_admin_fields trigger already allow every one
-- of these columns through untouched (only status/compliance/admin fields
-- are locked to admin-only).
alter table public.sellers
  add column if not exists logo_url text,
  add column if not exists cover_photo_url text,
  add column if not exists about text,
  add column if not exists location_label text,
  add column if not exists location_lat double precision,
  add column if not exists location_lng double precision,
  add column if not exists instagram_url text,
  add column if not exists facebook_url text,
  add column if not exists twitter_url text,
  add column if not exists tiktok_url text;

-- One bucket for both logo and cover photo, keyed by the seller's own id
-- folder (`{sellerId}/logo.<ext>`, `{sellerId}/cover.<ext>`) — same pattern
-- as `product-images`. Public read (a shop's branding is meant to be seen);
-- write restricted to the owning, approved seller's own folder.
insert into storage.buckets (id, name, public)
values ('seller-branding', 'seller-branding', true)
on conflict (id) do nothing;

create policy "Seller branding is publicly readable"
  on storage.objects for select
  using (bucket_id = 'seller-branding');

create policy "Sellers can upload their own branding"
  on storage.objects for insert
  with check (
    bucket_id = 'seller-branding'
    and exists (
      select 1 from public.sellers s
      where s.owner_id = auth.uid()
        and s.status = 'approved'
        and (storage.foldername(name))[1] = s.id::text
    )
  );

create policy "Sellers can replace their own branding"
  on storage.objects for update
  using (
    bucket_id = 'seller-branding'
    and exists (
      select 1 from public.sellers s
      where s.owner_id = auth.uid()
        and (storage.foldername(name))[1] = s.id::text
    )
  );

create policy "Sellers can delete their own branding"
  on storage.objects for delete
  using (
    bucket_id = 'seller-branding'
    and exists (
      select 1 from public.sellers s
      where s.owner_id = auth.uid()
        and (storage.foldername(name))[1] = s.id::text
    )
  );
