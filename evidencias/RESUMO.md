# Relatório de segurança do CicloTECH (resumo das evidências)

Data: 25/11/2026 · Branch: `feature/mobile-app` · Todas as saídas de comando estão em `evidencias/antes/` e `evidencias/depois/`.
Senhas, tokens, e-mails reais e caminhos pessoais foram ocultados (`scripts/seguranca/mascarar-evidencias.ps1`).

> **Ambiente:** Windows 11, sem Docker, sem Supabase CLI e sem GitHub CLI. Wapiti e sqlmap rodaram **somente contra `localhost`**.
> O banco local foi feito com **PGlite** (PostgreSQL compilado para WebAssembly, em memória), com as migrations do repositório.
> **Nenhuma migration foi aplicada no banco de nuvem** do Lovable/Supabase.

## Tabela

| # | Item | Antes | Depois | Evidência | Commit |
|---|------|-------|--------|-----------|--------|
| 0 | Estado inicial | — | npm audit, busca de segredos, `.gitignore`, `.env*`, Wapiti e sqlmap registrados | `antes/*` | `1c08d3f` |
| 1 | Senha forte | Só mínimo de 8 caracteres | Zod: 8+, maiúscula, minúscula, número, especial (máx. 72); React Hook Form + indicador de força no cadastro e na redefinição | `src/lib/passwordPolicy.ts`, `depois/etapa1-npm-test.txt` (13 testes) | `e7a2b55` |
| 2 | Esqueci a senha | Aba na tela de login; mensagem diferente quando dava erro | `/esqueci-senha` (resposta sempre igual, sem enumeração de contas) e `/redefinir-senha` (senha forte → `updateUser` → `signOut` → login); `/reset-password` redireciona | `depois/etapa2-npm-test.txt` (5 testes de fluxo) | `39c80b5` |
| 3 | Troca a cada 90 dias | Não existia | `profiles.password_changed_at` + gatilho que grava a data quando o hash muda + proteção contra o usuário adiar; `usePasswordExpiry` + guarda → `/trocar-senha` | `depois/etapa3-banco-local.txt` (6/6), `depois/etapa3-npm-test.txt` | `120480f` |
| 4a | Credenciais de admin | Senha de admin no código até `30f150d`; lista fixa de e-mails dava admin na interface | Admin só pelo banco (`rpc has_role` → `user_roles`); 4 testes | `antes/useAuth-*.tsx.txt`, `src/hooks/useAuth.test.tsx` | `88be8cf` |
| 4b | `.env` / segredos | `.env` versionado; `.gitignore` sem `.env` | `.env` e `.env.*` ignorados, `.env` fora do git, `.env.example` sem valores | `antes/arquivos-env.txt`, `depois/arquivos-env.txt`, `depois/etapa4-segredos-historico.txt` | `88be8cf` |
| 4c | Cabeçalhos HTTP | Nenhum (Wapiti: CSP, X-Frame-Options e X-Content-Type-Options ausentes) | CSP, nosniff, X-Frame-Options DENY, Referrer-Policy, Permissions-Policy, COOP (dev e preview) | `depois/etapa4-cabecalhos-dev.txt`, `depois/etapa4-cabecalhos-preview.txt` | `88be8cf` |
| 5 | pgcrypto (CPF) | Não existia | `cpf_criptografado bytea`, `salvar_cpf`/`ler_cpf` (SECURITY DEFINER, chave em `current_setting('app.chave_cpf')`); valor bruto ilegível; bcrypt `$2a$10$` | `depois/pgcrypto.txt` (8/8) | `50e688c` |
| 5 | RLS A × B | Não testado | A não lê, altera nem exclui perfil, CPF, equipamento ou doação de B; não cria em nome de B; não vira admin | `depois/rls.txt` (10/10) | `50e688c` |
| 5 | Banco local | — | `docker-compose.yml` (PostgreSQL 16, `127.0.0.1:54329`, credenciais do `.env`). **Não executado: Docker ausente** | `depois/etapa5-docker-supabase.txt` | `50e688c` |
| 6 | CodeQL | Não existia | `.github/workflows/codeql.yml`. **Alertas só depois do push** (gh ausente) | `depois/etapa6-codeql.txt` | `fbda038` |
| 6 | npm audit | 32 (1 baixa, 20 moderadas, 11 altas) | 9 (8 moderadas, 1 alta); 3 nas dependências de produção | `antes/npm-audit.*`, `depois/npm-audit*.txt` | `fbda038` |
| 6 | Wapiti | 3 alertas de cabeçalho (+4 semelhantes) | Dev: só "script-src não seguro" (`'unsafe-inline'` exigido pelo Vite em desenvolvimento). Build (`vite preview`): nenhum alerta | `antes/wapiti/`, `depois/wapiti/`, `depois/wapiti-preview/` | `fbda038` |
| 6 | sqlmap | Site: não injetável · Supabase local: sem conexão | Igual (o site não usa o parâmetro em consultas; a API do Supabase local não pôde subir) | `antes/sqlmap-*.txt`, `depois/sqlmap-*.txt` | `fbda038` |
| 7 | Lint / testes / build | — | Testes: **45/45** · Build: OK · Lint: 26 erros, **todos em arquivos que este trabalho não alterou**. Nos arquivos alterados: 4 erros antes → 0 depois | `depois/final-*.txt` | (este commit) |

