-- One seller account per user — `fetchMySeller()` assumes a single row.
alter table public.sellers add constraint sellers_owner_id_key unique (owner_id);
