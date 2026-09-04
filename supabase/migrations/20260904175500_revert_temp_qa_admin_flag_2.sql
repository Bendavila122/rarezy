-- Reverts the second temporary admin flag (20260904175000) now that
-- competition approval has been exercised end to end.
update public.profiles set is_admin = false where id = '1b7d607c-4848-4591-96cf-193e6ad872ea';
