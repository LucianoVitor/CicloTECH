-- ============================================================================
--  CicloTECH — criação COMPLETA do banco no Supabase
--  Como usar: num projeto Supabase NOVO, abra SQL Editor → New query, cole TUDO e clique em Run.
--  Rode UMA vez. Está numa transação: se algo falhar, nada é aplicado pela metade.
--
--  Consolida as migrações de supabase/migrations/ + drizzle/migrations/ (equipamentos/doações)
--  com estas correções:
--   • has_role: usuários logados podem executá-la (as políticas RLS dependem dela) e ela só
--     responde sobre o PRÓPRIO usuário (não revela quem é admin);
--   • avaliações públicas (view public_feedback) funcionam para visitantes;
--   • removido o gatilho auto_admin_dev (dava admin a quem se cadastrasse com admin@ciclotech.dev);
--   • cadastro não quebra se user_type vier com valor inválido;
--   • upload de avatar com substituição (upsert) passa a funcionar;
--   • permissões explícitas (GRANT) — não dependem da configuração padrão da Data API;
--   • políticas com (select auth.uid()) (recomendação de desempenho do Supabase).
-- ============================================================================

begin;

-- ─── 1. Tipos ──────────────────────────────────────────────────────────────
create type public.app_role as enum ('admin', 'moderator', 'user');
create type public.user_type as enum ('donor', 'student');

-- ─── 2. Função utilitária: updated_at automático ───────────────────────────
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ─── 3. Perfis ─────────────────────────────────────────────────────────────
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  phone text,
  address text,
  avatar_url text,
  user_type public.user_type default 'donor',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

create trigger profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

-- ─── 4. Papéis (admin / moderator / user) ──────────────────────────────────
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
alter table public.user_roles enable row level security;

-- Verifica o papel SEM passar pela RLS de user_roles (evita recursão nas políticas).
-- Só responde sobre o próprio usuário logado: has_role(outro_id, ...) sempre retorna false.
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

-- ─── 5. Cadastro: cria perfil + papel 'user' automaticamente ───────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, user_type)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    case
      when new.raw_user_meta_data ->> 'user_type' in ('donor', 'student')
        then (new.raw_user_meta_data ->> 'user_type')::public.user_type
      else 'donor'::public.user_type
    end
  );
  insert into public.user_roles (user_id, role) values (new.id, 'user');
  return new;
end;
$$;
revoke execute on function public.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Políticas: perfis
create policy "Usuário vê o próprio perfil" on public.profiles
  for select to authenticated
  using ((select auth.uid()) = id);

create policy "Admin vê todos os perfis" on public.profiles
  for select to authenticated
  using (public.has_role((select auth.uid()), 'admin'));

create policy "Usuário edita o próprio perfil" on public.profiles
  for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create policy "Admin edita qualquer perfil" on public.profiles
  for update to authenticated
  using (public.has_role((select auth.uid()), 'admin'))
  with check (public.has_role((select auth.uid()), 'admin'));

-- Políticas: papéis
create policy "Usuário vê os próprios papéis" on public.user_roles
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Admin vê todos os papéis" on public.user_roles
  for select to authenticated
  using (public.has_role((select auth.uid()), 'admin'));

create policy "Admin gerencia papéis" on public.user_roles
  for all to authenticated
  using (public.has_role((select auth.uid()), 'admin'))
  with check (public.has_role((select auth.uid()), 'admin'));

create policy "Somente admin cria papéis" on public.user_roles
  as restrictive for insert to authenticated
  with check (public.has_role((select auth.uid()), 'admin'));

-- ─── 6. Equipamentos ───────────────────────────────────────────────────────
create table public.equipamentos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  titulo text not null,
  categoria text not null,
  condicao text not null,
  descricao text not null default '',
  imagem_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id)
);
alter table public.equipamentos enable row level security;
create index equipamentos_user_id_idx on public.equipamentos (user_id);
create trigger equipamentos_updated_at
before update on public.equipamentos
for each row execute function public.set_updated_at();

