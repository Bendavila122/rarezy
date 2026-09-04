-- Adds a server-enforced admin flag to profiles. This is deliberately NOT
-- settable by a client: a trigger strips any attempt to set or change
-- `is_admin` unless the request is running with no PostgREST JWT context at
-- all (a direct DB session — migrations, the SQL editor) or with the
-- service_role JWT (an edge function using its own service-role key). A
-- normal signed-in user going through the anon/authenticated client SDK can
-- never grant themselves admin, however they call the API.

alter table public.profiles
  add column if not exists is_admin boolean not null default false;

create or replace function public.protect_is_admin()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    if new.is_admin and coalesce(auth.role(), 'service_role') <> 'service_role' then
      new.is_admin := false;
    end if;
  elsif tg_op = 'UPDATE' then
    if new.is_admin is distinct from old.is_admin
       and coalesce(auth.role(), 'service_role') <> 'service_role' then
      new.is_admin := old.is_admin;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists protect_is_admin_trigger on public.profiles;
create trigger protect_is_admin_trigger
  before insert or update on public.profiles
  for each row execute function public.protect_is_admin();
