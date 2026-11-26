alter table public.profiles add column if not exists password_changed_at timestamptz not null default now();

create or replace function public.registrar_troca_de_senha()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare _troca timestamptz;
begin
  if auth.uid() is null then
    raise exception 'Não autenticado' using errcode = '42501';
  end if;
  select u.updated_at into _troca from auth.users u where u.id = auth.uid();
  update public.profiles
     set password_changed_at = greatest(password_changed_at, least(coalesce(_troca, now()), now()))
   where id = auth.uid();
end;
$$;

revoke execute on function public.registrar_troca_de_senha() from public, anon;
grant execute on function public.registrar_troca_de_senha() to authenticated;

create or replace function public.proteger_password_changed_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.password_changed_at is distinct from old.password_changed_at
     and current_user in ('anon', 'authenticated') then
    new.password_changed_at := old.password_changed_at;
  end if;
  return new;
end;
$$;

drop trigger if exists proteger_password_changed_at on public.profiles;
create trigger proteger_password_changed_at
  before update on public.profiles
  for each row execute function public.proteger_password_changed_at();