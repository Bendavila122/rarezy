-- Completes the competition lifecycle past "live": picking a winner once a
-- competition sells out or its deadline passes, and letting the seller move
-- it through dispatch/delivery. There's no scheduled job in this project,
-- so resolution is triggered lazily — the client calls resolve_competition
-- when it loads a competition whose deadline has passed but which is still
-- "live" (same pattern the legacy localStorage store already uses for its
-- own deadline sweep). The winner is always the top scorer, never seller or
-- admin-picked, per the master plan's "seller can never choose the winner"
-- rule — admin exception-handling stays a manual SQL/dashboard action, not
-- a client-callable one.

create or replace function public.resolve_competition(p_competition_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_comp public.competitions%rowtype;
  v_winner record;
begin
  select * into v_comp from public.competitions where id = p_competition_id for update;
  if not found then
    return;
  end if;
  if v_comp.status not in ('live', 'completed') then
    return;
  end if;
  if v_comp.status = 'live' and now() < v_comp.ends_at then
    return;
  end if;

  select user_id, score into v_winner
  from public.scores
  where competition_id = p_competition_id
  order by score desc, created_at asc
  limit 1;

  perform set_config('app.trusted_rpc', 'true', true);

  if v_winner is null then
    update public.competitions set status = 'cancelled' where id = p_competition_id;
  else
    update public.competitions
    set status = 'winner_pending', winner_user_id = v_winner.user_id, winner_score = v_winner.score
    where id = p_competition_id;
  end if;
end;
$$;

grant execute on function public.resolve_competition(uuid) to authenticated, anon;

-- Sellers move their own competitions through dispatch/delivery — these two
-- are the only path to those status values (the protect_competition_admin_
-- fields trigger blocks a seller setting status directly), keeping the
-- transition auditable in one place rather than trusting a raw client
-- update.
create or replace function public.mark_dispatched(p_competition_id uuid, p_carrier text, p_tracking text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_owner uuid;
begin
  select s.owner_id into v_owner
  from public.competitions c
  join public.sellers s on s.id = c.seller_id
  where c.id = p_competition_id;

  if v_owner is null or v_owner <> auth.uid() then
    raise exception 'Not authorised';
  end if;

  perform set_config('app.trusted_rpc', 'true', true);

  insert into public.fulfilments (competition_id, status, carrier, tracking_number, dispatched_at)
  values (p_competition_id, 'dispatched', p_carrier, p_tracking, now())
  on conflict (competition_id) do update
  set status = 'dispatched', carrier = excluded.carrier, tracking_number = excluded.tracking_number, dispatched_at = now();

  update public.competitions set status = 'fulfilment_pending' where id = p_competition_id;
end;
$$;

grant execute on function public.mark_dispatched(uuid, text, text) to authenticated;

create or replace function public.mark_delivered(p_competition_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_owner uuid;
begin
  select s.owner_id into v_owner
  from public.competitions c
  join public.sellers s on s.id = c.seller_id
  where c.id = p_competition_id;

  if v_owner is null or v_owner <> auth.uid() then
    raise exception 'Not authorised';
  end if;

  perform set_config('app.trusted_rpc', 'true', true);

  update public.fulfilments set status = 'delivered', delivered_at = now() where competition_id = p_competition_id;
  update public.competitions set status = 'fulfilled' where id = p_competition_id;
end;
$$;

grant execute on function public.mark_delivered(uuid) to authenticated;
