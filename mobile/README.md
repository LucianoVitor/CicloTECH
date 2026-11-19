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
│   ├── (tabs)/               # Abas (como no protótipo mobile)
│   │   ├── index.tsx         # Início: hero/carrossel, categorias, nosso impacto, links institucionais
│   │   ├── doacoes.tsx       # Vitrine de doações (dados fictícios da Web + suas doações reais)
│   │   ├── trocas.tsx        # Trocas peer-to-peer (dados fictícios da Web)
│   │   └── perfil.tsx        # Perfil (tabela profiles), atalhos e logout
│   ├── meus-equipamentos.tsx # Seus equipamentos no Supabase (listar, doar, excluir)
│   ├── minhas-doacoes.tsx    # Suas doações no Supabase (status, cancelar)
│   ├── favoritos.tsx         # Itens marcados com o coração (salvos no aparelho)
│   ├── como-doar.tsx · impacto.tsx · sobre.tsx · faq.tsx   # Páginas institucionais da Web
│   └── equipamento/novo.tsx  # Cadastro de equipamento (modal)
└── src/
    ├── data/conteudo.ts      # TODO o conteúdo fictício da Web (textos, catálogos, métricas, FAQ)
    ├── lib/supabase.ts       # Cliente único (sessão no AsyncStorage)
    ├── types/database.ts     # Tipos gerados do banco (cópia dos tipos da Web)
    ├── services/             # Serviços CRUD tipados: Equipamentos, Doacoes, Perfil
    ├── hooks/useAuth.tsx     # Contexto de autenticação
    ├── components/ui.tsx     # Design system: Screen (grade), Button, Input, Chip, Badge, Card...
    ├── lib/                  # erros (mensagens legíveis), dialogo (alertas multiplataforma), catalogo
    └── theme/colors.ts       # Tokens da Web: fundo #030712, azul neon #3B82F6, Space Grotesk + Geist Mono
```

## Supabase

- Tabelas usadas: `equipamentos`, `doacoes` (FK composta `equipamento_id + user_id` com `ON DELETE CASCADE`) e `profiles`.
- Toda consulta passa pelas políticas RLS: cada usuário só vê/edita os próprios registros.
- Use apenas a chave **publishable/anon** no app. Nunca coloque a `service_role` em código mobile.
- Ao mudar o esquema, regenere `src/types/database.ts`:
  `npx supabase gen types typescript --project-id <PROJECT_ID> > src/types/database.ts`
