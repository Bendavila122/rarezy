-- Second temporary admin-flag round for QA (see 20260904174000) — testing
-- the competition-approval path this time. Reverted immediately after.
update public.profiles set is_admin = true where id = '1b7d607c-4848-4591-96cf-193e6ad872ea';