## Segredos encontrados no histórico (rotacionar)
Detalhes em `depois/etapa4-segredos-historico.txt` (os valores não aparecem lá).
1. **Senha da conta de administrador**, que esteve em `src/hooks/useAuth.tsx` (commit `d199bd6`). Saiu do código, mas **continua no histórico do git** → trocar a senha.
2. Chave **anon/publishable** no `.env` (commit `d3d08ba`). O JWT tem `role = anon`: é uma chave pública por definição. Rotacionar é opcional.
3. **Nenhuma chave `service_role`** no front-end nem no histórico.

## npm audit: o que não foi corrigido e por quê
O `npm audit fix` rodou sem `--force`. As vulnerabilidades restantes só se resolvem com uma **versão major**:
- `zod` (alta, produção): correção só na v4 (API diferente). Impacto baixo aqui, porque os schemas validam campos de texto com tamanho máximo.
- `react-router-dom`/`react-router` (moderadas, produção): correção na v7 (migração de rotas). O "open redirect" exige links montados com entrada do usuário, e o site não faz isso.
- `drizzle-kit` + `esbuild`/`@esbuild-kit` (moderadas, só desenvolvimento): o "fix" proposto **rebaixa** para 0.18.1. O primeiro `audit fix` fez exatamente isso (0.31 → 0.18) e trouxe pacotes antigos (`es5-ext`). Revertemos e fixamos `^0.31.11`.
- `@tailwindcss/typography` → `postcss-selector-parser` (moderadas, só build): o "fix" também é rebaixar de versão.
- `brace-expansion` (alta, só desenvolvimento): dependência de ferramentas de desenvolvimento.

## Wapiti: o que depende da hospedagem
O Vite só envia os cabeçalhos em `npm run dev` e `npm run preview`. **O site publicado precisa enviar os mesmos cabeçalhos pela hospedagem** (Lovable/Netlify/Vercel/Nginx): o valor está em `securityHeaders.ts` (`cabecalhosDeSeguranca({ dev: false })`). Além disso:
- `Strict-Transport-Security` (HSTS), que só faz sentido em HTTPS. O módulo SSL do Wapiti foi pulado (`sslscan` ausente).
- Redirecionamento HTTP → HTTPS e certificado TLS.
- Se a hospedagem não permitir cabeçalhos, `frame-ancestors` e `X-Frame-Options` **não funcionam via `<meta>`**.

## Pendências que dependem de você
1. **Push** (não foi feito): `git push origin feature/mobile-app`. Depois do push, o CodeQL roda. Instale o `gh` e liste os alertas com o comando que está em `depois/etapa6-codeql.txt`.
2. **Migrations na nuvem** (preciso da sua autorização): `20261125120000_password_changed_at.sql` e `20261125130000_pgcrypto_cpf.sql`. Para o pgcrypto, definir `app.chave_cpf` no banco do Supabase pelo painel, nunca no repositório. Até lá, a regra dos 90 dias **não bloqueia ninguém** (o hook não acha a coluna e libera o acesso).
3. **Lovable e o `.env`**: o `.env` saiu do git. Se o Lovable precisar dele para publicar, configure as variáveis no painel do Lovable.
4. **Trocar a senha** da conta de administrador (item 1 da lista de segredos).
5. **Painel do Supabase/Lovable (Auth)**: ativar a política de senha forte e a proteção contra senhas vazadas também no servidor, e conferir a URL `/redefinir-senha` em *Redirect URLs*.
6. **Prints de e-mail**: tirar print do e-mail de redefinição de senha recebido (o envio real é feito pelo servidor do Supabase).
7. **Datadog**: não fazia parte desta tarefa e não foi configurado.
8. **Rodar com Docker** quando possível: `docker compose up -d` e `supabase start`, depois repetir o sqlmap contra `http://localhost:54321/rest/v1/...` com a chave anon local (`SUPABASE_ANON_KEY_LOCAL`).

## Como reproduzir
```powershell
npm ci
npm test
node scripts/seguranca/testar-troca-periodica.mjs
node scripts/seguranca/testar-pgcrypto-rls.mjs
powershell -File scripts/seguranca/segredos-no-historico.ps1
powershell -File scripts/seguranca/varreduras.ps1 -Etapa depois -Wapiti <wapiti.exe> -Sqlmap <sqlmap.exe>
```
