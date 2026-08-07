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
      <div className="flex items-center justify-end gap-1">
        <button
          onClick={() => run(() => adjustStock(productId, -1))}
          disabled={pending || stock === 0}
          className="h-8 w-8 rounded-lg border-2 border-cafe/15 font-bold text-cafe/70 hover:bg-creme disabled:opacity-30"
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
            className="h-8 w-14 rounded-lg border-2 border-feira text-center font-bold focus:outline-none"
          />
        ) : (
          <button
            onClick={() => {
              setValue(String(stock))
              setEditing(true)
            }}
            disabled={pending}
            className={`h-8 min-w-14 rounded-lg px-2 font-slab ${
              stock === 0
                ? 'bg-tomate/15 text-tomate-dark'
                : stock <= 5
                  ? 'bg-banana/40 text-cafe'
                  : 'bg-feira/10 text-feira-dark'
            }`}
            title="Clique para digitar o valor"
          >
            {pending ? '…' : stock}
          </button>
        )}

        <button
          onClick={() => run(() => adjustStock(productId, 1))}
          disabled={pending}
          className="h-8 w-8 rounded-lg border-2 border-cafe/15 font-bold text-cafe/70 hover:bg-creme disabled:opacity-30"
          aria-label="Somar 1 ao estoque"
        >
          +
        </button>
        <button
          onClick={() => run(() => adjustStock(productId, 10))}
          disabled={pending}
          className="h-8 rounded-lg border-2 border-cafe/15 px-1.5 text-xs font-bold text-cafe/70 hover:bg-creme disabled:opacity-30"
          aria-label="Somar 10 ao estoque"
        >
          +10
        </button>
      </div>
      {error && <p className="mt-1 text-right text-xs text-tomate-dark">{error}</p>}
    </div>
  )
}
