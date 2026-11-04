# CicloTECH Mobile

App React Native (Expo SDK 58 + Expo Router) do CicloTECH. Usa o **mesmo projeto Supabase** da aplicação Web da raiz, mas é um projeto independente: tem seu próprio `package.json` e `node_modules`.

## Como rodar

```bash
cd mobile
npm install
cp .env.example .env   # preencha com os mesmos valores de VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY
npm start              # abra no Expo Go (QR code), emulador Android (a) ou iOS (i)
```

`npm run typecheck` roda a checagem de tipos.

## Estrutura

```
mobile/
├── app/                      # Rotas (Expo Router, baseado em arquivos)
│   ├── _layout.tsx           # Tema escuro, AuthProvider, rotas protegidas por sessão
│   ├── login.tsx             # Login / cadastro (Supabase Auth)
│   ├── (tabs)/               # Abas visíveis após login
│   │   ├── index.tsx         # Equipamentos (listar, doar, excluir)
│   │   ├── doacoes.tsx       # Doações do usuário
│   │   └── perfil.tsx        # Perfil (tabela profiles) e logout
│   └── equipamento/novo.tsx  # Cadastro de equipamento (modal)
└── src/
    ├── lib/supabase.ts       # Cliente único (sessão no AsyncStorage)
    ├── types/database.ts     # Tipos gerados do banco (cópia dos tipos da Web)
    ├── services/             # Serviços CRUD tipados: Equipamentos, Doacoes, Perfil
    ├── hooks/useAuth.tsx     # Contexto de autenticação
    ├── components/ui.tsx     # Screen, Button, Input, Card...
    └── theme/colors.ts       # Paleta: fundo #000000, destaque #FF003C
```

## Supabase

- Tabelas usadas: `equipamentos`, `doacoes` (FK composta `equipamento_id + user_id` com `ON DELETE CASCADE`) e `profiles`.
- Toda consulta passa pelas políticas RLS: cada usuário só vê/edita os próprios registros.
- Use apenas a chave **publishable/anon** no app. Nunca coloque a `service_role` em código mobile.
- Ao mudar o esquema, regenere `src/types/database.ts`:
  `npx supabase gen types typescript --project-id <PROJECT_ID> > src/types/database.ts`
