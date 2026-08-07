'use client'

import Link from 'next/link'
import { useCart } from '@/components/cart-provider'
import { formatCents } from '@/lib/format'

export default function CartPage() {
  const { items, setQty, remove, totalCents } = useCart()

  if (items.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-5xl">🧺</p>
        <p className="mt-3 text-gray-500">Seu carrinho está vazio.</p>
        <Link
          href="/"
          className="mt-4 inline-block rounded-lg bg-feira px-4 py-2 font-semibold text-white hover:bg-feira-dark"
        >
          Ver produtos
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-4 text-xl font-bold text-gray-900">Carrinho</h1>
      <ul className="space-y-3">
        {items.map((item) => (
          <li
            key={item.productId}
            className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-3 shadow-sm"
          >
            <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-50">
              {item.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
              ) : (
                <span className="text-2xl">🛍️</span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-gray-900">{item.name}</p>
              <p className="text-sm text-feira-dark">{formatCents(item.priceCents)}</p>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setQty(item.productId, item.qty - 1)}
                className="h-8 w-8 rounded-lg border border-gray-200 font-bold text-gray-600 hover:bg-gray-50"
                aria-label="Diminuir"
              >
                −
              </button>
              <span className="w-7 text-center font-semibold">{item.qty}</span>
              <button
                onClick={() => setQty(item.productId, item.qty + 1)}
                disabled={item.qty >= item.maxStock}
                className="h-8 w-8 rounded-lg border border-gray-200 font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-40"
                aria-label="Aumentar"
              >
                +
              </button>
            </div>
            <button
              onClick={() => remove(item.productId)}
              className="text-gray-300 hover:text-red-500"
              aria-label={`Remover ${item.name}`}
            >
              ✕
            </button>
          </li>
        ))}
      </ul>

      <div className="mt-6 rounded-xl border border-cafe/10 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between text-lg">
          <span className="font-medium text-gray-700">Total</span>
          <span className="font-bold text-feira-dark">{formatCents(totalCents)}</span>
        </div>
        <Link
          href="/checkout"
          className="mt-4 block rounded-xl bg-feira py-3 text-center font-bold text-white hover:bg-feira-dark"
        >
          Finalizar compra
        </Link>
      </div>
    </div>
  )
}
