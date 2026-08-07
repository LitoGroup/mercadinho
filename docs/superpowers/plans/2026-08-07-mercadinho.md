# Mercadinho Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Sistema interno de compras: admin cadastra produtos com IA (foto+EAN), clientes compram via PIX fixo + comprovante, admin confere pedidos no mês.

**Architecture:** Next.js App Router (Vercel) com server actions; Supabase para Postgres (RLS + funções transacionais), Auth (admin cria usuários) e Storage (fotos públicas, comprovantes privados); IA de visão via Vercel AI Gateway.

**Tech Stack:** Next.js 16 (TS, Tailwind v4), @supabase/ssr + @supabase/supabase-js, ai (AI SDK v6 via Gateway), qrcode, @zxing/browser, Vitest.

## Global Constraints

- Idioma da UI: **pt-BR**. Moeda: R$ (valores em `*_cents` inteiros).
- Todas as checagens de papel/autorização acontecem **no servidor** (layouts/actions), nunca só na UI.
- Mobile-first: telas usáveis em celular (câmera é essencial no admin).
- Sem auto-cadastro; login apenas email/senha via Supabase Auth.
- Env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `AI_GATEWAY_API_KEY` (documentadas em `.env.example`).
- Commits frequentes, mensagens `feat:/fix:/docs:` em português.

---

### Task 1: Scaffold do projeto

**Files:**
- Create: projeto Next.js na raiz (via `create-next-app`), `vitest.config.ts`, `.env.example`

**Interfaces:**
- Produces: projeto compilável com `npm run build`, testes com `npx vitest run`.

- [ ] **Step 1:** `npx create-next-app@latest . --ts --tailwind --app --no-src-dir --eslint --turbopack --yes` (diretório já tem git; usar `--yes` e aceitar merge)
- [ ] **Step 2:** `npm i @supabase/ssr @supabase/supabase-js ai qrcode @zxing/browser && npm i -D vitest @types/qrcode`
- [ ] **Step 3:** Criar `vitest.config.ts` (ambiente node, include `lib/**/*.test.ts`) e script `"test": "vitest run"` no package.json.
- [ ] **Step 4:** Criar `.env.example` com as 4 env vars do Global Constraints.
- [ ] **Step 5:** `npm run build` passa → commit `feat: scaffold Next.js + deps`.

### Task 2: Lib PIX (BR Code estático) — TDD

**Files:**
- Create: `lib/pix.ts`, `lib/pix.test.ts`, `lib/format.ts`

**Interfaces:**
- Produces: `buildPixPayload({key, merchantName, merchantCity}): string`; `crc16(payload: string): string`; `formatCents(cents: number): string` ("R$ 12,34").

- [ ] **Step 1: Teste falhando** (`lib/pix.test.ts`):

```ts
import { describe, expect, it } from 'vitest'
import { buildPixPayload, crc16 } from './pix'

describe('crc16', () => {
  it('calcula CRC16-CCITT de payload conhecido', () => {
    expect(crc16('12345678')).toBe('3C9D')
  })
})

describe('buildPixPayload', () => {
  const payload = buildPixPayload({ key: 'pix@empresa.com', merchantName: 'LitoGroup', merchantCity: 'SAO PAULO' })
  it('começa com Payload Format Indicator e termina com CRC', () => {
    expect(payload.startsWith('000201')).toBe(true)
    expect(payload).toMatch(/6304[0-9A-F]{4}$/)
  })
  it('contém chave, nome e cidade', () => {
    expect(payload).toContain('pix@empresa.com')
    expect(payload).toContain('LitoGroup')
    expect(payload).toContain('SAO PAULO')
  })
  it('CRC confere', () => {
    const body = payload.slice(0, -4)
    expect(payload.slice(-4)).toBe(crc16(body))
  })
})
```

- [ ] **Step 2:** `npx vitest run` → FAIL (módulo inexistente).
- [ ] **Step 3: Implementação** (`lib/pix.ts`): TLV EMV (`emv(id, value)` = id + length 2 dígitos + value), campos: `000201`, `26` (GUI `br.gov.bcb.pix` + chave), `52040000`, `5303986`, `5802BR`, `59` nome (≤25 chars), `60` cidade (≤15), `62` com `0503***`, `6304` + CRC16-CCITT (poly 0x1021, init 0xFFFF, sobre payload incluindo `6304`).
- [ ] **Step 4:** `npx vitest run` → PASS.
- [ ] **Step 5:** `lib/format.ts` com `formatCents` (Intl.NumberFormat pt-BR BRL). Commit `feat: payload PIX estático com testes`.

### Task 3: Supabase — migração, clients, middleware

**Files:**
- Create: `supabase/migrations/0001_schema.sql`, `lib/supabase/client.ts`, `lib/supabase/server.ts`, `lib/supabase/admin.ts`, `middleware.ts`, `lib/types.ts`

**Interfaces:**
- Produces: `createClient()` (browser), `createServerSupabase()` (RSC/actions, cookies), `createAdminClient()` (service role); tipos `Profile`, `Product`, `Order`, `OrderItem`, `Settings`; SQL functions `create_order(p_items jsonb, p_receipt_path text) returns uuid` e `review_order(p_order_id uuid, p_approve boolean, p_note text)`.

