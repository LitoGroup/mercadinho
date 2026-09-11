import Link from 'next/link'
import { OrderStatusBadge } from '@/components/order-status-badge'
import { OrderReviewCard } from '@/components/order-review-card'
import { currentYearMonthBR, formatCents, formatDate, startOfDayBR, todayBR } from '@/lib/format'
import { createServerSupabase } from '@/lib/supabase/server'
import type { Order, OrderStatus } from '@/lib/types'

function monthOptions(): { value: string; label: string }[] {
  const options: { value: string; label: string }[] = []
  // Mes corrente pelo horario de Brasilia: no servidor em UTC, entre a meia-
  // noite e as 3h o mes vira antes de virar no Brasil.
  const { year, month } = currentYearMonthBR()
  for (let i = 0; i < 12; i++) {
    const d = new Date(Date.UTC(year, month - 1 - i, 1))
    const value = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`
    const label = d.toLocaleDateString('pt-BR', {
      timeZone: 'UTC',
      month: 'long',
      year: 'numeric',
    })
    options.push({ value, label: label.charAt(0).toUpperCase() + label.slice(1) })
  }
  return options
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ mes?: string; dia?: string; status?: string }>
}) {
  const params = await searchParams
  const months = monthOptions()
  const mes = params.mes && /^\d{4}-\d{2}$/.test(params.mes) ? params.mes : months[0].value
  const dia = params.dia && /^\d{4}-\d{2}-\d{2}$/.test(params.dia) ? params.dia : undefined
  const status = ['pending', 'approved', 'rejected'].includes(params.status ?? '')
    ? (params.status as OrderStatus)
    : undefined

  let start: string
  let end: string
  if (dia) {
    const [y, m, d] = dia.split('-').map(Number)
    start = startOfDayBR(y, m, d)
    end = startOfDayBR(y, m, d + 1)
  } else {
    const [year, month] = mes.split('-').map(Number)
    start = startOfDayBR(year, month, 1)
    end = startOfDayBR(year, month + 1, 1)
  }

  const supabase = await createServerSupabase()
  let query = supabase
    .from('orders')
    .select('*, profiles:user_id(name), order_items(product_name, quantity, unit_price_cents)')
    .gte('created_at', start)
    .lt('created_at', end)
    .order('created_at', { ascending: false })
  if (status) query = query.eq('status', status)

  const { data } = await query
  const orders = (data ?? []) as Order[]
  const total = orders.reduce((sum, o) => sum + o.total_cents, 0)
  const aguardando = orders.filter((o) => o.status === 'pending')
  const conferidos = orders.filter((o) => o.status !== 'pending')
  const pendentes = aguardando.length
  const hoje = todayBR()
  const linkBase = `/admin/pedidos?mes=${mes}`

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold text-texto">Conferência de pedidos</h1>

      {/* Celular: o mês num campo só, e três atalhos. Aguardando primeiro,
          porque é o trabalho do dia. */}
      <div className="mb-4 sm:hidden">
        <form className="flex gap-2">
          <select
            name="mes"
            defaultValue={mes}
            aria-label="Mês"
            className="min-h-12 flex-1 rounded-xl border border-texto/12 bg-white px-3 font-medium"
          >
            {months.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="min-h-12 rounded-xl bg-azul px-5 font-semibold text-white"
          >
            Ver
          </button>
        </form>

        <div className="mt-2 flex gap-1.5">
          <FiltroChip
            href={`${linkBase}&status=pending`}
            ativo={status === 'pending' && !dia}
            rotulo={pendentes > 0 ? `Aguardando ${pendentes}` : 'Aguardando'}
          />
          <FiltroChip href={`${linkBase}&dia=${hoje}`} ativo={dia === hoje} rotulo="Hoje" />
          <FiltroChip href={linkBase} ativo={!status && !dia} rotulo="Todos" />
        </div>
      </div>

      <form className="mb-4 hidden grid-cols-2 items-end gap-3 sm:flex sm:flex-wrap">
        <div>
          <label htmlFor="mes" className="mb-1 block text-xs font-medium text-texto/50">
            Mês
          </label>
          <select
            id="mes"
            name="mes"
            defaultValue={mes}
            className="w-full rounded-lg border border-texto/15 bg-white px-3 py-2 text-sm sm:w-auto"
          >
            {months.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="dia" className="mb-1 block text-xs font-medium text-texto/50">
            Dia (opcional)
          </label>
          <input
            type="date"
            id="dia"
            name="dia"
            defaultValue={dia ?? ''}
            className="w-full rounded-lg border border-texto/15 bg-white px-3 py-2 text-sm sm:w-auto"
          />
        </div>
        <div>
          <label htmlFor="status" className="mb-1 block text-xs font-medium text-texto/50">
            Status
          </label>
          <select
            id="status"
            name="status"
            defaultValue={status ?? ''}
            className="w-full rounded-lg border border-texto/15 bg-white px-3 py-2 text-sm sm:w-auto"
          >
            <option value="">Todos</option>
            <option value="pending">Aguardando</option>
            <option value="approved">Aprovados</option>
            <option value="rejected">Rejeitados</option>
          </select>
        </div>
        <button
          type="submit"
          className="w-full rounded-lg bg-azul px-4 py-2 text-sm font-semibold text-white hover:opacity-90 sm:w-auto"
        >
          Filtrar
        </button>
        {dia && (
          <Link
            href={`/admin/pedidos?mes=${mes}${status ? `&status=${status}` : ''}`}
            className="pb-2 text-sm font-medium text-erro-escuro underline"
          >
            Limpar dia
          </Link>
        )}
      </form>

      {dia && (
        <p className="mb-3 -mt-1 text-sm text-texto/50">
          Mostrando pedidos de <strong>{dia.split('-').reverse().join('/')}</strong>.
        </p>
      )}

      <div className="mb-4 grid grid-cols-3 gap-3 text-center">
        <div className="rounded-xl border border-texto/8 bg-white p-3 shadow-sm">
          <p className="text-xs text-texto/50">Pedidos</p>
          <p className="text-lg font-bold text-texto">{orders.length}</p>
        </div>
        <div className="rounded-xl border border-texto/8 bg-white p-3 shadow-sm">
          <p className="text-xs text-texto/50">Total do período</p>
          <p className="text-lg font-bold text-azul">{formatCents(total)}</p>
        </div>
        <div className="rounded-xl border border-texto/8 bg-white p-3 shadow-sm">
          <p className="text-xs text-texto/50">Aguardando</p>
          <p className="text-lg font-bold text-alerta">{pendentes}</p>
        </div>
      </div>

      {orders.length === 0 ? (
        <p className="py-16 text-center text-texto/50">Nenhum pedido nesse período.</p>
      ) : (
        <>
          {/* Celular: os que aguardam vêm inteiros, com Aprovar e Rejeitar no
              próprio cartão. Os já conferidos viram linha, que é o que são. */}
          <div className="sm:hidden">
            {aguardando.length > 0 && (
              <ul className="space-y-3">
                {aguardando.map((o) => (
                  <li key={o.id}>
                    <OrderReviewCard
                      orderId={o.id}
                      clientName={o.profiles?.name ?? '—'}
                      createdAt={o.created_at}
                      totalCents={o.total_cents}
                      items={o.order_items ?? []}
                    />
                  </li>
                ))}
              </ul>
            )}

            {conferidos.length > 0 && (
              <div className={aguardando.length > 0 ? 'mt-6' : ''}>
                <p className="mb-2.5 text-[13px] font-bold tracking-wide text-texto/45">
                  CONFERIDOS
                </p>
                <ul className="space-y-2">
                  {conferidos.map((o) => (
                    <li key={o.id}>
                      <Link
                        href={`/admin/pedidos/${o.id}`}
                        className="flex items-center gap-3 rounded-xl border border-texto/8 bg-white px-3.5 py-3 shadow-sm active:bg-cinza-claro"
                      >
                        <span
                          aria-hidden="true"
                          className={`h-2 w-2 shrink-0 rounded-full ${
                            o.status === 'approved' ? 'bg-verde' : 'bg-erro'
                          }`}
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-semibold text-texto">
                            {o.profiles?.name ?? '—'}
                          </span>
                          <span className="block text-xs text-texto/45">
                            {formatDate(o.created_at)} ·{' '}
                            {o.status === 'approved' ? 'aprovado' : 'rejeitado'}
                          </span>
                        </span>
                        <span className="shrink-0 font-bold text-azul">
                          {formatCents(o.total_cents)}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Desktop: tabela */}
          <div className="hidden rounded-xl border border-texto/8 bg-white shadow-sm sm:block">
            <table className="w-full text-sm">
            <thead className="bg-cinza-claro text-left text-texto/50">
              <tr>
                <th className="p-3">Data</th>
                <th className="p-3">Cliente</th>
                <th className="p-3">Total</th>
                <th className="p-3">Status</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-texto/5">
              {orders.map((o) => (
                <tr key={o.id}>
                  <td className="p-3 text-texto/70">{formatDate(o.created_at)}</td>
                  <td className="p-3 font-medium text-texto">{o.profiles?.name ?? '—'}</td>
                  <td className="p-3 font-medium">{formatCents(o.total_cents)}</td>
                  <td className="p-3">
                    <OrderStatusBadge status={o.status} />
                  </td>
                  <td className="p-3 text-right">
                    <Link
                      href={`/admin/pedidos/${o.id}`}
                      className="font-medium text-azul hover:underline"
                    >
                      Conferir
                    </Link>
                  </td>
                </tr>
              ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}

function FiltroChip({ href, ativo, rotulo }: { href: string; ativo: boolean; rotulo: string }) {
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
