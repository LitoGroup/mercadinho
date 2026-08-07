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
    <div className="flex flex-col overflow-hidden rounded-2xl border-2 border-cafe/10 bg-[#FFFDF8] transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="relative flex h-36 items-center justify-center bg-white">
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
        ) : (
          <span className="text-4xl">🛍️</span>
        )}
        {/* Etiqueta de preço */}
        <span className="absolute -bottom-2 right-2 -rotate-3 rounded-md bg-banana px-2 py-0.5 font-slab text-sm text-cafe shadow-sm">
          {formatCents(product.price_cents)}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3 pt-4">
        <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-tomate">
          {product.category}
        </span>
        <h3 className="font-semibold leading-tight text-cafe">{product.name}</h3>
        {product.description && (
          <p className="line-clamp-2 text-xs text-cafe/60">{product.description}</p>
        )}
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
          className="mt-auto w-full rounded-xl bg-feira py-2 text-sm font-bold text-white shadow-[0_3px_0_0] shadow-feira-dark transition hover:brightness-110 active:translate-y-0.5 active:shadow-none disabled:cursor-not-allowed disabled:bg-cafe/20 disabled:shadow-none"
        >
          {soldOut ? 'Sem estoque' : inCart > 0 ? `Na cesta (${inCart}) · pôr mais` : 'Pôr na cesta'}
        </button>
      </div>
    </div>
  )
}
