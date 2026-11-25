-- CPF criptografado com pgcrypto (pgp_sym_encrypt / pgp_sym_decrypt).
-- A chave NUNCA fica no código nem na migration: vem da configuração do banco "app.chave_cpf".
--   Local (docker-compose): passada pelo .env (APP_CHAVE_CPF) -> postgres -c app.chave_cpf=...
--   Nuvem: definir pelo painel/SQL do responsável (ex.: alter database ... set app.chave_cpf), nunca no repositório.
-- Aplicar primeiro no banco LOCAL. Não aplicar no banco de nuvem sem autorização.

create extension if not exists pgcrypto;

alter table public.profiles add column if not exists cpf_criptografado bytea;

-- Observação: no Supabase a extensão pgcrypto fica no schema "extensions"; por isso o search_path
-- inclui "extensions" além de "public" (num PostgreSQL comum ela fica em "public").

-- Salva o CPF do PRÓPRIO usuário logado (auth.uid()), criptografado.
create or replace function public.salvar_cpf(_cpf text)
returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  _uid uuid := auth.uid();
  _digitos text := regexp_replace(coalesce(_cpf, ''), '\D', '', 'g');
begin
  if _uid is null then
    raise exception 'É preciso estar logado.' using errcode = '42501';
  end if;
  if length(_digitos) <> 11 then
    raise exception 'CPF deve ter 11 dígitos.' using errcode = '22023';
  end if;
  update public.profiles
     set cpf_criptografado = pgp_sym_encrypt(_digitos, current_setting('app.chave_cpf'))
   where id = _uid;
end;
$$;

-- Lê (descriptografa) o CPF do PRÓPRIO usuário logado. Retorna null se ainda não cadastrado.
create or replace function public.ler_cpf()
returns text
language plpgsql
stable
security definer
set search_path = public, extensions
as $$
declare
  _uid uuid := auth.uid();
  _cifrado bytea;
begin
  if _uid is null then
    raise exception 'É preciso estar logado.' using errcode = '42501';
  end if;
  select cpf_criptografado into _cifrado from public.profiles where id = _uid;
  if _cifrado is null then
    return null;
  end if;
  return pgp_sym_decrypt(_cifrado, current_setting('app.chave_cpf'));
end;
$$;

revoke execute on function public.salvar_cpf(text) from public, anon;
revoke execute on function public.ler_cpf() from public, anon;
grant execute on function public.salvar_cpf(text) to authenticated;
grant execute on function public.ler_cpf() to authenticated;