- [ ] **Step 1: SQL** — tabelas conforme spec (`profiles`, `products`, `orders`, `order_items`, `settings`), trigger `handle_new_user` criando profile a partir de `auth.users` (metadata `name`, `role`), RLS:
  - helper `is_admin()` (`security definer`, checa `profiles.role='admin' and active`)
  - products: SELECT `active=true` p/ autenticado OR `is_admin()`; INSERT/UPDATE/DELETE `is_admin()`
  - orders/order_items: SELECT `user_id=auth.uid()` OR admin; UPDATE admin; INSERT negado (só via função)
  - profiles: SELECT próprio OR admin; UPDATE admin
  - settings: SELECT autenticado; UPDATE admin; seed 1 linha vazia
  - `create_order` (security definer): valida usuário ativo, para cada item `update products set stock = stock - qty where id=... and stock >= qty and active` senão raise; insere order (total calculado dos preços atuais) + items snapshot; retorna id
  - `review_order` (security definer): exige admin; status `pending`→`approved|rejected`; se rejeitado devolve estoque; grava note/reviewed_by/reviewed_at
  - buckets `products` (público) e `receipts` (privado) via `insert into storage.buckets`; policies: receipts INSERT p/ autenticado com prefixo `auth.uid()/`, SELECT dono ou admin; products SELECT público, write admin
- [ ] **Step 2:** Clients padrão `@supabase/ssr` (browser/server com cookies; admin com service role, `persistSession:false`).
- [ ] **Step 3:** `middleware.ts`: refresh de sessão; sem sessão → redirect `/login` (exceto `/login` e assets).
- [ ] **Step 4:** `npm run build` passa. Commit `feat: schema Supabase + clients + middleware`.

### Task 4: Autenticação e guards

**Files:**
- Create: `app/login/page.tsx`, `app/actions/auth.ts`, `lib/auth.ts`

**Interfaces:**
- Produces: `requireUser()` → `{user, profile}` (redirect `/login` se ausente; bloqueia `active=false` com signOut); `requireAdmin()` → idem + redirect `/` se não-admin; action `signIn(formData)`, `signOut()`.

- [ ] **Step 1:** `lib/auth.ts` com os dois helpers (server-only, usa `createServerSupabase`).
- [ ] **Step 2:** `/login`: form email/senha (server action `signIn` → `supabase.auth.signInWithPassword`, erro em pt-BR via searchParams), redirect por papel (admin → `/admin/pedidos`, cliente → `/`).
- [ ] **Step 3:** Build + commit `feat: login e guards de papel`.

### Task 5: Catálogo + carrinho (cliente)

**Files:**
- Create: `components/cart-provider.tsx`, `components/product-card.tsx`, `components/shop-header.tsx`, `app/(shop)/layout.tsx`, `app/(shop)/page.tsx`, `app/(shop)/carrinho/page.tsx`
- Modify: `app/layout.tsx` (metadata pt-BR, CartProvider)

**Interfaces:**
- Produces: contexto `useCart()` → `{items: {productId, name, priceCents, qty, imageUrl}[], add, remove, setQty, clear, totalCents}` persistido em `localStorage("mercadinho-cart")`.
- Consumes: `requireUser`, `formatCents`, tipos Task 3.

- [ ] **Step 1:** CartProvider (client, hidrata do localStorage, grava a cada mudança).
- [ ] **Step 2:** Layout shop: `requireUser()`, header com nome, link Pedidos, badge do carrinho, sair.
- [ ] **Step 3:** Catálogo: RSC busca products ativos com estoque>0 (`?q=` busca por nome/categoria via `ilike`), grid de cards com foto (public URL), preço, botão adicionar (respeita estoque máx).
- [ ] **Step 4:** Carrinho: lista, ajustar qty, remover, total, CTA "Finalizar compra" → `/checkout`.
- [ ] **Step 5:** Build + commit `feat: catálogo e carrinho`.

### Task 6: Checkout com PIX + comprovante

**Files:**
- Create: `app/(shop)/checkout/page.tsx`, `components/checkout-form.tsx`, `app/actions/orders.ts`

**Interfaces:**
- Consumes: `useCart`, `buildPixPayload`, `create_order` RPC.
- Produces: action `placeOrder(formData)` — valida comprovante (pdf/jpg/png ≤10MB), upload `receipts/{userId}/{uuid}.{ext}`, chama `supabase.rpc('create_order', {p_items, p_receipt_path})`, retorna `{ok}` ou `{error}` pt-BR.

- [ ] **Step 1:** Page (RSC): lê `settings`; se chave PIX vazia mostra aviso "PIX não configurado"; gera QR data URL com `qrcode` a partir de `buildPixPayload`.
- [ ] **Step 2:** CheckoutForm (client): resumo do carrinho, QR, chave PIX com botão copiar, input file obrigatório, submit → `placeOrder`; sucesso limpa carrinho e redireciona `/pedidos?sucesso=1`; erro de estoque exibe mensagem.
- [ ] **Step 3:** Build + commit `feat: checkout PIX com comprovante`.

