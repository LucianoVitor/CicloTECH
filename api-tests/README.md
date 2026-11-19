# CicloTECH — Testes do back-end

O back-end do CicloTECH é o **Supabase**: autenticação (`/auth/v1`) e uma API REST gerada a partir do
banco PostgreSQL (`/rest/v1`), protegida por **RLS** (Row Level Security — cada usuário só acessa os próprios dados).

## Opção 1 — Testar as rotas no VS Code (REST Client)

1. Instale a extensão **REST Client** (`humao.rest-client`), se ainda não tiver.
2. Copie `api-tests/.env.example` para `api-tests/.env` e preencha:
   - `SUPABASE_URL` e `SUPABASE_ANON_KEY`: os mesmos valores de `VITE_SUPABASE_URL` / `VITE_SUPABASE_PUBLISHABLE_KEY` do `.env` da raiz;
   - `TEST_EMAIL` / `TEST_PASSWORD`: uma **conta de teste** (não use a sua conta pessoal).
3. Abra `api-tests/ciclotech.http` e clique em **Send Request** acima de cada bloco.
   - Rode primeiro **1.1 (cadastro, uma vez)** e **1.2 (login)**: o token gerado é usado por todos os outros testes.
   - Rode a seção 2 **na ordem** (2.1 cria o equipamento que 2.3, 2.5 e a seção 3 usam).

## O que cada seção demonstra

| Seção | Rotas | O que prova |
|---|---|---|
| 1. Autenticação | `POST /auth/v1/signup`, `/token`, `GET /auth/v1/user` | Login gera JWT; senha errada → 400; token adulterado → 403 |
| 2. Equipamentos | `GET/POST/PATCH/DELETE /rest/v1/equipamentos` | CRUD completo, filtros, validação (`not null` → 400) e **RLS**: sem login não vê nada, não cria, e não cria em nome de outro usuário |
| 3. Doações | `/rest/v1/doacoes` | JOIN com equipamentos, **chave estrangeira** (equipamento inexistente → 409) e **exclusão em cascata** (apagar o equipamento apaga a doação) |
| 4. Perfil e papéis | `/rest/v1/profiles`, `/user_roles`, `POST /rest/v1/rpc/has_role` | Perfil criado por **trigger**; usuário comum **não consegue se promover a admin** |
| 5. Feedback | `/rest/v1/feedback`, view `public_feedback` | Restrição `CHECK` (nota de 1 a 5) e um **bug conhecido** (abaixo) |
| 6. Logout | `POST /auth/v1/logout` | Invalida o token |

Códigos de erro do PostgreSQL que aparecem nas respostas: `23502` campo obrigatório, `23503` chave estrangeira,
`23514` restrição CHECK, `42501` permissão negada (RLS/GRANT).

## Achados verificados em 05/11/2026 (banco antigo do Lovable Cloud)

> Os itens 1 e 2 estão **corrigidos** em `supabase/recriar-banco.sql`, junto com um terceiro defeito:
> a função `has_role` tinha a execução revogada para usuários logados, o que fazia a leitura do próprio
> perfil falhar com `permission denied for function has_role`.

1. **Bug — avaliações públicas exigem login.** `GET /rest/v1/public_feedback` sem login responde
   `401 permission denied for table feedback`. A view consulta a tabela `feedback`, mas visitantes (`anon`) só têm
   permissão em algumas colunas dela. Resultado provável: as avaliações do FAQ não aparecem para quem não está logado.
2. **Risco de segurança — trigger `auto_admin_dev`.** A migração `20260428115645_...sql` dá papel de **admin** a quem
   se cadastrar com `admin@ciclotech.dev`, sem verificar se a pessoa é dona do e-mail. Se a confirmação de e-mail
   estiver desligada no painel do Supabase, qualquer um vira admin. Recomendação: remover esse trigger em produção.
   (Não foi testado de propósito, para não criar contas no banco real.)

## Opção 2 — Testes automatizados do serviço de equipamentos (Vitest)

Na raiz do projeto:

```bash
npm install
npm test
```

Roda `src/services/EquipamentosService.test.ts` (testes de unidade do CRUD, sem acessar o banco real).
