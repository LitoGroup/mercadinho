'use client'

import { Check, FileText } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { reviewOrder } from '@/app/actions/orders'
import { formatCents, formatDate } from '@/lib/format'
import type { OrderItem } from '@/lib/types'

// O cartão traz tudo que decide a conferência — cliente, horário, itens e
// total — para aprovar sem abrir a tela de detalhe. O comprovante continua
// atrás de um toque: é URL assinada, gerada só quando pedida.
export function OrderReviewCard({
  orderId,
  clientName,
  createdAt,
  totalCents,
  items,
}: {
  orderId: string
  clientName: string
  createdAt: string
  totalCents: number
  items: Pick<OrderItem, 'product_name' | 'quantity' | 'unit_price_cents'>[]
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [rejecting, setRejecting] = useState(false)
  const [note, setNote] = useState('')
  const [error, setError] = useState<string | null>(null)

  function run(approve: boolean, reason: string) {
    setError(null)
    startTransition(async () => {
      const result = await reviewOrder(orderId, approve, reason)
      if (result.error) setError(result.error)
      else router.refresh()
    })
  }

  return (
    <div className="overflow-hidden rounded-xl border border-texto/8 bg-white shadow-sm">
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-[17px] font-bold text-texto">{clientName}</p>
            <p className="mt-0.5 text-xs text-texto/50">{formatDate(createdAt)}</p>
          </div>
          <p className="shrink-0 text-[19px] font-bold text-azul">{formatCents(totalCents)}</p>
        </div>

        {items.length > 0 && (
          <ul className="mt-3 space-y-1 border-t border-texto/6 pt-3">
            {items.map((item, i) => (
              <li key={i} className="flex justify-between gap-3 text-sm text-texto/70">
                <span>
                  {item.quantity}× {item.product_name}
                </span>
                <span className="shrink-0 font-medium">
                  {formatCents(item.unit_price_cents * item.quantity)}
                </span>
              </li>
            ))}
          </ul>
        )}

        <Link
          href={`/admin/pedidos/${orderId}`}
          className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-azul underline"
        >
          <FileText className="h-4 w-4" />
          Ver comprovante
        </Link>

        {error && <p className="mt-3 rounded-lg bg-erro/8 p-3 text-sm text-erro-escuro">{error}</p>}
      </div>

      {rejecting ? (
        <div className="px-4 pb-4">
          <label htmlFor={`motivo-${orderId}`} className="mb-1.5 block text-sm font-semibold text-erro-escuro">
            Por que está rejeitando?
          </label>
          <textarea
            id={`motivo-${orderId}`}
            autoFocus
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="O comprador vai ler este texto."
            className="w-full rounded-lg border-2 border-erro/35 px-3 py-2.5 text-base focus:border-erro focus:outline-none"
          />
          <div className="mt-2.5 flex gap-2">
            <button
              type="button"
              onClick={() => {
                setRejecting(false)
                setError(null)
              }}
              disabled={pending}
              className="h-12 flex-1 rounded-xl bg-texto/6 font-semibold text-texto/65 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => run(false, note)}
              disabled={pending || note.trim() === ''}
              className="h-12 flex-1 rounded-xl bg-erro font-bold text-white disabled:opacity-50"
            >
              {pending ? '…' : 'Confirmar'}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex gap-2 px-4 pb-4">
          <button
            type="button"
            onClick={() => setRejecting(true)}
            disabled={pending}
            className="h-13 w-28 rounded-xl border-2 border-erro/30 bg-white py-3.5 font-bold text-erro-escuro disabled:opacity-50"
          >
            Rejeitar
          </button>
          <button
            type="button"
            onClick={() => run(true, '')}
            disabled={pending}
            className="flex h-13 flex-1 items-center justify-center gap-2 rounded-xl bg-verde py-3.5 text-base font-bold text-azul transition hover:brightness-95 disabled:opacity-50"
          >
            <Check className="h-5 w-5" strokeWidth={2.5} />
            {pending ? 'Aprovando…' : 'Aprovar'}
          </button>
        </div>
      )}
    </div>
  )
}
