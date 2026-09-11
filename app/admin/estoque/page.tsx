import Link from 'next/link'
import { StockControls } from '@/components/stock-controls'
import { formatCents, formatDate } from '@/lib/format'
import { createServerSupabase } from '@/lib/supabase/server'
import type { Product } from '@/lib/types'

interface Movement {
  id: string
  delta: number
  stock_after: number
  created_at: string
  products: { name: string } | null
  profiles: { name: string } | null
}

export default async function AdminStockPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; situacao?: string }>
}) {
  const { q, situacao } = await searchParams
  const supabase = await createServerSupabase()

  // Ordem alfabética, não por saldo. Ordenar por saldo fazia a linha pular de
  // lugar assim que você somava 1 — a lista fugia do dedo no meio da reposição.
  let query = supabase.from('products').select('*').order('name')
  if (q) query = query.ilike('name', `%${q}%`)
  const { data } = await query
  const todos = (data ?? []) as Product[]

  // 43 dos 98 produtos ativos estão zerados e 51 acabando: a tela abre pelo
  // que precisa de reposição, não por uma lista alfabética de tudo.
  const aba = situacao === 'acabando' || situacao === 'todos' ? situacao : 'zerados'
  const products =
    aba === 'todos'
      ? todos
      : aba === 'zerados'
        ? todos.filter((p) => p.active && p.stock === 0)
        : todos.filter((p) => p.active && p.stock > 0 && p.stock <= 5)

  const { data: movementsData, error: movementsError } = await supabase
    .from('stock_movements')
    .select('id, delta, stock_after, created_at, products(name), profiles:changed_by(name)')
    .order('created_at', { ascending: false })
    .limit(15)
  const movements = (movementsData ?? []) as unknown as Movement[]

  const totalItens = todos.reduce((sum, p) => sum + p.stock, 0)
  const valorEstoque = todos.reduce((sum, p) => sum + p.stock * p.price_cents, 0)
  const acabando = todos.filter((p) => p.active && p.stock > 0 && p.stock <= 5).length
  const zerados = todos.filter((p) => p.active && p.stock === 0).length
  const ativos = todos.filter((p) => p.active).length
  const buscaAtual = q ? `&q=${encodeURIComponent(q)}` : ''

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold text-texto">Controle de estoque</h1>

      <div className="mb-4 grid grid-cols-2 gap-3 text-center sm:grid-cols-4">
        <div className="rounded-xl border border-texto/8 bg-white p-3 shadow-sm">
          <p className="text-xs text-texto/50">Itens em estoque</p>
          <p className="text-lg font-bold text-texto">{totalItens}</p>
        </div>
        <div className="rounded-xl border border-texto/8 bg-white p-3 shadow-sm">
          <p className="text-xs text-texto/50">Valor em estoque</p>
          <p className="text-lg font-bold text-azul">{formatCents(valorEstoque)}</p>
        </div>
        <div className="rounded-xl border border-texto/8 bg-white p-3 shadow-sm">
          <p className="text-xs text-texto/50">Acabando (≤5)</p>
          <p className="text-lg font-bold text-alerta">{acabando}</p>
        </div>
        <div className="rounded-xl border border-texto/8 bg-white p-3 shadow-sm">
          <p className="text-xs text-texto/50">Zerados</p>
          <p className="text-lg font-bold text-erro-escuro">{zerados}</p>
        </div>
      </div>

      <form className="mb-2.5">
        <input type="hidden" name="situacao" value={aba} />
        <input
          type="search"
          name="q"
          defaultValue={q ?? ''}
          placeholder="Buscar produto…"
          aria-label="Buscar produto"
          className="min-h-12 w-full rounded-xl border border-texto/10 bg-white px-4 shadow-sm focus:border-azul focus:outline-none sm:max-w-xs"
        />
      </form>

      <div className="mb-3 flex gap-1.5">
        <AbaEstoque
          href={`/admin/estoque?situacao=zerados${buscaAtual}`}
          ativo={aba === 'zerados'}
          rotulo={`Zerados ${zerados}`}
        />
        <AbaEstoque
          href={`/admin/estoque?situacao=acabando${buscaAtual}`}
          ativo={aba === 'acabando'}
          rotulo={`Acabando ${acabando}`}
        />
        <AbaEstoque
          href={`/admin/estoque?situacao=todos${buscaAtual}`}
          ativo={aba === 'todos'}
          rotulo={`Todos ${ativos}`}
        />
      </div>

      {products.length === 0 ? (
        <p className="py-16 text-center text-texto/50">
          {q
            ? 'Nenhum produto encontrado nessa busca.'
            : aba === 'zerados'
              ? 'Nenhum produto zerado. Estoque em dia.'
              : aba === 'acabando'
                ? 'Nenhum produto acabando.'
                : 'Nenhum produto cadastrado ainda.'}
        </p>
      ) : (
        <>
          {/* Celular: cartões com os controles de estoque embaixo */}
          <ul className="space-y-3 sm:hidden">
            {products.map((p) => (
              <li
                key={p.id}
                className={`rounded-xl border border-texto/8 bg-white p-3 shadow-sm ${
                  p.active ? '' : 'opacity-60'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link
                      href={`/admin/produtos/${p.id}`}
                      className="block truncate font-medium text-texto"
                    >
                      {p.name}
                    </Link>
                    <p className="text-xs text-texto/40">
                      {formatCents(p.price_cents)}
                      {!p.active && ' · inativo'}
                      {p.active && p.stock === 0 && (
                        <span className="ml-1 font-semibold text-erro-escuro">· esgotado</span>
                      )}
                      {p.active && p.stock > 0 && p.stock <= 5 && (
                        <span className="ml-1 font-semibold text-alerta">· acabando</span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="mt-3 border-t border-texto/6 pt-3">
                  <StockControls productId={p.id} stock={p.stock} />
                </div>
              </li>
            ))}
          </ul>

          {/* Desktop: tabela */}
          <div className="hidden rounded-xl border border-texto/8 bg-white shadow-sm sm:block">
            <table className="w-full text-sm">
            <thead className="bg-cinza-claro text-left text-texto/50">
              <tr>
                <th className="p-3">Produto</th>
                <th className="p-3">Preço</th>
                <th className="p-3 text-right">Estoque</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-texto/5">
              {products.map((p) => (
                <tr key={p.id} className={p.active ? '' : 'opacity-50'}>
                  <td className="p-3">
                    <Link
                      href={`/admin/produtos/${p.id}`}
                      className="font-medium text-texto hover:underline"
                    >
                      {p.name}
                    </Link>
                    <p className="text-xs text-texto/40">
                      {p.category}
                      {!p.active && ' · inativo'}
                      {p.active && p.stock === 0 && (
                        <span className="ml-1 font-semibold text-erro-escuro">· esgotado</span>
                      )}
                      {p.active && p.stock > 0 && p.stock <= 5 && (
                        <span className="ml-1 font-semibold text-alerta">· acabando</span>
                      )}
                    </p>
                  </td>
                  <td className="p-3">{formatCents(p.price_cents)}</td>
                  <td className="p-3">
                    <StockControls productId={p.id} stock={p.stock} />
                  </td>
                </tr>
              ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <h2 className="mb-2 mt-6 font-semibold text-texto/80">Últimas movimentações</h2>
      {movementsError ? (
        <p className="rounded-xl bg-alerta/10 p-4 text-sm text-alerta">
          O histórico de movimentações precisa da migração{' '}
          <code className="font-mono">0002_estoque.sql</code> — rode o arquivo no SQL Editor do
          Supabase para ativá-lo.
        </p>
      ) : movements.length === 0 ? (
        <p className="rounded-xl border border-texto/8 bg-white p-4 text-sm text-texto/50 shadow-sm">
          Nenhuma movimentação registrada ainda.
        </p>
      ) : (
        <ul className="divide-y divide-texto/5 overflow-hidden rounded-xl border border-texto/8 bg-white shadow-sm">
          {movements.map((m) => (
            <li key={m.id} className="flex items-center justify-between gap-2 p-3 text-sm">
              <div>
                <span className="font-medium text-texto">{m.products?.name ?? 'Produto'}</span>
                <p className="text-xs text-texto/40">
                  {formatDate(m.created_at)}
                  {m.profiles?.name ? ` · ${m.profiles.name}` : ''}
                </p>
              </div>
              <div className="text-right">
                <span
                  className={`font-bold ${m.delta > 0 ? 'text-azul' : 'text-erro-escuro'}`}
                >
                  {m.delta > 0 ? `+${m.delta}` : m.delta}
                </span>
                <p className="text-xs text-texto/40">saldo {m.stock_after}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function AbaEstoque({ href, ativo, rotulo }: { href: string; ativo: boolean; rotulo: string }) {
  return (
    <Link
      href={href}
      aria-current={ativo ? 'page' : undefined}
      className={`flex min-h-11 flex-1 items-center justify-center rounded-xl border px-2 text-sm ${
        ativo
          ? 'border-azul bg-azul font-bold text-white'
          : 'border-texto/10 bg-white font-medium text-texto/60'
      }`}
    >
      {rotulo}
    </Link>
  )
}
