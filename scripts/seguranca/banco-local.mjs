// Banco PostgreSQL LOCAL em memória (PGlite = PostgreSQL compilado para WebAssembly), sem Docker.
// Recria os objetos mínimos do Supabase (papéis anon/authenticated, auth.users, auth.uid())
// e aplica as migrations do repositório na ordem. Usado pelos testes de segurança do banco.
import { PGlite } from "@electric-sql/pglite";
import { pgcrypto } from "@electric-sql/pglite/contrib/pgcrypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";

export const MIGRATIONS_ORIGINAIS = [
  "supabase/migrations/20260428115342_418b5549-badf-477c-b1ef-be51db9a13c7.sql",
  "supabase/migrations/20260428115401_1e9528de-bfbd-4a19-8f47-df0ac8fd5595.sql",
  "supabase/migrations/20260428115645_d32b002e-3d7a-471b-8bdb-3beac5a70c49.sql",
  "drizzle/migrations/0000_create_equipamentos_doacoes.sql",
  "supabase/migrations/20260521185453_6139d763-7208-49ae-9eb5-37ad9576a731.sql",
  "supabase/migrations/20260525193505_a886f75c-69d7-4c28-8d1e-d4ead9e1ce74.sql",
  // Já aplicadas no banco de nuvem pelo Lovable (trocas, conversas, has_role, exclusão pelo admin).
  "supabase/lovable-atualizacao-compacta.sql",
  "supabase/lovable-admin-excluir-usuario.sql",
];

export async function criarBanco(repo, migrationsExtras = []) {
  const db = new PGlite({ extensions: { pgcrypto } });
  await db.exec(`
    -- O Supabase já vem com pgcrypto habilitada (é ela que o Auth usa para o bcrypt).
    create extension if not exists pgcrypto;
    create role anon nologin; create role authenticated nologin; create role service_role nologin;
    create schema auth;
    create table auth.users (
      id uuid primary key default gen_random_uuid(),
      email text,
      encrypted_password text,
      raw_user_meta_data jsonb
    );
    create function auth.uid() returns uuid language sql stable as
      $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    grant usage on schema auth to anon, authenticated;
    grant execute on function auth.uid() to anon, authenticated;
    create schema storage;
    create table storage.buckets (id text primary key, name text, public boolean);
    create table storage.objects (id uuid primary key default gen_random_uuid(), bucket_id text, name text);
    alter table storage.objects enable row level security;
    create function storage.foldername(name text) returns text[] language sql immutable as
      $$ select (string_to_array(name, '/'))[1:array_length(string_to_array(name, '/'), 1) - 1] $$;
    grant usage on schema storage to anon, authenticated;
    alter default privileges in schema public grant all on tables to anon, authenticated;
    alter default privileges in schema public grant execute on functions to anon, authenticated;
    create publication supabase_realtime;
  `);
  for (const m of [...MIGRATIONS_ORIGINAIS, ...migrationsExtras]) {
    await db.exec(readFileSync(join(repo, m), "utf8"));
  }
  return db;
}

/** Executa SQL como um papel da API (anon/authenticated) com o "JWT" de um usuário. */
export async function como(db, papel, uid, sql) {
  await db.exec(`reset role; select set_config('request.jwt.claim.sub', '${uid ?? ""}', false); set role ${papel};`);
  try {
    return await db.query(sql);
  } finally {
    await db.exec(`reset role; select set_config('request.jwt.claim.sub', '', false);`);
  }
}

/** Cria um usuário em auth.users (o gatilho handle_new_user cria o perfil). */
export async function criarUsuario(db, email, nome) {
  const r = await db.query(
    `insert into auth.users (email, encrypted_password, raw_user_meta_data)
     values ($1, crypt('Senha@Inicial1', gen_salt('bf', 10)), jsonb_build_object('full_name', $2::text)) returning id`,
    [email, nome],
  );
  return r.rows[0].id;
}

export function relatorio(titulo) {
  const linhas = [`# ${titulo}`, `Gerado em: ${new Date().toISOString()}`, `Banco: PGlite ${"(PostgreSQL em WebAssembly, local, em memória)"}`, ""];
  let falhas = 0;
  return {
    log: (texto = "") => linhas.push(texto),
    ok: (nome, passou, detalhe = "") => {
      if (!passou) falhas++;
      linhas.push(`[${passou ? "PASSOU" : "FALHOU"}] ${nome}${detalhe ? `\n         ${detalhe}` : ""}`);
    },
    fim: () => {
      linhas.push("", falhas ? `RESULTADO: ${falhas} verificação(ões) falharam` : "RESULTADO: todas as verificações passaram");
      return { texto: linhas.join("\n") + "\n", falhas };
    },
  };
}
