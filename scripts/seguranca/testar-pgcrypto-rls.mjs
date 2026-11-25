// Etapa 5: pgcrypto (CPF criptografado), formato do hash de senha e isolamento por RLS, no banco LOCAL (PGlite).
// Uso: node scripts/seguranca/testar-pgcrypto-rls.mjs  (gera dois relatórios em evidencias/depois/)
import { writeFileSync } from "node:fs";
import { como, criarBanco, criarUsuario, relatorio } from "./banco-local.mjs";

const repo = process.cwd();
const CPF_FICTICIO = "123.456.789-09"; // CPF de exemplo, não pertence a ninguém
const db = await criarBanco(repo, [
  "supabase/migrations/20261125120000_password_changed_at.sql",
  "supabase/migrations/20261125130000_pgcrypto_cpf.sql",
]);
// Chave só desta sessão de teste (no docker-compose ela vem do .env; nunca do código da aplicação).
const CHAVE_TESTE = `chave-de-teste-${Math.random().toString(36).slice(2)}`;
await db.query(`select set_config('app.chave_cpf', $1, false)`, [CHAVE_TESTE]);

const a = await criarUsuario(db, "usuario.a@example.com", "Usuário A");
const b = await criarUsuario(db, "usuario.b@example.com", "Usuário B");
const curto = (id) => id.slice(0, 8) + "…";

// ---------- pgcrypto ----------
const p = relatorio("Etapa 5 - pgcrypto (CPF criptografado) e hash de senha");
p.log(`Usuário A = ${curto(a)} | Usuário B = ${curto(b)} | CPF FICTÍCIO usado: ${CPF_FICTICIO}`);
p.log("");
await como(db, "authenticated", a, `select public.salvar_cpf('${CPF_FICTICIO}')`);

const bruto = (await db.query(`select encode(cpf_criptografado, 'hex') as hex, length(cpf_criptografado) as bytes from public.profiles where id = $1`, [a])).rows[0];
p.log("1) select bruto da coluna (o que fica gravado na tabela):");
p.log(`   select encode(cpf_criptografado,'hex') from public.profiles where id = '<A>';`);
p.log(`   -> ${bruto.hex.slice(0, 96)}… (${bruto.bytes} bytes)`);
p.ok("Valor gravado é ilegível (não contém os dígitos do CPF)", !bruto.hex.includes("3132333435363738393039") && !bruto.hex.includes("12345678909"));

const lido = (await como(db, "authenticated", a, `select public.ler_cpf() as cpf`)).rows[0].cpf;
p.log("");
p.log("2) select public.ler_cpf();  -- como o usuário A");
p.log(`   -> ${lido}`);
p.ok("ler_cpf() devolve o CPF do próprio usuário (só dígitos)", lido === "12345678909");

const lidoB = (await como(db, "authenticated", b, `select public.ler_cpf() as cpf`)).rows[0].cpf;
p.ok("Usuário B chamando ler_cpf() NÃO recebe o CPF de A (recebe o próprio: null)", lidoB === null, `B recebeu: ${lidoB}`);

let erroSemChave = null;
try { await db.query(`select pgp_sym_decrypt(cpf_criptografado, 'chave-errada') from public.profiles where id = $1`, [a]); } catch (e) { erroSemChave = e.message; }
p.ok("Com a chave errada não é possível descriptografar", !!erroSemChave, `erro: ${erroSemChave}`);

let erroChaveVazia = null;
await db.query(`select set_config('app.chave_cpf', '', false)`);
try { await como(db, "authenticated", a, `select public.ler_cpf()`); } catch (e) { erroChaveVazia = e.message; }
await db.query(`select set_config('app.chave_cpf', $1, false)`, [CHAVE_TESTE]);
p.ok("Sem a chave configurada no banco, ler_cpf() falha (a chave não está no código)", !!erroChaveVazia, `erro: ${erroChaveVazia}`);

let erroAnon = null;
try { await como(db, "anon", null, `select public.ler_cpf()`); } catch (e) { erroAnon = e.message; }
p.ok("Visitante sem login (anon) não pode executar ler_cpf()", !!erroAnon, `erro: ${erroAnon}`);

let erroCpf = null;
try { await como(db, "authenticated", a, `select public.salvar_cpf('123')`); } catch (e) { erroCpf = e.message; }
p.ok("CPF com formato inválido é recusado", !!erroCpf, `erro: ${erroCpf}`);

