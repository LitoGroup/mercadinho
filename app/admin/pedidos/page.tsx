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
  searchParams: Promise<{ mes?: string; status?: string }>
}) {
  const params = await searchParams
  const months = monthOptions()
  const mes = params.mes && /^\d{4}-\d{2}$/.test(params.mes) ? params.mes : months[0].value
  const status = ['pending', 'approved', 'rejected'].includes(params.status ?? '')
    ? (params.status as OrderStatus)
    : undefined

  const [year, month] = mes.split('-').map(Number)
  const start = new Date(year, month - 1, 1).toISOString()
  const end = new Date(year, month, 1).toISOString()

  const supabase = await createServerSupabase()
  let query = supabase
    .from('orders')
    .select('*, profiles(name)')
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
      <h1 className="mb-4 text-xl font-bold text-gray-900">Conferência de pedidos</h1>

      <form className="mb-4 flex flex-wrap items-end gap-3">
        <div>
          <label htmlFor="mes" className="mb-1 block text-xs font-medium text-gray-500">
            Mês
          </label>
          <select
            id="mes"
            name="mes"
            defaultValue={mes}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
          >
            {months.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="status" className="mb-1 block text-xs font-medium text-gray-500">
            Status
          </label>
          <select
            id="status"
            name="status"
            defaultValue={status ?? ''}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
          >
            <option value="">Todos</option>
            <option value="pending">Aguardando</option>
            <option value="approved">Aprovados</option>
            <option value="rejected">Rejeitados</option>
          </select>
        </div>
        <button
          type="submit"
          className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
        >
          Filtrar
        </button>
      </form>

      <div className="mb-4 grid grid-cols-3 gap-3 text-center">
        <div className="rounded-xl border border-gray-100 bg-white p-3 shadow-sm">
          <p className="text-xs text-gray-500">Pedidos</p>
          <p className="text-lg font-bold text-gray-900">{orders.length}</p>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-3 shadow-sm">
          <p className="text-xs text-gray-500">Total do período</p>
          <p className="text-lg font-bold text-feira-dark">{formatCents(total)}</p>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-3 shadow-sm">
          <p className="text-xs text-gray-500">Aguardando</p>
          <p className="text-lg font-bold text-amber-600">{pendentes}</p>
        </div>
      </div>

      {orders.length === 0 ? (
        <p className="py-16 text-center text-gray-500">Nenhum pedido nesse período.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-100 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-500">
              <tr>
                <th className="p-3">Data</th>
                <th className="p-3">Cliente</th>
                <th className="p-3">Total</th>
                <th className="p-3">Status</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {orders.map((o) => (
                <tr key={o.id}>
                  <td className="p-3 text-gray-600">{formatDate(o.created_at)}</td>
                  <td className="p-3 font-medium text-gray-900">{o.profiles?.name ?? '—'}</td>
                  <td className="p-3 font-medium">{formatCents(o.total_cents)}</td>
                  <td className="p-3">
                    <OrderStatusBadge status={o.status} />
                  </td>
                  <td className="p-3 text-right">
                    <Link
                      href={`/admin/pedidos/${o.id}`}
                      className="font-medium text-feira-dark hover:underline"
                    >
                      Conferir
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
