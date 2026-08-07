'use client'

import { Plus } from 'lucide-react'
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
    <div className="group flex flex-col overflow-hidden rounded-xl border border-texto/8 bg-white transition hover:border-texto/15 hover:shadow-md">
      <div className="relative aspect-square overflow-hidden bg-white">
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-cinza-claro text-texto/20">
            <ShoppingBagIcon />
          </div>
        )}
        {inCart > 0 && (
          <span className="absolute left-2 top-2 rounded-md bg-azul px-2 py-0.5 text-xs font-semibold text-white">
            {inCart} no carrinho
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col border-t border-texto/5 p-3">
        <span className="text-[11px] font-medium uppercase tracking-wide text-texto/40">
          {product.category}
        </span>
        <h3 className="mt-0.5 line-clamp-2 text-sm font-semibold leading-snug text-texto">
          {product.name}
        </h3>
        {product.description && (
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-texto/45">
            {product.description}
          </p>
        )}

        <div className="mt-auto flex items-center justify-between pt-3">
          <span className="text-[16px] font-bold text-azul">
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
            aria-label={soldOut ? 'Sem estoque' : `Adicionar ${product.name} ao carrinho`}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-verde text-azul shadow-sm transition hover:brightness-95 disabled:cursor-not-allowed disabled:bg-azul/10 disabled:text-texto/30"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
        {soldOut && (
          <p className="mt-1.5 text-right text-[11px] font-medium text-erro-escuro">
            {product.stock === 0 ? 'Esgotado' : 'Quantidade máxima no carrinho'}
          </p>
        )}
      </div>
    </div>
  )
}

function ShoppingBagIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M6 7h12l1 13H5L6 7Z" />
      <path d="M9 10V6a3 3 0 0 1 6 0v4" />
    </svg>
  )
}
