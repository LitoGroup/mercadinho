# Mercadinho — Sistema interno de compras

**Data:** 2026-08-07 · **Status:** Aprovado pelo usuário

## Objetivo

Sistema de compras online para uso interno da empresa (LitoGroup). Um admin
cadastra produtos com ajuda de IA (foto + código de barras → descrição
gerada); funcionários compram via carrinho, pagam por PIX (QR fixo da
empresa) e enviam comprovante; o admin confere os comprovantes contra os
pedidos no fim do mês.

## Decisões de produto (confirmadas com o usuário)

| Decisão | Escolha |
|---|---|
| Escaneamento de produto | Foto **e** código de barras (EAN); IA de visão gera nome/descrição; admin revisa antes de salvar |
| Pagamento | QR code PIX **fixo** da empresa (gerado da chave PIX configurada); cliente digita o valor no banco |
| Contas | **Admin cria os usuários** (sem auto-cadastro) |
| Stack | Next.js (App Router) na Vercel + Supabase (Postgres, Auth, Storage) + IA via Vercel AI Gateway (Claude) |

## Papéis

- **admin** — gerencia produtos, usuários, configurações (chave PIX) e confere pedidos.
- **cliente** — navega no catálogo, compra, envia comprovante, vê histórico próprio.

Papel guardado em `profiles.role`. Rotas `/admin/*` exigem `role = 'admin'`
(verificado no servidor, não só na UI).

## Fluxos

### Lançamento de produto (admin)
1. `/admin/produtos/novo`: câmera do dispositivo lê EAN (leitor no browser) e captura foto.
2. Server route envia foto (+ EAN + dados do Open Food Facts, se achar) ao Claude (visão) via AI Gateway → retorna `{name, description, category}` em JSON.
3. Admin revisa/edita nome, descrição, categoria; define preço (centavos) e estoque; salva.
4. Foto vai para bucket público `products`; registro criado em `products`.

### Compra (cliente)
1. Catálogo (`/`) com busca por nome/categoria; só produtos `active` com estoque.
2. Carrinho persistido em `localStorage`.
3. Checkout:
   - Mostra total + QR PIX estático (BR Code sem valor, gerado da chave em `settings`) + botão "copiar chave PIX".
   - Upload obrigatório do comprovante (PDF/JPG/PNG, máx 10 MB) → bucket privado `receipts`.
   - Cria `orders` (status `pending`) + `order_items` com preço congelado; decrementa estoque atomicamente (falha se insuficiente).
4. `/pedidos`: histórico do cliente com status e link para o próprio comprovante.

### Conferência (admin)
1. `/admin/pedidos`: filtro por mês e status; soma total do período filtrado.
2. Detalhe do pedido: itens, valores, comprovante via signed URL (60 s).
3. Ações: **aprovar** ou **rejeitar** (observação obrigatória ao rejeitar). Rejeição devolve o estoque. Registra `reviewed_by`/`reviewed_at`.

### Gestão de usuários (admin)
- `/admin/usuarios`: lista, cria (nome, email, senha temporária, papel) via
  Supabase Admin API (service role, só no servidor), desativa usuário.

## Modelo de dados (Postgres/Supabase)

- `profiles` — `id uuid PK → auth.users`, `name`, `role ('admin'|'customer')`, `active bool`, timestamps.
- `products` — `id`, `ean text null`, `name`, `description`, `category`, `price_cents int`, `stock int`, `image_path`, `active bool`, `created_by`, timestamps.
- `orders` — `id`, `user_id`, `status ('pending'|'approved'|'rejected')`, `total_cents`, `receipt_path`, `review_note`, `reviewed_by`, `reviewed_at`, `created_at`.
- `order_items` — `id`, `order_id`, `product_id`, `product_name` (snapshot), `unit_price_cents` (snapshot), `quantity`.
- `settings` — linha única: `pix_key`, `pix_key_type`, `merchant_name`, `merchant_city`.

Criação de pedido via função SQL `create_order(...)` (transacional: valida
estoque, decrementa, insere pedido + itens). Reversão de estoque via função
`review_order(...)`.

### RLS
- `products`: SELECT para autenticados (`active`); tudo para admin.
- `orders`/`order_items`: SELECT do próprio usuário; tudo para admin; INSERT só via função (security definer).
- `profiles`: SELECT próprio; tudo para admin.
- `settings`: SELECT autenticado; UPDATE admin.
- Storage: `products` público (write admin); `receipts` privado (write dono no próprio prefixo `user_id/`, read dono + admin).

## IA

- Rota `/api/ai/describe-product` (server): recebe imagem (base64) + EAN opcional.
- Busca Open Food Facts por EAN (best-effort, timeout curto).
- Chama AI Gateway com string `"anthropic/claude-sonnet-5"` (visão) pedindo JSON estruturado `{name, description, category}` em pt-BR, tom de mercadinho.
- Falha da IA não bloqueia o cadastro: admin pode preencher manualmente.

## PIX

- BR Code estático (EMV) gerado no servidor a partir de `settings` (chave, nome, cidade) — payload sem valor, com CRC16; renderizado como QR (lib `qrcode`).
- Lógica do payload coberta por testes unitários (CRC e campos EMV).

## Erros e casos-limite

- Estoque insuficiente no checkout → erro claro, carrinho ajustável.
- Comprovante ausente/tipo inválido/grande demais → bloqueia finalização.
- Usuário desativado → login bloqueado (checagem em `profiles.active` no middleware/layout).
- IA indisponível → formulário de produto continua utilizável manualmente.

## Testes

- Unitários (Vitest): payload PIX/CRC16, cálculo de totais, validação de checkout.
- Verificação manual dos fluxos via preview browser.

## Fora do escopo (v1)

Confirmação automática de pagamento, notificações por email, relatórios
exportáveis, edição de pedido após envio, multi-empresa.
