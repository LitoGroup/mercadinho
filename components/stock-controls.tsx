'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { adjustStock, setStock } from '@/app/actions/products'

export function StockControls({ productId, stock }: { productId: string; stock: number }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(String(stock))
  const [error, setError] = useState<string | null>(null)

  function run(action: () => Promise<{ error?: string }>) {
    setError(null)
    startTransition(async () => {
      const result = await action()
      if (result.error) setError(result.error)
      else {
        setEditing(false)
        router.refresh()
      }
    })
  }

  return (
    <div>
      <div className="flex items-center justify-end gap-2">
        <button
          onClick={() => run(() => adjustStock(productId, -1))}
          disabled={pending || stock === 0}
          className="h-12 w-12 rounded-xl border-2 border-texto/12 text-xl font-bold text-texto/70 hover:bg-cinza-claro disabled:opacity-30"
          aria-label="Tirar 1 do estoque"
        >
          −
        </button>

        {editing ? (
          <input
            autoFocus
            inputMode="numeric"
            value={value}
            onChange={(e) => setValue(e.target.value.replace(/\D/g, ''))}
            onBlur={() => run(() => setStock(productId, Number(value || 0)))}
            onKeyDown={(e) => {
              if (e.key === 'Enter') run(() => setStock(productId, Number(value || 0)))
              if (e.key === 'Escape') setEditing(false)
            }}
            className="h-12 w-16 rounded-xl border-2 border-azul text-center text-lg font-bold focus:outline-none"
          />
        ) : (
          <button
            onClick={() => {
              setValue(String(stock))
              setEditing(true)
            }}
            disabled={pending}
            className={`h-12 min-w-16 rounded-xl px-3 text-lg font-bold ${
              stock === 0
                ? 'bg-erro/10 text-erro-escuro'
                : stock <= 5
                  ? 'bg-alerta/20 text-texto'
                  : 'bg-verde/10 text-azul'
            }`}
            title="Clique para digitar o valor"
          >
            {pending ? '…' : stock}
          </button>
        )}

        <button
          onClick={() => run(() => adjustStock(productId, 1))}
          disabled={pending}
          className="h-12 w-12 rounded-xl border-2 border-texto/12 text-xl font-bold text-texto/70 hover:bg-cinza-claro disabled:opacity-30"
          aria-label="Somar 1 ao estoque"
        >
          +
        </button>
        <button
          onClick={() => run(() => adjustStock(productId, 10))}
          disabled={pending}
          className="h-12 rounded-xl border-2 border-texto/12 px-3.5 text-sm font-bold text-texto/70 hover:bg-cinza-claro disabled:opacity-30"
          aria-label="Somar 10 ao estoque"
        >
          +10
        </button>
      </div>
      {error && <p className="mt-1 text-right text-xs text-erro-escuro">{error}</p>}
    </div>
  )
}
