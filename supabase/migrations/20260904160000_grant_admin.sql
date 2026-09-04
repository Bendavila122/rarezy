-- Flags the pre-provisioned admin account as admin. Run once, after the
-- auth user for wsl.ben2025@gmail.com has been created directly in the
-- Supabase Dashboard (Authentication -> Users -> Add user) rather than
-- through the app's normal signup wizard. Direct SQL like this runs outside
-- any PostgREST/client request context, so the `protect_is_admin` trigger
-- (see the is_admin migration) allows it through — the same trigger blocks
-- every other path to setting this flag.
insert into public.profiles (id, username, email, id_verified, is_admin)
select id, 'admin', email, true, true
from auth.users
where email = 'wsl.ben2025@gmail.com'
on conflict (id) do update set is_admin = true, id_verified = true, username = 'admin';
