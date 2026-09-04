-- Core multi-seller marketplace schema. Money is stored in integer pence
-- throughout (standard practice, avoids float rounding). Payments are
-- simulated for now (orders are marked 'paid' synchronously inside
-- purchase_entries rather than via a real Stripe payment-intent + webhook)
-- — the schema and RPC boundary are shaped so swapping in real Stripe later
-- only touches `orders.status`/`stripe_payment_intent_id` and where
-- `purchase_entries` marks an order paid, not the entries/competitions side.

-- Shared helper: is the calling user an admin? Used by every RLS policy and
-- protection trigger below instead of re-deriving it each time.
create or replace function public.is_admin_actor()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false);
$$;

-- ---------------------------------------------------------------------
-- Sellers
-- ---------------------------------------------------------------------
create table public.sellers (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  business_name text not null,
  trading_name text,
  company_number text,
  country text not null default 'GB',
  website text,
  contact_email text not null,
  contact_phone text,
  category text not null default 'watches' check (category in ('watches', 'jewellery', 'other')),
  years_trading integer,
  status text not null default 'submitted'
    check (status in ('submitted', 'under_review', 'approved', 'rejected', 'suspended', 'banned')),
  compliance_notes text,
  admin_notes text,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users (id)
);

alter table public.sellers enable row level security;

create policy "Owners can read their own seller row" on public.sellers
  for select using (auth.uid() = owner_id);
create policy "Admins can read all sellers" on public.sellers
  for select using (public.is_admin_actor());
create policy "Approved sellers are publicly readable" on public.sellers
  for select using (status = 'approved');
create policy "A user can apply once as a seller" on public.sellers
  for insert with check (auth.uid() = owner_id);
create policy "Owners can update their own seller row" on public.sellers
  for update using (auth.uid() = owner_id);
create policy "Admins can update any seller row" on public.sellers
  for update using (public.is_admin_actor());

create or replace function public.protect_seller_admin_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.is_admin_actor() or coalesce(auth.role(), 'service_role') = 'service_role' then
    return new;
  end if;
  if tg_op = 'INSERT' then
    new.status := 'submitted';
    new.compliance_notes := null;
    new.admin_notes := null;
    new.reviewed_at := null;
    new.reviewed_by := null;
  elsif tg_op = 'UPDATE' then
    new.status := old.status;
    new.compliance_notes := old.compliance_notes;
    new.admin_notes := old.admin_notes;
    new.reviewed_at := old.reviewed_at;
    new.reviewed_by := old.reviewed_by;
  end if;
  return new;
end;
$$;

create trigger protect_seller_admin_fields_trigger
  before insert or update on public.sellers
  for each row execute function public.protect_seller_admin_fields();

-- ---------------------------------------------------------------------
-- Products (the thing a competition is won)
-- ---------------------------------------------------------------------
create table public.products (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.sellers (id) on delete cascade,
  category text not null check (category in ('watch', 'jewellery', 'handbag', 'clothing', 'electronics', 'other')),
  brand text not null,
  model text not null,
  reference text,
  year integer,
  condition text not null check (condition in ('new', 'excellent', 'good', 'fair')),
  retail_value_pence integer not null check (retail_value_pence > 0),
  description text not null,
  specifications jsonb not null default '{}'::jsonb,
  box boolean not null default false,
  papers boolean not null default false,
  accessories text,
  status text not null default 'draft' check (status in ('draft', 'pending_approval', 'approved', 'rejected')),
  admin_notes text,
  created_at timestamptz not null default now()
);

alter table public.products enable row level security;

create policy "Sellers can read their own products" on public.products
  for select using (exists (select 1 from public.sellers s where s.id = seller_id and s.owner_id = auth.uid()));
create policy "Admins can read all products" on public.products
  for select using (public.is_admin_actor());
create policy "Approved products are publicly readable" on public.products
  for select using (status = 'approved');
create policy "Sellers can insert their own products" on public.products
  for insert with check (exists (select 1 from public.sellers s where s.id = seller_id and s.owner_id = auth.uid() and s.status = 'approved'));
create policy "Sellers can update their own products" on public.products
  for update using (exists (select 1 from public.sellers s where s.id = seller_id and s.owner_id = auth.uid()));
create policy "Admins can update any product" on public.products
  for update using (public.is_admin_actor());

create or replace function public.protect_product_admin_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.is_admin_actor() or coalesce(auth.role(), 'service_role') = 'service_role' then
    return new;
  end if;
  if tg_op = 'UPDATE' then
    if new.status is distinct from old.status and new.status not in ('draft', 'pending_approval') then
      new.status := old.status;
    end if;
    new.admin_notes := old.admin_notes;
  end if;
  return new;
