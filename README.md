# 🛒 Mercadinho

Sistema de compras online para uso **interno da empresa**:

- **Admin** cadastra produtos escaneando o código de barras e tirando foto — a **IA gera nome e descrição** automaticamente (revisáveis antes de salvar).
- **Funcionários** montam o carrinho, pagam via **PIX** (QR code fixo da empresa) e **enviam o comprovante** (PDF ou imagem).
- O pedido fica no **histórico do usuário** e no **painel do admin**, que confere comprovante × valores no fim do mês (aprova/rejeita com observação; rejeição devolve o estoque).

**Stack:** Next.js (App Router) · Supabase (Postgres + Auth + Storage) · Vercel AI Gateway (Claude com visão) · Tailwind CSS.

## Setup

### 1. Supabase

1. Crie um projeto em [supabase.com](https://supabase.com).
2. No **SQL Editor**, execute o conteúdo de [`supabase/migrations/0001_schema.sql`](supabase/migrations/0001_schema.sql) (cria tabelas, RLS, funções e buckets).
3. Em **Project Settings → API**, copie a URL, a chave `anon` e a `service_role`.

### 2. Variáveis de ambiente

```bash
cp .env.example .env.local
```

Preencha:

| Variável | Onde obter |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API (⚠️ secreta) |
| `AI_GATEWAY_API_KEY` | [Vercel AI Gateway](https://vercel.com/docs/ai-gateway) |

### 3. Primeiro admin

```bash
node scripts/create-admin.mjs "Seu Nome" voce@empresa.com suasenha
```

### 4. Rodar

```bash
npm install
npm run dev
```

Entre com o admin criado, configure a **chave PIX** em *Admin → Config* e cadastre os usuários em *Admin → Usuários*.

## Deploy (Vercel)

1. Importe o repositório na [Vercel](https://vercel.com/new).
2. Adicione as 4 variáveis de ambiente acima (a `AI_GATEWAY_API_KEY` é criada automaticamente se você ativar o AI Gateway no projeto).
3. Deploy. ✅

## Testes

```bash
npm test
```

Cobrem o payload PIX (BR Code/CRC16) e formatação.

## Estrutura

- `app/(shop)/` — catálogo, carrinho, checkout, pedidos (cliente)
- `app/admin/` — pedidos, produtos, usuários, config (admin)
- `app/actions/` — server actions (auth, orders, products, users, settings)
- `app/api/ai/describe-product/` — geração de descrição com IA (visão)
- `supabase/migrations/` — schema completo com RLS e funções transacionais
- `lib/pix.ts` — gerador de BR Code PIX estático (testado)
