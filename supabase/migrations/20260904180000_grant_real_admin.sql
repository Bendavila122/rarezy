-- Flags the real, dashboard-created admin account as admin. The earlier
-- grant_admin migration ran before this auth user existed (no-op); this
-- re-runs the same grant now that it does.
insert into public.profiles (id, username, email, id_verified, is_admin)
select id, 'admin', email, true, true
from auth.users
where email = 'wsl.ben2025@gmail.com'
on conflict (id) do update set is_admin = true, id_verified = true, username = 'admin';