create policy "Dono gerencia seus equipamentos" on public.equipamentos
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- ─── 7. Doações (só de equipamentos do mesmo dono; apagar o equipamento apaga a doação) ──
create table public.doacoes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  equipamento_id uuid not null,
  status text not null default 'Ativo',
  observacoes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint doacoes_equipamento_owner_fkey
    foreign key (equipamento_id, user_id)
    references public.equipamentos (id, user_id) on delete cascade
);
alter table public.doacoes enable row level security;
create index doacoes_user_id_idx on public.doacoes (user_id);
create index doacoes_equipamento_owner_idx on public.doacoes (equipamento_id, user_id);
create trigger doacoes_updated_at
before update on public.doacoes
for each row execute function public.set_updated_at();
comment on table public.doacoes is
  'Doações vinculadas a equipamentos do mesmo proprietário; excluir o equipamento exclui suas doações.';

create policy "Dono gerencia suas doações" on public.doacoes
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- ─── 8. Avaliações (feedback) ──────────────────────────────────────────────
create table public.feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  author_name text not null,
  rating int not null check (rating between 1 and 5),
  message text not null,
  created_at timestamptz not null default now()
);
alter table public.feedback enable row level security;
create index feedback_created_idx on public.feedback (created_at desc);
create index feedback_user_id_idx on public.feedback (user_id);

-- Avaliações são públicas (linhas); as COLUNAS que visitantes enxergam são limitadas pelos GRANTs abaixo.
create policy "Avaliações são públicas" on public.feedback
  for select to anon, authenticated
  using (true);

create policy "Usuário publica a própria avaliação" on public.feedback
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Usuário apaga a própria avaliação" on public.feedback
  for delete to authenticated
  using ((select auth.uid()) = user_id);

create policy "Admin gerencia avaliações" on public.feedback
  for all to authenticated
  using (public.has_role((select auth.uid()), 'admin'))
  with check (public.has_role((select auth.uid()), 'admin'));

-- View pública: só o primeiro nome do autor, sem user_id. security_invoker = respeita RLS/GRANTs de quem consulta.
create view public.public_feedback
with (security_invoker = true) as
select
  id,
  split_part(author_name, ' ', 1) as author_name,
  rating,
  message,
  created_at
from public.feedback;

-- ─── 9. Permissões da API (explícitas; RLS continua decidindo QUAIS linhas) ──
revoke all on public.profiles, public.user_roles, public.equipamentos, public.doacoes, public.feedback
  from anon, authenticated;
revoke all on public.public_feedback from anon, authenticated;

grant usage on schema public to anon, authenticated;

grant select, update on public.profiles to authenticated;
grant select, insert, update, delete on public.user_roles to authenticated;
grant select, insert, update, delete on public.equipamentos to authenticated;
grant select, insert, update, delete on public.doacoes to authenticated;

grant select (id, author_name, rating, message, created_at) on public.feedback to anon;
grant select, insert, delete on public.feedback to authenticated;
grant update on public.feedback to authenticated; -- usado só por admins (política acima)
grant select on public.public_feedback to anon, authenticated;

-- ─── 10. Storage: fotos de perfil (bucket público "avatars", pasta = id do usuário) ──
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "Usuário vê os próprios arquivos de avatar" on storage.objects
  for select to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "Usuário envia o próprio avatar" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "Usuário substitui o próprio avatar" on storage.objects
  for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text)
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "Usuário apaga o próprio avatar" on storage.objects
  for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

commit;

-- ============================================================================
--  Depois: para tornar alguém ADMIN (troque pelo e-mail da pessoa, já cadastrada):
--    insert into public.user_roles (user_id, role)
--    select id, 'admin' from auth.users where email = 'seu-email@exemplo.com';
-- ============================================================================
