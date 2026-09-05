-- Extends `profiles` with everything a real account settings page needs to
-- edit: an avatar, phone number, date of birth and a postal address. All
-- nullable/additive — no existing row needs backfilling. Email/username/
-- password are already covered (auth.users + the existing `profiles.email`/
-- `username` columns); this migration only adds what was still missing.
alter table public.profiles
  add column if not exists avatar_url text,
  add column if not exists phone text,
  add column if not exists date_of_birth date,
  add column if not exists address_line1 text,
  add column if not exists address_line2 text,
  add column if not exists city text,
  add column if not exists postcode text,
  add column if not exists country text default 'GB';

-- `profiles.email` is a read-only cache of auth.users.email (used for the
-- username-based login lookup, since RLS can't expose real auth.users rows
-- to the client). Supabase's email-change flow updates auth.users.email
-- only once the user confirms via the link sent to their new address — this
-- trigger keeps the cached copy in sync automatically at that point, rather
-- than the client trying to guess when confirmation happened.
create or replace function public.sync_profile_email()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.email is distinct from old.email then
    update public.profiles set email = new.email where id = new.id;
  end if;
  return new;
end;
$$;

drop trigger if exists sync_profile_email_trigger on auth.users;
create trigger sync_profile_email_trigger
after update of email on auth.users
for each row execute function public.sync_profile_email();

-- Profile picture storage — public read (avatars are shown to other
-- players, e.g. on leaderboards later), write restricted to a folder
-- prefixed by the owner's own user id so nobody can overwrite another
-- account's picture.
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "Avatars are publicly readable"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "Users can upload their own avatar"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can replace their own avatar"
  on storage.objects for update
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can delete their own avatar"
  on storage.objects for delete
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
