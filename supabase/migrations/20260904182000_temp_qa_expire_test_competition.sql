-- QA: force the earlier test competition's deadline into the past so the
-- winner-resolution / fulfilment / dispute UI can be exercised end to end.
update public.competitions set ends_at = now() - interval '1 minute'
where id = '15c26428-8b49-4cd7-8b96-b04c58cd7eca';
