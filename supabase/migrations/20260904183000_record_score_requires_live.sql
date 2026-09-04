-- A competition that's already closed (winner picked or otherwise resolved)
-- shouldn't accept new scores — the client-side gap this closes: the
-- attempts/play panel was only hidden by status in a later fix, but the
-- RPC itself had no server-side check, so a stale tab (or a deliberately
-- bypassed client) could still record scores after the winner was chosen.
create or replace function public.record_score(p_competition_id uuid, p_score integer)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_status text;
  v_owed integer;
  v_used integer;
  v_best integer;
begin
  if p_score is null or p_score < 0 or p_score % 4 <> 0 then
    raise exception 'Invalid score';
  end if;

  select status into v_status from public.competitions where id = p_competition_id;
  if v_status is distinct from 'live' then
    raise exception 'This competition is no longer accepting entries';
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
