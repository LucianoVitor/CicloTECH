// Etapa 3: testa a migration password_changed_at no banco LOCAL (PGlite).
// Uso: node scripts/seguranca/testar-troca-periodica.mjs > evidencias/depois/etapa3-banco-local.txt
import { como, criarBanco, criarUsuario, relatorio } from "./banco-local.mjs";

const repo = process.cwd();
const r = relatorio("Etapa 3 - troca periódica de senha (password_changed_at)");
const db = await criarBanco(repo, ["supabase/migrations/20261125120000_password_changed_at.sql"]);
r.log("Migrations aplicadas: as do repositório + as já aplicadas na nuvem (drizzle/migrations 0001 e 0002) + 20261125120000_password_changed_at.sql");
r.log("");

const col = await db.query(
  `select data_type, is_nullable, column_default from information_schema.columns
   where table_schema='public' and table_name='profiles' and column_name='password_changed_at'`,
);
r.ok("Coluna profiles.password_changed_at existe (timestamptz, not null, default now())",
  col.rows[0]?.data_type === "timestamp with time zone" && col.rows[0]?.is_nullable === "NO" && /now\(\)/.test(col.rows[0]?.column_default ?? ""),
  JSON.stringify(col.rows[0]));

const a = await criarUsuario(db, "usuario.a@example.com", "Usuário A");
const p1 = (await db.query(`select password_changed_at from public.profiles where id = $1`, [a])).rows[0];
r.ok("Cadastro inicial: perfil nasce com password_changed_at preenchido", !!p1?.password_changed_at, `valor: ${p1?.password_changed_at?.toISOString?.()}`);

// Simula senha antiga (100 dias) e depois a troca feita pelo Supabase Auth (updateUser).
await db.query(`update public.profiles set password_changed_at = now() - interval '100 days' where id = $1`, [a]);
const antes = (await db.query(`select password_changed_at from public.profiles where id = $1`, [a])).rows[0].password_changed_at;
await db.query(`update auth.users set encrypted_password = crypt('Nova@Senha2026', gen_salt('bf', 10)) where id = $1`, [a]);
const depois = (await db.query(`select password_changed_at from public.profiles where id = $1`, [a])).rows[0].password_changed_at;
r.ok("Troca de senha (update de auth.users.encrypted_password) atualiza password_changed_at",
  depois > antes && Date.now() - depois.getTime() < 60_000,
  `antes: ${antes.toISOString()} | depois: ${depois.toISOString()}`);

// Usuário tenta adiar o vencimento pela API.
await db.query(`update public.profiles set password_changed_at = now() - interval '100 days' where id = $1`, [a]);
const vencida = (await db.query(`select password_changed_at from public.profiles where id = $1`, [a])).rows[0].password_changed_at;
await como(db, "authenticated", a, `update public.profiles set password_changed_at = now() + interval '10 years', full_name = 'Nome Editado' where id = '${a}'`);
const tentativa = (await db.query(`select password_changed_at, full_name from public.profiles where id = $1`, [a])).rows[0];
r.ok("Usuário NÃO consegue alterar password_changed_at pela API (valor mantido)",
  tentativa.password_changed_at.getTime() === vencida.getTime(),
  `continua: ${tentativa.password_changed_at.toISOString()}`);
r.ok("Usuário continua podendo editar o próprio nome", tentativa.full_name === "Nome Editado");

const sel = await como(db, "authenticated", a, `select password_changed_at from public.profiles where id = '${a}'`);
r.ok("Usuário lê a própria data (necessário para o hook usePasswordExpiry)", sel.rows.length === 1);

const { texto, falhas } = r.fim();
process.stdout.write(texto);
process.exit(falhas ? 1 : 0);
