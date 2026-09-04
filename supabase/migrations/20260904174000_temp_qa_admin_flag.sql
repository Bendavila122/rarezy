-- Temporarily flags the throwaway QA test account (sellertest@rarezy-dev.com)
-- as admin, purely to exercise the seller/competition approval UI end to
-- end during development. Reverted by the following migration once that
-- testing was done.
update public.profiles set is_admin = true where id = '1b7d607c-4848-4591-96cf-193e6ad872ea';
