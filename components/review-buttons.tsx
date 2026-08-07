'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { reviewOrder } from '@/app/actions/orders'

export function ReviewButtons({ orderId }: { orderId: string }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [rejecting, setRejecting] = useState(false)
  const [note, setNote] = useState('')
  const [error, setError] = useState<string | null>(null)

  function submit(approve: boolean) {
    setError(null)
    startTransition(async () => {
      const result = await reviewOrder(orderId, approve, note)
      if (result.error) {
        setError(result.error)
      } else {
        router.refresh()
      }
    })
  }

  return (
    <div className="space-y-3">
      {rejecting ? (
        <div className="space-y-2">
          <label htmlFor="note" className="block text-sm font-medium text-gray-700">
            Motivo da rejeição *
          </label>
          <textarea
            id="note"
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Ex.: comprovante não confere com o valor do pedido"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-red-400 focus:outline-none"
          />
          <div className="flex gap-2">
            <button
              onClick={() => submit(false)}
              disabled={pending || note.trim() === ''}
              className="flex-1 rounded-lg bg-red-600 py-2.5 font-semibold text-white hover:bg-red-700 disabled:bg-gray-300"
            >
              {pending ? 'Salvando…' : 'Confirmar rejeição'}
            </button>
            <button
              onClick={() => setRejecting(false)}
              disabled={pending}
              className="rounded-lg border border-gray-200 px-4 py-2.5 text-gray-600 hover:bg-gray-50"
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <div className="flex gap-2">
          <button
            onClick={() => submit(true)}
            disabled={pending}
            className="flex-1 rounded-lg bg-feira py-2.5 font-semibold text-white hover:bg-feira-dark disabled:bg-gray-300"
          >
            {pending ? 'Salvando…' : '✓ Aprovar pedido'}
          </button>
          <button
            onClick={() => setRejecting(true)}
            disabled={pending}
            className="flex-1 rounded-lg border border-red-200 py-2.5 font-semibold text-red-600 hover:bg-red-50"
          >
            ✕ Rejeitar
          </button>
        </div>
      )}
      {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    </div>
  )
}
