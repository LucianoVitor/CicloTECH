-- CicloTECH — função para o painel de admin excluir usuários.
-- Só administradores podem executar; ninguém exclui a própria conta.
-- Apaga a conta (auth.users) e, em cascata: perfil, papéis, trocas, conversas e mensagens.
-- Equipamentos não têm FK para auth.users, então são apagados explicitamente (e as doações deles, em cascata).
create or replace function public.admin_excluir_usuario(_user_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.has_role((select auth.uid()), 'admin') then
    raise exception 'Apenas administradores podem excluir usuários.' using errcode = '42501';
  end if;
  if _user_id = (select auth.uid()) then
    raise exception 'Você não pode excluir a sua própria conta.' using errcode = '42501';
  end if;
  delete from public.equipamentos where user_id = _user_id;
  delete from auth.users where id = _user_id;
end;
$$;
revoke execute on function public.admin_excluir_usuario(uuid) from public, anon;
grant execute on function public.admin_excluir_usuario(uuid) to authenticated;
