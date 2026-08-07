import { KeyRound } from 'lucide-react'
import Link from 'next/link'
import { OrderStatusBadge } from '@/components/order-status-badge'
import { formatCents, formatDate } from '@/lib/format'
import { getReceiptUrl } from '@/lib/orders'
import { createServerSupabase } from '@/lib/supabase/server'
import type { Order } from '@/lib/types'

export default async function MyOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ sucesso?: string }>
}) {
  const { sucesso } = await searchParams
  const supabase = await createServerSupabase()

  const { data } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .order('created_at', { ascending: false })
  const orders = (data ?? []) as Order[]

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h1 className="text-xl font-bold text-gray-900">Meus pedidos</h1>
        <Link
          href="/senha"
          className="flex items-center gap-1.5 rounded-lg border border-cafe/15 px-3 py-1.5 text-sm font-medium text-cafe/70 transition hover:bg-white sm:hidden"
        >
          <KeyRound className="h-4 w-4" />
          Trocar senha
        </Link>
      </div>

      {sucesso && (
        <p className="mb-4 rounded-xl bg-feira/15 p-4 text-sm font-medium text-feira-dark">
          Pedido enviado! Ele será conferido pelo administrador.
        </p>
      )}

      {orders.length === 0 ? (
        <p className="py-16 text-center text-gray-500">Você ainda não fez nenhum pedido.</p>
      ) : (
        <ul className="space-y-4">
          {orders.map(async (order) => {
            const receiptUrl = await getReceiptUrl(order.receipt_path)
            return (
              <li key={order.id} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm text-gray-500">{formatDate(order.created_at)}</p>
                    <p className="font-bold text-feira-dark">{formatCents(order.total_cents)}</p>
                  </div>
                  <OrderStatusBadge status={order.status} />
                </div>

                <ul className="mt-3 space-y-1 border-t border-gray-50 pt-2 text-sm text-gray-600">
                  {order.order_items?.map((item) => (
                    <li key={item.id} className="flex justify-between">
                      <span>
                        {item.quantity}× {item.product_name}
                      </span>
                      <span>{formatCents(item.unit_price_cents * item.quantity)}</span>
                    </li>
                  ))}
                </ul>

                {order.status === 'rejected' && order.review_note && (
                  <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                    <strong>Motivo:</strong> {order.review_note}
                  </p>
                )}

                {receiptUrl && (
                  <a
                    href={receiptUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-block text-sm font-medium text-feira-dark underline"
                  >
                    Ver comprovante enviado
                  </a>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
