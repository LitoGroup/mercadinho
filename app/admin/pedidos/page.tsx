import Link from 'next/link'
import { OrderStatusBadge } from '@/components/order-status-badge'
import { formatCents, formatDate } from '@/lib/format'
import { createServerSupabase } from '@/lib/supabase/server'
import type { Order, OrderStatus } from '@/lib/types'

function monthOptions(): { value: string; label: string }[] {
  const options: { value: string; label: string }[] = []
  const now = new Date()
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const label = d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
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
    start = new Date(y, m - 1, d).toISOString()
    end = new Date(y, m - 1, d + 1).toISOString()
  } else {
    const [year, month] = mes.split('-').map(Number)
    start = new Date(year, month - 1, 1).toISOString()
    end = new Date(year, month, 1).toISOString()
  }

  const supabase = await createServerSupabase()
  let query = supabase
    .from('orders')
    .select('*, profiles:user_id(name)')
    .gte('created_at', start)
    .lt('created_at', end)
    .order('created_at', { ascending: false })
  if (status) query = query.eq('status', status)

  const { data } = await query
  const orders = (data ?? []) as Order[]
  const total = orders.reduce((sum, o) => sum + o.total_cents, 0)
  const pendentes = orders.filter((o) => o.status === 'pending').length

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold text-texto">Conferência de pedidos</h1>

      <form className="mb-4 grid grid-cols-2 items-end gap-3 sm:flex sm:flex-wrap">
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
          {/* Celular: cada pedido é um cartão tocável, sem rolagem lateral */}
          <ul className="space-y-3 sm:hidden">
            {orders.map((o) => (
              <li key={o.id}>
                <Link
                  href={`/admin/pedidos/${o.id}`}
                  className="block rounded-xl border border-texto/8 bg-white p-4 shadow-sm active:bg-cinza-claro"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-texto">
                        {o.profiles?.name ?? '—'}
                      </p>
                      <p className="text-xs text-texto/50">{formatDate(o.created_at)}</p>
                    </div>
                    <p className="shrink-0 font-bold text-azul">
                      {formatCents(o.total_cents)}
                    </p>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <OrderStatusBadge status={o.status} />
                    <span className="text-sm font-semibold text-azul">Conferir →</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>

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