end;
$$;

create trigger protect_product_admin_fields_trigger
  before insert or update on public.products
  for each row execute function public.protect_product_admin_fields();

create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  url text not null,
  image_type text,
  sort_order integer not null default 0
);

alter table public.product_images enable row level security;

create policy "Product image visibility follows the product" on public.product_images
  for select using (
    exists (
      select 1 from public.products p
      where p.id = product_id
        and (
          p.status = 'approved'
          or public.is_admin_actor()
          or exists (select 1 from public.sellers s where s.id = p.seller_id and s.owner_id = auth.uid())
        )
    )
  );
create policy "Sellers can manage their own product images" on public.product_images
  for all using (
    exists (
      select 1 from public.products p
      join public.sellers s on s.id = p.seller_id
      where p.id = product_id and s.owner_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------
-- Platform settings — configurable rather than hard-coded (fee, minimums)
-- ---------------------------------------------------------------------
create table public.platform_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.platform_settings enable row level security;

create policy "Settings are publicly readable" on public.platform_settings
  for select using (true);
create policy "Only admins can change settings" on public.platform_settings
  for update using (public.is_admin_actor());
create policy "Only admins can insert settings" on public.platform_settings
  for insert with check (public.is_admin_actor());

insert into public.platform_settings (key, value) values
  ('fee', '{"percent": 30, "fixed_pence": 20}'),
  ('min_retail_value_pence', '{"amount": 200000}'),
  ('min_ticket_price_pence', '{"amount": 50}');

-- ---------------------------------------------------------------------
-- Orders (a purchase of entries — simulated payment for now)
-- ---------------------------------------------------------------------
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  subtotal_pence integer not null,
  platform_fee_pence integer not null,
  total_pence integer not null,
  status text not null default 'pending' check (status in ('pending', 'paid', 'failed', 'refunded', 'partially_refunded')),
  stripe_payment_intent_id text,
  created_at timestamptz not null default now()
);

alter table public.orders enable row level security;

create policy "Users can read their own orders" on public.orders
  for select using (auth.uid() = user_id);
create policy "Admins can read all orders" on public.orders
  for select using (public.is_admin_actor());

-- No direct insert/update policy for anyone — orders are only ever created
-- or mutated from inside `purchase_entries` (security definer), never
-- directly by a client.

-- ---------------------------------------------------------------------
-- Competitions
-- ---------------------------------------------------------------------
create table public.competitions (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.sellers (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  ticket_price_pence integer not null check (ticket_price_pence > 0),
  max_entries integer not null check (max_entries > 0),
  entries_sold integer not null default 0,
  ends_at timestamptz not null,
  status text not null default 'draft' check (
    status in (
      'draft', 'pending_approval', 'live', 'completed', 'winner_pending',
      'fulfilment_pending', 'fulfilled', 'payout_pending', 'paid',
      'cancelled', 'refunded', 'rejected'
    )
  ),
  admin_notes text,
  winner_user_id uuid references auth.users (id),
  winner_score integer,
  created_at timestamptz not null default now()
);

alter table public.competitions enable row level security;

create policy "Sellers can read their own competitions" on public.competitions
  for select using (exists (select 1 from public.sellers s where s.id = seller_id and s.owner_id = auth.uid()));
create policy "Admins can read all competitions" on public.competitions
  for select using (public.is_admin_actor());
create policy "Live and resolved competitions are publicly readable" on public.competitions
  for select using (
    status in ('live', 'completed', 'winner_pending', 'fulfilment_pending', 'fulfilled', 'payout_pending', 'paid')
  );
create policy "Sellers can insert their own competitions" on public.competitions
  for insert with check (exists (select 1 from public.sellers s where s.id = seller_id and s.owner_id = auth.uid() and s.status = 'approved'));
create policy "Sellers can update their own competitions" on public.competitions
  for update using (exists (select 1 from public.sellers s where s.id = seller_id and s.owner_id = auth.uid()));
create policy "Admins can update any competition" on public.competitions
  for update using (public.is_admin_actor());

create or replace function public.protect_competition_admin_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.is_admin_actor()
     or coalesce(auth.role(), 'service_role') = 'service_role'
     or coalesce(current_setting('app.trusted_rpc', true), '') = 'true' then
    return new;
  end if;
  if tg_op = 'UPDATE' then
    if new.status is distinct from old.status and new.status not in ('draft', 'pending_approval') then
      new.status := old.status;
    end if;
    new.admin_notes := old.admin_notes;
    new.winner_user_id := old.winner_user_id;
    new.winner_score := old.winner_score;
    new.entries_sold := old.entries_sold;
  end if;
  return new;
end;
$$;

create trigger protect_competition_admin_fields_trigger
  before insert or update on public.competitions
  for each row execute function public.protect_competition_admin_fields();

-- ---------------------------------------------------------------------
-- Entries — always created via purchase_entries(), never directly
-- ---------------------------------------------------------------------
create table public.entries (
  id uuid primary key default gen_random_uuid(),
  competition_id uuid not null references public.competitions (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  quantity integer not null check (quantity > 0),
  order_id uuid references public.orders (id),
  created_at timestamptz not null default now()
);

alter table public.entries enable row level security;

create policy "Users can read their own entries" on public.entries
  for select using (auth.uid() = user_id);
create policy "Sellers can read entries on their own competitions" on public.entries
  for select using (
    exists (
      select 1 from public.competitions c
      join public.sellers s on s.id = c.seller_id
      where c.id = competition_id and s.owner_id = auth.uid()
    )
  );
create policy "Admins can read all entries" on public.entries
  for select using (public.is_admin_actor());

-- ---------------------------------------------------------------------
-- Scores — the skill-game mechanic, one row per attempt
-- ---------------------------------------------------------------------
create table public.scores (
  id uuid primary key default gen_random_uuid(),
  competition_id uuid not null references public.competitions (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  score integer not null check (score >= 0),
  created_at timestamptz not null default now()
);

alter table public.scores enable row level security;

create policy "Scores are publicly readable" on public.scores
  for select using (true);

-- Public, name-safe leaderboard view — never exposes raw user_id to clients.
create view public.competition_leaderboard
  with (security_invoker = true) as
  select s.competition_id, p.username, max(s.score) as best_score
  from public.scores s
  join public.profiles p on p.id = s.user_id
  group by s.competition_id, p.username;

-- ---------------------------------------------------------------------
-- Seller ledger — running record of what a seller is owed
-- ---------------------------------------------------------------------
create table public.seller_ledger_entries (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.sellers (id) on delete cascade,
  competition_id uuid references public.competitions (id),
  type text not null check (type in ('sale', 'refund', 'adjustment', 'payout')),
  amount_pence integer not null,
  status text not null default 'pending' check (status in ('pending', 'available', 'paid')),
  created_at timestamptz not null default now()
);

alter table public.seller_ledger_entries enable row level security;

create policy "Sellers can read their own ledger" on public.seller_ledger_entries
  for select using (exists (select 1 from public.sellers s where s.id = seller_id and s.owner_id = auth.uid()));
create policy "Admins can read all ledgers" on public.seller_ledger_entries
  for select using (public.is_admin_actor());

-- ---------------------------------------------------------------------
-- Fulfilment
-- ---------------------------------------------------------------------
create table public.fulfilments (
  id uuid primary key default gen_random_uuid(),
  competition_id uuid not null references public.competitions (id) on delete cascade unique,
  status text not null default 'pending' check (status in ('pending', 'preparing', 'dispatched', 'delivered', 'confirmed')),
  carrier text,
  tracking_number text,
  dispatched_at timestamptz,
  delivered_at timestamptz
);

alter table public.fulfilments enable row level security;

create policy "Sellers can manage fulfilment on their own competitions" on public.fulfilments
  for all using (
    exists (
      select 1 from public.competitions c
      join public.sellers s on s.id = c.seller_id
      where c.id = competition_id and s.owner_id = auth.uid()
    )
  );
create policy "The winner can read their fulfilment status" on public.fulfilments
  for select using (
    exists (select 1 from public.competitions c where c.id = competition_id and c.winner_user_id = auth.uid())
  );
create policy "Admins can manage all fulfilment" on public.fulfilments
  for all using (public.is_admin_actor());

-- ---------------------------------------------------------------------
-- Disputes
-- ---------------------------------------------------------------------
create table public.disputes (
  id uuid primary key default gen_random_uuid(),
  competition_id uuid not null references public.competitions (id),
  user_id uuid not null references auth.users (id),
  seller_id uuid not null references public.sellers (id),
  type text not null check (type in ('not_received', 'materially_different', 'damaged', 'wrong_product', 'other')),
  description text not null,
  status text not null default 'open' check (status in ('open', 'awaiting_seller', 'awaiting_customer', 'resolved', 'escalated')),
  resolution text,
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

alter table public.disputes enable row level security;

create policy "Customers can read and open their own disputes" on public.disputes
  for select using (auth.uid() = user_id);
create policy "Customers can open a dispute" on public.disputes
  for insert with check (auth.uid() = user_id);
create policy "Sellers can read disputes against them" on public.disputes
  for select using (exists (select 1 from public.sellers s where s.id = seller_id and s.owner_id = auth.uid()));
create policy "Admins can manage all disputes" on public.disputes
  for all using (public.is_admin_actor());

-- ---------------------------------------------------------------------
-- Audit log — append-only, admin actions
-- ---------------------------------------------------------------------
create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users (id),
  action text not null,
  entity_type text not null,
  entity_id uuid,
  details jsonb,
  created_at timestamptz not null default now()
);

alter table public.audit_logs enable row level security;

create policy "Admins can read audit logs" on public.audit_logs
  for select using (public.is_admin_actor());
create policy "Admins can write audit logs" on public.audit_logs
  for insert with check (public.is_admin_actor());

-- ---------------------------------------------------------------------
-- purchase_entries — the one and only way entries get created. Locks the
-- competition row, checks capacity, computes the configurable platform fee,
-- and records a (simulated-paid) order + entries + ledger credit
-- atomically. Sets app.trusted_rpc so the protection trigger above lets it
-- update entries_sold/status even though the caller is a plain customer.
-- ---------------------------------------------------------------------
create or replace function public.purchase_entries(p_competition_id uuid, p_quantity integer)
returns public.entries
language plpgsql
security definer
set search_path = public
as $$
declare
  v_comp public.competitions%rowtype;
  v_order_id uuid;
  v_entry public.entries%rowtype;
  v_fee_cfg jsonb;
  v_subtotal integer;
  v_fee integer;
  v_total integer;
begin
  if p_quantity is null or p_quantity < 1 then
    raise exception 'Quantity must be at least 1';
  end if;

  select * into v_comp from public.competitions where id = p_competition_id for update;
  if not found then
    raise exception 'Competition not found';
  end if;
  if v_comp.status <> 'live' then
    raise exception 'This competition is not live';
  end if;
  if v_comp.entries_sold + p_quantity > v_comp.max_entries then
    raise exception 'Not enough entries remaining';
  end if;

  v_subtotal := v_comp.ticket_price_pence * p_quantity;
  select value into v_fee_cfg from public.platform_settings where key = 'fee';
  v_fee := round(v_subtotal * (v_fee_cfg->>'percent')::numeric / 100) + (v_fee_cfg->>'fixed_pence')::integer;
  v_total := v_subtotal + v_fee;

  perform set_config('app.trusted_rpc', 'true', true);

  insert into public.orders (user_id, subtotal_pence, platform_fee_pence, total_pence, status)
  values (auth.uid(), v_subtotal, v_fee, v_total, 'paid')
  returning id into v_order_id;

  update public.competitions
  set entries_sold = entries_sold + p_quantity,
      status = case when entries_sold + p_quantity >= max_entries then 'completed' else status end
  where id = p_competition_id;

  insert into public.entries (competition_id, user_id, quantity, order_id)
  values (p_competition_id, auth.uid(), p_quantity, v_order_id)
  returning * into v_entry;

  insert into public.seller_ledger_entries (seller_id, competition_id, type, amount_pence, status)
  values (v_comp.seller_id, p_competition_id, 'sale', v_subtotal, 'pending');

  return v_entry;
end;
$$;

grant execute on function public.purchase_entries(uuid, integer) to authenticated;

-- ---------------------------------------------------------------------
-- record_score — one skill-game attempt. Attempts owed are derived from
-- entries actually purchased, attempts used from prior score rows, so
-- there's nothing for a client to lie about beyond the score value itself
-- (still checked server-side: non-negative, multiple of 4 — see the
-- matching client-side comment in store.ts's recordScore for why).
-- ---------------------------------------------------------------------
create or replace function public.record_score(p_competition_id uuid, p_score integer)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_owed integer;
  v_used integer;
  v_best integer;
begin
  if p_score is null or p_score < 0 or p_score % 4 <> 0 then
    raise exception 'Invalid score';
  end if;

  select coalesce(sum(quantity), 0) into v_owed
  from public.entries where competition_id = p_competition_id and user_id = auth.uid();

  select count(*) into v_used
  from public.scores where competition_id = p_competition_id and user_id = auth.uid();

  if v_used >= v_owed then
    raise exception 'No attempts remaining';
  end if;

  insert into public.scores (competition_id, user_id, score) values (p_competition_id, auth.uid(), p_score);

  select max(score) into v_best
  from public.scores where competition_id = p_competition_id and user_id = auth.uid();

  return v_best;
end;
$$;

grant execute on function public.record_score(uuid, integer) to authenticated;
