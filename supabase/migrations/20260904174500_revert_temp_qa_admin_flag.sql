-- Reverts the temporary admin flag from the QA test account (see the
-- previous migration) now that the seller/competition approval UI has
-- been exercised end to end.
update public.profiles set is_admin = false where id = '1b7d607c-4848-4591-96cf-193e6ad872ea';