### Task 7: Histórico de pedidos (cliente)

**Files:**
- Create: `app/(shop)/pedidos/page.tsx`, `components/order-status-badge.tsx`, `lib/orders.ts`

**Interfaces:**
- Produces: `getReceiptUrl(path)` (server, signed URL 60s); badge por status (pending=Aguardando conferência/amarelo, approved=Aprovado/verde, rejected=Rejeitado/vermelho + nota).

- [ ] **Step 1:** RSC lista orders do usuário (RLS) com items, data pt-BR, total, link comprovante, nota de rejeição.
- [ ] **Step 2:** Build + commit `feat: histórico de pedidos`.

### Task 8: Admin — layout, produtos e IA

**Files:**
- Create: `app/admin/layout.tsx`, `app/admin/page.tsx` (redirect pedidos), `app/admin/produtos/page.tsx`, `app/admin/produtos/novo/page.tsx`, `app/admin/produtos/[id]/page.tsx`, `components/product-form.tsx`, `components/barcode-scanner.tsx`, `components/photo-capture.tsx`, `app/actions/products.ts`, `app/api/ai/describe-product/route.ts`

**Interfaces:**
- Produces: `saveProduct(formData)` (create/update: upload foto → bucket products, campos name/description/category/price/stock/ean/active); `POST /api/ai/describe-product` body `{imageBase64?, mediaType?, ean?}` → `{name, description, category}` (admin-only; 502 em falha).
- `BarcodeScanner({onResult})` (client, @zxing/browser, câmera traseira); `PhotoCapture({onCapture})` (input `capture="environment"` + preview, comprime p/ ≤1024px via canvas).

**IA:** Open Food Facts `https://world.openfoodfacts.org/api/v2/product/{ean}.json` (timeout 3s, best-effort) + `generateText` do pacote `ai` com model string `"anthropic/claude-sonnet-5"`, mensagem com imagem + contexto, instrução para responder **somente JSON** `{name, description, category}` em pt-BR (descrição 1-2 frases, tom simpático de mercadinho); parse defensivo.

- [ ] **Step 1:** Layout admin (`requireAdmin`, nav: Pedidos · Produtos · Usuários · Config).
- [ ] **Step 2:** Lista de produtos (tabela: foto, nome, preço, estoque, ativo, editar).
- [ ] **Step 3:** ProductForm com scanner EAN + foto + botão "Gerar com IA" (chama a rota, preenche campos editáveis) + preço em reais (converte p/ cents) + estoque.
- [ ] **Step 4:** Rota IA + action saveProduct. Build + commit `feat: admin produtos com IA`.

### Task 9: Admin — conferência de pedidos

**Files:**
- Create: `app/admin/pedidos/page.tsx`, `app/admin/pedidos/[id]/page.tsx`, `components/review-buttons.tsx`
- Modify: `app/actions/orders.ts` (adicionar `reviewOrder`)

**Interfaces:**
- Produces: `reviewOrder(orderId, approve, note)` → RPC `review_order`; página lista com `?mes=YYYY-MM&status=` (default mês atual, todos os status), soma `total_cents` filtrado, contagem por status.

- [ ] **Step 1:** Lista com filtros (select mês — últimos 12, select status), linhas: data, cliente (profiles.name), total, status, link detalhe.
- [ ] **Step 2:** Detalhe: itens, total, comprovante (signed URL, botão abrir), aprovar/rejeitar (nota obrigatória ao rejeitar — validar na action).
- [ ] **Step 3:** Build + commit `feat: conferência de pedidos`.

### Task 10: Admin — usuários e configurações

**Files:**
- Create: `app/admin/usuarios/page.tsx`, `components/user-form.tsx`, `app/actions/users.ts`, `app/admin/config/page.tsx`, `app/actions/settings.ts`

**Interfaces:**
- Produces: `createUser({name,email,password,role})` via `createAdminClient().auth.admin.createUser` (`email_confirm:true`, metadata name/role); `setUserActive(id, active)` (bloqueia desativar a si mesmo); `saveSettings(formData)` (pix_key, pix_key_type, merchant_name, merchant_city).

- [ ] **Step 1:** Usuários: tabela (nome, email via admin API, papel, ativo), form de criação com senha temporária, toggle ativo.
- [ ] **Step 2:** Config: form settings + preview do QR gerado.
- [ ] **Step 3:** Build + commit `feat: admin usuários e config PIX`.

### Task 11: Integração — Supabase real, verificação e push

- [ ] **Step 1:** Provisionar Supabase (MCP autorizado ou keys do usuário); aplicar `0001_schema.sql`; criar primeiro admin via script/admin API; `.env.local`.
- [ ] **Step 2:** `npm run build` + `npx vitest run` verdes; smoke test dos fluxos no preview browser (login, produto novo, compra, conferência).
- [ ] **Step 3:** Push `main` para `github.com/LitoGroup/mercadinho`; instruções de deploy Vercel (envs) no README.
- [ ] **Step 4:** Commit final `docs: README com setup e deploy`.
