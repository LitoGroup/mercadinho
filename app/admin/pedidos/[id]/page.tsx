import Link from 'next/link'
import { notFound } from 'next/navigation'
import { OrderStatusBadge } from '@/components/order-status-badge'
import { ReviewButtons } from '@/components/review-buttons'
import { formatCents, formatDate } from '@/lib/format'
import { getReceiptUrl } from '@/lib/orders'
import { createServerSupabase } from '@/lib/supabase/server'
import type { Order } from '@/lib/types'

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createServerSupabase()
  const { data } = await supabase
    .from('orders')
    .select('*, order_items(*), profiles(name)')
    .eq('id', id)
    .single<Order>()

  if (!data) notFound()
  const receiptUrl = await getReceiptUrl(data.receipt_path)
  const isPdf = data.receipt_path.endsWith('.pdf')

  return (
    <div className="mx-auto max-w-lg">
      <Link href="/admin/pedidos" className="text-sm text-gray-500 hover:underline">
        ← Voltar aos pedidos
      </Link>

      <div className="mt-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h1 className="font-bold text-gray-900">{data.profiles?.name ?? 'Cliente'}</h1>
            <p className="text-sm text-gray-500">{formatDate(data.created_at)}</p>
          </div>
          <OrderStatusBadge status={data.status} />
        </div>

        <ul className="mt-4 space-y-1 border-t border-gray-50 pt-3 text-sm text-gray-700">
          {data.order_items?.map((item) => (
            <li key={item.id} className="flex justify-between">
              <span>
                {item.quantity}× {item.product_name}
                <span className="text-gray-400"> ({formatCents(item.unit_price_cents)} un.)</span>
              </span>
              <span className="font-medium">
                {formatCents(item.unit_price_cents * item.quantity)}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-2 flex justify-between border-t border-gray-100 pt-2 font-bold">
          <span>Total</span>
          <span className="text-feira-dark">{formatCents(data.total_cents)}</span>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        <h2 className="mb-2 font-semibold text-gray-700">Comprovante</h2>
        {!receiptUrl ? (
          <p className="text-sm text-red-600">Não foi possível carregar o comprovante.</p>
        ) : isPdf ? (
          <a
            href={receiptUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-block rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
          >
            📄 Abrir PDF do comprovante
          </a>
        ) : (
          <a href={receiptUrl} target="_blank" rel="noreferrer">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={receiptUrl}
              alt="Comprovante de pagamento"
              className="max-h-96 w-full rounded-lg border object-contain"
            />
          </a>
        )}
        <p className="mt-2 text-xs text-gray-400">
          Confira se o valor e a data batem com o total do pedido.
        </p>
      </div>

      <div className="mt-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        {data.status === 'pending' ? (
          <ReviewButtons orderId={data.id} />
        ) : (
          <div className="text-sm text-gray-600">
            <p>
              Conferido em {data.reviewed_at ? formatDate(data.reviewed_at) : '—'}.
            </p>
            {data.review_note && (
              <p className="mt-1">
                <strong>Observação:</strong> {data.review_note}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
