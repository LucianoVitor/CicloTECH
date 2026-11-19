create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select _user_id is not null
     and _user_id = (select auth.uid())
     and exists (
       select 1 from public.user_roles ur
       where ur.user_id = _user_id and ur.role = _role
     );
$$;
revoke execute on function public.has_role(uuid, public.app_role) from public, anon;
grant execute on function public.has_role(uuid, public.app_role) to authenticated;
drop trigger if exists on_auth_user_created_admin on auth.users;
drop function if exists public.auto_admin_dev();
alter table public.doacoes add column if not exists autor_nome text not null default '';
drop policy if exists "Doações ativas visíveis a usuários" on public.doacoes;
create policy "Doações ativas visíveis a usuários" on public.doacoes
  for select to authenticated
  using (status = 'Ativo');
drop policy if exists "Equipamentos em doação visíveis a usuários" on public.equipamentos;
create policy "Equipamentos em doação visíveis a usuários" on public.equipamentos
  for select to authenticated
  using (exists (
    select 1 from public.doacoes d
    where d.equipamento_id = equipamentos.id and d.status = 'Ativo'
  ));
drop policy if exists "Admin gerencia equipamentos" on public.equipamentos;
create policy "Admin gerencia equipamentos" on public.equipamentos
  for all to authenticated
  using (public.has_role((select auth.uid()), 'admin'))
  with check (public.has_role((select auth.uid()), 'admin'));
drop policy if exists "Admin gerencia doações" on public.doacoes;
create policy "Admin gerencia doações" on public.doacoes
  for all to authenticated
  using (public.has_role((select auth.uid()), 'admin'))
  with check (public.has_role((select auth.uid()), 'admin'));
create index if not exists doacoes_status_idx on public.doacoes (status);
create table if not exists public.trocas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  autor_nome text not null default '',
  titulo text not null check (char_length(titulo) between 1 and 120),
  categoria text not null,
  descricao text not null default '',
  quer_trocar_por text not null check (char_length(quer_trocar_por) between 1 and 120),
  imagem_url text,
  status text not null default 'Ativo' check (status in ('Ativo', 'Encerrada')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.trocas enable row level security;
create index if not exists trocas_user_id_idx on public.trocas (user_id);
create index if not exists trocas_status_created_idx on public.trocas (status, created_at desc);
drop trigger if exists trocas_updated_at on public.trocas;
create trigger trocas_updated_at
before update on public.trocas
for each row execute function public.set_updated_at();
drop policy if exists "Trocas ativas visíveis a usuários" on public.trocas;
create policy "Trocas ativas visíveis a usuários" on public.trocas
  for select to authenticated
  using (status = 'Ativo' or (select auth.uid()) = user_id);
drop policy if exists "Usuário publica a própria troca" on public.trocas;
create policy "Usuário publica a própria troca" on public.trocas
  for insert to authenticated
  with check ((select auth.uid()) = user_id);
drop policy if exists "Usuário edita a própria troca" on public.trocas;
create policy "Usuário edita a própria troca" on public.trocas
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
drop policy if exists "Usuário apaga a própria troca" on public.trocas;
create policy "Usuário apaga a própria troca" on public.trocas
  for delete to authenticated
  using ((select auth.uid()) = user_id);
drop policy if exists "Admin gerencia trocas" on public.trocas;
create policy "Admin gerencia trocas" on public.trocas
  for all to authenticated
  using (public.has_role((select auth.uid()), 'admin'))
  with check (public.has_role((select auth.uid()), 'admin'));
create table if not exists public.conversas (
  id uuid primary key default gen_random_uuid(),
  item_tipo text not null check (item_tipo in ('doacao', 'troca')),
  item_id uuid not null,
  item_titulo text not null,
  item_categoria text not null default '',
  item_imagem_url text,
  dono_id uuid not null references auth.users (id) on delete cascade,
  dono_nome text not null default '',
  interessado_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  interessado_nome text not null default '',
  created_at timestamptz not null default now(),
  unique (item_tipo, item_id, interessado_id),
  check (dono_id <> interessado_id)
);
alter table public.conversas enable row level security;
create index if not exists conversas_dono_idx on public.conversas (dono_id);
create index if not exists conversas_interessado_idx on public.conversas (interessado_id);
create table if not exists public.mensagens (
  id uuid primary key default gen_random_uuid(),
  conversa_id uuid not null references public.conversas (id) on delete cascade,
  autor_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  texto text not null check (char_length(btrim(texto)) between 1 and 2000),
  created_at timestamptz not null default now()
);
alter table public.mensagens enable row level security;
create index if not exists mensagens_conversa_created_idx on public.mensagens (conversa_id, created_at);
drop policy if exists "Participantes veem a conversa" on public.conversas;
create policy "Participantes veem a conversa" on public.conversas
  for select to authenticated
  using ((select auth.uid()) in (dono_id, interessado_id));
drop policy if exists "Interessado inicia a conversa" on public.conversas;
create policy "Interessado inicia a conversa" on public.conversas
  for insert to authenticated
  with check ((select auth.uid()) = interessado_id and dono_id <> interessado_id);
drop policy if exists "Admin gerencia conversas" on public.conversas;
create policy "Admin gerencia conversas" on public.conversas
  for all to authenticated
  using (public.has_role((select auth.uid()), 'admin'))
  with check (public.has_role((select auth.uid()), 'admin'));
drop policy if exists "Participantes leem mensagens" on public.mensagens;
create policy "Participantes leem mensagens" on public.mensagens
  for select to authenticated
  using (exists (
    select 1 from public.conversas c
    where c.id = mensagens.conversa_id and (select auth.uid()) in (c.dono_id, c.interessado_id)
  ));
drop policy if exists "Participantes enviam mensagens" on public.mensagens;
create policy "Participantes enviam mensagens" on public.mensagens
  for insert to authenticated
  with check (
    (select auth.uid()) = autor_id
    and exists (
      select 1 from public.conversas c
      where c.id = mensagens.conversa_id and (select auth.uid()) in (c.dono_id, c.interessado_id)
    )
  );
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    begin
      alter publication supabase_realtime add table public.mensagens;
    exception when duplicate_object then null;
    end;
    begin
      alter publication supabase_realtime add table public.conversas;
    exception when duplicate_object then null;
    end;
  end if;
end $$;
drop policy if exists "CicloTECH envia foto de equipamento" on storage.objects;
create policy "CicloTECH envia foto de equipamento" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'equipamentos' and (storage.foldername(name))[1] = (select auth.uid())::text);
drop policy if exists "CicloTECH apaga foto de equipamento" on storage.objects;
create policy "CicloTECH apaga foto de equipamento" on storage.objects
  for delete to authenticated
  using (bucket_id = 'equipamentos' and (storage.foldername(name))[1] = (select auth.uid())::text);
drop policy if exists "CicloTECH lê as próprias fotos" on storage.objects;
create policy "CicloTECH lê as próprias fotos" on storage.objects
  for select to authenticated
  using (bucket_id in ('equipamentos', 'avatars') and (storage.foldername(name))[1] = (select auth.uid())::text);
drop policy if exists "CicloTECH envia foto de perfil" on storage.objects;
create policy "CicloTECH envia foto de perfil" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
revoke all on public.trocas, public.conversas, public.mensagens from anon;
grant select, insert, update, delete on public.trocas to authenticated;
grant select, insert, update, delete on public.conversas to authenticated;
grant select, insert on public.mensagens to authenticated;