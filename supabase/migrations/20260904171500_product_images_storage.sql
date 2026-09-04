-- Real file storage for seller-uploaded product images — the existing Sell
-- flow only ever created local blob: URLs (never persisted), which is fine
-- for a single-browser demo but can't work once other customers/admin need
-- to see a seller's images. Public read (product photos are meant to be
-- seen); upload restricted to the seller's own folder, keyed by seller_id
-- so one seller can never write into another's path.
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

create policy "Product images are publicly readable"
  on storage.objects for select
  using (bucket_id = 'product-images');

create policy "Sellers can upload into their own folder"
  on storage.objects for insert
  with check (
    bucket_id = 'product-images'
    and exists (
      select 1 from public.sellers s
      where s.owner_id = auth.uid()
        and s.status = 'approved'
        and (storage.foldername(name))[1] = s.id::text
    )
  );

create policy "Sellers can delete their own uploads"
  on storage.objects for delete
  using (
    bucket_id = 'product-images'
    and exists (
      select 1 from public.sellers s
      where s.owner_id = auth.uid()
        and (storage.foldername(name))[1] = s.id::text
    )
  );
