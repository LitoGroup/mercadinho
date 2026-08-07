'use client'

import { useCart } from '@/components/cart-provider'
import { formatCents } from '@/lib/format'

export interface CatalogProduct {
  id: string
  name: string
  description: string
  category: string
  price_cents: number
  stock: number
  imageUrl: string | null
}

export function ProductCard({ product }: { product: CatalogProduct }) {
  const { items, add } = useCart()
  const inCart = items.find((i) => i.productId === product.id)?.qty ?? 0
  const soldOut = inCart >= product.stock

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
      <div className="flex h-36 items-center justify-center bg-gray-50">
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
        ) : (
          <span className="text-4xl">🛍️</span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <span className="text-xs uppercase tracking-wide text-emerald-600">{product.category}</span>
        <h3 className="font-semibold leading-tight text-gray-900">{product.name}</h3>
        {product.description && (
          <p className="line-clamp-2 text-xs text-gray-500">{product.description}</p>
        )}
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="font-bold text-emerald-700">{formatCents(product.price_cents)}</span>
          <button
            onClick={() =>
              add({
                productId: product.id,
                name: product.name,
                priceCents: product.price_cents,
                maxStock: product.stock,
                imageUrl: product.imageUrl,
              })
            }
            disabled={soldOut}
            className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {soldOut ? 'Sem estoque' : inCart > 0 ? `Adicionar (${inCart})` : 'Adicionar'}
          </button>
        </div>
      </div>
    </div>
  )
}
