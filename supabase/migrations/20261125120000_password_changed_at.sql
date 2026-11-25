-- Troca periódica de senha (90 dias): data da última troca em profiles.
-- Aplicar primeiro no banco LOCAL. Não aplicar no banco de nuvem sem autorização.

alter table public.profiles add column if not exists password_changed_at timestamptz not null default now();

-- Cadastro inicial: o perfil é criado pelo gatilho handle_new_user e recebe o default now().

-- Troca de senha (supabase.auth.updateUser / redefinição): o Supabase Auth grava o novo hash em
-- auth.users.encrypted_password; este gatilho registra a data no perfil. Fica no servidor para que
-- o navegador não precise (nem possa) informar a data.
create or replace function public.registrar_troca_de_senha()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.encrypted_password is distinct from old.encrypted_password then
    update public.profiles set password_changed_at = now() where id = new.id;
  end if;
  return new;
end;
$$;

revoke execute on function public.registrar_troca_de_senha() from public, anon, authenticated;

drop trigger if exists on_auth_user_password_changed on auth.users;
create trigger on_auth_user_password_changed
  after update of encrypted_password on auth.users
  for each row execute function public.registrar_troca_de_senha();

-- O usuário pode editar o próprio perfil (nome, foto...), mas não pode adiar o vencimento da senha
-- mudando password_changed_at pela API: se a alteração vier dos papéis da API, o valor antigo é mantido.
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
