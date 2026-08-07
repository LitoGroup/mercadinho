'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'

export interface CartItem {
  productId: string
  name: string
  priceCents: number
  qty: number
  maxStock: number
  imageUrl: string | null
}

interface CartContextValue {
  items: CartItem[]
  add: (item: Omit<CartItem, 'qty'>) => void
  remove: (productId: string) => void
  setQty: (productId: string, qty: number) => void
  clear: () => void
  totalCents: number
  count: number
}

const CartContext = createContext<CartContextValue | null>(null)
const STORAGE_KEY = 'mercadinho-cart'

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) setItems(JSON.parse(saved))
    } catch {
      // carrinho corrompido: começa vazio
    }
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items, hydrated])

  const value = useMemo<CartContextValue>(() => {
    const totalCents = items.reduce((sum, i) => sum + i.priceCents * i.qty, 0)
    const count = items.reduce((sum, i) => sum + i.qty, 0)
    return {
      items,
      totalCents,
      count,
      add: (item) =>
        setItems((prev) => {
          const existing = prev.find((i) => i.productId === item.productId)
          if (existing) {
            return prev.map((i) =>
              i.productId === item.productId
                ? { ...i, qty: Math.min(i.qty + 1, i.maxStock) }
                : i
            )
          }
          return [...prev, { ...item, qty: 1 }]
        }),
      remove: (productId) => setItems((prev) => prev.filter((i) => i.productId !== productId)),
      setQty: (productId, qty) =>
        setItems((prev) =>
          qty <= 0
            ? prev.filter((i) => i.productId !== productId)
            : prev.map((i) =>
                i.productId === productId ? { ...i, qty: Math.min(qty, i.maxStock) } : i
              )
        ),
      clear: () => setItems([]),
    }
  }, [items])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart precisa estar dentro de <CartProvider>')
  return ctx
}