p.log("");
p.log("3) Hash de senha (bcrypt):");
p.log("   select email, left(encrypted_password, 7) as prefixo, length(encrypted_password) from auth.users;");
for (const u of (await db.query(`select email, left(encrypted_password, 7) as prefixo, length(encrypted_password) as tam from auth.users order by email`)).rows) {
  p.log(`   -> ${u.email.replace(/^[^@]+/, "<oculto>")} | ${u.prefixo} | ${u.tam} caracteres`);
}
p.ok("Senhas guardadas como bcrypt ($2a$, custo 10), nunca em texto", (await db.query(`select bool_and(encrypted_password like '$2a$10$%') ok from auth.users`)).rows[0].ok);
p.log("   ATENÇÃO: este auth.users é uma réplica mínima criada no PGlite (o Supabase local não pôde rodar");
p.log("   sem Docker). O hash foi gerado por crypt(..., gen_salt('bf', 10)) do pgcrypto, que produz o mesmo");
p.log("   formato bcrypt $2a$ usado pelo Supabase Auth. Rodar no Supabase local quando houver Docker.");
const rp = p.fim();
writeFileSync("evidencias/depois/pgcrypto.txt", rp.texto);

// ---------- RLS ----------
const r = relatorio("Etapa 5 - RLS: usuário A tentando ler/alterar dados do usuário B");
r.log(`Usuário A = ${curto(a)} | Usuário B = ${curto(b)}`);
r.log("");
const eqB = (await como(db, "authenticated", b, `insert into public.equipamentos (titulo, categoria, condicao) values ('Notebook do B', 'Notebook', 'Funcional') returning id`)).rows[0].id;
const doaB = (await como(db, "authenticated", b, `insert into public.doacoes (equipamento_id) values ('${eqB}') returning id`)).rows[0].id;
await como(db, "authenticated", b, `select public.salvar_cpf('987.654.321-00')`);

let x = await como(db, "authenticated", a, `select id, full_name from public.profiles where id = '${b}'`);
r.ok("A lê o perfil de B -> 0 linhas", x.rows.length === 0, `linhas: ${x.rows.length}`);
x = await como(db, "authenticated", a, `update public.profiles set full_name = 'Hackeado' where id = '${b}' returning id`);
r.ok("A altera o perfil de B -> 0 linhas alteradas", x.rows.length === 0, `linhas: ${x.rows.length}`);
x = await como(db, "authenticated", a, `select cpf_criptografado from public.profiles where id = '${b}'`);
r.ok("A lê o CPF criptografado de B -> 0 linhas", x.rows.length === 0);
x = await como(db, "authenticated", a, `update public.equipamentos set titulo = 'Hackeado' where id = '${eqB}' returning id`);
r.ok("A altera o equipamento de B -> 0 linhas alteradas", x.rows.length === 0, `linhas: ${x.rows.length}`);
x = await como(db, "authenticated", a, `delete from public.equipamentos where id = '${eqB}' returning id`);
r.ok("A exclui o equipamento de B -> 0 linhas excluídas", x.rows.length === 0, `linhas: ${x.rows.length}`);
x = await como(db, "authenticated", a, `delete from public.doacoes where id = '${doaB}' returning id`);
r.ok("A exclui a doação de B -> 0 linhas excluídas", x.rows.length === 0, `linhas: ${x.rows.length}`);

let erroIns = null;
try { await como(db, "authenticated", a, `insert into public.equipamentos (titulo, categoria, condicao, user_id) values ('Falso', 'Notebook', 'Funcional', '${b}')`); } catch (e) { erroIns = e.message; }
r.ok("A cria equipamento em nome de B -> recusado pelo RLS", !!erroIns, `erro: ${erroIns}`);

let erroRole = null;
try { await como(db, "authenticated", a, `insert into public.user_roles (user_id, role) values ('${a}', 'admin')`); } catch (e) { erroRole = e.message; }
r.ok("A tenta se promover a admin (insert em user_roles) -> recusado", !!erroRole, `erro: ${erroRole}`);

x = (await db.query(`select titulo from public.equipamentos where id = $1`, [eqB])).rows[0];
r.ok("Conferência como superusuário: equipamento de B continua intacto", x?.titulo === "Notebook do B");
x = await como(db, "authenticated", b, `select full_name from public.profiles where id = '${b}'`);
r.ok("B continua vendo e com o próprio nome intacto", x.rows[0]?.full_name === "Usuário B");
const rr = r.fim();
writeFileSync("evidencias/depois/rls.txt", rr.texto);

process.stdout.write(rp.texto + "\n" + rr.texto);
process.exit(rp.falhas || rr.falhas ? 1 : 0);
