-- Storage for AI-generated marketing creative (separate bucket from
-- product-images since these are generated-on-demand campaign assets, not
-- part of the product listing itself). Public read (a seller needs to be
-- able to download/share them); writes only ever come from the
-- generate-marketing-image edge function's service-role client, not
-- directly from a seller's browser, so no insert policy is needed here.
insert into storage.buckets (id, name, public)
values ('marketing-assets', 'marketing-assets', true)
on conflict (id) do nothing;

create policy "Marketing assets are publicly readable"
  on storage.objects for select
  using (bucket_id = 'marketing-assets');
