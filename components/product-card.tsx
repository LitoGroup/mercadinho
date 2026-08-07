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
    <div className="flex flex-col rounded-2xl border border-cafe/10 bg-[#FFFDF8] p-2 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-white ring-1 ring-inset ring-cafe/5">
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="flex h-full items-center justify-center text-4xl">🛍️</span>
        )}
        {inCart > 0 && (
          <span className="absolute left-1.5 top-1.5 rounded-full bg-tomate px-2 py-0.5 text-[11px] font-bold text-white shadow">
            {inCart} na cesta
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col px-1 pb-1 pt-2">
        <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-tomate/80">
          {product.category}
        </span>
        <h3 className="mt-0.5 line-clamp-2 text-sm font-semibold leading-snug text-cafe">
          {product.name}
        </h3>
        {product.description && (
          <p className="mt-0.5 line-clamp-1 text-xs text-cafe/45">{product.description}</p>
        )}

        <div className="mt-auto flex items-center justify-between pt-2.5">
          <span className="-rotate-1 rounded-md bg-banana px-2 py-0.5 font-slab text-[15px] leading-tight text-cafe">
            {formatCents(product.price_cents)}
          </span>
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
            aria-label={soldOut ? 'Sem estoque' : `Adicionar ${product.name} à cesta`}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-feira text-xl font-bold text-white shadow-[0_3px_0_0] shadow-feira-dark transition hover:brightness-110 active:translate-y-0.5 active:shadow-none disabled:cursor-not-allowed disabled:bg-cafe/15 disabled:text-cafe/40 disabled:shadow-none"
          >
            +
          </button>
        </div>
        {soldOut && (
          <p className="mt-1 text-right text-[11px] font-semibold text-tomate-dark">
            {product.stock === 0 ? 'Esgotado' : 'Máximo na cesta'}
          </p>
        )}
      </div>
    </div>
  )
}
