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
          <label htmlFor="note" className="block text-sm font-medium text-texto/80">
            Motivo da rejeição *
          </label>
          <textarea
            id="note"
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Ex.: comprovante não confere com o valor do pedido"
            className="w-full rounded-lg border border-texto/15 px-3 py-2 focus:border-erro focus:outline-none"
          />
          <div className="flex gap-2">
            <button
              onClick={() => submit(false)}
              disabled={pending || note.trim() === ''}
              className="flex-1 rounded-lg bg-erro py-2.5 font-semibold text-white hover:bg-erro-escuro disabled:bg-texto/15"
            >
              {pending ? 'Salvando…' : 'Confirmar rejeição'}
            </button>
            <button
              onClick={() => setRejecting(false)}
              disabled={pending}
              className="rounded-lg border border-texto/10 px-4 py-2.5 text-texto/70 hover:bg-cinza-claro"
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
            className="flex-1 rounded-lg bg-azul py-2.5 font-semibold text-white hover:bg-azul-claro disabled:bg-texto/15"
          >
            {pending ? 'Salvando…' : '✓ Aprovar pedido'}
          </button>
          <button
            onClick={() => setRejecting(true)}
            disabled={pending}
            className="flex-1 rounded-lg border border-erro/25 py-2.5 font-semibold text-erro-escuro hover:bg-erro/8"
          >
            ✕ Rejeitar
          </button>
        </div>
      )}
      {error && <p className="rounded-lg bg-erro/8 p-3 text-sm text-erro-escuro">{error}</p>}
    </div>
  )
}
